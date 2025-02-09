import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/user-controller";
import { validateUser } from "../middlewares/rules-middleware";

const router = express.Router();

router.delete("/user/:id", deleteUser);
router.post("/user", validateUser, createUser);
router.get("/user", getAllUsers);
router.put("/user/:id", validateUser, updateUser);

export default router;