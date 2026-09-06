from pathlib import Path

from fastapi.testclient import TestClient

MAIN_PY = Path(__file__).resolve().parent.parent / "main.py"


def _preflight(client, origin):
    return client.options(
        "/health",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "GET",
        },
    )


def test_configured_frontend_origin_is_allowed_with_credentials(build_app):
    app = build_app("https://app.example")
    client = TestClient(app)

    response = _preflight(client, "https://app.example")

    assert response.headers["access-control-allow-origin"] == "https://app.example"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_unlisted_origin_is_rejected(build_app):
    app = build_app("https://app.example")
    client = TestClient(app)

    response = _preflight(client, "https://evil.example")

    assert "access-control-allow-origin" not in response.headers


def test_localhost_dev_origin_is_still_allowed(build_app):
    app = build_app("https://app.example")
    client = TestClient(app)

    response = _preflight(client, "http://localhost:3000")

    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_trailing_slash_in_frontend_url_is_stripped(build_app):
    app = build_app("https://app.example/")
    client = TestClient(app)

    response = _preflight(client, "https://app.example")

    assert response.headers["access-control-allow-origin"] == "https://app.example"
    assert response.headers["access-control-allow-credentials"] == "true"


def test_hardcoded_railway_origin_string_is_gone():
    contents = MAIN_PY.read_text()

    assert "frontend-production-bb27" not in contents
