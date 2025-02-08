import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/user-controller";
import { validateUser } from "../middlewares/rules-middleware";

const router = express.Router();

router.delete("/users/:id", deleteUser);
router.post("/users", validateUser, createUser);
router.get("/users", getAllUsers);
router.put("/users/:id", validateUser, updateUser);

export default router;