const cluster = require("cluster");
const os = require("os");
const buildApp = require("./app");
const numCPUs = 4;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork({ PORT: 3001 + i });
  }

  cluster.on("exit", (worker) => {
    console.log('Worker ${worker.process.pid} died. Restarting...');
    cluster.fork();
  });
} else {
  (async () => {
    const app = await buildApp();
    const PORT = process.env.PORT || 3000;

    app.listen({ port: PORT }, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('Worker ${process.pid} listening on port ${PORT}');
    });
  })();
}
