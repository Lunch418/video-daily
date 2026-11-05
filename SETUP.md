# SETUP: репозиторий video-daily с нуля до ежедневного ролика

Схема работы: **облачная задача каждый день делает ролик без звука и текст для озвучки → ты на своём компьютере одной командой озвучиваешь (Silero TTS) и получаешь готовое видео с голосом.**
Озвучка идёт локально, потому что в облачной среде задачи нет PyTorch и скачивания моделей. Зато она бесплатная, без лимитов и без регистраций.

## 1. Создать репозиторий (5 минут)
1. github.com → New repository → имя `video-daily`, **Private** → Create.
2. Распакуй архив, в репозитории нажми «uploading an existing file», перетащи **содержимое** папки `video-daily` (не саму папку), Commit.
   (Либо через git: `git init && git add . && git commit -m init && git remote add origin <url> && git push -u origin main`.)

## 2. Подготовить свой компьютер для озвучки (один раз)
Нужны Python 3.9+, ffmpeg и Chromium для playwright.
```bash
git clone <url репозитория> && cd video-daily
python -m venv .venv
# Windows: .venv\Scripts\activate     Linux/macOS: source .venv/bin/activate
pip install torch numpy pillow playwright
playwright install chromium
```
ffmpeg: Windows — `winget install ffmpeg`; macOS — `brew install ffmpeg`; Linux — `sudo apt install ffmpeg`.
Шрифты DejaVu Sans и DejaVu Sans Mono должны быть в системе (на Linux обычно есть; на Windows/macOS скачай с dejavu-fonts.github.io и установи), иначе вид слегка отличается.
Для видео без CPU-версии torch: `pip install torch --index-url https://download.pytorch.org/whl/cpu` (быстрее и меньше).

## 3. Проверить, что всё работает на примере
```bash
python tools/voice.py projects/replication-postgresql --speaker xenia
```
Первый запуск скачает модель Silero (нужен интернет), потом создаст `projects/replication-postgresql/voice/*.wav`, `timing.json`
и соберёт `out/replication-postgresql/replication-postgresql.mp4` с озвучкой. Голоса: `xenia`, `baya`, `kseniya` (женские), `aidar`, `eugene` (мужские).
Послушай 2–3 голоса (`--speaker`), выбери лучший. Если ударение в слове неверное, поставь `+` перед ударной гласной в `narration_tts.txt` (например, `репликац+ия`).
Только сборка без озвучки: `python -I engine/build.py projects/<slug> full`.

## 4. Создать ежедневную задачу в Claude
Вкладка «Запланированные задачи» → новая:
- **Название:** Ежедневный ролик (video-daily).
- **Расписание:** по будням (или каждый день), 10:00, часовой пояс Asia/Yekaterinburg.
- **Репозиторий:** выбери `video-daily` (задача должна иметь к нему доступ; для записи в репозиторий дай права на push).
- **Промпт:** содержимое файла `tasks/daily_prompt.md`.
- **Подтверждения:** включи автоматическое одобрение действий, иначе задача может зависнуть, пока ты спишь.
Нажми «Запустить сейчас» один раз и проверь результат.

## 5. Ежедневный цикл
1. Утром в чат приходит ролик без звука + текст озвучки; задача кладёт проект в репозиторий (`projects/<дата-тема>/`).
2. На компьютере: `git pull && python tools/voice.py projects/<дата-тема>` — через несколько минут `out/<дата-тема>/<дата-тема>.mp4` с голосом.
3. Если задача не смогла сделать push, она пришлёт `scenes.js`, `meta.json`, `narration_tts.txt` файлами: положи их в `projects/<slug>/` вручную.

## 6. Если что-то не работает
- «ошибки страницы» при сборке: ошибка в `scenes.js` (чаще всего `K('слово')` указывает на слово, которого нет в `narr`). Исправь и запусти `preview`.
- Терминал или текст наезжает на субтитры: оставь на экране меньше строк (см. правила в `AUTHORING.md`).
- Silero читает английское слово неправильно: запиши его по-русски в `narration_tts.txt` (как произносят вслух).
- Субтитры чуть опережают или отстают: синхронизация приблизительная (по паузам в аудио), допустимо сдвиг в доли секунды.
- Не проверено мной: запуск Silero на твоём компьютере (в моей среде нет PyTorch и скачивания моделей). Скрипты написаны по документации Silero; если при первом запуске возникнет ошибка, пришли её текст.
