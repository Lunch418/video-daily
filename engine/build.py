"""Сборка ролика.
  python3 -I engine/build.py projects/<slug> narr      тексты сцен -> out/<slug>/narr.json
  python3 -I engine/build.py projects/<slug> preview   контрольные кадры out/<slug>/prev_*.png, sheet_*.png
  python3 -I engine/build.py projects/<slug> full      рендер, склейка, звук -> out/<slug>/<slug>.mp4
Если есть projects/<slug>/timing.json (его делает tools/voice.py), длительности сцен и слова берутся из него.
Если есть projects/<slug>/voice/N.wav|mp3 (N = номер сцены), озвучка накладывается; иначе — тихая дорожка."""
import sys, os, json, subprocess, glob
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ff import ffmpeg
FF = ffmpeg()

ENG = os.path.dirname(os.path.abspath(__file__))
proj = os.path.abspath(sys.argv[1]); mode = sys.argv[2] if len(sys.argv) > 2 else 'preview'
meta = json.load(open(f'{proj}/meta.json'))
OUT = os.path.join(os.path.dirname(ENG), 'out', meta['slug']); os.makedirs(OUT, exist_ok=True)
FPS = 30
rd = lambda p: open(p, encoding='utf-8').read()
timing = ''
tj = f'{proj}/timing.json'
if os.path.exists(tj): timing = 'window.TIMING=' + rd(tj) + ';\n'
TH = f"{ENG}/themes/{meta['theme']}" if meta.get('theme') else ENG      # тема проекта: engine/themes/<имя>/{head.html,lib.js,runtime.js}
extra = ('\n' + rd(f'{TH}/lib.js')) if TH != ENG else ''
html = rd(f'{TH}/head.html').replace('{{HEADER}}', meta['header']) + '<script>\n' + timing + rd(f'{ENG}/lib.js') + extra + '\n' + rd(f'{proj}/scenes.js') + '\n' + rd(f'{TH}/runtime.js') + '\n</script>\n'
page_path = f'{OUT}/index.html'; open(page_path, 'w', encoding='utf-8').write(html)

def voice_file(i):
    for ext in ('wav', 'mp3'):
        f = f'{proj}/voice/{i + 1}.{ext}'
        if os.path.exists(f): return f
    return None

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 720, 'height': 1280}, device_scale_factor=1)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto('file://' + page_path); pg.wait_for_timeout(300)
    durs = pg.evaluate('DUR'); narr = pg.evaluate('SC.map(s=>s.narr)')
    for i in range(len(durs)):                      # каждая сцена строится и рисуется без ошибок
        pg.evaluate(f'setScene({i})'); pg.evaluate(f'draw({durs[i] * 0.5})')
    if errs: print('ОШИБКИ СТРАНИЦЫ:', errs); sys.exit(1)
    if mode == 'narr':
        json.dump(narr, open(f'{OUT}/narr.json', 'w'), ensure_ascii=False); print('narr.json:', len(narr), 'сцен')
    elif mode == 'preview':
        for i, d in enumerate(durs):
            pg.evaluate(f'setScene({i})')
            for tag, fr in (('a', 0.5), ('b', 0.9)):
                pg.evaluate(f'draw({d * fr})'); pg.screenshot(path=f'{OUT}/prev_{i}{tag}.png')
        from PIL import Image
        for g in range(0, len(durs), 4):
            idx = range(g, min(g + 4, len(durs)))
            ims = [Image.open(f'{OUT}/prev_{i}{s}.png').resize((360, 640)) for i in idx for s in 'ab']
            sh = Image.new('RGB', (360 * len(idx), 1280))
            for j, im in enumerate(ims): sh.paste(im, ((j // 2) * 360, (j % 2) * 640))
            sh.save(f'{OUT}/sheet_{g // 4}.png')
        print('сцены, сек:', [round(x, 1) for x in durs], 'всего', round(sum(durs), 1))
    else:
        have_voice = [voice_file(i) for i in range(len(durs))]
        if any(have_voice) and not all(have_voice): sys.exit('озвучка есть не для всех сцен: ' + str([i + 1 for i, v in enumerate(have_voice) if not v]))
        if all(have_voice) and not timing: sys.exit('есть voice/, но нет timing.json: сначала python3 tools/voice.py')
        for i, d in enumerate(durs):
            tmp, fin = f'{OUT}/scene_{i}.tmp.mp4', f'{OUT}/scene_{i}.mp4'
            ff = subprocess.Popen([FF, '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '18', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', tmp], stdin=subprocess.PIPE)
            pg.evaluate(f'setScene({i})')
            for f in range(int(round(d * FPS))):
                pg.evaluate(f'draw({f / FPS})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
            ff.stdin.close()
            if ff.wait() == 0: os.rename(tmp, fin)
            else: sys.exit('ffmpeg упал на сцене %d' % (i + 1))
            print('сцена', i + 1, 'готова', flush=True)
        open(f'{OUT}/list.txt', 'w').write(''.join(f"file 'scene_{i}.mp4'\n" for i in range(len(durs))))
        subprocess.check_call([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{OUT}/list.txt', '-c', 'copy', f'{OUT}/joined.tmp.mp4'])
        final = f"{OUT}/{meta['slug']}.mp4"
        if all(have_voice):                          # озвучка: звук сцены начинается через 0.5 с, добиваем тишиной до длины сцены
            wavs = []
            for i, d in enumerate(durs):
                w = f'{OUT}/a{i + 1}.wav'
                subprocess.check_call([FF, '-v', 'error', '-y', '-i', have_voice[i], '-af', f'adelay=500|500,apad=whole_dur={d}', '-ar', '44100', '-ac', '2', '-t', str(d), w]); wavs.append(w)
            open(f'{OUT}/alist.txt', 'w').write(''.join(f"file '{w}'\n" for w in wavs))
            subprocess.check_call([FF, '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', f'{OUT}/alist.txt', '-c:a', 'aac', '-b:a', '160k', f'{OUT}/voice_all.m4a'])
            subprocess.check_call([FF, '-v', 'error', '-y', '-i', f'{OUT}/joined.tmp.mp4', '-i', f'{OUT}/voice_all.m4a', '-map', '0:v', '-map', '1:a', '-c', 'copy', '-shortest', '-movflags', '+faststart', final])
        else:
            subprocess.check_call([FF, '-v', 'error', '-y', '-i', f'{OUT}/joined.tmp.mp4', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-shortest', '-movflags', '+faststart', final])
        t0 = 0; lines = []
        for i, d in enumerate(durs):
            lines.append(f'[{t0:6.1f}s] сцена {i + 1}: {narr[i]}'); t0 += d
        open(f'{OUT}/narration.txt', 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
        print('ГОТОВО:', final, round(sum(durs), 1), 'сек', '(с озвучкой)' if all(have_voice) else '(без озвучки)')
    b.close()
