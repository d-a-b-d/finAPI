const request = require("supertest");
const buildApp = require("../../app.js"); 
const sequelize = require("../../db");

let app;

beforeAll(async () => {
  app = await buildApp();
  await app.ready(); 
});

afterAll(async () => {
  await app.redis.quit(); 
  await app.close();
  await sequelize.close();
});

describe("Create Account", () => {
  test("should create a new account", async () => {
    const result = await request(app.server) 
      .post("/accounts/create-account")
      .send({ initialBalance: 1000 });

    expect(result.status).toBe(201);
    expect(result.body).toHaveProperty("accountId");
    expect(result.body).toHaveProperty("balance");
  });
});

describe("Deposit Money", () => {
  test("should deposit the amount of money successfully", async () => {
    const result = await request(app.server)
      .post("/accounts/deposit")
      .send({ amount: 1000, accountId: 1 });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("newBalance");
  });
});

describe("Withdraw Money", () => {
  test("should withdraw the amount of money successfully", async () => {
    const result = await request(app.server)
      .post("/accounts/withdraw")
      .send({ amount: 2, accountId: 1 });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("newBalance");
  });
});

describe("Transfer Money", () => {
  test("should transfer the amount of money from source account to destination account successfully", async () => {
    const result = await request(app.server)
      .post("/accounts/transfer")
      .send({ sourceAccountId: "1", destinationAccountId: "2", amount: 1 });

    expect(result.status).toBe(200);
    expect(result.body).toHaveProperty("newSourceBalance");
    expect(result.body).toHaveProperty("newDestinationBalance");
  });
});

describe("Check Account Balance", () => {
  test("should check account balance successfully", async () => {
    const result = await request(app.server).get(
      "/accounts/accounts/current-balance/1"
    );

    expect(result.status).toBe(200); 
    expect(result.body).toHaveProperty("balance");
  });
});
