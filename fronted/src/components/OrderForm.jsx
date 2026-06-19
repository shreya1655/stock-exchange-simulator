import { useState } from "react";
import axios from "axios";

const API_URL ="https://stock-exchange-simulator.onrender.com";
// For deployment later, change to:
// const API_URL = "https://stock-exchange-simulator.onrender.com";

function OrderForm({ user, symbol, setSelectedStock }) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const submitOrder = async () => {
    if (!price || !quantity) {
      alert("Please enter price and quantity");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/orders/place`, {
        symbol,
        side,
        price: Number(price),
        quantity: Number(quantity),
        userId: user.uid,
        email: user.email
      });

      console.log(response.data);

      setPrice("");
      setQuantity("");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Order Failed"
      );
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        width: "100%",
        marginBottom: "20px"
      }}
    >
      <label>Select Stock:</label>

      <select
        value={symbol}
        onChange={(e) =>
          setSelectedStock(e.target.value)
        }
      >
        <option value="AAPL">AAPL</option>
        <option value="GOOGL">GOOGL</option>
        <option value="TSLA">TSLA</option>
        <option value="MSFT">MSFT</option>
        <option value="AMZN">AMZN</option>
      </select>

      <select
        value={side}
        onChange={(e) =>
          setSide(e.target.value)
        }
      >
        <option value="BUY">BUY</option>
        <option value="SELL">SELL</option>
      </select>

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) =>
          setPrice(e.target.value)
        }
        style={{ flex: 1 }}
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) =>
          setQuantity(e.target.value)
        }
        style={{ flex: 1 }}
      />

      <button
        onClick={submitOrder}
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Submit
      </button>
    </div>
  );
}

export default OrderForm;