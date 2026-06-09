; Custom NSIS script to ensure correct version is written to registry
!macro customInstall
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Version" "${VERSION}"
  WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "DesktopConfetti" "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
!macroend

!macro customUnInstall
  DeleteRegValue HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Run" "DesktopConfetti"
!macroend