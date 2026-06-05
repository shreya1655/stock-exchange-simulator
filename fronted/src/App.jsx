import { useEffect, useState } from "react";
import {
  signInWithPopup,
  onAuthStateChanged
} from "firebase/auth";
import { io } from "socket.io-client";
import axios from "axios";

import { auth, provider } from "./firebase";

import OrderForm from "./components/OrderForm";
import OrderBook from "./components/OrderBook";
import TradeHistory from "./components/TradeHistory";
import Portfolio from "./components/Portfolio";
import Leaderboard from "./components/Leaderboard";

const socket = io("http://localhost:5000");

function App() {
  const [user, setUser] = useState(null);

  const [books, setBooks] =
  useState({});

  const [selectedStock, setSelectedStock] =
  useState("AAPL");

  const [leaderboard, setLeaderboard] = useState([]);
  
  const [trades, setTrades] = useState([]);

  const [portfolio, setPortfolio] =
    useState(null);


  // Firebase persistent login
  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      const result =
        await signInWithPopup(
          auth,
          provider
        );

      setUser(result.user);
    } catch (err) {
      console.error(err);
    }
  };

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    if (user) {

  axios
    .get(
      `http://localhost:5000/orders/portfolio/${user.uid}?email=${user.email}`
    )
    .then((res) => {
      setPortfolio(res.data);
    })
    .catch((err) => {
      console.error(err);
    });

  axios
    .get(
      "http://localhost:5000/leaderboard"
    )
    .then((res) => {
      setLeaderboard(res.data);
    })
    .catch((err) => {
      console.error(err);
    });
}
    

    socket.on("init", (data) => {
  setBooks(data.book || {});
  setTrades(data.trades || []);
});

    socket.on(
  "orderbook_update",
  (data) => {
    setBooks(data);
  }
);


    socket.on(
      "trade_update",
      (newTrades) => {
        setTrades((prev) => [
          ...newTrades,
          ...prev
        ]);
      }
    );

    socket.on("leaderboard_update", (data) => {
  setLeaderboard(data);
});

    return () => {
  socket.off("init");
  socket.off("orderbook_update");
  socket.off("trade_update");
  socket.off("leaderboard_update");
};
  }, [user]);

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>
          Stock Exchange Simulator
        </h2>

        <button onClick={login}>
          Login with Google
        </button>
      </div>
    );
  }

  return (
<div
  style={{
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "30px"
  }}
>      <h2>
        Welcome {user.email}
      </h2>

      <button
  onClick={logout}
  style={{
    background: "#2563eb",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "20px"
  }}
>
  Logout
</button>

      <div
  style={{
    display: "flex",
    gap: "30px",
    marginBottom: "30px"
  }}
>
  <Portfolio portfolio={portfolio} />
  <Leaderboard leaderboard={leaderboard} />
</div>

<div
  style={{
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "20px",
    boxShadow:
      "0 2px 8px rgba(0,0,0,0.1)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
> 
<OrderForm
  user={user}
  symbol={selectedStock}
/>

</div>
      


<div
  style={{
    display: "flex",
    gap: "20px"
  }}
>
<OrderBook
  book={
    books[selectedStock] || {
      buyOrders: [],
      sellOrders: []
    }
  }
/>  <TradeHistory trades={trades} />
</div>
    </div>
  );
}

export default App;