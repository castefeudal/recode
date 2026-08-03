# MARKOVMADE: RECODE — запуск сайта через GitHub + Cloudflare

## Что где размещается

- **GitHub** хранит весь исходный код и запускает проверки/автодеплой.
- **Cloudflare Workers** публикует Web/PWA по HTTPS.
- **Backend необязателен:** игра, локальные сохранения, импорт/экспорт и PWA работают без него. Backend нужен только для облачного аккаунта и cloud sync.
- **GitHub Pages не используется:** текущая Web-сборка является Worker/full-stack artifact, а не обычной папкой статического HTML.

## Состав этого пакета

В архиве находятся все необходимые исходники:

- `web_app/` — сайт и PWA;
- `backend/` — необязательный cloud API;
- `game/` — Godot/native source;
- `content/`, `schemas/`, `tools/`, `docs/`, изображения и лицензии;
- `package-lock.json` — зафиксированные Web-зависимости;
- GitHub Actions для CI и автоматической публикации;
- локальные скрипты запуска.

`node_modules`, `.venv`, кеши и готовые локальные сборки не включены намеренно. Это генерируемые платформозависимые файлы; GitHub Actions восстанавливает их из lockfile.

---

# Вариант A — проще всего: GitHub Desktop

1. Распакуйте ZIP в отдельную папку.
2. Установите **GitHub Desktop** и войдите в аккаунт GitHub.
3. В GitHub Desktop выберите `File → Add local repository` и укажите распакованную папку.
4. Если программа предложит создать Git-репозиторий, подтвердите.
5. Нажмите **Publish repository**.
6. Для первого теста лучше оставить репозиторий **Private**.
7. После публикации настройте Cloudflare secrets по инструкции ниже.

# Вариант B — командная строка

1. На GitHub создайте пустой repository без README, `.gitignore` и License.
2. В распакованной папке запустите:

Windows:

```bat
upload-to-github.bat https://github.com/USERNAME/REPOSITORY.git
```

macOS/Linux:

```bash
./upload-to-github.sh https://github.com/USERNAME/REPOSITORY.git
```

Замените `USERNAME/REPOSITORY` на свой адрес.

---

# Настройка Cloudflare

## 1. Создайте аккаунт

Создайте или откройте аккаунт Cloudflare. Покупать домен для первого теста не требуется: Cloudflare выдаст адрес вида:

```text
https://markovmade-recode.<account-subdomain>.workers.dev
```

## 2. Получите Account ID

В Cloudflare Dashboard откройте Workers & Pages. Скопируйте **Account ID**.

## 3. Создайте API token

Создайте API token с правом редактировать Cloudflare Workers. Не публикуйте token в коде.

## 4. Добавьте GitHub Secrets

В GitHub repository откройте:

```text
Settings → Secrets and variables → Actions → New repository secret
```

Добавьте два secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

## 5. Запустите публикацию

Откройте:

```text
Actions → Deploy Web to Cloudflare → Run workflow
```

Либо внесите любое изменение в `web_app/` и отправьте его в ветку `main`.

Workflow автоматически выполнит:

```text
npm ci
npm run typecheck
npm run lint
npm test
wrangler deploy
```

URL появится в логе шага **Print deployment URL**, в GitHub deployment summary и в Cloudflare Dashboard.

---

# Локальный запуск

Требуется Node.js 22.16+.

Windows:

```bat
start-local.bat
```

macOS/Linux:

```bash
./start-local.sh
```

Или вручную:

```bash
cd web_app
npm ci --no-audit --no-fund
npm run dev
```

После запуска откройте адрес, который напечатает Vite, обычно `http://localhost:5173`.

Production-проверка локально:

```bash
cd web_app
npm run verify:web
npm run preview
```

---

# Cloud sync и backend

Для первого теста backend не нужен. Пользовательские данные сохраняются в браузере.

Для локального теста cloud sync:

```bash
cd backend
python -m venv .venv
```

Windows:

```bat
.venv\Scripts\pip install -r requirements.txt
set APP_ENV=development
set CLOUD_AUTH_ENABLED=1
set JWT_SECRET=replace-with-a-long-random-secret
set CORS_ORIGINS=http://localhost:5173
.venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
```

macOS/Linux:

```bash
.venv/bin/pip install -r requirements.txt
APP_ENV=development \
CLOUD_AUTH_ENABLED=1 \
JWT_SECRET='replace-with-a-long-random-secret' \
CORS_ORIGINS='http://localhost:5173' \
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

В Web-интерфейсе укажите endpoint:

```text
http://127.0.0.1:8000
```

Для публичного backend нужны HTTPS, постоянный диск/БД, резервные копии и корректный CORS. Текущий SQLite backend подходит для закрытого теста, но не должен объявляться окончательной production-инфраструктурой без отдельной эксплуатационной проверки.

---

# Собственный домен

После успешного deploy откройте Cloudflare:

```text
Workers & Pages → markovmade-recode → Settings → Domains & Routes
```

Добавьте custom domain. Затем обновите `CORS_ORIGINS` backend, если он используется.

---

# Частые ошибки

## GitHub Actions пишет, что secrets отсутствуют

Проверьте точные имена:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

## `npm ci` не запускается

Проверьте Node.js:

```bash
node --version
```

Нужна версия 22.13 или новее; рекомендована 22.16.

## Сайт опубликован, но cloud sync не работает

Игра должна работать без backend. Для cloud sync отдельно проверьте:

- публичный HTTPS URL API;
- `CLOUD_AUTH_ENABLED=1`;
- корректный `JWT_SECRET`;
- `CORS_ORIGINS`, совпадающий с адресом сайта;
- endpoint в CloudPanel.

## Нельзя загрузить всё через браузер GitHub

Не загружайте сотни файлов вручную через Web UI. Используйте GitHub Desktop или скрипты `upload-to-github.*`.
