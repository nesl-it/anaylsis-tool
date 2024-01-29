import express, { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { ProtectedRoute } from "../middlewares/auth";

const router: Router = express.Router();

// User Auth Routes
router.post("/email-signup", UserController.emailSignup);
router.post("/email-signin", UserController.emailSignin);
router.post("/change-password", ProtectedRoute, UserController.changePassword);

// User Profile Routes
router.patch("/update-profile", ProtectedRoute, UserController.updateProfile);
router.get("/get-profile", ProtectedRoute, UserController.getProfile);

export default router;
