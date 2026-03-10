from flask import current_app
from flask_mailman import Mail, EmailMessage


def send_verification_email(email: str, code: str) -> None:
    """Send a 6-character verification code to the given email address."""
    mail: Mail = current_app.extensions['mail']
    msg = EmailMessage(
        subject='CodePulse — 驗證碼',
        body=(
            f'您的驗證碼為：{code}\n'
            f'有效時間：5 分鐘\n'
            f'若非本人操作，請忽略此郵件。'
        ),
        to=[email],
    )
    msg.send()
