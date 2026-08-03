# MARKOVMADE Creator Studio

Offline-редактор безопасного bilingual campaign format `.mmc` (JSON schema 2).

## Запуск

Из корня source:

```bash
python3 -m http.server 8090 --directory tools/creator_studio
```

Откройте `http://127.0.0.1:8090`. Создавайте сцены, задавайте RU/EN text/dialogue, `next_scene_id`, порядок и choices. Studio делает autosave в браузере, поддерживает search, duplicate, undo/redo и экспорт.

## Обязательная проверка экспорта

```bash
python3 tools/validators/validate_campaign.py path/to/campaign.mmc
```

Ожидается `"status": "passed"`. Validator отклоняет duplicate IDs, dangling transitions, orphan scenes, unsafe paths и script-like payload. Только прошедший файл можно отдавать runtime/content review.

`campaign.schema.json` — формальный контракт. `example_campaign.mmc` — минимальный валидный пример. Студия не выполняет код из кампании.

**Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE**
