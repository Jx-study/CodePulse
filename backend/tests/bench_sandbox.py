"""
bench_sandbox.py — 量測 sandbox-sidecar 的 POST /run 延遲

執行前提：
  1. docker-compose.yml 把 sandbox-sidecar 的 8080 port 暴露到 host
  2. docker compose up -d sandbox-sidecar 已啟動

用法：
  python backend/tests/bench_sandbox.py            # 預設 30 次串行
  python backend/tests/bench_sandbox.py --n 50     # 跑 50 次
  python backend/tests/bench_sandbox.py --concurrent 5 --n 20  # 5 並發 x 20 次

這個腳本量的是「sidecar 收到 /run → 容器跑完 → 回傳」的純粹延遲，
不含 Gemini / MiniLM / AST 等其他分析（那些跟 pool 改造無關）。
"""

import argparse
import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

SIDECAR_URL = "http://localhost:8080/run"

# 三種代表性 workload：簡單、中等、稍重
WORKLOADS = {
    "trivial": "x = 1 + 1\n",
    "bubble_sort_small": """
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

bubble_sort([5, 3, 8, 1, 2, 7, 4, 6])
""",
    "bubble_sort_medium": """
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(len(arr) - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

bubble_sort(list(range(50, 0, -1)))
""",
}


def one_request(code: str, timeout: float = 30.0) -> tuple[float, bool]:
    """送一個請求，回傳 (耗時 ms, 是否成功)"""
    t0 = time.perf_counter()
    try:
        r = requests.post(SIDECAR_URL, json={"code": code}, timeout=timeout)
        elapsed_ms = (time.perf_counter() - t0) * 1000
        ok = r.status_code == 200 and "error" not in r.json()
        return elapsed_ms, ok
    except Exception as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        print(f"  [error] {e}")
        return elapsed_ms, False


def run_serial(code: str, n: int, label: str) -> None:
    print(f"\n=== Serial benchmark: {label} (n={n}) ===")
    times: list[float] = []
    fails = 0
    for i in range(n):
        elapsed, ok = one_request(code)
        if not ok:
            fails += 1
        times.append(elapsed)
        print(f"  {i + 1:3d}: {elapsed:7.1f}ms{' (FAIL)' if not ok else ''}")
    _print_stats(times, fails)


def run_concurrent(code: str, n: int, concurrency: int, label: str) -> None:
    print(f"\n=== Concurrent benchmark: {label} (n={n}, concurrency={concurrency}) ===")
    times: list[float] = []
    fails = 0
    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=concurrency) as ex:
        futures = [ex.submit(one_request, code) for _ in range(n)]
        for f in as_completed(futures):
            elapsed, ok = f.result()
            if not ok:
                fails += 1
            times.append(elapsed)
    wall = (time.perf_counter() - t0) * 1000
    _print_stats(times, fails)
    print(f"  總牆鐘時間：{wall:.0f}ms（理論串行：{sum(times):.0f}ms）")
    print(f"  → 並發加速比：{sum(times) / wall:.2f}x")


def _print_stats(times: list[float], fails: int) -> None:
    times_sorted = sorted(times)
    n = len(times)
    print(f"\n  --- 統計 ---")
    print(f"  成功：{n - fails}/{n}    失敗：{fails}")
    print(f"  平均：{statistics.mean(times):.1f}ms")
    print(f"  P50 ：{times_sorted[n // 2]:.1f}ms")
    print(f"  P95 ：{times_sorted[min(int(n * 0.95), n - 1)]:.1f}ms")
    print(f"  最快：{min(times):.1f}ms")
    print(f"  最慢：{max(times):.1f}ms")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=30, help="總請求數")
    parser.add_argument("--concurrent", type=int, default=1, help="並發數（1 = 串行）")
    parser.add_argument(
        "--workload",
        choices=list(WORKLOADS.keys()),
        default="bubble_sort_small",
    )
    args = parser.parse_args()

    code = WORKLOADS[args.workload]

    # 先做 health check
    try:
        requests.post(SIDECAR_URL, json={"code": "x=1\n"}, timeout=10)
    except requests.ConnectionError:
        print("❌ 連不到 http://localhost:8080/run")
        print("   檢查：docker-compose.yml 是否暴露了 sandbox-sidecar 的 8080 port？")
        print("   確認：docker compose up -d sandbox-sidecar")
        return

    if args.concurrent == 1:
        run_serial(code, args.n, args.workload)
    else:
        run_concurrent(code, args.n, args.concurrent, args.workload)


if __name__ == "__main__":
    main()
