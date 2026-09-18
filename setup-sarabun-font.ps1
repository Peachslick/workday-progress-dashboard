$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$fontDir = Join-Path $root "assets\fonts"
$baseUrl = "https://raw.githubusercontent.com/google/fonts/main/ofl/sarabun"
$fontFiles = @(
    "Sarabun-Regular.ttf",
    "Sarabun-Medium.ttf",
    "Sarabun-SemiBold.ttf",
    "Sarabun-Bold.ttf",
    "Sarabun-ExtraBold.ttf"
)

New-Item -ItemType Directory -Path $fontDir -Force | Out-Null

Write-Host ""
Write-Host "Sarabun local font setup" -ForegroundColor Cyan
Write-Host "Source: Google Fonts official repository"
Write-Host ""

foreach ($file in $fontFiles) {
    $url = "$baseUrl/$file"
    $out = Join-Path $fontDir $file
    Write-Host "Downloading $file ..."
    Invoke-WebRequest -UseBasicParsing -Uri $url -OutFile $out

    if ((Get-Item $out).Length -lt 10000) {
        throw "Downloaded file is unexpectedly small: $file"
    }
}

# Keep the font license beside the local copies.
$licenseUrl = "$baseUrl/OFL.txt"
$licenseOut = Join-Path $fontDir "OFL.txt"
Write-Host "Downloading OFL.txt ..."
Invoke-WebRequest -UseBasicParsing -Uri $licenseUrl -OutFile $licenseOut

Write-Host ""
Write-Host "Sarabun setup completed." -ForegroundColor Green
Write-Host "The dashboard can now use Sarabun offline from assets\fonts."
Write-Host ""
