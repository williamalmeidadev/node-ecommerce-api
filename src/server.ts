import dotenv from "dotenv";
import express from "express";
import { testDbConnection } from "./pg/pool";
import { router } from "./routes/router";

dotenv.config();

const app = express();

app.use(express.json());
app.use(router);

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  testDbConnection().catch((error: unknown) => {
    console.error("DB FAIL:", error);
  });
});
