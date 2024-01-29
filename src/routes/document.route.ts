import express, { Router } from "express";
import * as DocsController from "../controllers/document.controller";
import { ProtectedRoute } from "../middlewares/auth";
import { uploadFileUsingMulter } from "../config/multer";

const router: Router = express.Router();

// Document Routes
router.post(
  "/uploadDoc",
  uploadFileUsingMulter.single("file"),
  ProtectedRoute,
  DocsController.uploadDocument
);
router.post("/query", ProtectedRoute, DocsController.queryDocument);

export default router;
