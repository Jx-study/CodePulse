Write-Host "========================================"
Write-Host "   Docker Smart Launcher"
Write-Host "========================================"
Write-Host ""

# ── [1/3] Network check ──────────────────────────
Write-Host "[1/3] Checking network environment..."
Write-Host "Testing Docker Hub connectivity..."

docker pull hello-world:latest --quiet 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Docker Hub is reachable"
    Write-Host "[2/3] Using Docker Hub official registry..."
    $registryPrefix = ""
} else {
    Write-Host "[FAIL] Docker Hub unreachable"
    Write-Host "[2/3] Switching to dockerproxy.com mirror..."
    $registryPrefix = "dockerproxy.com/library/"
}

# ── [3/3] Launch options ─────────────────────────
Write-Host ""
Write-Host "[3/3] Launch options"
Write-Host "========================================"
Write-Host "  [1] Quick start    (no rebuild)"
Write-Host "  [2] Full build     (--build)"
Write-Host "  [3] Auto detect    (build only if image missing)"
Write-Host "========================================"
Write-Host ""
$choice = Read-Host "Select option (1/2/3) [default: 1]"
if ($choice -eq "") { $choice = "1" }
Write-Host ""

# ── Determine compose args ────────────────────────
function Get-NeedsBuild {
    $b = docker images -q codepulse-backend  2>$null
    $f = docker images -q codepulse-frontend 2>$null
    return (-not $b -or -not $f)
}

$buildFlag = switch ($choice) {
    "1" {
        Write-Host ">> docker compose up"
        $false
    }
    "2" {
        Write-Host ">> docker compose up --build"
        $true
    }
    "3" {
        Write-Host "Checking image status..."
        if (Get-NeedsBuild) {
            Write-Host "[WARN] Image missing, build required"
            Write-Host ">> docker compose up --build"
            $true
        } else {
            Write-Host "[OK] Images exist, quick start"
            Write-Host "Note: select [2] if Dockerfile or dependencies changed"
            Write-Host ">> docker compose up"
            $false
        }
    }
    default {
        Write-Host "[WARN] Invalid option, falling back to auto detect"
        Get-NeedsBuild
    }
}

Write-Host ""

# ── Run (try/finally catches Ctrl+C) ─────────────
try {
    if ($buildFlag) {
        docker compose up --build
    } else {
        docker compose up
    }
} finally {
    Write-Host ""
    Write-Host "========================================"
    Write-Host "Service stopped or interrupted"
    Write-Host "========================================"
    Write-Host ""
    $downChoice = Read-Host "Run 'docker compose down' to clean up? (y/N)"

    if ($downChoice -ieq "y") {
        Write-Host ""
        Write-Host ">> docker compose down"
        docker compose down
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Containers removed"
        } else {
            Write-Host "[FAIL] docker compose down failed"
        }
        $poolIds = docker ps -aq --filter "label=codepulse-pool=1"
        if ($poolIds) {
            Write-Host ">> Removing sandbox pool containers..."
            docker rm -f $poolIds
            Write-Host "[OK] Pool containers removed"
        }
    } else {
        Write-Host ""
        Write-Host "Containers kept. Run 'docker compose down' manually when done."
    }

    Write-Host ""
    Write-Host "========================================"
    Read-Host "Press Enter to exit"
}