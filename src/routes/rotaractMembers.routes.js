import { Router } from "express";
import { createMeetingReport, createProjectDraft, createProjectReport, createRotaractMeetingDraft, deleteMeetingReport, deleteProjectDraft, deleteProjectReport, deleteRotaractMeetingDraft, getMeetingReports, getProjectDrafts, getProjectReports, getRotaractMeetingDrafts } from "../controllers/rotaractMembers.controller.js";
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
        createRotaractMeetingDraft
    )
    .get(
        verifyJWT,
        getRotaractMeetingDrafts
    )

router.route("/draft-meeting/:draftId")
    .delete(
        verifyJWT,
        deleteRotaractMeetingDraft
    );
    

router.route("/project-reports")
    .post(
        verifyJWT,
        upload.none(),
        createProjectReport
    )
    .get(
        verifyJWT,
        getProjectReports
    );

router.route("/project-reports/:projectId")
    .delete(
        verifyJWT,
        deleteProjectReport
    );

router.route("/draft-project")
    .post(
        verifyJWT,
        upload.none(),
        createProjectDraft
    )
    .get(
        verifyJWT,
        getProjectDrafts
    )

router.route("/draft-project/:draftId")
    .delete(
        verifyJWT,
        deleteProjectDraft 
    );


export default router;