const express = require("express");

module.exports = (
  orderBook,
  portfolioManager,
  io
) => {
  const router = express.Router();

  // PLACE ORDER
  router.post(
    "/place",
    (req, res) => {
      const {
        symbol,
        side,
        price,
        quantity,
        userId,
        email
      } = req.body;

      portfolioManager.createUser(
        userId,
        email
      );

      const validation =
        portfolioManager.validateOrder(
          userId,
          symbol,
          side,
          Number(price),
          Number(quantity)
        );

      if (!validation.valid) {
        return res
          .status(400)
          .json(validation);
      }

      const trades =
        orderBook.addOrder({
          symbol,
          side,
          price: Number(price),
          quantity: Number(quantity),
          userId,
          email
        });

      trades.forEach((trade) => {
        portfolioManager.processTrade(
          trade.buyerId,
          trade.sellerId,
          trade.symbol,
          trade.price,
          trade.quantity
        );
      });

      io.emit(
        "orderbook_update",
        orderBook.getAllBooks()
      );

      io.emit(
        "trade_update",
        trades
      );

      io.emit(
        "leaderboard_update",
        portfolioManager.getLeaderboard(
          orderBook
        )
      );

      res.json({
        success: true
      });
    }
  );

  // ALL BOOKS
  router.get(
    "/books",
    (req, res) => {
      res.json(
        orderBook.getAllBooks()
      );
    }
  );

  // PORTFOLIO
  router.get(
  "/portfolio/:userId",
  (req, res) => {

    const userId =
      req.params.userId;

    const email =
      req.query.email;

    let portfolio =
      portfolioManager.getPortfolioValue(
        userId,
        orderBook
      );

    if (!portfolio) {

      portfolioManager.createUser(
        userId,
        email
      );

      portfolio =
        portfolioManager.getPortfolioValue(
          userId,
          orderBook
        );
    }

    res.json(portfolio);
  }
);
  // CANCEL ORDER
  router.delete(
  "/cancel/:orderId",
  (req, res) => {

    console.log(
      "Cancel request received:",
      req.params.orderId
    );

    const result =
      orderBook.cancelOrder(
        req.params.orderId
      );

    console.log(result);

    if (!result.success) {
      return res
        .status(404)
        .json(result);
    }

    io.emit(
      "orderbook_update",
      orderBook.getAllBooks()
    );

    res.json(result);
  }
);

  return router;
};