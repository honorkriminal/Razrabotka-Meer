# Отчёт кафе

Программа читает заказы из `data/smena.csv`, группирует выручку по официантам и выводит итог за смену.

```sh
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python main.py
python -m mypy app
python -m pytest -q
```

Для Windows PowerShell команда активации — `.\.venv\Scripts\Activate.ps1`. На данных примера итог составляет 4 937,50 ₽.
