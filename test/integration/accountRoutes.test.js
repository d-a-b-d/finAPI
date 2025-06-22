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

afterAll(async () => {
  await app.close();
});
