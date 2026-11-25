"""Загрузка, сортировка заказов и расчёт выручки."""

from pathlib import Path

from app.domain.order import Order
from app.services.importer import read_rows


def load_orders(path: Path) -> list[Order]:
    """Загружает заказы из CSV-файла.

    Args:
        path: Путь к файлу со столбцами waiter и kopeks.

    Returns:
        Заказы в исходном порядке.
    """
    return [
        Order(waiter=row["waiter"], kopeks=int(row["kopeks"]))
        for row in read_rows(path)
    ]


def revenue_by_waiter(orders: list[Order], top: int = 0) -> dict[str, int]:
    """Суммирует выручку по официантам в порядке убывания.

    Args:
        orders: Заказы смены с суммами в копейках.
        top: Сколько официантов вернуть. Ноль означает всех.

    Returns:
        Имена официантов и их выручка в копейках.

    Raises:
        ValueError: Если список заказов пуст.
    """
    if not orders:
        raise ValueError("Список заказов пуст")
    totals: dict[str, int] = {}
    for order in orders:
        totals[order.waiter] = totals.get(order.waiter, 0) + order.kopeks
    ranked = sorted(totals.items(), key=lambda pair: -pair[1])
    if top:
        ranked = ranked[:top]
    return dict(ranked)


def sort_orders_in_place(orders: list[Order]) -> None:
    """Сортирует заказы на месте по убыванию суммы.

    Args:
        orders: Список заказов для сортировки.
    """
    orders.sort(key=lambda order: -order.kopeks)
