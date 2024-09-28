import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { approveUser, disapproveUser, getReportsByUser, getUnapprovedUsers, getUsers } from "../controllers/admin.controller.js";

const router = Router()


router.route("/requests").get(verifyJWT, getUnapprovedUsers);
router.route("/approve-user/:userId").patch(verifyJWT, approveUser);
router.route("/disapprove-user/:userId").post(verifyJWT, disapproveUser);

router.route("/get-users").get(getUsers)
router.route("/user-reports/:userId").get(verifyJWT, getReportsByUser);

export default router;