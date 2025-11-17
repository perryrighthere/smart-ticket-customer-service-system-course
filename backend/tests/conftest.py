import os
import sys

# Ensure 'backend/app' package is importable when pytest sets rootdir at repo root
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

