import express, { Router } from "express";
import * as DocsController from "../controllers/document.controller";
import { ProtectedRoute } from "../middlewares/auth";
import { uploadFileUsingMulter } from "../config/multer";

const router: Router = express.Router();

// Document Routes
router.post("/uploadDoc", uploadFileUsingMulter.single("file"), DocsController.uploadDocument);
router.get("/getSummary", DocsController.getSummary);

router.post("/query", DocsController.queryDocument);

export default router;
