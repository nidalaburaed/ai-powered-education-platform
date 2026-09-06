import importlib
import os
import sys
from pathlib import Path

import pytest

BACKEND_DIR = str(Path(__file__).resolve().parent.parent)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

os.environ.setdefault("ANTHROPIC_API_KEY", "dummy")
os.environ.setdefault("SUPABASE_URL", "http://localhost:54321")
os.environ.setdefault("SUPABASE_SERVICE_KEY", "dummy.dummy.dummy")
os.environ.setdefault("SUPABASE_ANON_KEY", "dummy.dummy.dummy")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")


@pytest.fixture
def build_app(monkeypatch):
    from app.core.config import settings
    import main

    def _build(frontend_url: str):
        monkeypatch.setattr(settings, "FRONTEND_URL", frontend_url)
        importlib.reload(main)
        return main.app

    yield _build

    monkeypatch.undo()
    importlib.reload(main)
