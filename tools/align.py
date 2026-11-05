"""Выравнивание слов по озвучке без распознавания речи: по паузам в аудио (ffmpeg silencedetect) и длине слов.
Результат — projects/<slug>/timing.json: {"durs":[...сек на сцену], "words":[[время начала каждого слова], ...]}.
Это приближённая синхронизация (точность порядка долей секунды)."""
import re, json, subprocess, os

LEAD, TAIL = 0.5, 0.8   # тишина перед озвучкой сцены и после неё, сек
norm = lambda w: re.sub(r'[^\w]', '', w.lower().replace('ё', 'е'))

def parse_tts(path):
    return [s.strip() for s in re.split(r'=== СЦЕНА \d+ ===', open(path, encoding='utf-8').read())[1:]]

def probe(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

def speech_segments(f, dur):
    sd = subprocess.run(['ffmpeg', '-v', 'info', '-i', f, '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]
    se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
    seg, cur = [], 0.0
    for k, s in enumerate(ss):
        e = se[k] if k < len(se) else dur
        if s > cur + 0.02: seg.append((cur, s))
        cur = e
    if cur < dur - 0.02: seg.append((cur, dur))
    return seg or [(0, dur)]

def word_weights(nw, tw):
    """Вес слова = длина его озвученной формы. Английские слова в сценарии сопоставляются с русской транскрипцией из narration_tts."""
    lat = lambda x: re.search('[A-Za-z]', x)
    weights = [0] * len(nw); ti = 0; j = 0
    while j < len(nw):
        if lat(nw[j]):
            k = j
            while k < len(nw) and lat(nw[k]): k += 1
            if k < len(nw):
                anchor = norm(nw[k]); t2 = ti
                while t2 < len(tw) and norm(tw[t2]) != anchor: t2 += 1
                if t2 >= len(tw): t2 = min(ti + 3 * (k - j), len(tw))
            else: t2 = len(tw)
            span = sum(len(norm(x)) for x in tw[ti:t2]) or 5
            ls = [len(norm(nw[x])) or 1 for x in range(j, k)]
            for x, l in zip(range(j, k), ls): weights[x] = span * l / sum(ls)
            ti = t2; j = k
        else:
            weights[j] = len(norm(nw[j])) or 1; ti += 1; j += 1
    return weights

def align(proj, narr, tts_texts):
    res = {'durs': [], 'words': []}
    for i in range(len(narr)):
        f = next((f'{proj}/voice/{i + 1}.{e}' for e in ('wav', 'mp3') if os.path.exists(f'{proj}/voice/{i + 1}.{e}')), None)
        if not f: raise SystemExit(f'нет озвучки сцены {i + 1}')
        dur = probe(f); seg = speech_segments(f, dur)
        w = word_weights(narr[i].split(), tts_texts[i].split()); tot = sum(w); Ts = sum(e - s for s, e in seg)
        starts = []; acc = 0
        for x in w:
            u = acc / tot * Ts; acc += x; t = seg[-1][1]
            for s, e in seg:
                if u <= e - s + 1e-9: t = s + u; break
                u -= e - s
            starts.append(round(LEAD + t, 3))
        res['words'].append(starts); res['durs'].append(round(LEAD + dur + TAIL, 3))
    json.dump(res, open(f'{proj}/timing.json', 'w'))
    return res
