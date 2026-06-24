const { v4: uuidv4 } = require("uuid");

class OrderNode {
  constructor(order) {
    this.id = order.id;
    this.symbol = order.symbol;
    this.side = order.side;
    this.price = order.price;
    this.quantity = order.quantity;
    this.userId = order.userId;
    this.email = order.email;
    this.timestamp = order.timestamp;

    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  append(node) {
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      node.prev = this.tail;
      this.tail = node;
    }

    this.size++;
  }

  remove(node) {
    if (!node) return null;

    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }

    node.prev = null;
    node.next = null;
    this.size--;

    return node;
  }

  removeHead() {
    return this.remove(this.head);
  }

  isEmpty() {
    return this.size === 0;
  }

  toArray() {
    const orders = [];
    let curr = this.head;

    while (curr) {
      orders.push({
        id: curr.id,
        symbol: curr.symbol,
        side: curr.side,
        price: curr.price,
        quantity: curr.quantity,
        userId: curr.userId,
        email: curr.email,
        timestamp: curr.timestamp,
      });

      curr = curr.next;
    }

    return orders;
  }
}

class OrderBook {
  constructor() {
    this.books = {};
    this.orderIndex = new Map();

    ["AAPL", "GOOGL", "TSLA", "MSFT", "AMZN"].forEach((symbol) => {
      this.createStock(symbol);
    });
  }

  createStock(symbol) {
    if (!this.books[symbol]) {
      this.books[symbol] = {
        buyLevels: new Map(),
        sellLevels: new Map(),
        buyPrices: [],
        sellPrices: [],
        trades: [],
      };
    }
  }

  addPriceLevel(book, side, price) {
    if (side === "BUY") {
      if (!book.buyLevels.has(price)) {
        book.buyLevels.set(price, new DoublyLinkedList());
        book.buyPrices.push(price);
        book.buyPrices.sort((a, b) => b - a);
      }
    } else {
      if (!book.sellLevels.has(price)) {
        book.sellLevels.set(price, new DoublyLinkedList());
        book.sellPrices.push(price);
        book.sellPrices.sort((a, b) => a - b);
      }
    }
  }

  removePriceLevelIfEmpty(book, side, price) {
    const levels = side === "BUY" ? book.buyLevels : book.sellLevels;
    const prices = side === "BUY" ? book.buyPrices : book.sellPrices;
    const level = levels.get(price);

    if (level && level.isEmpty()) {
      levels.delete(price);
      const index = prices.indexOf(price);

      if (index !== -1) {
        prices.splice(index, 1);
      }
    }
  }

  addOrder(order) {
    const symbol = order.symbol;
    this.createStock(symbol);

    const book = this.books[symbol];

    const newOrder = {
      ...order,
      id: uuidv4(),
      price: Number(order.price),
      quantity: Number(order.quantity),
      timestamp: Date.now(),
    };

    const node = new OrderNode(newOrder);

    this.addPriceLevel(book, newOrder.side, newOrder.price);

    const levels =
      newOrder.side === "BUY" ? book.buyLevels : book.sellLevels;

    levels.get(newOrder.price).append(node);

    this.orderIndex.set(newOrder.id, {
      symbol,
      side: newOrder.side,
      price: newOrder.price,
      node,
    });

    return this.matchOrders(symbol);
  }

  matchOrders(symbol) {
    const book = this.books[symbol];
    const executedTrades = [];

    while (book.buyPrices.length > 0 && book.sellPrices.length > 0) {
      const bestBuyPrice = book.buyPrices[0];
      const bestSellPrice = book.sellPrices[0];

      if (bestBuyPrice < bestSellPrice) {
        break;
      }

      const buyQueue = book.buyLevels.get(bestBuyPrice);
      const sellQueue = book.sellLevels.get(bestSellPrice);

      const buy = buyQueue.head;
      const sell = sellQueue.head;

      if (!buy || !sell) {
        break;
      }

      const quantity = Math.min(buy.quantity, sell.quantity);

      const trade = {
        id: uuidv4(),
        symbol,
        buyerId: buy.userId,
        sellerId: sell.userId,
        buyOrderId: buy.id,
        sellOrderId: sell.id,
        price: sell.price,
        quantity,
        timestamp: Date.now(),
      };

      executedTrades.push(trade);
      book.trades.push(trade);

      buy.quantity -= quantity;
      sell.quantity -= quantity;

      if (buy.quantity === 0) {
        buyQueue.removeHead();
        this.orderIndex.delete(buy.id);
        this.removePriceLevelIfEmpty(book, "BUY", bestBuyPrice);
      }

      if (sell.quantity === 0) {
        sellQueue.removeHead();
        this.orderIndex.delete(sell.id);
        this.removePriceLevelIfEmpty(book, "SELL", bestSellPrice);
      }
    }

    return executedTrades;
  }

  cancelOrder(orderId, userId) {
    const indexedOrder = this.orderIndex.get(orderId);

    if (!indexedOrder) {
      return { success: false, message: "Order not found" };
    }

    const { symbol, side, price, node } = indexedOrder;

    if (node.userId !== userId) {
      return { success: false, message: "Not your order" };
    }

    const book = this.books[symbol];

    const levels = side === "BUY" ? book.buyLevels : book.sellLevels;
    const queue = levels.get(price);

    queue.remove(node);
    this.orderIndex.delete(orderId);

    this.removePriceLevelIfEmpty(book, side, price);

    return {
      success: true,
      message: `${side === "BUY" ? "Buy" : "Sell"} order cancelled`,
    };
  }

  getOrdersFromLevels(levels, prices) {
    const orders = [];

    for (const price of prices) {
      const queue = levels.get(price);

      if (queue) {
        orders.push(...queue.toArray());
      }
    }

    return orders;
  }

  getOrderBook(symbol) {
    this.createStock(symbol);

    const book = this.books[symbol];

    return {
      buyOrders: this.getOrdersFromLevels(book.buyLevels, book.buyPrices),
      sellOrders: this.getOrdersFromLevels(book.sellLevels, book.sellPrices),
      trades: book.trades,
    };
  }

  getAllBooks() {
    const snapshot = {};

    for (const symbol in this.books) {
      snapshot[symbol] = this.getOrderBook(symbol);
    }

    return snapshot;
  }

  getTrades(symbol) {
    this.createStock(symbol);
    return this.books[symbol].trades;
  }
}

module.exports = OrderBook;