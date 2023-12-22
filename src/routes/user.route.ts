import express, { Router } from "express";
import * as UserController from "../controllers/user.controller";
import { ProtectedRoute } from "../middlewares/auth";

const router: Router = express.Router();

// User Auth Routes
router.post("/email-signup", UserController.emailSignup);
router.post("/email-signin", UserController.emailSignin);
router.post("/verify-email", UserController.verifyEmail);
router.post("/resend-verify-email", UserController.resendVerifyEmail);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);
router.post("/change-password", ProtectedRoute, UserController.changePassword);

// User Profile Routes
router.get("/get-profile", ProtectedRoute, UserController.getProfile);
router.patch("/update-profile", ProtectedRoute, UserController.updateProfile);

export default router;