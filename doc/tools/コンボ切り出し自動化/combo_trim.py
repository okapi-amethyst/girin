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
  python combo_trim.py <watchフォルダ>
  例: python combo_trim.py C:/Videos/combos/watch

  引数なしの場合は、スクリプトと同じ階層の watch/ を見る
"""

import subprocess
import re
import os
import sys
import json
import shutil
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


def open_video(output_path: str):
    """Windows の既定アプリで動画を開く"""
    if os.name != "nt":
        print("  注意: 自動再生は Windows のみ対応です")
        return
    os.startfile(output_path)


# ============================================================
# メイン処理
# ============================================================

def process_video(input_path: str, output_dir: str) -> str | None:
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
            return None

        print(f"  切り出し長: {duration - start_time:.2f} 秒")

        # ---- カット実行 ----
        cut_video(input_path, output_path, start_time)
        print(f"  完了 → {output_path}")
        return output_path

    except Exception as e:
        print(f"  エラー: {e}")
        return None


def move_source(video_path: Path, destination_dir: Path) -> Path:
    """元動画を再処理防止のため退避"""
    destination_dir.mkdir(exist_ok=True)
    target = destination_dir / video_path.name

    if target.exists():
        stem = video_path.stem
        suffix = video_path.suffix
        index = 1
        while target.exists():
            target = destination_dir / f"{stem}_{index}{suffix}"
            index += 1

    shutil.move(str(video_path), str(target))
    return target


def main():
    script_dir = Path(__file__).resolve().parent
    input_dir = Path(sys.argv[1]) if len(sys.argv) >= 2 else script_dir / "watch"
    if not input_dir.is_dir():
        print(f"エラー: フォルダが見つかりません: {input_dir}")
        sys.exit(1)

    output_dir = input_dir / "output"
    done_dir = input_dir / "done"
    error_dir = input_dir / "error"
    output_dir.mkdir(exist_ok=True)

    videos = sorted(
        f for f in input_dir.iterdir()
        if f.is_file() and f.suffix.lower() in VIDEO_EXTENSIONS
    )
    if not videos:
        print(f"動画ファイルが見つかりません ({'/'.join(VIDEO_EXTENSIONS)}): {input_dir}")
        sys.exit(1)

    print(f"対象: {len(videos)} 本")
    print(f"watch : {input_dir}")
    print(f"output: {output_dir}")
    print(f"done  : {done_dir}")
    print(f"error : {error_dir}")

    for index, video in enumerate(videos, start=1):
        print(f"\n[{index}/{len(videos)}]")
        output_path = process_video(str(video), str(output_dir))

        if output_path is None:
            moved = move_source(video, error_dir)
            print(f"  元動画を error へ移動 → {moved}")
            continue

        moved = move_source(video, done_dir)
        print(f"  元動画を done へ移動 → {moved}")
        print("  出力動画を再生します。確認後、プレイヤーを閉じて Enter で次へ進んでください。")
        open_video(output_path)

        if index < len(videos):
            input("  Enter > ")
        else:
            input("  最後の確認後、Enter で終了 > ")

    print(f"\n{'='*50}")
    print("全処理完了")


if __name__ == "__main__":
    main()
