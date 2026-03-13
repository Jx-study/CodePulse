"""Tests for /api/users endpoints."""


def _authed(client, auth_headers, method, path, **kwargs):
    """Make an authenticated request using the access_token cookie."""
    token = auth_headers['access_token']
    client.set_cookie('access_token', token)
    fn = getattr(client, method)
    resp = fn(path, **kwargs)
    client.delete_cookie('access_token')
    return resp


def test_health_endpoint(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200


def test_upload_signature_requires_auth(client):
    resp = client.get('/api/users/me/upload-signature')
    assert resp.status_code == 401


def test_upload_signature_returns_fields(client, auth_headers):
    resp = _authed(client, auth_headers, 'get', '/api/users/me/upload-signature')
    assert resp.status_code == 200
    data = resp.get_json()
    assert 'signature' in data
    assert 'timestamp' in data
    assert 'cloud_name' in data
    assert 'api_key' in data
    assert 'folder' in data
    assert 'public_id' in data


def test_patch_me_updates_avatar_url(client, auth_headers):
    resp = _authed(
        client, auth_headers, 'patch', '/api/users/me',
        json={'avatar_url': 'https://res.cloudinary.com/demo/image/upload/sample.jpg'},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['user']['avatar_url'] == 'https://res.cloudinary.com/demo/image/upload/sample.jpg'


def test_patch_me_rejects_empty_display_name(client, auth_headers):
    resp = _authed(
        client, auth_headers, 'patch', '/api/users/me',
        json={'display_name': ''},
    )
    assert resp.status_code == 400
