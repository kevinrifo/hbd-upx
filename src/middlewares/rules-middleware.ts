import { body } from "express-validator";

const validateUser = [
    body("firstName").isString().trim().notEmpty().withMessage("First name is required"),
    body("lastName").isString().trim().notEmpty().withMessage("Last name is required"),
    body("birthDate")
        .isString()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage("Birth date must be in YYYY-MM-DD format"),
    body("location").isString().trim().notEmpty().withMessage("Location is required"),
    body("timezone").isString().trim().notEmpty().withMessage("Timezone is required"),
    body("email")
        .isString()
        .trim()
        .isEmail()
        .withMessage("Invalid email format")
        .normalizeEmail(),
];

export { validateUser };