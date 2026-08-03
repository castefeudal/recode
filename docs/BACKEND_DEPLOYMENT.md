# Backend Deployment

Задайте JWT_SECRET и POSTGRES_PASSWORD, включите TLS reverse proxy, rate limits, backups, log retention и health probes. Выполните migrations/001_initial.sql в PostgreSQL. Текущий код использует SQLite как автономный development adapter; production PostgreSQL adapter подключается перед public beta.
