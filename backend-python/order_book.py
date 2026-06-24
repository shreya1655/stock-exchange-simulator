from dataclasses import dataclass
from typing import Optional, Dict, List
from uuid import uuid4
import time


def now_ms() -> int:
    return int(time.time() * 1000)


@dataclass
class OrderNode:
    id: str
    symbol: str
    side: str
    price: float
    quantity: int
    userId: str
    email: str
    timestamp: int
    prev: Optional["OrderNode"] = None
    next: Optional["OrderNode"] = None

    def to_dict(self):
        return {
            "id": self.id,
            "symbol": self.symbol,
            "side": self.side,
            "price": self.price,
            "quantity": self.quantity,
            "userId": self.userId,
            "email": self.email,
            "timestamp": self.timestamp,
        }


class DoublyLinkedList:
    def __init__(self):
        self.head: Optional[OrderNode] = None
        self.tail: Optional[OrderNode] = None
        self.size = 0

    def append(self, node: OrderNode):
        if self.head is None:
            self.head = node
            self.tail = node
        else:
            self.tail.next = node
            node.prev = self.tail
            self.tail = node

        self.size += 1

    def remove(self, node: OrderNode):
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next

        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev

        node.prev = None
        node.next = None
        self.size -= 1

    def remove_head(self):
        if self.head is None:
            return None

        node = self.head
        self.remove(node)
        return node

    def is_empty(self):
        return self.size == 0

    def to_list(self):
        result = []
        curr = self.head

        while curr:
            result.append(curr.to_dict())
            curr = curr.next

        return result


class OrderBook:
    def __init__(self):
        self.books = {}
        self.order_index = {}

        for symbol in ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN"]:
            self.create_stock(symbol)

    def create_stock(self, symbol: str):
        if symbol not in self.books:
            self.books[symbol] = {
                "buyLevels": {},
                "sellLevels": {},
                "buyPrices": [],
                "sellPrices": [],
                "trades": [],
            }

    def add_price_level(self, book, side: str, price: float):
        if side == "BUY":
            if price not in book["buyLevels"]:
                book["buyLevels"][price] = DoublyLinkedList()
                book["buyPrices"].append(price)
                book["buyPrices"].sort(reverse=True)
        else:
            if price not in book["sellLevels"]:
                book["sellLevels"][price] = DoublyLinkedList()
                book["sellPrices"].append(price)
                book["sellPrices"].sort()

    def remove_price_level_if_empty(self, book, side: str, price: float):
        if side == "BUY":
            levels = book["buyLevels"]
            prices = book["buyPrices"]
        else:
            levels = book["sellLevels"]
            prices = book["sellPrices"]

        queue = levels.get(price)

        if queue and queue.is_empty():
            del levels[price]
            prices.remove(price)

    def add_order(self, order: dict):
        symbol = order["symbol"]
        side = order["side"]

        self.create_stock(symbol)
        book = self.books[symbol]

        node = OrderNode(
            id=str(uuid4()),
            symbol=symbol,
            side=side,
            price=float(order["price"]),
            quantity=int(order["quantity"]),
            userId=order["userId"],
            email=order.get("email", ""),
            timestamp=now_ms(),
        )

        self.add_price_level(book, side, node.price)

        if side == "BUY":
            book["buyLevels"][node.price].append(node)
        else:
            book["sellLevels"][node.price].append(node)

        self.order_index[node.id] = {
            "symbol": symbol,
            "side": side,
            "price": node.price,
            "node": node,
        }

        return self.match_orders(symbol)

    def match_orders(self, symbol: str):
        book = self.books[symbol]
        executed_trades = []

        while book["buyPrices"] and book["sellPrices"]:
            best_buy_price = book["buyPrices"][0]
            best_sell_price = book["sellPrices"][0]

            if best_buy_price < best_sell_price:
                break

            buy_queue = book["buyLevels"][best_buy_price]
            sell_queue = book["sellLevels"][best_sell_price]

            buy = buy_queue.head
            sell = sell_queue.head

            if buy is None or sell is None:
                break

            quantity = min(buy.quantity, sell.quantity)

            trade = {
                "id": str(uuid4()),
                "symbol": symbol,
                "buyerId": buy.userId,
                "sellerId": sell.userId,
                "buyOrderId": buy.id,
                "sellOrderId": sell.id,
                "price": sell.price,
                "quantity": quantity,
                "timestamp": now_ms(),
            }

            executed_trades.append(trade)
            book["trades"].append(trade)

            buy.quantity -= quantity
            sell.quantity -= quantity

            if buy.quantity == 0:
                buy_queue.remove_head()
                self.order_index.pop(buy.id, None)
                self.remove_price_level_if_empty(book, "BUY", best_buy_price)

            if sell.quantity == 0:
                sell_queue.remove_head()
                self.order_index.pop(sell.id, None)
                self.remove_price_level_if_empty(book, "SELL", best_sell_price)

        return executed_trades

    def cancel_order(self, order_id: str, user_id: str):
        indexed = self.order_index.get(order_id)

        if not indexed:
            return {"success": False, "message": "Order not found"}

        symbol = indexed["symbol"]
        side = indexed["side"]
        price = indexed["price"]
        node = indexed["node"]

        if node.userId != user_id:
            return {"success": False, "message": "Not your order"}

        book = self.books[symbol]

        if side == "BUY":
            queue = book["buyLevels"][price]
        else:
            queue = book["sellLevels"][price]

        queue.remove(node)
        self.order_index.pop(order_id, None)
        self.remove_price_level_if_empty(book, side, price)

        return {
            "success": True,
            "message": f"{side} order cancelled",
        }

    def get_orders_from_levels(self, levels: Dict[float, DoublyLinkedList], prices: List[float]):
        orders = []

        for price in prices:
            queue = levels.get(price)
            if queue:
                orders.extend(queue.to_list())

        return orders

    def get_order_book(self, symbol: str):
        self.create_stock(symbol)
        book = self.books[symbol]

        return {
            "buyOrders": self.get_orders_from_levels(book["buyLevels"], book["buyPrices"]),
            "sellOrders": self.get_orders_from_levels(book["sellLevels"], book["sellPrices"]),
            "trades": book["trades"],
        }

    def get_all_books(self):
        result = {}

        for symbol in self.books:
            result[symbol] = self.get_order_book(symbol)

        return result

    def get_trades(self, symbol: str):
        self.create_stock(symbol)
        return self.books[symbol]["trades"]