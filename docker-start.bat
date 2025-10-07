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
echo [3/3] 啟動選項
echo ========================================
echo 請選擇啟動方式:
echo   [1] 快速啟動 (不重新構建，適合代碼無變更)
echo   [2] 完整構建後啟動 (--build，適合 Dockerfile 或依賴有變更)
echo   [3] 智能檢測 (自動判斷是否需要構建)
echo ========================================
echo.
set /p CHOICE="請輸入選項 (1/2/3，預設為 3): "

REM 如果使用者直接按 Enter，使用預設值 3
if "%CHOICE%"=="" set CHOICE=3

echo.

if "%CHOICE%"=="1" (
    echo 執行命令: docker-compose up
    echo.
    docker-compose up
) else if "%CHOICE%"=="2" (
    echo 執行命令: docker-compose up --build
    echo.
    docker-compose up --build
) else if "%CHOICE%"=="3" (
    echo 正在檢測映像狀態...

    REM 檢查後端映像
    docker images -q codepulse-backend >nul 2>&1
    set BACKEND_EXISTS=%errorlevel%

    REM 檢查前端映像
    docker images -q codepulse-frontend >nul 2>&1
    set FRONTEND_EXISTS=%errorlevel%

    if %BACKEND_EXISTS% neq 0 (
        echo ⚠ 後端映像不存在，需要構建
        echo 執行命令: docker-compose up --build
        echo.
        docker-compose up --build
    ) else if %FRONTEND_EXISTS% neq 0 (
        echo ⚠ 前端映像不存在，需要構建
        echo 執行命令: docker-compose up --build
        echo.
        docker-compose up --build
    ) else (
        echo ✓ 映像已存在，執行快速啟動
        echo 執行命令: docker-compose up
        echo.
        echo 💡 提示: 如果 Dockerfile 或依賴有變更，請選擇選項 2 重新構建
        echo.
        docker-compose up
    )
) else (
    echo ✗ 無效的選項，使用預設選項 3 (智能檢測)
    echo.

    REM 重複選項 3 的邏輯
    docker images -q codepulse-backend >nul 2>&1
    if %errorlevel% neq 0 (
        docker-compose up --build
    ) else (
        docker images -q codepulse-frontend >nul 2>&1
        if %errorlevel% neq 0 (
            docker-compose up --build
        ) else (
            docker-compose up
        )
    )
)

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