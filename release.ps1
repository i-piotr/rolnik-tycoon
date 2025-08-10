$ErrorActionPreference = "Stop"

Write-Host "→ Bumping patch version..." -ForegroundColor Cyan
$npmOut = & npm --no-git-tag-version version patch
if ($LASTEXITCODE -ne 0) { 
    Write-Host "`nERROR: npm version failed" -ForegroundColor Red
    exit 1
}
$newVer = "$npmOut".Trim()
$newTag = "v$newVer"
Write-Host "→ New version: $newVer" -ForegroundColor Green

Write-Host "→ Committing package.json..." -ForegroundColor Cyan
git add package.json
git commit -m "release: $newTag" | Out-Null

Write-Host "→ Creating tag $newTag..." -ForegroundColor Cyan
git tag -a $newTag -m "release: $newTag"

Write-Host "→ Pushing to GitHub..." -ForegroundColor Cyan
git push origin main | Out-Null
git push origin --tags | Out-Null

Write-Host "→ Building production bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "`nERROR: build failed" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "✅ Release complete!" -ForegroundColor Green
Write-Host "   Version: $newVer"
Write-Host "   Tag:     $newTag"
Write-Host ""
Write-Host "▶ Starting local preview of the production build..." -ForegroundColor Cyan
Write-Host "   (Press CTRL+C in this terminal to stop the preview server.)" -ForegroundColor DarkGray
npm run preview
