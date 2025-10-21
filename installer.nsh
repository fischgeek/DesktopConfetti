; Custom NSIS script to ensure correct version is written to registry
!macro customInstall
  ; Write version to registry for software detection tools
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr SHCTX "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Version" "${VERSION}"
!macroend