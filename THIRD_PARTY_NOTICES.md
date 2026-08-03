# Third-Party Notices

Проект использует open-source dependencies согласно их собственным лицензиям:

- Godot Engine — MIT;
- React/Next-compatible Vinext/Vite tooling — см. `web_app/package-lock.json`;
- FastAPI, Pydantic, Uvicorn — см. `backend/requirements.txt`;
- platform SDKs HealthKit, Health Connect, Steamworks — применяются только по отдельным условиям соответствующих владельцев платформ.

Web UI использует system font stack и не загружает шрифты с внешних CDN. Точный dependency inventory фиксируется lockfile; перед store release владелец должен сгенерировать SBOM и приложить полный текст лицензий к platform build. В репозитории нет чужих reference-game assets или защищённой музыки.
