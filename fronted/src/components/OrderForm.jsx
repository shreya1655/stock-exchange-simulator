import { useState } from "react";
import axios from "axios";

function OrderForm({
  user,
  symbol
}) {
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const submitOrder = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/orders/place",
        {
          symbol,
          side,
          price,
          quantity,
          userId: user.uid,
          email: user.email
        }
      );

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
    width: "100%"
  }}
>
  <h3 style={{ margin: 0 }}>
    {symbol}
  </h3>

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