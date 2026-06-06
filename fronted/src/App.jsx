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

const socket = io(
  "https://stock-exchange-simulator.onrender.com"
);

function App() {
  const [user, setUser] = useState(null);

  const [books, setBooks] = useState({});

  const [selectedStock, setSelectedStock] =
    useState("AAPL");

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [trades, setTrades] = useState([]);

  const [portfolio, setPortfolio] =
    useState(null);

  // ---------------- LOGIN ----------------

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

  // ---------------- LOAD DATA ----------------

  const loadPortfolio = async () => {
    if (!user) return;

    try {
      const res = await axios.get(
        `https://stock-exchange-simulator.onrender.com/orders/portfolio/${user.uid}?email=${user.email}`
      );

      setPortfolio(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await axios.get(
        "https://stock-exchange-simulator.onrender.com/leaderboard"
      );

      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      loadPortfolio();
      loadLeaderboard();
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

        // LIVE PORTFOLIO UPDATE
        if (user) {
          loadPortfolio();
          loadLeaderboard();
        }
      }
    );

    socket.on(
      "leaderboard_update",
      (data) => {
        setLeaderboard(data);
      }
    );

    return () => {
      socket.off("init");
      socket.off("orderbook_update");
      socket.off("trade_update");
      socket.off("leaderboard_update");
    };
  }, [user]);

  // ---------------- LOGIN SCREEN ----------------

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

  // ---------------- MAIN UI ----------------

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px"
      }}
    >
      <h2>
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

      {/* TOP */}
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


      {/* ORDER FORM */}
      <OrderForm
  user={user}
  symbol={selectedStock}
  setSelectedStock={setSelectedStock}
/>

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px"
        }}
      >
        <OrderBook
          book={
            books[selectedStock] || {
              buyOrders: [],
              sellOrders: []
            }
          }
        />

        <TradeHistory
          trades={trades.filter(
            (trade) =>
              trade.symbol ===
              selectedStock
          )}
        />
      </div>
    </div>
  );
}

export default App;