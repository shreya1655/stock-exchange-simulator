function Portfolio({ portfolio }) {
  if (!portfolio) {
    return <div>Loading...</div>;
  }

  return (
  <div
    style={{
      flex: 1,
      background: "white",
      borderRadius: "12px",
      padding: "20px",
      boxShadow:
        "0 2px 8px rgba(0,0,0,0.1)"
    }}
  >
      <h2>Portfolio</h2>

      <h3>
        Cash: ₹
        {portfolio.cash.toFixed(2)}
      </h3>



      <h3>
  Holdings Value:
  ₹{portfolio.holdingsValue.toFixed(2)}
</h3>

<h3>
  Total Value:
  ₹{portfolio.totalValue.toFixed(2)}
</h3>

<h3>
  P&L:
  ₹{portfolio.pnl.toFixed(2)}
</h3>

      <h3>Holdings</h3>

      {Object.entries(
        portfolio.holdings
      ).map(
        ([symbol, holding]) => (
          <div key={symbol}>
            {symbol}
            {" | "}
            Shares:
            {" "}
            {holding.shares}
            {" | "}
            Avg:
            {" "}
            {holding.avgBuyPrice.toFixed(
              2
            )}
          </div>
        )
      )}
    </div>
  );
}

export default Portfolio;