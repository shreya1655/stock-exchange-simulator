const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const OrderBook = require("./models/orderBook");
const PortfolioManager = require("./models/PortfolioManager");

const app = express();

// ====================== MIDDLEWARE ======================
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://stock-exchange-simulator.vercel.app"
    ],
    credentials: true
  })
);

// ====================== CREATE SERVER ======================
const server = http.createServer(app);

// ====================== SOCKET.IO ======================
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://stock-exchange-simulator.vercel.app"
    ],
    methods: ["GET", "POST"]
  }
});

// ====================== CORE INSTANCES ======================
const orderBook = new OrderBook();
const portfolioManager = new PortfolioManager();

// ====================== ROUTES ======================
const orderRoutes = require("./routes/orders")(
  orderBook,
  portfolioManager,
  io
);

const leaderboardRoutes = require("./routes/leaderboard")(
  portfolioManager,
  orderBook
);

app.use("/orders", orderRoutes);
app.use("/leaderboard", leaderboardRoutes);

// ====================== HEALTH CHECK ======================
app.get("/", (req, res) => {
  res.send("Exchange Running 🚀");
});

// ====================== SOCKET CONNECTION ======================
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.emit("init", {
    book: orderBook.getAllBooks(),
    trades: orderBook.getAllBooks()
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ====================== START SERVER ======================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});