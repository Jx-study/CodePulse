from flask import current_app, render_template
from flask_mailman import EmailMultiAlternatives

def send_verification_email(email: str, code: str) -> None:
    """發送包含 HTML 內容的 6 位數驗證碼郵件"""
    
    subject = 'CodePulse — 驗證碼'
    
    # 備用純文字內容 (當 HTML 無法顯示時)
    text_content = f'您的驗證碼為：{code}\n有效時間：5 分鐘'
    
    # HTML 內容 (可以直接寫字串，或者使用 render_template)
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #333;">CodePulse 驗證</h2>
        <p>您好，您的驗證碼為：</p>
        <div style="background: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #2d89ef;">
            {code}
        </div>
        <p style="font-size: 14px; color: #666;">有效時間：<strong>5 分鐘</strong></p>
        <hr>
        <p style="font-size: 12px; color: #999;">若非本人操作，請忽略此郵件。</p>
    </div>
    """

    msg = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=current_app.config.get('MAIL_DEFAULT_SENDER'),
        to=[email],
    )
    
    # 注入 HTML 版本
    msg.attach_alternative(html_content, "text/html")
    msg.send()