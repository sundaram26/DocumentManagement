import { Router } from "express";
import { generateAndSendOTP, verifyOTP, resendOTP } from "../controllers/otp.controller.js";

const router = Router()

router.route("/generate-otp").post(generateAndSendOTP)
router.route("/verify-otp").post(verifyOTP)
router.route("/resend-otp").post(resendOTP);


export default router;