$ErrorActionPreference='Stop'
python tools/validators/validate_project.py
python -m unittest backend/tests/test_contract.py
