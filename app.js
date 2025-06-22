const path = require("path");
const Fastify = require("fastify");
const redis = require("redis");
const fastifyCookie = require("@fastify/cookie");
const fastifyFormbody = require("@fastify/formbody");
const fastifyStatic = require("@fastify/static");
const fastifyView = require("@fastify/view");
const ejs = require("ejs");

async function buildApp() {
  const app = Fastify({ logger: true }); 

  app.register(fastifyCookie);
  app.register(fastifyFormbody);
  app.register(fastifyStatic, {
    root: path.join(__dirname, "public"),
    prefix: "/public/",
  });

  app.register(fastifyView, {
    engine: { ejs },
    root: path.join(__dirname, "views"),
    layout: false,
  });

  const redisClient = redis.createClient();
  await redisClient.connect().catch(console.error);
  app.decorate("redis", redisClient);

  app.register(require("./routes/index"), { prefix: "/" });
  app.register(require("./routes/users"), { prefix: "/users" });
  app.register(require("./routes/accountRoutes"), { prefix: "/accounts" });
  app.register(require("./routes/transactionRoutes"), {
    prefix: "/transactions",
  });


  app.setNotFoundHandler((request, reply) => {
    reply.code(404).view("error", {
      message: "Not Found",
      error: process.env.NODE_ENV === "development" ? "404 Not Found" : {},
    });
  });

  app.setErrorHandler((err, request, reply) => {
    const statusCode = err.statusCode || 500;
    reply.status(statusCode).view("error", {
      message: err.message,
      error: process.env.NODE_ENV === "development" ? err : {},
    });
  });

  return app;
}

module.exports = buildApp;
