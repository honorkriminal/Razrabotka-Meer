"""Построчное чтение данных смены из CSV."""

import csv
from collections.abc import Iterator
from pathlib import Path


def read_rows(path: Path) -> Iterator[dict[str, str]]:
    """Читает строки CSV по одной.

    Args:
        path: Путь к CSV-файлу в UTF-8.

    Yields:
        Словарь со значениями строки по названиям столбцов.
    """
    with open(path, encoding="utf-8", newline="") as file:
        yield from csv.DictReader(file)
