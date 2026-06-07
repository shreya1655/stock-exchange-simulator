import axios from "axios";

function OrderBook({
book = {
buyOrders: [],
sellOrders: []
}
}) {
const cancelOrder = async (orderId) => {
  try {
    await axios.delete(
      `https://stock-exchange-simulator.onrender.com/orders/cancel/${orderId}`,
      {
        data: {
          userId: auth.currentUser.uid
        }
      }
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
boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
}}
> <h2>Order Book</h2>

```
  <div
    style={{
      display: "flex",
      gap: "50px"
    }}
  >
    {/* BUY ORDERS */}
    <div>
      <h3>BUY</h3>

      {book.buyOrders.length === 0 ? (
        <p>No Buy Orders</p>
      ) : (
        book.buyOrders.map((order) => (
          <div
            key={order.id}
            style={{
              marginBottom: "8px"
            }}
          >
            {order.price} | {order.quantity}

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
        ))
      )}
    </div>

    {/* SELL ORDERS */}
    <div>
      <h3>SELL</h3>

      {book.sellOrders.length === 0 ? (
        <p>No Sell Orders</p>
      ) : (
        book.sellOrders.map((order) => (
          <div
            key={order.id}
            style={{
              marginBottom: "8px"
            }}
          >
            {order.price} | {order.quantity}

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
        ))
      )}
    </div>
  </div>
</div>

);
}

export default OrderBook;