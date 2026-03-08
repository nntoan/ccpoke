export function buildWindowsHookScript(
  version: string,
  port: number,
  route: string,
  secret: string
): string {
  return [
    `@REM ccpoke-version: ${version}`,
    `@echo off`,
    `setlocal`,
    `if not defined CCPOKE_HOST set CCPOKE_HOST=localhost`,
    `set TMPFILE=%TEMP%\\\\ccpoke-%RANDOM%%RANDOM%.json`,
    `findstr "^" > %TMPFILE%`,
    `set TMUX_TARGET=`,
    `if defined TMUX_PANE (`,
    `  for /f "tokens=*" %%a in ('psmux display-message -p "#{session_name}:#{window_index}.#{pane_index}" 2^>nul') do set TMUX_TARGET=%%a`,
    `)`,
    `if defined TMUX_TARGET (`,
    `  powershell -NoProfile -Command "$j=Get-Content '%TMPFILE%' -Raw|ConvertFrom-Json; $j|Add-Member -NotePropertyName tmux_target -NotePropertyValue '%TMUX_TARGET%' -Force; $j|ConvertTo-Json -Compress|Set-Content '%TMPFILE%'"`,
    `)`,
    `curl -s -X POST http://%CCPOKE_HOST%:${port}${route} -H "Content-Type: application/json" -H "X-CCPoke-Secret: ${secret}" -d @%TMPFILE% > nul 2>&1`,
    `del %TMPFILE% > nul 2>&1`,
    `endlocal`,
    ``,
  ].join("\r\n");
}
