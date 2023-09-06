import express from "express";
import upload from "../middlewares/multer.middleware";
import {
  addDetailsHandler,
  image2imageHandler,
  promptOnlyHandler,
} from "../controllers/main.controller";
const router = express.Router();

router.post("/prompt-only", promptOnlyHandler);
router.post("/image2image", upload.single("file"), image2imageHandler);
router.post("/add-text", addDetailsHandler);
export { router as MainRoutes };
