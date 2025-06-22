This is a experiment in a horizontally scalable API built with Fastify, PostgreSQL, and NGINX attemping to support concurrent transaction processing and efficient request handling at scale.

## Architecture

```

                      ┌──────────────┐
                      │    NGINX     │
                      └──────┬───────┘
                             │
┌────────────────────────────▼───────────────────────────────┐
│                  Node.js Cluster (4 CPU)                   │
│  ┌────────────┬────────────┬────────────┬────────────┐     │
│  │   Fastify  │   Fastify  │   Fastify  │  Fastify   │     │
│  └────────────┴────────────┴────────────┴────────────┘     │
│             Shared Redis & Sequelize ORM                   │
└────────────────────────────────────────────────────────────┘
```

## Getting Started

First, clone the repo:

```bash
git clone https://github.com/d-a-b-d/banking-app.git
cd banking-app
```

Install dependencies: 

```bash
npm install
```

Create an .env file:

```bash
DATABASE_URL={replace-with-your-password-here}
REDIS_URL={replace-with-your-redis-URL} 
PORT=3000
```
Run migrations:
```bash
npx sequelize-cli db:migrate
```
Start the application:

```bash
npm run dev
```
Start NGINX

## API endpoints

Create Account
```bash
POST /accounts/create-account
```

Deposit Money
```bash
POST /accounts/deposit 
```
Withdraw Money
```bash
POST /accounts/withdraw 
```
Transfer Money
```bash
POST /accounts/transfer
```
Get Current Balance
```bash
GET /accounts/current-balance/:id
```
Get Transaction History
```bash
GET/transactions/transaction-history/:accountId
```

##To-Do

Fix CircleCI & Jest tests

Integrate Prometheus + Grafana for live monitoring

Add role-based access

Split and expand into microservices
