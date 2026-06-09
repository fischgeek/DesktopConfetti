$appPath = "$env:LOCALAPPDATA\Programs\DesktopConfetti\DesktopConfetti.exe"
$requiredVersion = "1.0.12"

if (Test-Path $appPath) {
    $installedVersion = (Get-Item $appPath).VersionInfo.FileVersion
    if ([version]$installedVersion -ge [version]$requiredVersion) {
        Write-Host "Detected: $installedVersion"
        exit 0
    }
}

exit 1