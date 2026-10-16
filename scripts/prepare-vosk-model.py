#!/usr/bin/env python3
"""Build a browser-compatible Vosk model archive from the official Apache-2.0 model."""
import os
import shutil
import tarfile
import tempfile
import urllib.request
import zipfile
from pathlib import Path

URL = "https://alphacephei.com/vosk/models/vosk-model-en-us-0.22-lgraph.zip"
OUTPUT = Path("public/models/vosk-model-en-us-0.22-lgraph.tar.gz")
with tempfile.TemporaryDirectory() as temp:
    root = Path(temp)
    archive = root / "model.zip"
    print("Downloading official Vosk English lgraph model...", flush=True)
    urllib.request.urlretrieve(URL, archive)
    with zipfile.ZipFile(archive) as z:
        unsafe = [n for n in z.namelist() if ".." in Path(n).parts or n.startswith("/")]
        if unsafe:
            raise ValueError("Unsafe paths in model ZIP")
        z.extractall(root / "unpacked")
    folder = root / "unpacked" / "vosk-model-en-us-0.22-lgraph"
    for filename in ("am/final.mdl", "conf/mfcc.conf", "conf/model.conf"):
        if not (folder / filename).is_file():
            raise FileNotFoundError(f"Missing model file: {filename}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    print("Repacking browser Vosk model...", flush=True)
    with tarfile.open(OUTPUT, "w:gz", compresslevel=3) as tar:
        tar.add(folder, arcname="model")
    print(f"Model ready: {OUTPUT} ({OUTPUT.stat().st_size / 1048576:.1f} MiB)", flush=True)
