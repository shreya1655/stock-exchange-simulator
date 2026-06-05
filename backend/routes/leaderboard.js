const express = require("express");

module.exports = (
  portfolioManager,
  orderBook
) => {
  const router =
    express.Router();

  router.get("/", (req, res) => {
    res.json(
      portfolioManager.getLeaderboard(
        orderBook
      )
    );
  });

  return router;
};