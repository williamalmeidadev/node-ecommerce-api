import { Router } from "express";

export const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});
