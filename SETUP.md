# Установка и запуск

Генератор делает вертикальное видео (720x1280, 30 fps) из сценария `scenes.js`. Озвучка локальная (Silero TTS), без регистраций и лимитов.

## 1. Окружение (один раз)
Нужны Python 3.9+ и Chromium для playwright. ffmpeg берётся из системы или из пакета `imageio-ffmpeg`.
```bash
git clone <url репозитория> && cd video-daily
python3 -m venv --system-site-packages .venv
.venv/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv/bin/pip install -r tools/requirements-voice.txt playwright pillow
.venv/bin/playwright install chromium
```
Шрифты DejaVu Sans и DejaVu Sans Mono должны быть в системе (на Linux обычно есть), иначе вид слегка отличается.
Скрипты запускаются с `-I`, поэтому playwright должен стоять в самом venv.

## 2. Сборка примера
```bash
.venv/bin/python tools/voice.py projects/rolling-update-kernel --speaker aidar
```
Первый запуск скачает модель Silero (нужен интернет), создаст `projects/<slug>/voice/*.wav` и `timing.json`
и соберёт `out/<slug>/<slug>.mp4` с озвучкой. Только сборка без озвучки: `python -I engine/build.py projects/<slug> full`.

## 3. Голос
- Модель по умолчанию `v5_ru` (`--model v4_ru` - прежняя, более роботизированная).
- Голоса: `xenia`, `baya`, `kseniya` (женские), `aidar`, `eugene` (мужские): `--speaker aidar`.
- Неверное ударение: поставь `+` перед ударной гласной в `narration_tts.txt` (например, `репликац+ия`).
- Английское слово читается неправильно: запиши его по-русски в `narration_tts.txt` (как произносят вслух).

## 4. Новый ролик
Сценарий пишется по `AUTHORING.md`: `projects/<slug>/{meta.json,scenes.js,narration_tts.txt}`.
Проверка раскладки: `python -I engine/build.py projects/<slug> preview` (кадры в `out/<slug>/`).

## 5. Если что-то не работает
- "ошибки страницы" при сборке: ошибка в `scenes.js` (чаще всего `K('слово')` указывает на слово, которого нет в `narr`). Исправь и запусти `preview`.
- Терминал или текст наезжает на субтитры: оставь на экране меньше строк (см. `AUTHORING.md`).
- Субтитры чуть опережают или отстают: синхронизация приблизительная (по паузам в аудио), допустим сдвиг в доли секунды.
