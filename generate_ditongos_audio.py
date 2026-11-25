#!/usr/bin/env python3
"""Generate MP3 speech files from data/words.csv using macOS say + ffmpeg."""
import argparse
import csv
import shutil
import subprocess
import tempfile
from pathlib import Path

BASE = Path(__file__).resolve().parent
CSV_PATH = BASE / "data" / "words.csv"
AUDIO_DIR = BASE / "audio"

parser = argparse.ArgumentParser(description="Generate Portuguese word MP3s using a macOS voice.")
parser.add_argument("--voice", default="Joana", help="macOS voice name (default: Joana)")
parser.add_argument("--overwrite", action="store_true", help="replace MP3 files already present")
args = parser.parse_args()

if not CSV_PATH.exists():
    raise SystemExit(f"Could not find {CSV_PATH}. Put this script beside the data and audio folders.")
if not shutil.which("say"):
    raise SystemExit("This script requires macOS 'say'.")
if not shutil.which("ffmpeg"):
    raise SystemExit("ffmpeg is not installed. Install it with: brew install ffmpeg")
AUDIO_DIR.mkdir(exist_ok=True)

with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as f:
    rows = list(csv.DictReader(f))

# Build unique output/text pairs, using the CSV's sound filename field.
tasks = {}
for row in rows:
    word = (row.get("word") or "").strip()
    sound = (row.get("sound") or "").strip()
    if word and sound:
        tasks[sound] = word

if not tasks:
    raise SystemExit("No usable rows found. The CSV needs 'word' and 'sound' columns.")

made = skipped = 0
with tempfile.TemporaryDirectory(prefix="ditongos_tts_") as tmp:
    tmpdir = Path(tmp)
    for filename, word in tasks.items():
        dest = AUDIO_DIR / filename
        if dest.exists() and not args.overwrite:
            print(f"SKIP (already exists): {filename}")
            skipped += 1
            continue
        aiff = tmpdir / (dest.stem + ".aiff")
        print(f"Generating: {word} -> {filename}")
        subprocess.run(["say", "-v", args.voice, "-o", str(aiff), word], check=True)
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(aiff), "-codec:a", "libmp3lame", "-q:a", "3", str(dest)], check=True)
        made += 1

print(f"\nDone. Created {made} MP3 file(s); skipped {skipped} existing file(s).")
