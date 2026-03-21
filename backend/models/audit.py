from database import db
from datetime import datetime, timezone
import uuid


class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    audit_id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    event_id = db.Column(db.String(36), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    event_timestamp = db.Column(db.DateTime(timezone=True), nullable=False, default=datetime.now(timezone.utc))
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.BigInteger, nullable=False)
    action = db.Column(db.String(20), nullable=False)  # 'INSERT' | 'UPDATE' | 'DELETE'
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.user_id', ondelete='SET NULL'), nullable=True)
    request_id = db.Column(db.String(128), nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)  # supports IPv6
    user_agent = db.Column(db.Text, nullable=True)
    service_name = db.Column(db.String(50), nullable=True)
    old_data = db.Column(db.JSON, nullable=True)
    new_data = db.Column(db.JSON, nullable=True)
    changes = db.Column(db.JSON, nullable=True)
    checksum = db.Column(db.String(64), nullable=True)

    __table_args__ = (
        db.Index('ix_audit_logs_event_id', 'event_id'),
        db.Index('ix_audit_logs_table_record', 'table_name', 'record_id'),
        db.Index('ix_audit_logs_user_id', 'user_id'),
        db.Index('ix_audit_logs_event_timestamp', 'event_timestamp'),
        db.Index('ix_audit_logs_request_id', 'request_id'),
    )

    def __repr__(self):
        return f'<AuditLog {self.audit_id} {self.action} {self.table_name}:{self.record_id}>'
