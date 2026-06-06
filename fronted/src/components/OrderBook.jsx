import axios from "axios";

function OrderBook({
  book = {
    buyOrders: [],
    sellOrders: []
  }
}) {
  const cancelOrder =
    async (orderId) => {
      try {
        await axios.delete(
          `https://stock-exchange-simulator.onrender.com/orders/cancel/${orderId}`
        );
      } catch (err) {
        console.error(err);
      }
    };

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
      <h2>Order Book</h2>

      <div
        style={{
          display: "flex",
          gap: "50px"
        }}
      >
        <div>
          <h3>BUY</h3>

          {book.buyOrders.map(
            (order) => (
              <div
                key={order.id}
              >
                {order.price}
                {" | "}
                {order.quantity}

                <button
  onClick={() =>
    cancelOrder(order.id)
  }
  style={{
    marginLeft: "10px",
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "4px 10px",
    cursor: "pointer"
  }}
>
  Cancel
</button>
              </div>
            )
          )}
        </div>

        <div>
          <h3>SELL</h3>

          {book.sellOrders.map(
            (order) => (
              <div
                key={order.id}
              >
                {order.price}
                {" | "}
                {order.quantity}

                <button
                  onClick={() =>
                    cancelOrder(
                      order.id
                    )
                  }
                >
                  Cancel
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderBook;