set -eu
n=$1
project=otchet-kafe-start
[[ "$n" == 05 ]] && project=otchet-kafe-bez-tipov
target="$GITHUB_WORKSPACE/course/lesson_$n/$project"
base="$GITHUB_WORKSPACE/course/materials/tema-04-annotacii-tipov"
cp -R "$base/$project" "$target"
if [[ "$n" == 05 ]]; then cp -r "$base/otchet-kafe-start/app/." "$target/app/"; fi
cd "$target"
python -m venv .venv
.venv/bin/python -m pip install -qr requirements.txt
mkdir -p .vscode "$RUNNER_TEMP/profile/User"
cp "$GITHUB_WORKSPACE/capture/settings.json" "$RUNNER_TEMP/profile/User/settings.json"
python - "$n" <<'PY'
import json,sys
from pathlib import Path
p=Path('.vscode/settings.json')
d=json.loads(p.read_text())
d['python.analysis.typeCheckingMode']='basic'
if sys.argv[1]=='07':
 d.update({'autoDocstring.docstringFormat':'google-notypes','autoDocstring.includeExtendedSummary':False})
else:
 q=Path(__import__('os').environ['RUNNER_TEMP'])/'profile/User/settings.json'
 u=json.loads(q.read_text());u['ruff.enable']=False;q.write_text(json.dumps(u))
p.write_text(json.dumps(d,indent=2))
PY
if [[ "$n" == 07 ]]; then cp "$GITHUB_WORKSPACE/capture/python.code-snippets" .vscode/; fi
cd "$RUNNER_TEMP"
curl -fsSL https://update.code.visualstudio.com/latest/linux-x64/stable | tar xz
code="$RUNNER_TEMP/VSCode-linux-x64/bin/code"
opts=(--disable-gpu --user-data-dir "$RUNNER_TEMP/profile" --extensions-dir "$RUNNER_TEMP/extensions")
"$code" "${opts[@]}" --install-extension ms-python.python --install-extension ms-python.vscode-pylance --install-extension njpwerner.autodocstring --install-extension charliermarsh.ruff
"$code" "${opts[@]}" --extensionDevelopmentPath="$GITHUB_WORKSPACE/capture/runner" "$target"
for i in $(seq 1 180); do
  if [[ -f "$GITHUB_WORKSPACE/capture/finished" ]]; then exit 0; fi
  if [[ -f "$GITHUB_WORKSPACE/capture/failed" ]]; then cat "$GITHUB_WORKSPACE/capture/failed"; exit 1; fi
  sleep 2
done
exit 1
