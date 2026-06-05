const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const OrderBook = require("./models/orderBook");
const PortfolioManager = require("./models/portfolioManager");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const orderBook =
  new OrderBook();

const portfolioManager =
  new PortfolioManager();

// routes
const orderRoutes =
require("./routes/orders")(
  orderBook,
  portfolioManager,
  io
);

//leaderboard
const leaderboardRoutes =
  require("./routes/leaderboard")
  (
    portfolioManager,
    orderBook
  );

app.use(
  "/leaderboard",
  leaderboardRoutes
);

app.use("/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("Exchange Running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // send initial state immediately
  socket.emit("init", {
  book: orderBook.getAllBooks(),
  trades: orderBook.getTrades()
});
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});