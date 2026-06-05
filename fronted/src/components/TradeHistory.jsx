function TradeHistory({ trades }) {
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
      <h2>Trades</h2>

      {trades.map(trade => (
        <div key={trade.id}>
          Price:
          {" "}
          {trade.price}
          {" | "}
          Qty:
          {" "}
          {trade.quantity}
        </div>
      ))}
    </div>
  );
}

export default TradeHistory;