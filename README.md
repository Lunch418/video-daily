# video-daily

Генератор вертикальных обучающих видео (720×1280, 30 fps) для IT-тематики: тёмный стиль, изометрические серверы,
лёгкие терминалы с реальными выводами команд, субтитры по словам. Озвучка — локально через Silero TTS.

**Установка и запуск - в [SETUP.md](SETUP.md).**

## Структура
- `engine/` — движок: `head.html` (стили), `lib.js` (сервер, поток данных, терминал), `runtime.js` (тайминг, субтитры), `build.py` (сборка).
- `tools/` — озвучка: `voice.py` (Silero TTS → озвучка сцен → тайминг → сборка), `align.py` (выравнивание слов по паузам).
- `projects/<slug>/` — один ролик: `scenes.js`, `meta.json`, `narration_tts.txt`, после озвучки `voice/`, `timing.json`.
- `tasks/daily_prompt.md` - шаблон промпта для автоматической генерации роликов.
- `AUTHORING.md` — как писать сцены (API, лёгкие терминалы, правила фактов).

## Команды
```bash
python -I engine/build.py projects/<slug> preview   # контрольные кадры out/<slug>/
python -I engine/build.py projects/<slug> full      # видео (без озвучки или с ней, если есть voice/ и timing.json)
python tools/voice.py projects/<slug> --speaker xenia   # озвучка Silero + пересборка под голос
```
Нужны: Python 3 + Pillow, playwright с Chromium, ffmpeg, шрифты DejaVu; для озвучки ещё torch.

Пример `projects/replication-postgresql` — ролик про репликацию PostgreSQL (сцены 5–7 — плотные терминалы, так делать не нужно, см. AUTHORING.md).

## Темы оформления
`meta.json` проекта может содержать `"theme": "navy"` - тогда берутся `engine/themes/navy/{head.html,lib.js,runtime.js}`
(синий фон, карточки, заголовок сцены `title:['белая строка','жёлтая строка']`, субтитры по 3 слова, счётчик `01 / 07`).
Без поля `theme` работает базовое оформление из `engine/`. Пример: `projects/rolling-update-kernel` (rolling-обновление ядра, 7 сцен, 59.6 сек без озвучки).
В темах функция `build(st, K, W)` получает ещё `W(i)` - время начала i-го слова сцены.

## Окружение без системного ffmpeg
`engine/ff.py` ищет ffmpeg (переменная `FFMPEG`, затем PATH, затем пакет `imageio-ffmpeg`), ffprobe не нужен.
```bash
python3 -m venv --system-site-packages .venv
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install imageio-ffmpeg numpy omegaconf playwright pillow
.venv/bin/python tools/voice.py projects/rolling-update-kernel --speaker xenia
```
Скрипты запускаются с `-I` (изолированный режим), поэтому playwright должен стоять в самом venv, а не в `~/.local`.
