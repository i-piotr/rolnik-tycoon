$ErrorActionPreference = "Stop"

function die($msg) {
    Write-Host "`nERROR: $msg" -ForegroundColor Red
    exit 1
}

# 🔍 Sprawdzenie wymaganych narzędzi
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { die "Git is not installed or not in PATH." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { die "npm is not installed or not in PATH." }

# 🔍 Sprawdzenie czy jesteśmy w repo
$inside = (& git rev-parse --is-inside-work-tree 2>$null)
if (-not $inside) { die "This folder is not a Git repository." }

# 🔍 Sprawdzenie konfiguracji użytkownika Git
$userName = (& git config user.name)
$userEmail = (& git config user.email)
if (-not $userName -or -not $userEmail) {
    die "Git user.name / user.email are not configured. Run:`n  git config --global user.name \"Your Name\"`n  git config --global user.email \"your@email\""
}

# 📌 Aktualna gałąź
$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
Write-Host "→ Current branch: $branch" -ForegroundColor Cyan

# 💾 Commit bieżących zmian (jeśli są)
$changes = (& git status --porcelain)
if ($changes) {
    Write-Host "→ Committing local changes..." -ForegroundColor Yellow
    & git add -A
    & git commit -m "chore: save changes before version bump" | Out-Null
} else {
    Write-Host "→ No local changes to commit before bump." -ForegroundColor DarkGray
}

# 🔼 Podbijanie wersji PATCH (bez auto-tagowania przez npm)
Write-Host "→ Bumping version (patch)..." -ForegroundColor Cyan
$npmOut = & npm --no-git-tag-version version patch
if ($LASTEXITCODE -ne 0) { die "npm version failed." }

$newVer = "$npmOut".Trim()
$newTag = "v$newVer"
Write-Host "→ New version: $newVer" -ForegroundColor Green

# 💾 Commit plików wersji
& git add package.json package-lock.json
& git commit -m "release: v$newVer"

# 🏷 Tworzenie taga
& git tag -a $newTag -m "release: v$newVer"

# ⬆ Wysyłanie na GitHuba
Write-Host "→ Pushing branch..." -ForegroundColor Cyan
& git push origin $branch
Write-Host "→ Pushing tags..." -ForegroundColor Cyan
& git push origin --tags

Write-Host ""
Write-Host "✅ Release complete!" -ForegroundColor Green
Write-Host "   Version:  $newVer"
Write-Host "   Tag:      $newTag"
Write-Host "   Branch:   $branch"
