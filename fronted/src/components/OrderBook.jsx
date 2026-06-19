import axios from "axios";

const API_URL = "https://stock-exchange-simulator.onrender.com";

function OrderBook({
  book = {
    buyOrders: [],
    sellOrders: []
  },
  user
}) {
  const cancelOrder = async (orderId) => {
    if (!user) return;

    try {
      await axios.delete(
        `${API_URL}/orders/cancel/${orderId}`,
        {
          data: {
            userId: user.uid
          }
        }
      );
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Failed to cancel order"
      );
    }
  };

  const renderOrder = (order) => (
    <div
      key={order.id}
      style={{
        marginBottom: "8px"
      }}
    >
      {order.price} | {order.quantity}

      {order.userId === user?.uid && (
        <button
          onClick={() => cancelOrder(order.id)}
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
      )}
    </div>
  );

  return (
    <div
      style={{
        flex: 1,
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
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

          {book.buyOrders.length === 0 ? (
            <p>No Buy Orders</p>
          ) : (
            book.buyOrders.map(renderOrder)
          )}
        </div>

        <div>
          <h3>SELL</h3>

          {book.sellOrders.length === 0 ? (
            <p>No Sell Orders</p>
          ) : (
            book.sellOrders.map(renderOrder)
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderBook;