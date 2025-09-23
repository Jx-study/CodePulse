@echo off
chcp 65001 >nul
echo ========================================
echo    Docker 智能啟動腳本 (環境自適應)
echo ========================================
echo.

echo [1/3] 檢測網路環境...
echo 正在測試 Docker Hub 連通性...

REM 嘗試實際拉取測試映像檔
docker pull hello-world:latest --quiet >nul 2>&1

if %errorlevel% == 0 (
    echo ✓ Docker Hub 官方源可用
    echo [2/3] 使用 Docker Hub 官方源...
    set "REGISTRY_PREFIX="
) else (
    echo ✗ Docker Hub 無法連接
    echo [2/3] 切換至 dockerproxy.com 鏡像源...
    set "REGISTRY_PREFIX=dockerproxy.com/library/"
)

echo.
echo [3/3] 啟動 Docker Compose...
echo 執行命令: docker-compose up --build
echo.

REM 執行 docker-compose
docker-compose up --build

if %errorlevel% == 0 (
    echo.
    echo ✓ 應用啟動成功！
    echo.
    echo 服務資訊:
    echo   後端: http://localhost:5000
    echo   前端: http://localhost:5173
) else (
    echo.
    echo ✗ 應用啟動失敗 (錯誤代碼: %errorlevel%)
    echo.
    echo 故障排除建議:
    echo   1. 檢查 Docker Desktop 是否正在運行(輸入docker version)
    echo   2. 確認網路連接穩定
    echo   3. 直接執行: docker-compose up --build
)

echo.
echo ========================================
pause