"""Поиск ffmpeg: переменная FFMPEG -> системный ffmpeg -> бинарник из пакета imageio-ffmpeg (pip install imageio-ffmpeg).
Длительность файла считается через ffmpeg -i, поэтому ffprobe не нужен."""
import os, re, shutil, subprocess

def ffmpeg():
    p = os.environ.get('FFMPEG') or shutil.which('ffmpeg')
    if p: return p
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        raise SystemExit('ffmpeg не найден: установи его (apt install ffmpeg) или pip install imageio-ffmpeg')

def duration(path):
    err = subprocess.run([ffmpeg(), '-hide_banner', '-i', path], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', err)
    if not m: raise SystemExit('не удалось определить длительность ' + path)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3])
