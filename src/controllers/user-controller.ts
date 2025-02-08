import { Result, ValidationError, validationResult } from "express-validator";
import { Request, Response } from "express";
import prisma from "../configs/db";

const createUser = async (req: Request, res: Response): Promise<void> => {
    const errors: Result<ValidationError> = validationResult(req);
    const { firstName, lastName, email, birthDate, location, timezone } = req.body;

    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Validation Error",
            errors: errors.array()
        });
        return
    }

    try {
        const user = await prisma.user.create(
            {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    birth_date: birthDate,
                    location: location,
                    timezone: timezone
                }
            });

        res.json(user);
        return
    } catch (error) {
        console.error("Error registering user", error);
        res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" });
        return
    }
}

// Get all users
const getAllUsers = async (_: Request, res: Response): Promise<void> => {
    try {
        const users = await prisma.user.findMany();
        res.json({ message: "All users", data: users });
    } catch (error) {
        console.error("Error getting all users", error);
        res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" });
    }
};


const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({ where: { id: Number(id) } });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return
        }

        await prisma.user.delete({ where: { id: Number(id) } });

        res.status(200).json({ message: "User deleted successfully" });
        return
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Internal Server Error", error: error instanceof Error ? error.message : "Unknown error" });
        return
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const errors: Result<ValidationError> = validationResult(req);
    const { firstName, lastName, email, birthDate, location, timezone } = req.body;
    const userId = req.params.id;

    if (!errors.isEmpty()) {
        res.status(400).json({
            message: "Validation Error",
            errors: errors.array()
        });
        return;
    }

    try {
        const user = await prisma.user.update({
            where: { id: Number(userId) },
            data: {
                first_name: firstName,
                last_name: lastName,
                email: email,
                birth_date: birthDate,
                location: location,
                timezone: timezone
            }
        });

        // Delete existing messages associated with this user
        await prisma.birthdayMessage.deleteMany({ where: { user_id: Number(userId) } });

        res.json(user);
    } catch (error) {
        console.error("Error updating user", error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

export { createUser, getAllUsers, deleteUser, updateUser }