#!/bin/zsh

set -e

cd /Users/harry/Codex/personal_website

HOST="127.0.0.1"
PORT=8000
MAX_PORT=8010

if ! command -v python3 >/dev/null 2>&1; then
  echo "Could not find python3."
  echo "Install Python 3, then run this launcher again."
  echo ""
  echo "Press Enter to close this window."
  read
  exit 1
fi

while lsof -nP -iTCP:${PORT} -sTCP:LISTEN >/dev/null 2>&1; do
  if [ "${PORT}" -ge "${MAX_PORT}" ]; then
    echo "Ports 8000-8010 are already in use."
    echo "Close an older local website Terminal window and try again."
    echo ""
    echo "Press Enter to close this window."
    read
    exit 1
  fi

  PORT=$((PORT + 1))
done

URL="http://${HOST}:${PORT}"

echo "Starting Xingjian Bi personal website preview..."
echo "Folder: /Users/harry/Codex/personal_website"
echo "URL: ${URL}"
echo ""
echo "Edit files in this folder, then refresh the browser to see updates."
echo "To stop the preview, press Ctrl+C in this Terminal window."
echo ""

if [ "${PERSONAL_WEBSITE_OPEN_BROWSER:-1}" != "0" ]; then
  ( sleep 1; open "${URL}" >/dev/null 2>&1 || true ) &
fi

python3 -m http.server "${PORT}" --bind "${HOST}"
