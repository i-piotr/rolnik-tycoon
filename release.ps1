# ==============================
# release.ps1 - Automatyczne wydanie nowej wersji
# ==============================

Write-Host "Auto-committing current changes (if any)..." -ForegroundColor Cyan
git add . >$null 2>&1
git commit -m "chore: auto-commit before release" >$null 2>&1

Write-Host "Bumping patch version (no npm)..." -ForegroundColor Cyan
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
$versionParts = $packageJson.version.Split('.')
$versionParts[2] = [int]$versionParts[2] + 1
$newVersion = "$($versionParts[0]).$($versionParts[1]).$($versionParts[2])"
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 package.json

Write-Host "New version: $newVersion" -ForegroundColor Green
git add package.json
git commit -m "release: v$newVersion"
git tag -a "v$newVersion" -m "release: v$newVersion"
git push origin main
git push origin --tags

Write-Host "Building production bundle..." -ForegroundColor Cyan
npm run build

Write-Host "Release complete!" -ForegroundColor Green
Write-Host "   Version: $newVersion"
Write-Host "   Tag:     v$newVersion"

Write-Host "Starting local preview (CTRL+C to stop)..." -ForegroundColor Yellow
npm run preview
