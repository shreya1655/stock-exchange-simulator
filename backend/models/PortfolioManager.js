class PortfolioManager {
  constructor() {
    this.portfolios = {};
  }

  createUser(userId, email) {
    if (!this.portfolios[userId]) {
      this.portfolios[userId] = {
        userId,
        email,
        cash: 100000,

        holdings: {
          AAPL: {
            shares: 100,
            avgBuyPrice: 100
          },

          TSLA: {
            shares: 100,
            avgBuyPrice: 100
          },

          NVDA: {
            shares: 100,
            avgBuyPrice: 100
          },

          MSFT: {
            shares: 100,
            avgBuyPrice: 100
          }
        }
      };
    }

    return this.portfolios[userId];
  }

  getPortfolio(userId) {
    return this.portfolios[userId];
  }

  validateOrder(
    userId,
    symbol,
    side,
    price,
    quantity
  ) {
    const portfolio =
      this.portfolios[userId];

    if (!portfolio) {
      return {
        valid: false,
        message:
          "Portfolio not found"
      };
    }

    const holding =
      portfolio.holdings[symbol];

    const orderValue =
      price * quantity;

    if (side === "BUY") {
      if (
        portfolio.cash <
        orderValue
      ) {
        return {
          valid: false,
          message:
            "Insufficient cash balance"
        };
      }
    }

    if (side === "SELL") {
      if (
        !holding ||
        holding.shares <
          quantity
      ) {
        return {
          valid: false,
          message:
            "Insufficient shares"
        };
      }
    }

    return {
      valid: true
    };
  }

  getPortfolioValue(userId, orderBook) {
  const portfolio =
    this.portfolios[userId];

  if (!portfolio) {
    return null;
  }

  let holdingsValue = 0;

  for (let symbol in portfolio.holdings) {
    const holding =
      portfolio.holdings[symbol];

    const book =
      orderBook.getOrderBook(symbol);

    let marketPrice = 100;

    if (
      book.sellOrders.length > 0
    ) {
      marketPrice =
        book.sellOrders[0].price;
    } else if (
      book.buyOrders.length > 0
    ) {
      marketPrice =
        book.buyOrders[0].price;
    }

    holdingsValue +=
      holding.shares *
      marketPrice;
  }

  const totalValue =
    portfolio.cash +
    holdingsValue;

  const initialValue =
    100000 + (100 * 100 * 4);

  const pnl =
    totalValue -
    initialValue;

  return {
    ...portfolio,
    holdingsValue,
    totalValue,
    pnl
  };
}

  processTrade(
    buyerId,
    sellerId,
    symbol,
    price,
    quantity
  ) {
    const buyer =
      this.portfolios[buyerId];

    const seller =
      this.portfolios[sellerId];

    if (!buyer || !seller) {
      return;
    }

    const cost =
      price * quantity;

    buyer.cash -= cost;

    const buyerHolding =
      buyer.holdings[symbol];

    const totalCost =
      buyerHolding.avgBuyPrice *
        buyerHolding.shares +
      cost;

    buyerHolding.shares += quantity;

    buyerHolding.avgBuyPrice =
      totalCost /
      buyerHolding.shares;

    seller.cash += cost;

    const sellerHolding =
      seller.holdings[symbol];

    sellerHolding.shares -=
      quantity;
  }
getLeaderboard(orderBook) {
  const result = [];

  for (let userId in this.portfolios) {
    const user = this.portfolios[userId];

    let holdingsValue = 0;

    for (let symbol in user.holdings) {
      const holding = user.holdings[symbol];

      // get current market price
      const book = orderBook.getOrderBook(symbol);

      let marketPrice = 100; // fallback

      if (book.sellOrders.length > 0) {
        marketPrice = book.sellOrders[0].price;
      } else if (book.buyOrders.length > 0) {
        marketPrice = book.buyOrders[0].price;
      }

      holdingsValue += holding.shares * marketPrice;
    }

    const totalValue = user.cash + holdingsValue;

    result.push({
      userId,
      email: user.email,
      totalValue
    });
  }

  return result.sort((a, b) => b.totalValue - a.totalValue);
}
  
}



module.exports =
  PortfolioManager;