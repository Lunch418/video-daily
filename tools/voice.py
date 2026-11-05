"""Озвучка ролика локально (Silero TTS) + пересборка видео под голос.
  python tools/voice.py projects/<slug> [--speaker xenia] [--no-build]
Нужно: Python 3.9+, torch (CPU), playwright+Chromium, ffmpeg, интернет при первом запуске (модель Silero скачается и закэшируется).
Читает projects/<slug>/narration_tts.txt (блоки '=== СЦЕНА N ===', английские термины записаны по-русски),
пишет projects/<slug>/voice/N.wav, projects/<slug>/timing.json и собирает out/<slug>/<slug>.mp4 с озвучкой.
Голоса моделей v5_ru / v4_ru: xenia, baya, kseniya, aidar, eugene."""
import sys, os, re, json, wave, subprocess, argparse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from align import align, parse_tts

ap = argparse.ArgumentParser(); ap.add_argument('proj'); ap.add_argument('--speaker', default='xenia')
ap.add_argument('--model', default='v5_ru', help='v5_ru (живее) или v4_ru'); ap.add_argument('--rate', type=int, default=48000); ap.add_argument('--no-build', action='store_true'); a = ap.parse_args()
proj = os.path.abspath(a.proj); root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
meta = json.load(open(f'{proj}/meta.json'))
texts = parse_tts(f'{proj}/narration_tts.txt')

# тексты сцен из сценария
subprocess.check_call([sys.executable, '-I', f'{root}/engine/build.py', proj, 'narr'])
narr = json.load(open(f'{root}/out/{meta["slug"]}/narr.json'))
if len(narr) != len(texts): sys.exit(f'сцен в сценарии {len(narr)}, а в narration_tts.txt {len(texts)}')

# синтез
import torch, numpy as np
torch.set_num_threads(max(1, (os.cpu_count() or 2) // 2))
res = torch.hub.load(repo_or_dir='snakers4/silero-models', model='silero_tts', language='ru', speaker=a.model, trust_repo=True)
model = res[0] if isinstance(res, tuple) else res
model.to(torch.device('cpu'))
os.makedirs(f'{proj}/voice', exist_ok=True)

def chunks(text, limit=350):
    sents = re.split(r'(?<=[.?!])\s+', text.strip()); out, cur = [], ''
    for s in sents:
        if cur and len(cur) + len(s) + 1 > limit: out.append(cur); cur = s
        else: cur = (cur + ' ' + s).strip()
    if cur: out.append(cur)
    return out

for i, t in enumerate(texts):
    parts = []
    for c in chunks(t):
        audio = model.apply_tts(text=c, speaker=a.speaker, sample_rate=a.rate, put_accent=True, put_yo=True)
        parts.append(audio.numpy()); parts.append(np.zeros(int(a.rate * 0.25), dtype='float32'))
    pcm = (np.clip(np.concatenate(parts[:-1]), -1, 1) * 32767).astype('int16')
    with wave.open(f'{proj}/voice/{i + 1}.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(a.rate); w.writeframes(pcm.tobytes())
    print(f'сцена {i + 1}: озвучена', flush=True)

align(proj, narr, texts); print('timing.json готов')
if not a.no_build: subprocess.check_call([sys.executable, '-I', f'{root}/engine/build.py', proj, 'full'])
