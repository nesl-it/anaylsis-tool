import express, { Router } from "express";
import * as ChatController from "../controllers/chat.controller";
import { ProtectedRoute } from "../middlewares/auth";

const router: Router = express.Router();

// Chat Routes
router.post("/list", ProtectedRoute, ChatController.listChat)

export default router;