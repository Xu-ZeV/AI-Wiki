<#
.SYNOPSIS
    把 AI-Wiki 中的多代理协作 skill（agent-team-*）同步到 Codex 用户级 skill 目录。
.DESCRIPTION
    事实源：<repo>\.agents\skills\agent-team-*
    目标：  $env:USERPROFILE\.codex\skills\<name>

    同步时会把指向仓库 raw 层的相对链接改写为绝对路径，因为 skill 被拷出仓库后
    `../../../raw/SkillHub/` 这类相对路径会失效。

    脚本是幂等的：每次同步前先删除目标同名目录，再整体复制，保证两边内容一致。
.EXAMPLE
    pwsh -File scripts/sync-agent-team-skills.ps1
.EXAMPLE
    pwsh -File scripts/sync-agent-team-skills.ps1 -WhatIf
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    # Wiki 仓库根目录，默认取脚本所在目录的上一级
    [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path,

    # Codex 用户级 skill 目录
    [string]$Destination = (Join-Path $env:USERPROFILE '.codex\skills'),

    # 只同步匹配该模式的 skill 目录
    [string]$Filter = 'agent-team-*'
)

$ErrorActionPreference = 'Stop'

$sourceRoot = Join-Path $RepoRoot '.agents\skills'
$repoLinkBase = ($RepoRoot -replace '\\', '/') + '/raw/SkillHub/'

if (-not (Test-Path -LiteralPath $sourceRoot)) {
    throw "找不到事实源目录：$sourceRoot"
}

$skills = Get-ChildItem -LiteralPath $sourceRoot -Directory -Filter $Filter | Sort-Object Name
if ($skills.Count -eq 0) {
    throw "在 $sourceRoot 下没有匹配 '$Filter' 的 skill 目录"
}

$destFull = [System.IO.Path]::GetFullPath($Destination)
$skillsRoot = [System.IO.Path]::GetFullPath((Join-Path $env:USERPROFILE '.codex\skills'))
if (-not $destFull.StartsWith($skillsRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "目标目录必须位于 $skillsRoot 之下，当前为：$destFull"
}

$report = foreach ($skill in $skills) {
    $src = $skill.FullName
    $dst = Join-Path $destFull $skill.Name

    # 安全闸：目标目录必须严格落在 skills 根之下，且同名于源 skill
    $dstFull = [System.IO.Path]::GetFullPath($dst)
    if (-not $dstFull.StartsWith($skillsRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "拒绝写入越界路径：$dstFull"
    }
    if ((Split-Path $dstFull -Leaf) -ne $skill.Name) {
        throw "目标目录名与源 skill 不一致：$dstFull"
    }

    if (-not $PSCmdlet.ShouldProcess($dstFull, '同步 skill')) {
        continue
    }

    if (Test-Path -LiteralPath $dstFull) {
        [System.IO.Directory]::Delete($dstFull, $true)
    }
    New-Item -ItemType Directory -Path $dstFull -Force | Out-Null

    $copied = 0
    $rewritten = 0
    foreach ($file in Get-ChildItem -LiteralPath $src -Recurse -File) {
        $rel = $file.FullName.Substring($src.Length + 1)
        $target = Join-Path $dstFull $rel
        $targetDir = Split-Path $target -Parent
        if (-not (Test-Path -LiteralPath $targetDir)) {
            New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
        }

        if ($file.Extension -eq '.md') {
            $text = Get-Content -LiteralPath $file.FullName -Raw
            # 把任意深度的 ../../../raw/SkillHub/ 改写为仓库绝对路径
            $patched = $text -replace '\]\(\.\./(?:\.\./)+raw/SkillHub/', "]($repoLinkBase"
            if ($patched -ne $text) {
                $rewritten++
            }
            Set-Content -LiteralPath $target -Value $patched -NoNewline -Encoding utf8
        }
        else {
            Copy-Item -LiteralPath $file.FullName -Destination $target -Force
        }
        $copied++
    }

    [pscustomobject]@{
        Skill     = $skill.Name
        Files     = $copied
        Rewritten = $rewritten
        Target    = $dstFull
    }
}

if ($report) {
    $report | Format-Table -AutoSize
    Write-Host ("已同步 {0} 个 skill 到 {1}" -f @($report).Count, $destFull) -ForegroundColor Green
    Write-Host '新开一个 Codex 会话即可加载这些 skill。' -ForegroundColor DarkGray
}
