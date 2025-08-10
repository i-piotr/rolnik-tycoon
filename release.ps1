Param(
    [ValidateSet("patch","minor","major")]
    [string]$Type = "patch",
    [string]$Message = "release: %s",
    [string]$PreCommitMessage = "chore: save changes before version bump",
    [string]$Remote = "origin"
)

$ErrorActionPreference = "Stop"

function die($msg) {
    Write-Host "`nERROR: $msg" -ForegroundColor Red
    exit 1
}

# 0) Basic checks
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { die "Git is not installed or not in PATH." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { die "npm is not installed or not in PATH." }

# Inside a git repo?
$inside = (& git rev-parse --is-inside-work-tree 2>$null)
if (-not $inside) { die "This folder is not a Git repository." }

# User identity configured?
$userName = (& git config user.name)
$userEmail = (& git config user.email)
if (-not $userName -or -not $userEmail) {
    die "Git user.name / user.email are not configured. Run:`n  git config --global user.name \"Your Name\"`n  git config --global user.email \"your@email\""
}

# Current branch
$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
if (-not $branch) { die "Cannot determine current Git branch." }

Write-Host "→ Current branch: $branch" -ForegroundColor Cyan

# 1) Stage & pre-commit if there are changes
$changes = (& git status --porcelain)
if ($changes) {
    Write-Host "→ Staging and committing current changes..." -ForegroundColor Yellow
    & git add -A
    & git commit -m $PreCommitMessage | Out-Null
} else {
    Write-Host "→ No local changes to commit." -ForegroundColor DarkGray
}

# 2) Bump version via npm (creates commit + tag)
Write-Host "→ Bumping version ($Type)..." -ForegroundColor Cyan
$npmOut = & npm version $Type -m $Message
if ($LASTEXITCODE -ne 0) { die "npm version failed." }

# npm returns something like "v0.8.7"
$newTag = "$npmOut".Trim()
$newVer = $newTag.TrimStart('v')

Write-Host "→ New version: $newVer (tag $newTag)" -ForegroundColor Green

# 3) Push commit & tag
Write-Host "→ Pushing to $Remote/$branch..." -ForegroundColor Cyan
& git push $Remote $branch
if ($LASTEXITCODE -ne 0) { die "git push branch failed." }

Write-Host "→ Pushing tags..." -ForegroundColor Cyan
& git push $Remote --tags
if ($LASTEXITCODE -ne 0) { die "git push tags failed." }

# 4) Summary
Write-Host ""
Write-Host "✅ Release complete!" -ForegroundColor Green
Write-Host "   Version:  $newVer"
Write-Host "   Tag:      $newTag"
Write-Host "   Branch:   $branch"
Write-Host ""
Write-Host "Tip: To preview production build locally:" -ForegroundColor DarkGray
Write-Host "     npm run build" -ForegroundColor DarkGray
Write-Host "     npm run preview" -ForegroundColor DarkGray
