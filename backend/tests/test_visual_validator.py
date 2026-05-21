import pytest


def test_none_type_null_data_passes():
    from services.visual_validator import validate_visual
    validate_visual("none", None)  # must not raise


def test_none_type_with_data_raises():
    from services.visual_validator import validate_visual
    with pytest.raises(ValueError, match="must be null"):
        validate_visual("none", {"url": "https://res.cloudinary.com/x/img.png"})


def test_image_type_valid_url_passes():
    from services.visual_validator import validate_visual
    validate_visual("image", {"url": "https://res.cloudinary.com/codepulse/image/upload/v1/img.png"})


def test_image_type_missing_url_raises():
    from services.visual_validator import validate_visual
    with pytest.raises(ValueError, match="must have url"):
        validate_visual("image", {"other": "field"})


def test_image_type_http_raises():
    from services.visual_validator import validate_visual
    with pytest.raises(ValueError, match="HTTPS"):
        validate_visual("image", {"url": "http://res.cloudinary.com/x/img.png"})


def test_image_type_disallowed_host_raises():
    from services.visual_validator import validate_visual
    with pytest.raises(ValueError, match="allowlist"):
        validate_visual("image", {"url": "https://evil.com/img.png"})


def test_image_type_url_too_long_raises():
    from services.visual_validator import validate_visual
    long_url = "https://res.cloudinary.com/" + "a" * 480
    with pytest.raises(ValueError, match="invalid url"):
        validate_visual("image", {"url": long_url})


def test_unknown_visual_type_raises():
    from services.visual_validator import validate_visual
    with pytest.raises(ValueError, match="Unknown visual_type"):
        validate_visual("graph", None)


def test_image_type_userinfo_in_url_raises():
    from services.visual_validator import validate_visual
    # https://user@evil.com/... should fail allowlist
    with pytest.raises(ValueError, match="allowlist"):
        validate_visual("image", {"url": "https://user@evil.com/img.png"})
