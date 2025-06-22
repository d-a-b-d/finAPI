const request = require("supertest");
const buildApp = require("../../app.js"); 
let app;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
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

afterAll(async () => {
  await app.close();
});
