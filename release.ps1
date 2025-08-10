# Release script: auto-commit all changes → bump patch → tag → push → build → preview
$ErrorActionPreference = "Stop"

function Bump-Patch([string]$path) {
  $code = @"
const fs = require('fs');
const p = '$path';
const pkg = JSON.parse(fs.readFileSync(p,'utf8'));
const [maj,min,patRest] = String(pkg.version||'0.0.0').split('.');
let [pat] = String(patRest||'0').split('-');
pat = String((parseInt(pat || '0',10) || 0) + 1);
pkg.version = [maj,min,pat].join('.');
fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(pkg.version);
"@
  node -e $code
}

Write-Host "→ Auto-committing current changes (if any)..." -ForegroundColor Cyan
$porcelain = & git status --porcelain
if ($porcelain) {
  & git add -A
  # commit może się nie udać jeśli hook zablokuje – wtedy skrypt się przerwie (dobrze)
  & git commit -m "chore: save changes before release" | Out-Null
} else {
  Write-Host "→ No local changes to commit." -ForegroundColor DarkGray
}

Write-Host "→ Bumping patch version (no npm)..." -ForegroundColor Cyan
$newVer = Bump-Patch "package.json"
if (-not $newVer) { Write-Host "`nERROR: bump failed" -ForegroundColor Red; exit 1 }
$newTag = "v$newVer"
Write-Host "→ New version: $newVer" -ForegroundColor Green

Write-Host "→ Committing package.json..." -ForegroundColor Cyan
& git add package.json
# Jeżeli package-lock.json nie jest ignorowany, dorzuć go automatycznie:
if (Test-Path "package-lock.json") { & git add package-lock.json 2>$null | Out-Null }
& git commit -m "release: $newTag" | Out-Null

Write-Host "→ Tagging $newTag..." -ForegroundColor Cyan
& git tag -a $newTag -m "release: $newTag"

Write-Host "→ Pushing branch & tags..." -ForegroundColor Cyan
$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
& git push origin $branch | Out-Null
& git push origin --tags | Out-Null

Write-Host "→ Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "`nERROR: build failed" -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "✅ Release complete!" -ForegroundColor Green
Write-Host "   Version: $newVer"
Write-Host "   Tag:     $newTag"
Write-Host "   Branch:  $branch"
Write-Host ""
Write-Host "▶ Starting local preview (CTRL+C to stop)..." -ForegroundColor Cyan
npm run preview
