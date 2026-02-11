import dotenv from "dotenv";
import express from "express";
import { router } from "./routes/router";

dotenv.config();

const app = express();

app.use(express.json());
app.use(router);

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
