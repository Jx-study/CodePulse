from supabase import create_client, Client
from config import Config
import logging

# Supabase 客戶端
supabase: Client = None
supabase_admin: Client = None

def init_supabase():
    """初始化 Supabase 客戶端 (使用 ANON_KEY)"""
    global supabase
    try:
        supabase = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_ANON_KEY
        )
        logging.info("Supabase 客戶端初始化成功")
        return supabase
    except Exception as e:
        logging.error(f"Supabase 初始化失敗: {e}")
        raise e

def init_supabase_admin():
    """初始化 Supabase Admin 客戶端 (使用 SERVICE_ROLE_KEY)"""
    global supabase_admin
    try:
        if not Config.SUPABASE_SERVICE_ROLE_KEY:
            logging.warning("SUPABASE_SERVICE_ROLE_KEY 未設置，admin 功能將無法使用")
            return None

        supabase_admin = create_client(
            Config.SUPABASE_URL,
            Config.SUPABASE_SERVICE_ROLE_KEY
        )
        logging.info("Supabase Admin 客戶端初始化成功")
        return supabase_admin
    except Exception as e:
        logging.error(f"Supabase Admin 初始化失敗: {e}")
        return None

def get_supabase_client():
    """獲取 Supabase 客戶端實例 (一般用途)"""
    global supabase
    if supabase is None:
        supabase = init_supabase()
    return supabase

def get_supabase_admin_client():
    """獲取 Supabase Admin 客戶端實例 (需要 admin 權限的操作)"""
    global supabase_admin
    if supabase_admin is None:
        supabase_admin = init_supabase_admin()
    return supabase_admin

def test_connection():
    """測試資料庫連接"""
    try:
        supabase_client = get_supabase_client()
        # 簡單測試 - 檢查客戶端是否創建成功
        if supabase_client:
            logging.info("Supabase 連接測試成功")
            return True
        return False
    except Exception as e:
        logging.warning(f"Supabase 連接測試: {e}")
        return False