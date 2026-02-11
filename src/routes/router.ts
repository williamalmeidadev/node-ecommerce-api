import { Router } from "express";
import * as productController from "../controllers/productController";
import * as userController from "../controllers/userController";

export const router = Router();

router.get("/health", (_req, res) => {
  return res.status(200).json({ status: "ok" });
});

router.post("/users", userController.create);
router.get("/users", userController.list);
router.get("/users/:id", userController.get);
router.put("/users/:id", userController.update);
router.patch("/users/:id/password", userController.updatePassword);
router.delete("/users/:id", userController.remove);

router.post("/products", productController.create);
router.get("/products", productController.list);
router.get("/products/:id", productController.get);
router.put("/products/:id", productController.update);
router.delete("/products/:id", productController.remove);
