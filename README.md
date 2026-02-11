# node-ecommerce-api

Base API structure with Node.js, Express and TypeScript.

## Stack
- Node.js
- Express
- TypeScript
- dotenv
- bcrypt
- pg

## Run
```bash
npm install
npm run build
npm run dev
```

## Initial Endpoint
- `GET /health`

## Environment
Create `.env` using `.env.example` and set your PostgreSQL values.

## Database Connection Validation
When the server starts, it runs a test query and logs either:
- `DB OK: ...`
- `DB FAIL: ...`
