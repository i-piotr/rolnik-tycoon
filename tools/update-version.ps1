Param()
$root = Split-Path -Parent $PSScriptRoot
$pkgPath = Join-Path $root 'package.json'
if (!(Test-Path $pkgPath)) { Write-Error "Nie znaleziono package.json"; exit 1 }
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$ver = $pkg.version
if (-not $ver) { Write-Error 'Brak pola "version" w package.json'; exit 1 }

$target = Join-Path $root 'src\version.ts'
$content = "export const APP_VERSION = `"$ver`";`nexport default APP_VERSION;`n"

if (Test-Path $target) { $current = Get-Content $target -Raw } else { $current = "" }
if ($current -ne $content) {
  $content | Set-Content -Path $target -Encoding UTF8
  Write-Host "Zaktualizowano src/version.ts -> $ver"
} else {
  Write-Host "APP_VERSION już aktualne ($ver)"
}
