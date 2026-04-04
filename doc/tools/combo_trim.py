#!/usr/bin/env python3
"""
combo_trim.py - コンボ動画の自動トリミングスクリプト

ロジック:
  スタート点: 後ろからスキャンして最後の silence_end（= 成功コンボの1発目）
  エンド点:   動画末尾そのまま（余白は気にしない）

前提:
  成功したらすぐリプレイ保存すること（= 成功コンボがクリップ末尾にある状態）
  ffmpeg と ffprobe が PATH に通っていること

使い方:
  python combo_trim.py <動画フォルダ>
  例: python combo_trim.py C:/Videos/combos
"""

import subprocess
import re
import os
import sys
import json
from pathlib import Path


# ============================================================
# 調整パラメータ（動画を見ながら数値を調整してください）
# ============================================================

SILENCE_NOISE    = "-35dB" # 無音判定の音量基準 ゲーム音量に応じて -30〜-40 で調整
SILENCE_DURATION = 0.5     # 無音と判定する最低継続時間（秒）
START_OFFSET     = -1    # スタート点の微調整（秒） マイナスで少し前から
IGNORE_TAIL_SEC  = 4.0     # 末尾このN秒以内の silence_end は無視する

VIDEO_EXTENSIONS = {".mp4", ".mkv", ".mov", ".avi", ".flv"}


# ============================================================
# ffmpeg ラッパー
# ============================================================

def get_video_duration(input_path: str) -> float:
    """動画の総時間を取得（秒）"""
    cmd = [
        "ffprobe", "-v", "quiet",
        "-print_format", "json",
        "-show_format",
        input_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffprobe failed: {result.stderr}")
    data = json.loads(result.stdout)
    return float(data["format"]["duration"])



def find_silence_regions(input_path: str) -> list:
    """無音区間の start / end リストを返す。末尾まで無音の場合 end=None"""
    cmd = [
        "ffmpeg", "-i", input_path,
        "-af", f"silencedetect=noise={SILENCE_NOISE}:d={SILENCE_DURATION}",
        "-f", "null", "-",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)

    regions = []
    current = {}
    for line in result.stderr.splitlines():
        s = re.search(r"silence_start: ([\d.]+)", line)
        e = re.search(r"silence_end: ([\d.]+)", line)
        if s:
            current = {"start": float(s.group(1)), "end": None}
        if e and current:
            current["end"] = float(e.group(1))
            regions.append(current)
            current = {}

    # クリップ末尾まで無音（silence_end が出ないケース）
    if "start" in current:
        regions.append(current)

    return regions


def cut_video(input_path: str, output_path: str, start: float):
    """start 以降を末尾まで copy モードで切り出す"""
    cmd = [
        "ffmpeg", "-y",
        "-i", input_path,
        "-ss", str(max(0.0, start)),
        "-c", "copy",
        output_path,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg cut failed:\n{result.stderr[-500:]}")


# ============================================================
# メイン処理
# ============================================================

def process_video(input_path: str, output_dir: str):
    p = Path(input_path)
    output_path = str(Path(output_dir) / f"{p.stem}_trimmed{p.suffix}")

    print(f"\n{'='*50}")
    print(f"処理中: {p.name}")

    try:
        duration = get_video_duration(input_path)
        print(f"  動画長: {duration:.2f} 秒")

        # ---- スタート点（後ろから最後の silence_end = 成功コンボの1発目） ----
        silences = find_silence_regions(input_path)
        silence_ends = [
            r["end"] for r in silences
            if r["end"] is not None and r["end"] < duration - IGNORE_TAIL_SEC
        ]

        if silence_ends:
            start_time = max(0.0, silence_ends[-1] + START_OFFSET)
            print(f"  無音区間: {len(silences)} 個検出（末尾 {IGNORE_TAIL_SEC}秒以内は除外）")
            print(f"  最後の silence_end: {silence_ends[-1]:.2f} 秒 → スタート: {start_time:.2f} 秒")
        else:
            start_time = 0.0
            print(f"  無音なし → スタート: 0.00 秒（先頭から）")

        # ---- エンド点（動画末尾そのまま） ----
        print(f"  エンド: {duration:.2f} 秒（末尾まで）")

        # ---- バリデーション ----
        if start_time >= duration:
            print(f"  !! スキップ: スタート({start_time:.2f}) >= 動画長({duration:.2f})")
            print(f"     SILENCE_NOISE を調整してください")
            return

        print(f"  切り出し長: {duration - start_time:.2f} 秒")

        # ---- カット実行 ----
        cut_video(input_path, output_path, start_time)
        print(f"  完了 → {output_path}")

    except Exception as e:
        print(f"  エラー: {e}")


def main():
    if len(sys.argv) < 2:
        print("使い方: python combo_trim.py <動画フォルダ>")
        print("例:     python combo_trim.py C:/Videos/combos")
        sys.exit(1)

    input_dir = Path(sys.argv[1])
    if not input_dir.is_dir():
        print(f"エラー: フォルダが見つかりません: {input_dir}")
        sys.exit(1)

    output_dir = input_dir / "output"
    output_dir.mkdir(exist_ok=True)

    videos = sorted(f for f in input_dir.iterdir() if f.suffix.lower() in VIDEO_EXTENSIONS)
    if not videos:
        print(f"動画ファイルが見つかりません ({'/'.join(VIDEO_EXTENSIONS)}): {input_dir}")
        sys.exit(1)

    print(f"対象: {len(videos)} 本 → {output_dir}")
    for video in videos:
        process_video(str(video), str(output_dir))

    print(f"\n{'='*50}")
    print("全処理完了")


if __name__ == "__main__":
    main()
