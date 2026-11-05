# video-daily

Генератор вертикальных обучающих видео (720×1280, 30 fps) для IT-тематики: тёмный стиль, изометрические серверы,
лёгкие терминалы с реальными выводами команд, субтитры по словам. Озвучка — локально через Silero TTS.

**Пошаговая настройка с нуля (репозиторий, озвучка, ежедневная задача) — в [SETUP.md](SETUP.md).**

## Структура
- `engine/` — движок: `head.html` (стили), `lib.js` (сервер, поток данных, терминал), `runtime.js` (тайминг, субтитры), `build.py` (сборка).
- `tools/` — озвучка: `voice.py` (Silero TTS → озвучка сцен → тайминг → сборка), `align.py` (выравнивание слов по паузам).
- `projects/<slug>/` — один ролик: `scenes.js`, `meta.json`, `narration_tts.txt`, после озвучки `voice/`, `timing.json`.
- `tasks/daily_prompt.md` — промпт для запланированной задачи «ролик в день».
- `AUTHORING.md` — как писать сцены (API, лёгкие терминалы, правила фактов).

## Команды
```bash
python -I engine/build.py projects/<slug> preview   # контрольные кадры out/<slug>/
python -I engine/build.py projects/<slug> full      # видео (без озвучки или с ней, если есть voice/ и timing.json)
python tools/voice.py projects/<slug> --speaker xenia   # озвучка Silero + пересборка под голос
```
Нужны: Python 3 + Pillow, playwright с Chromium, ffmpeg, шрифты DejaVu; для озвучки ещё torch.

Пример `projects/replication-postgresql` — ролик про репликацию PostgreSQL (сцены 5–7 — плотные терминалы, так делать не нужно, см. AUTHORING.md).
