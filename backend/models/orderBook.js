const { v4: uuidv4 } = require("uuid");

class OrderBook {
  constructor() {
    this.books = {
  AAPL: {
    buyOrders: [],
    sellOrders: [],
    trades: []
  },
  GOOGL: {
    buyOrders: [],
    sellOrders: [],
    trades: []
  },
  TSLA: {
    buyOrders: [],
    sellOrders: [],
    trades: []
  },
  MSFT: {
    buyOrders: [],
    sellOrders: [],
    trades: []
  },
  AMZN: {
    buyOrders: [],
    sellOrders: [],
    trades: []
  }
};
  }

  createStock(symbol) {
    if (!this.books[symbol]) {
      this.books[symbol] = {
        buyOrders: [],
        sellOrders: [],
        trades: []
      };
    }
  }

  addOrder(order) {
    const symbol = order.symbol;

    this.createStock(symbol);

    const book = this.books[symbol];

    order.id = uuidv4();
    order.timestamp = Date.now();

    if (order.side === "BUY") {
      book.buyOrders.push(order);

      book.buyOrders.sort((a, b) => {
        if (b.price !== a.price) {
          return b.price - a.price;
        }

        return (
          a.timestamp -
          b.timestamp
        );
      });
    } else {
      book.sellOrders.push(order);

      book.sellOrders.sort((a, b) => {
        if (a.price !== b.price) {
          return a.price - b.price;
        }

        return (
          a.timestamp -
          b.timestamp
        );
      });
    }

    return this.matchOrders(symbol);
  }

  matchOrders(symbol) {
    const book =
      this.books[symbol];

    const executedTrades = [];

    while (
      book.buyOrders.length > 0 &&
      book.sellOrders.length > 0 &&
      book.buyOrders[0].price >=
        book.sellOrders[0].price
    ) {
      const buy =
        book.buyOrders[0];

      const sell =
        book.sellOrders[0];

      const quantity =
        Math.min(
          buy.quantity,
          sell.quantity
        );

      const trade = {
        id: uuidv4(),

        symbol,

        buyerId: buy.userId,
        sellerId: sell.userId,

        buyOrderId: buy.id,
        sellOrderId: sell.id,

        price: sell.price,
        quantity,

        timestamp: Date.now()
      };

      executedTrades.push(
        trade
      );

      book.trades.push(trade);

      buy.quantity -= quantity;
      sell.quantity -= quantity;

      if (buy.quantity === 0) {
        book.buyOrders.shift();
      }

      if (sell.quantity === 0) {
        book.sellOrders.shift();
      }
    }

    return executedTrades;
  }

  getOrderBook(symbol) {
    this.createStock(symbol);

    return this.books[symbol];
  }

  getAllBooks() {
    return this.books;
  }

  cancelOrder(orderId, userId) {
  for (const symbol in this.books) {
    const book = this.books[symbol];

    const buyIndex = book.buyOrders.findIndex(o => o.id === orderId);

    if (buyIndex !== -1) {
      const order = book.buyOrders[buyIndex];

      if (order.userId !== userId) {
        return { success: false, message: "Not your order" };
      }

      book.buyOrders.splice(buyIndex, 1);

      return { success: true, message: "Buy order cancelled" };
    }

    const sellIndex = book.sellOrders.findIndex(o => o.id === orderId);

    if (sellIndex !== -1) {
      const order = book.sellOrders[sellIndex];

      if (order.userId !== userId) {
        return { success: false, message: "Not your order" };
      }

      book.sellOrders.splice(sellIndex, 1);

      return { success: true, message: "Sell order cancelled" };
    }
  }

  return { success: false, message: "Order not found" };
}

  getTrades(symbol) {
    this.createStock(symbol);

    return this.books[symbol]
      .trades;
  }
}

module.exports = OrderBook;