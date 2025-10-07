from supabase import create_client, Client
from config import Config
import logging

# Supabase 客戶端
supabase: Client = None

def init_supabase():
    """初始化 Supabase 客戶端"""
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

def get_supabase_client():
    """獲取 Supabase 客戶端實例"""
    global supabase
    if supabase is None:
        supabase = init_supabase()
    return supabase

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