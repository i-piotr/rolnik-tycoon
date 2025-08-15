# release.ps1 - auto commit -> bump patch -> tag -> push -> build -> preview (no BOM)

Write-Host "Auto-committing current changes (if any)..." -ForegroundColor Cyan
git add . >$null 2>&1
git commit -m "chore: auto-commit before release" >$null 2>&1

Write-Host "Bumping patch version (no npm)..." -ForegroundColor Cyan
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
$parts = $packageJson.version.Split('.')
$parts[2] = [int]$parts[2] + 1
$newVersion = "$($parts[0]).$($parts[1]).$($parts[2])"
$packageJson.version = $newVersion

# write package.json as UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText("package.json", ($packageJson | ConvertTo-Json -Depth 10) + "`n", $utf8NoBom)
# Zaktualizuj src/version.ts zgodnie z package.json
powershell -ExecutionPolicy Bypass -File tools/update-version.ps1
git add src/version.ts | Out-Null


Write-Host "New version: $newVersion" -ForegroundColor Green
git add package.json
git commit -m "release: v$newVersion" | Out-Null
git tag -a "v$newVersion" -m "release: v$newVersion"
git push origin main | Out-Null
git push origin --tags | Out-Null

Write-Host "Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed." -ForegroundColor Red; exit 1 }

Write-Host "Release complete!" -ForegroundColor Green
Write-Host "  Version: v$newVersion"

Write-Host "Starting local preview (CTRL+C to stop)..." -ForegroundColor Yellow
npm run preview
