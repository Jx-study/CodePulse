from urllib.parse import urlparse

ALLOWED_VISUAL_TYPES = {'none', 'image'}
ALLOWED_IMAGE_HOSTS = {'res.cloudinary.com'}
MAX_URL_LENGTH = 500


def validate_visual(visual_type: str, visual_data: dict | None) -> None:
    """Raise ValueError if visual_type/visual_data combination is invalid."""
    if visual_type not in ALLOWED_VISUAL_TYPES:
        raise ValueError(f'Unknown visual_type: {visual_type}')
    if visual_type == 'none':
        if visual_data is not None:
            raise ValueError('visual_data must be null when visual_type=none')
        return
    if visual_type == 'image':
        if not isinstance(visual_data, dict) or 'url' not in visual_data:
            raise ValueError('image visual_data must have url')
        url = visual_data['url']
        if not isinstance(url, str) or len(url) > MAX_URL_LENGTH:
            raise ValueError('invalid url')
        parsed = urlparse(url)
        if parsed.scheme != 'https':
            raise ValueError('url must be HTTPS')
        if parsed.hostname not in ALLOWED_IMAGE_HOSTS:
            raise ValueError(f'host not in allowlist: {parsed.hostname}')
