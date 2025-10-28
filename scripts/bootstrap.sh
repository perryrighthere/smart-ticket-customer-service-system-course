#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt

pushd frontend >/dev/null
npm install
popd >/dev/null

echo "Bootstrap complete. Activate venv with 'source .venv/bin/activate'"
