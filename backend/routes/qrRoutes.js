import express from "express";
import { getCurrentQR } from "../controllers/qrController.js";

const router = express.Router();

router.get("/current", getCurrentQR);

export default router;
