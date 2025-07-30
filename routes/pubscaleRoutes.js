import express from "express";
import { handleCallback } from "../controllers/pubscaleController.js";

const router = express.Router();

router.get("/payments/offers/pubscale", handleCallback);

export default router;
