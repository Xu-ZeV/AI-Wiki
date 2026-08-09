# 三处数据/脚本/模板的区别

## 三处分别是什么

| 位置 | 作用 | 能删吗 |
|------|------|--------|
| **src/ui-ux-pro-max/** | **唯一**。所有CSV、源码、模板都在这里改写，是“唯一真相来源”。 | ❌不能删除，这是你要维护的那一份。
| **.claude/skills/ui-ux-pro-max/** | 给 **光标 / Claude Code** 使用的技能。AI从这里读取SKILL.md并运行`scripts/search.py`。设计上的数据、脚本应该是**指向src的符号链接**，这样不用维护两份。 ❌不能删除（否则技能不起作用）；但可以改成只链接到src，不保留副本。
| **cli/资产/** | 给 **npm 包 uipro-cli** 预留用。用户执行 `npm i -g uipro-cli` 再 `uipro init` 时，是安装这里备份目录的 data/scripts/templates。 ❌不能删；发布前用脚本从 src 同步过来即可。

## 可以只保留一个吗？

- **不能**只保留一个“物理目录”：三处**用途不同**，都要存在。
- **可以**只维护**一份内容**：
  - 所有修改只在 **src/ui-ux-pro-max/** 里做。
  - .claude里用**符号链接**指向维护src → 不用在.claude里再数据/脚本。
  - 发布CLI前执行一次同步：把src→到cli/assets。

这样你日常只改src，其他两处自动或连续上。

## 推荐工作流

1.只改**src/ui-ux-pro-max/data/**、**脚本/**、**模板/**。
2. .claude/skills下的数据、脚本使用符号链接指回src（见下方「恢复符号链接」）。
3.发布npm前执行：
   ```bash
   cp -r src/ui-ux-pro-max/data/* cli/assets/data/
   cp -r src/ui-ux-pro-max/scripts/* cli/assets/scripts/
   cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/
   ```
