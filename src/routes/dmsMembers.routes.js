import { Router } from "express";
import { createActivityDraft, createActivityReport, createDmsMeetingDraft, createMeetingReport, deleteActivityDraft, deleteActivityReport, deleteDmsMeetingDraft, deleteMeetingReport, getActivityDrafts, getActivityReports, getDmsMeetingDrafts, getMeetingReports } from "../controllers/dmsMembers.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/meeting-reports")
        .post(
            verifyJWT,
            upload.none(),
            createMeetingReport
        )
        .get(
            verifyJWT,
            getMeetingReports
        )

router.route("/meeting-reports/:meetingId")
        .delete(
            verifyJWT,
            deleteMeetingReport
        );

router.route("/draft-meeting")
        .post(
            verifyJWT,
            upload.none(),
            createDmsMeetingDraft
        )
        .get(
            verifyJWT,
            getDmsMeetingDrafts
        )

router.route("/draft-meeting/:draftId")
        .delete(
            verifyJWT,
            deleteDmsMeetingDraft
        );

router.route("/activity-reports")
        .post(
            verifyJWT,
            upload.none(),
            createActivityReport
        )
        .get(
            verifyJWT,
            getActivityReports
        );

router.route("/activity-reports/:activityId")
        .delete(
            verifyJWT,
            deleteActivityReport
        );

router.route("/draft-activity")
        .post(
            verifyJWT,
            upload.none(),
            createActivityDraft
        )
        .get(
            verifyJWT,
            getActivityDrafts
        )
    
router.route("/draft-activity/:draftId")
        .delete(
            verifyJWT,
            deleteActivityDraft
        );


export default router;