const { performance } =
  require("node:perf_hooks");

const OrderBook =
  require("../models/orderBook");

const ORDER_PAIRS =
  Number(process.argv[2] || 5000);

const ROUNDS =
  Number(process.argv[3] || 5);

function runBenchmark() {
  const orderBook =
    new OrderBook();

  let matches = 0;

  const start =
    performance.now();

  for (
    let i = 0;
    i < ORDER_PAIRS;
    i++
  ) {
    orderBook.addOrder({
      symbol: "AAPL",
      side: "SELL",
      price: 100,
      quantity: 1,
      userId: `seller-${i}`,
      email: `seller-${i}@test.com`
    });
  }

  for (
    let i = 0;
    i < ORDER_PAIRS;
    i++
  ) {
    const trades =
      orderBook.addOrder({
        symbol: "AAPL",
        side: "BUY",
        price: 100,
        quantity: 1,
        userId: `buyer-${i}`,
        email: `buyer-${i}@test.com`
      });

    matches += trades.length;
  }

  const elapsedMs =
    performance.now() -
    start;

  const matchesPerSecond =
    matches /
    (elapsedMs / 1000);

  return {
    matches,
    elapsedMs,
    matchesPerSecond
  };
}

const results = [];

for (
  let round = 1;
  round <= ROUNDS;
  round++
) {
  const result =
    runBenchmark();

  results.push(
    result.matchesPerSecond
  );

  console.log(
    `Round ${round}: ` +
      `${result.matches} matches in ` +
      `${result.elapsedMs.toFixed(2)} ms | ` +
      `${result.matchesPerSecond.toFixed(0)} matches/sec`
  );
}

results.sort(
  (a, b) => a - b
);

const median =
  results[
    Math.floor(
      results.length / 2
    )
  ];

console.log(
  `\nMedian throughput: ` +
    `${median.toFixed(0)} matches/sec`
);