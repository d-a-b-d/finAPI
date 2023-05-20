const request = require('supertest');
const app = require('../app.js');

test('createAccount should create a new account and return the account ID and balance', async () => {
    const initialBalance = 1000;
    const response = await request(app)
      .post('/accounts/create-account')
      .send({ initialBalance });
  
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('accountId');
    expect(response.body).toHaveProperty('balance');

    await new Promise(resolve => setTimeout(resolve, 100));
  });


  describe('Deposit to Account', () => {
    test('should deposit amount to account and return updated balance', async () => {

      const createResponse = await request(app)
        .post('/accounts/create-account')
        .send({ initialBalance: 0 });
  
      expect(createResponse.status).toBe(201);
      expect(createResponse.body).toHaveProperty('accountId');
      expect(createResponse.body).toHaveProperty('balance', '0.00');
  
      const accountId = createResponse.body.accountId;
  

      const depositResponse = await request(app)
        .post('/accounts/deposit')
        .send({ accountId, amount: 100 });
  
      expect(depositResponse.status).toBe(200);
      expect(depositResponse.body).toHaveProperty('balance', 100);
  
      const balanceResponse = await request(app).get(`/accounts/accounts/current-balance/${accountId}`);
  
      expect(balanceResponse.status).toBe(200);
      expect(balanceResponse.body).toHaveProperty('balance', '100.00');
    });
  });

