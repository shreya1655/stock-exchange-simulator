const { io } =
  require("socket.io-client");

const SERVER_URL =
  process.env.SERVER_URL ||
  "http://localhost:5000";

const CLIENT_COUNT =
  Number(process.argv[2] || 100);

const SAMPLES =
  Number(process.argv[3] || 50);

const clients = [];
const latencies = [];

function percentile(
  values,
  percentage
) {
  const sorted =
    [...values].sort(
      (a, b) => a - b
    );

  const index =
    Math.floor(
      percentage *
      sorted.length
    );

  return sorted[
    Math.min(
      index,
      sorted.length - 1
    )
  ];
}

async function createClients() {
  await Promise.all(
    Array.from(
      {
        length:
          CLIENT_COUNT
      },
      (_, index) =>
        new Promise(
          (
            resolve,
            reject
          ) => {
            const socket =
              io(
                SERVER_URL,
                {
                  transports: [
                    "websocket"
                  ]
                }
              );

            socket.on(
              "connect",
              () => {
                clients.push(
                  socket
                );

                resolve();
              }
            );

            socket.on(
              "connect_error",
              reject
            );
          }
        )
    )
  );
}

async function run() {
  await createClients();

  console.log(
    `${clients.length} clients connected`
  );

  clients.forEach(
    (socket) => {
      socket.on(
        "benchmark:update",
        (payload) => {
          latencies.push(
            Date.now() -
            payload.emittedAt
          );
        }
      );
    }
  );

  for (
    let i = 0;
    i < SAMPLES;
    i++
  ) {
    clients[0].emit(
      "benchmark:broadcast"
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          100
        )
    );
  }

  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        1000
      )
  );

  console.log(
    `Measurements: ${latencies.length}`
  );

  console.log(
    `Median latency: ` +
      `${percentile(latencies, 0.5)} ms`
  );

  console.log(
    `p95 latency: ` +
      `${percentile(latencies, 0.95)} ms`
  );

  console.log(
    `Max latency: ` +
      `${Math.max(...latencies)} ms`
  );

  clients.forEach(
    (socket) =>
      socket.disconnect()
  );
}

run().catch(
  (err) => {
    console.error(err);
    process.exit(1);
  }
);