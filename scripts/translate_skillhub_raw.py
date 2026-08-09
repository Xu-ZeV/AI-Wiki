#!/usr/bin/env python3
"""Create a Chinese mirror of raw/SkillHub without changing English sources."""

from __future__ import annotations

import argparse
import html as html_lib
import json
import random
import re
import shutil
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from pathlib import Path


DEFAULT_SOURCE = Path("raw/SkillHub")
DEFAULT_TARGET = Path("raw/SkillHub/zh")
TRANSLATE_EXTENSIONS = {".md", ".mdc"}
SKIP_DIRS = {".git", "node_modules", "__pycache__"}
YAML_TRANSLATE_KEYS = {"title", "description", "short-description", "summary"}
MAX_BATCH_CHARS = 6000
MAX_BATCH_ITEMS = 120
MOBILE_FALLBACK_MAX_CHARS = 3200

FENCE_RE = re.compile(
    r"^[ \t]*(?P<fence>`{3,}|~{3,})[^\r\n]*(?:\r?\n).*?^[ \t]*(?P=fence)[ \t]*$",
    re.MULTILINE | re.DOTALL,
)
INLINE_CODE_RE = re.compile(r"(`+)([^`\n]|`(?!\1))*?\1")
URL_RE = re.compile(r"\b(?:https?|file)://[^\s<>)\]]+")
OBSIDIAN_LINK_RE = re.compile(r"!\[\[[^\]]+\]\]|\[\[[^\]]+\]\]")
HTML_COMMENT_RE = re.compile(r"<!--.*?-->", re.DOTALL)
HTML_TAG_RE = re.compile(r"</?[A-Za-z][^>\n]*>")
MARKDOWN_TARGET_RE = re.compile(r"(?<=\])\([^)]+\)")
PATH_RE = re.compile(
    r"(?<![\w-])(?:[A-Za-z]:[\\/]|\.{1,2}[\\/]|[\\/]|"
    r"(?:raw|wiki|skills|scripts|log|references|reference|src|tests|test|docs|public|assets|"
    r"\.agents|\.gemini)[\\/])"
    r"(?:[A-Za-z0-9_.@+-]+[\\/])*[A-Za-z0-9_.@+-]+/?"
)
PLACEHOLDER_RE = re.compile(r"ZXQ(?:PH|FENCE)\d{6}QXZ")

TERM_FIXES = (
    ("组件道具", "组件 props"),
    ("道具", "props"),
    ("可组合项", "可组合函数"),
    ("可组合物", "可组合函数"),
    ("反应效果", "响应式 effect"),
    ("无功效应", "响应式 effect"),
    ("无功值", "响应式值"),
    ("非反应值", "非响应式值"),
    ("反应性", "响应式"),
    ("反应式", "响应式"),
    ("手表效果", "watchEffect"),
    ("观察者", "侦听器"),
    ("观察源", "侦听器源"),
    ("悬念", "Suspense"),
    ("传送", "Teleport"),
    ("生命周期钩", "生命周期钩子"),
    ("脚本设置", "script setup"),
    ("政策和规则", "策略和规则"),
    ("开发人员", "开发者"),
    ("黑曜石", "Obsidian"),
    ("保险库", "vault"),
    ("保管库", "vault"),
    ("金库", "vault"),
    ("降价", "Markdown"),
    ("维基百科", "wiki"),
    ("代币", "token"),
    ("令牌", "token"),
    ("底座", "Bases"),
    ("防溢出", "反粗糙"),
    ("防闪", "反粗糙"),
    ("法学硕士", "LLM"),
    ("Obsidianvault", "Obsidian vault"),
    ("Obsidian维基", "Obsidian Wiki"),
    ("Obsidian味", "Obsidian 风格"),
    ("AI代理", "AI agent"),
    ("代理技能", "agent 技能"),
    ("高代理", "高自主性"),
    ("架构师数字接口", "架构数字界面"),
    ("打字稿", "TypeScript"),
    ("老虎机", "Slots"),
    ("发射", "emits"),
    ("v 模型", "v-model"),
    ("模板参考", "模板 ref"),
    ("保持活动", "KeepAlive"),
    ("食品法典委员会", "Codex"),
    ("味觉技巧", "Taste Skill"),
)


@dataclass
class Stats:
    translated_files: int = 0
    copied_files: int = 0
    skipped_files: int = 0
    translated_units: int = 0
    api_calls: int = 0
    cache_hits: int = 0


class Translator:
    def __init__(self, source_lang: str = "en", target_lang: str = "zh-CN", sleep: float = 0.0):
        self.source_lang = source_lang
        self.target_lang = target_lang
        self.sleep = sleep
        self.cache: dict[str, str] = {}
        self.stats = Stats()
        self.batch_index = 0

    def translate_units(self, units: list[str]) -> list[str]:
        result: list[str | None] = [None] * len(units)
        pending: list[tuple[int, str]] = []

        for idx, unit in enumerate(units):
            if not should_translate(unit):
                result[idx] = unit
                continue
            cached = self.cache.get(unit)
            if cached is not None:
                result[idx] = cached
                self.stats.cache_hits += 1
                continue
            pending.append((idx, unit))

        batch: list[tuple[int, str]] = []
        batch_chars = 0
        for item in pending:
            unit_len = len(item[1])
            if batch and (batch_chars + unit_len > MAX_BATCH_CHARS or len(batch) >= MAX_BATCH_ITEMS):
                self._flush_batch(batch, result)
                batch = []
                batch_chars = 0
            batch.append(item)
            batch_chars += unit_len + 24
        if batch:
            self._flush_batch(batch, result)

        return [item if item is not None else units[idx] for idx, item in enumerate(result)]

    def _flush_batch(self, batch: list[tuple[int, str]], result: list[str | None]) -> None:
        self.batch_index += 1
        delimiter = f"ZXQSEG{self.batch_index:06d}QXZ"
        text = f"\n{delimiter}\n".join(unit for _, unit in batch)
        try:
            translated = self._request(text)
        except RuntimeError:
            if len(batch) > 1:
                mid = len(batch) // 2
                self._flush_batch(batch[:mid], result)
                self._flush_batch(batch[mid:], result)
                return
            idx, unit = batch[0]
            translated = unit
            result[idx] = translated
            return

        parts = [part.strip("\n") for part in translated.split(delimiter)]

        if len(parts) != len(batch):
            if len(batch) > 1:
                mid = len(batch) // 2
                self._flush_batch(batch[:mid], result)
                self._flush_batch(batch[mid:], result)
                return
            for idx, unit in batch:
                result[idx] = self._translate_one(unit)
            return

        for (idx, original), translated_part in zip(batch, parts):
            translated_part = apply_term_fixes(translated_part)
            self.cache[original] = translated_part
            result[idx] = translated_part
            self.stats.translated_units += 1

    def _translate_one(self, text: str) -> str:
        cached = self.cache.get(text)
        if cached is not None:
            self.stats.cache_hits += 1
            return cached
        translated = apply_term_fixes(self._request(text))
        self.cache[text] = translated
        self.stats.translated_units += 1
        return translated

    def _request(self, text: str) -> str:
        if not text:
            return text

        params = urllib.parse.urlencode(
            {
                "client": "gtx",
                "sl": self.source_lang,
                "tl": self.target_lang,
                "dt": "t",
            }
        )
        data = urllib.parse.urlencode({"q": text}).encode("utf-8")
        request = urllib.request.Request(
            f"https://translate.googleapis.com/translate_a/single?{params}",
            data=data,
            method="POST",
        )
        request.add_header("Content-Type", "application/x-www-form-urlencoded; charset=utf-8")

        last_error: Exception | None = None
        for attempt in range(3):
            try:
                with urllib.request.urlopen(request, timeout=20) as response:
                    payload = response.read().decode("utf-8")
                parsed = json.loads(payload)
                self.stats.api_calls += 1
                if self.sleep:
                    time.sleep(self.sleep)
                return "".join(part[0] for part in parsed[0] if part and part[0])
            except urllib.error.HTTPError as exc:
                last_error = exc
                if exc.code == 429:
                    break
                time.sleep(min(2**attempt, 10))
            except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
                last_error = exc
                time.sleep(min(2**attempt, 10))

        if len(text) <= MOBILE_FALLBACK_MAX_CHARS:
            return self._request_mobile(text)

        raise RuntimeError(f"translation request failed after retries: {last_error}")

    def _request_mobile(self, text: str) -> str:
        last_error: Exception | None = None
        for attempt in range(4):
            try:
                query = urllib.parse.urlencode(
                    {"sl": self.source_lang, "tl": self.target_lang, "q": text}
                )
                request = urllib.request.Request(
                    f"https://translate.google.com/m?{query}",
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                with urllib.request.urlopen(request, timeout=20) as response:
                    page = response.read().decode("utf-8", "ignore")
                match = re.search(r'class="result-container">(.*?)</div>', page, re.DOTALL)
                if not match:
                    raise RuntimeError("mobile translation result not found")
                translated = re.sub(r"<.*?>", "", match.group(1))
                self.stats.api_calls += 1
                return html_lib.unescape(translated)
            except Exception as exc:
                last_error = exc
                time.sleep(min(2**attempt, 10))
        raise RuntimeError(f"mobile translation failed after retries: {last_error}")


def should_translate(text: str) -> bool:
    if not text.strip():
        return False
    if PLACEHOLDER_RE.fullmatch(text.strip()):
        return False
    without_placeholders = PLACEHOLDER_RE.sub("", text)
    return bool(re.search(r"[A-Za-z]", without_placeholders))


def apply_term_fixes(text: str) -> str:
    for source, target in TERM_FIXES:
        text = text.replace(source, target)
    return text


def protect(text: str, prefix: str = "PH") -> tuple[str, dict[str, str]]:
    placeholders: dict[str, str] = {}

    def replace(match: re.Match[str]) -> str:
        token = f"ZXQ{prefix}{len(placeholders):06d}QXZ"
        placeholders[token] = match.group(0)
        return token

    for pattern in (HTML_COMMENT_RE, HTML_TAG_RE, OBSIDIAN_LINK_RE, MARKDOWN_TARGET_RE, URL_RE, INLINE_CODE_RE, PATH_RE):
        text = pattern.sub(replace, text)
    return text, placeholders


def restore(text: str, placeholders: dict[str, str]) -> str:
    changed = True
    while changed:
        changed = False
        for token, value in reversed(placeholders.items()):
            if token in text:
                text = text.replace(token, value)
                changed = True
    return text


def protect_fences(text: str) -> tuple[str, dict[str, str]]:
    placeholders: dict[str, str] = {}

    def replace(match: re.Match[str]) -> str:
        token = f"ZXQFENCE{len(placeholders):06d}QXZ"
        placeholders[token] = match.group(0)
        return token

    return FENCE_RE.sub(replace, text), placeholders


def split_line(line: str) -> tuple[str, str]:
    if line.endswith("\r\n"):
        return line[:-2], "\r\n"
    if line.endswith("\n"):
        return line[:-1], "\n"
    return line, ""


def translate_frontmatter(block: str, translator: Translator) -> str:
    out: list[str] = []
    units: list[str] = []
    unit_positions: list[int] = []
    placeholders_by_position: dict[int, dict[str, str]] = {}

    for line in block.splitlines(keepends=True):
        content, newline = split_line(line)
        match = re.match(r"^([A-Za-z0-9_-]+:\s*)(.*)$", content)
        if not match or match.group(1).split(":", 1)[0] not in YAML_TRANSLATE_KEYS:
            out.append(line)
            continue

        value = match.group(2)
        if not should_translate(value):
            out.append(line)
            continue

        protected, placeholders = protect(value)
        out.append(match.group(1) + protected + newline)
        units.append(protected)
        unit_positions.append(len(out) - 1)
        placeholders_by_position[len(out) - 1] = placeholders

    translations = translator.translate_units(units)
    for position, translated in zip(unit_positions, translations):
        content, newline = split_line(out[position])
        key_prefix = content.split(":", 1)[0] + ": "
        out[position] = key_prefix + restore(translated, placeholders_by_position[position]) + newline
    return "".join(out)


def split_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---"):
        return "", text
    match = re.match(r"^(---\r?\n.*?\r?\n---[ \t]*(?:\r?\n|$))(.*)$", text, re.DOTALL)
    if not match:
        return "", text
    return match.group(1), match.group(2)


def translate_markdown(text: str, translator: Translator) -> str:
    frontmatter, body = split_frontmatter(text)
    translated_frontmatter = translate_frontmatter(frontmatter, translator) if frontmatter else ""

    fenced_body, fence_placeholders = protect_fences(body)
    lines = fenced_body.splitlines(keepends=True)
    protected_lines: list[str] = []
    line_placeholders: list[dict[str, str]] = []
    units: list[str] = []
    unit_positions: list[int] = []

    for line in lines:
        content, newline = split_line(line)
        protected, placeholders = protect(content)
        protected_lines.append(protected + newline)
        line_placeholders.append(placeholders)
        if should_translate(protected):
            units.append(protected)
            unit_positions.append(len(protected_lines) - 1)

    translations = translator.translate_units(units)
    for position, translated in zip(unit_positions, translations):
        _, newline = split_line(protected_lines[position])
        protected_lines[position] = translated + newline

    restored_lines: list[str] = []
    for index, line in enumerate(protected_lines):
        content, newline = split_line(line)
        restored_lines.append(restore(content, line_placeholders[index]) + newline)

    translated_body = "".join(restored_lines)
    translated_body = restore(translated_body, fence_placeholders)
    return translated_frontmatter + translated_body


def iter_source_files(source: Path, target: Path) -> list[Path]:
    files: list[Path] = []
    target_resolved = target.resolve()
    for path in source.rglob("*"):
        if path.is_dir():
            continue
        parts = path.relative_to(source).parts
        if any(part in SKIP_DIRS for part in parts):
            continue
        try:
            path.resolve().relative_to(target_resolved)
            continue
        except ValueError:
            pass
        files.append(path)
    return sorted(files)


def read_only_list(source: Path, list_path: Path) -> list[Path]:
    files: list[Path] = []
    for raw_line in list_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        candidate = (source / line).resolve()
        try:
            candidate.relative_to(source)
        except ValueError:
            raise ValueError(f"listed file is outside source: {line}")
        if not candidate.exists() or not candidate.is_file():
            raise FileNotFoundError(f"listed file does not exist: {line}")
        files.append(candidate)
    return sorted(dict.fromkeys(files))


def copy_or_translate_file(path: Path, source: Path, target: Path, translator: Translator, force: bool) -> None:
    rel = path.relative_to(source)
    dest = target / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not force and dest.exists() and dest.stat().st_size > 0:
        translator.stats.skipped_files += 1
        return

    if path.suffix.lower() not in TRANSLATE_EXTENSIONS:
        shutil.copy2(path, dest)
        translator.stats.copied_files += 1
        return

    text = path.read_text(encoding="utf-8")
    translated = translate_markdown(text, translator)
    dest.write_text(translated, encoding="utf-8", newline="")
    translator.stats.translated_files += 1


def count_chinese(text: str) -> int:
    return len(re.findall(r"[\u4e00-\u9fff]", text))


def count_english_words(text: str) -> int:
    protected, _ = protect(text)
    protected = PLACEHOLDER_RE.sub("", protected)
    return len(re.findall(r"\b[A-Za-z]{4,}\b", protected))


def run_checks(source: Path, target: Path) -> dict[str, object]:
    source_md = [
        path
        for path in iter_source_files(source, target)
        if path.suffix.lower() in TRANSLATE_EXTENSIONS
    ]
    missing: list[str] = []
    placeholder_residue: list[str] = []
    fence_mismatches: list[str] = []
    low_chinese: list[dict[str, object]] = []
    english_heavy: list[dict[str, object]] = []

    for src in source_md:
        rel = src.relative_to(source)
        dst = target / rel
        if not dst.exists():
            missing.append(str(rel))
            continue
        src_text = src.read_text(encoding="utf-8")
        dst_text = dst.read_text(encoding="utf-8")
        if PLACEHOLDER_RE.search(dst_text) or re.search(r"ZXQSEG\d{6}QXZ", dst_text):
            placeholder_residue.append(str(rel))
        if src_text.count("```") != dst_text.count("```") or src_text.count("~~~") != dst_text.count("~~~"):
            fence_mismatches.append(str(rel))
        chinese = count_chinese(dst_text)
        english_words = count_english_words(dst_text)
        if len(src_text) > 600 and chinese < 80:
            low_chinese.append({"file": str(rel), "chinese_chars": chinese})
        if len(src_text) > 1200 and english_words > max(120, chinese // 3):
            english_heavy.append({"file": str(rel), "english_words": english_words, "chinese_chars": chinese})

    samples: list[dict[str, str]] = []
    random.seed(20260618)
    for src in random.sample(source_md, min(12, len(source_md))):
        rel = src.relative_to(source)
        dst = target / rel
        if not dst.exists():
            continue
        lines = [
            line.strip()
            for line in dst.read_text(encoding="utf-8").splitlines()
            if count_chinese(line) >= 12 and not line.strip().startswith("|")
        ]
        if lines:
            samples.append({"file": str(rel), "sample": lines[0][:180]})

    return {
        "source_markdown_files": len(source_md),
        "target_markdown_files": len(
            [
                p
                for p in target.rglob("*")
                if p.is_file()
                and p.name != "TRANSLATION_REPORT.md"
                and p.suffix.lower() in TRANSLATE_EXTENSIONS
            ]
        ),
        "missing_files": missing,
        "placeholder_residue": placeholder_residue,
        "fence_mismatches": fence_mismatches,
        "low_chinese_files": low_chinese[:30],
        "english_heavy_files": english_heavy[:30],
        "samples": samples,
    }


def write_report(target: Path, stats: Stats, checks: dict[str, object]) -> None:
    report = target / "TRANSLATION_REPORT.md"
    report.write_text(
        "\n".join(
            [
                "# SkillHub raw 中文镜像翻译报告",
                "",
                "- 翻译范围：`raw/SkillHub` 下除 `zh/` 与 `.git/` 外的 Markdown / MDC 文件。",
                "- 输出位置：`raw/SkillHub/zh`。",
                "- 英文源文件：已保留在原目录，未覆盖。",
                f"- 翻译文件数：{stats.translated_files}",
                f"- 原样复制非 Markdown 文件数：{stats.copied_files}",
                f"- 跳过已存在文件数：{stats.skipped_files}",
                f"- 翻译文本单元数：{stats.translated_units}",
                f"- 翻译 API 调用数：{stats.api_calls}",
                "",
                "## 自动检查",
                "",
                f"- 源 Markdown 文件数：{checks['source_markdown_files']}",
                f"- 目标 Markdown 文件数：{checks['target_markdown_files']}",
                f"- 缺失文件数：{len(checks['missing_files'])}",
                f"- 占位符残留文件数：{len(checks['placeholder_residue'])}",
                f"- 代码围栏数量不一致文件数：{len(checks['fence_mismatches'])}",
                f"- 中文字符过低文件数：{len(checks['low_chinese_files'])}",
                f"- 英文残留偏高文件数：{len(checks['english_heavy_files'])}",
                "",
                "## 顺读抽样",
                "",
                *[
                    f"- `{sample['file']}`：{sample['sample']}"
                    for sample in checks["samples"]
                ],
                "",
            ]
        ),
        encoding="utf-8",
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--target", type=Path, default=DEFAULT_TARGET)
    parser.add_argument("--check-only", action="store_true")
    parser.add_argument("--force", action="store_true", help="overwrite existing target files")
    parser.add_argument("--only-list", type=Path, help="UTF-8 file with source-relative paths to process")
    args = parser.parse_args()

    source = args.source.resolve()
    target = args.target.resolve()
    if not source.exists():
        print(f"source does not exist: {source}", file=sys.stderr)
        return 2
    target.mkdir(parents=True, exist_ok=True)

    translator = Translator()
    if not args.check_only:
        files = read_only_list(source, args.only_list.resolve()) if args.only_list else iter_source_files(source, target)
        for index, path in enumerate(files, 1):
            copy_or_translate_file(path, source, target, translator, args.force)
            if index % 25 == 0 or index == len(files):
                print(
                    f"[{index}/{len(files)}] translated={translator.stats.translated_files} "
                    f"copied={translator.stats.copied_files} skipped={translator.stats.skipped_files} "
                    f"api_calls={translator.stats.api_calls}",
                    flush=True,
                )

    checks = run_checks(source, target)
    write_report(target, translator.stats, checks)
    print(json.dumps({"stats": translator.stats.__dict__, "checks": checks}, ensure_ascii=False, indent=2))

    failed = (
        checks["missing_files"]
        or checks["placeholder_residue"]
        or checks["fence_mismatches"]
    )
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
