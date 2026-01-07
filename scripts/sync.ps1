# Simple Windows PowerShell watcher to rebuild/restart on changes
# Usage: pwsh -File scripts/sync.ps1

$ErrorActionPreference = "Stop"

function Get-ProjectSignature {
    $paths = @(
        "src","public","app","components","lib",
        "next.config.js","tailwind.config.ts","tsconfig.json","package.json","postcss.config.js"
    )
    $items = @()
    foreach ($p in $paths) {
        if (Test-Path $p) {
            $items += Get-ChildItem $p -Recurse -Force -ErrorAction SilentlyContinue |
                Where-Object { -not $_.PSIsContainer } |
                Select-Object FullName, Length, LastWriteTimeUtc
        }
    }
    return ($items | Sort-Object FullName | ConvertTo-Json -Compress)
}

Write-Host "[sync] Watching for changes... (Ctrl+C to stop)" -ForegroundColor Cyan
$last = Get-ProjectSignature

while ($true) {
    Start-Sleep -Seconds 2
    $now = Get-ProjectSignature
    if ($now -ne $last) {
        Write-Host "[sync] Change detected. Rebuilding containers..." -ForegroundColor Yellow
        try {
            docker compose build --no-cache | Write-Output
            docker compose up -d --force-recreate | Write-Output
            Write-Host "[sync] Redeployed all instances." -ForegroundColor Green
            $last = $now
        } catch {
            Write-Host "[sync] Error: $_" -ForegroundColor Red
        }
    }
}
