import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { DmsMeetingReport } from "../models/dmsMeetingReport.model.js";
import { ActivityReport } from "../models/dmsActivity.model.js";
import { ActivityDraft } from "../models/activityDraft.model.js"
import { DmsMeetingDraft } from "../models/dmsMeetingDraft.model.js";
import mongoose from "mongoose";
// import { uploadOnCloudinary } from "../utils/fileUpload.js";



// Function to generate the next sequence number for a given prefix
const generateMeetingId = async () => {
  // Define the prefix and the limit for ID reset
  const prefix = 'DMS';
  const year = new Date().getFullYear();
  const limit = 1000;

  // Find the last meeting report with the given prefix
  const lastReport = await DmsMeetingReport.findOne({ 
      meetingId: { $regex: `^${prefix}${year}` }
  }).sort({ meetingId: -1 });

  let lastId = lastReport ? lastReport.meetingId : `${prefix}${year}0000`;
  
  // Extract the sequence number and increment it
  const sequence = parseInt(lastId.slice(-4), 10);
  const newSequence = (sequence + 1) % limit;

  // Format the new sequence with leading zeros
  const formattedSequence = String(newSequence).padStart(4, '0');
  
  // Create the new meeting ID
  const newMeetingId = `${prefix}${year}${formattedSequence}`;
  
  return newMeetingId;
};

// Create a new meeting report
const createMeetingReport = asyncHandler(async (req, res) => {
  const { 
    facultyName, 
    venue, 
    meetingType, 
    startDate, 
    endDate, 
    meetingSummary, 
    expense, 
    attendanceImageUrl,
    coverImageUrl,
    supportDocumentUrl,
    isDraft, 
    userRole, 
  } = req.body;

  // const {coverImage, supportDocument} = req.files
  // const { meetingSummary } = req.body
  // console.log(req.body);

  const submittedBy = req.user._id;

  if (req.body.expense <= 0) {
    throw new ApiError(400, "Expense should not be less then 0");
  }
  
  const meetingId = await generateMeetingId();


  // Current date (date of submission)
  const submitDate = new Date();
  // End date from form
  const endDateObj = new Date(endDate);
  // The 3rd of the next month
  const thirdOfNextMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 3);
  // 7 days after the end date
  const sevenDaysAfterEndDate = new Date(endDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);

  let status = '';
  // console.log(`submitDate: ${submitDate}`);
  // console.log(`endDateObj: ${endDateObj}`);
  // console.log(`sevenDaysAfterEndDate: ${sevenDaysAfterEndDate}`);
  // console.log(`thirdOfNextMonth: ${thirdOfNextMonth}`);
  // Check if the report is a draft

  if ((submitDate <= thirdOfNextMonth) && (submitDate <= sevenDaysAfterEndDate)) {
    status = 'early';
  } else if (submitDate <= thirdOfNextMonth) {
    status = 'on-time';
  } else {
    status = 'late';
  }

  // More debugging outputs
  // console.log('Calculated status:', status);

  const newReport = await DmsMeetingReport.create({
      meetingId,
      facultyName, 
      venue, 
      meetingType, 
      startDate, 
      endDate, 
      meetingSummary, 
      expense, 
      attendanceImageUrl,
      coverImageUrl,
      supportDocumentUrl,
      isDraft, 
      status, 
      userRole, 
      submittedBy,
  });

  return res
          .status(201)
          .json(
            new ApiResponse(
              201, 
              newReport, 
              "Meeting report created successfully."
            )
          );
});

const getMeetingReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, searchQuery = '', userId } = req.query;

  const currentPage = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(parseInt(limit, 10), 1);
  const skip = (currentPage - 1) * pageSize;

    
  // Convert the userId string to an ObjectId
  const userObjectId = new mongoose.Types.ObjectId(userId);
  // console.log("user object id: ", userObjectId)

  const submittedBy = userObjectId || req.user._id; // Fallback to current user's ID if userId is not provided
  // console.log("submitted by: ",submittedBy);

  // Search filter for activityName and activityId
  const searchFilter = searchQuery
    ? {
        $or: [
          { meetingType: { $regex: searchQuery, $options: 'i' } },
          { meetingId: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {};

  // Count documents based on filters
  const totalReports = await DmsMeetingReport.countDocuments({
    submittedBy,
    ...searchFilter,
  });

  // Fetch reports with pagination and sorting
  const reports = await DmsMeetingReport.find({
    submittedBy,
    ...searchFilter,
  })
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 }); // Sorting by creation date

  //console.log("report: ", reports);
  
  const totalPages = Math.ceil(totalReports / pageSize);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: reports,
        totalPages,
        currentPage,
        totalReports,
      },
      "Meeting reports retrieved successfully."
    )
  );
});

const deleteMeetingReport = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const submittedBy = req.user._id;
  // console.log("Meeting Id: ", meetingId)
  // console.log("Submitted by: ", submittedBy)

  try {
    const deletedMeeting = await DmsMeetingReport.findOneAndDelete({ meetingId });
    // console.log("deleted meeting: ", deletedMeeting)
    if (deletedMeeting) {
      return res.status(200).json(
        new ApiResponse(200, {}, 'Meeting report removed successfully')
      );
    } else {
      return res.status(404).json(
        new ApiError(404, 'No Meeting found to remove')
      );
    }

    // console.log("deleted meeting: ", deletedMeeting)
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

const generateDmsMeetingDraftId = async () => {

  const prefix = 'DRAFTM';
  const limit = 10000;

  // Find the last meeting report with the given prefix
  const lastReport = await DmsMeetingDraft.findOne({ 
    draftId: { $regex: `^${prefix}` }
  }).sort({ draftId: -1 });

  let lastId = lastReport ? lastReport.draftId : `${prefix}0000`;

  // Extract the sequence number and increment it
  const sequence = parseInt(lastId.slice(-4), 10);
  const newSequence = (sequence + 1) % limit;

  // Format the new sequence with leading zeros
  const formattedSequence = String(newSequence).padStart(4, '0');

  // Create the new meeting ID
  const newDraftId = `${prefix}${formattedSequence}`;

  return newDraftId;
};

const createDmsMeetingDraft = asyncHandler(async (req, res) => {
  const {
    draftId, // Include draftId from request body
    facultyName,
    venue,
    meetingType,
    startDate,
    endDate,
    isDraft,
    meetingSummary,
    expense,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
  } = req.body;

  const submittedBy = req.user._id;

  // console.log("is draft: ", isDraft)
  // console.log("meeting Type: ", meetingType)

  if (!meetingType) {
    return res.status(400).json(new ApiError(400, 'Meeting type is required.'));
  }

  // console.log("Request Body:", req.body);
  // console.log("draft Id: ",draftId);
  

  try {
    const isDraftBool = isDraft === 'true';
    const draftIdValue = draftId === 'null' ? null : draftId;

    const expenseValue = Number(expense);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await DmsMeetingDraft.deleteMany({ createdAt: { $lt: sevenDaysAgo }, submittedBy });

    // console.log("is draft boolean: ", isDraftBool)

    if (isDraftBool) {
      
      if (draftIdValue) {
        // Update existing draft if draftId is provided
        const updatedDraft = await DmsMeetingDraft.findOneAndUpdate(
          { draftId, submittedBy },
          {
            facultyName,
            venue,
            meetingType,
            startDate,
            endDate,
            meetingSummary,
            expense: expenseValue,
            coverImageUrl,
            attendanceImageUrl,
            supportDocumentUrl,
            updatedAt: Date.now() // Update the timestamp
          },
          { new: true } // Return the updated document
        );

        if (!updatedDraft) {
          return res.status(404).json(new ApiError(404, 'Draft not found.'));
        }

        return res.status(200).json(
          new ApiResponse(200, updatedDraft, 'Draft updated successfully')
        );
      } else {
        // Create a new draft if no draftId is provided
        const newDraftId = await generateDmsMeetingDraftId();

        const newDraft = new DmsMeetingDraft({
          draftId: newDraftId,
          submittedBy,
          facultyName,
          venue,
          meetingType,
          startDate,
          endDate,
          meetingSummary,
          expense: expenseValue,
          coverImageUrl,
          attendanceImageUrl,
          supportDocumentUrl
        });

        await newDraft.save();

        return res.status(201).json(
          new ApiResponse(201, {}, 'Draft created successfully')
        );
      }
    } else {
      return res.status(400).json(
        new ApiError(400, 'isDraft must be true to create or update a draft')
      );
    }
  } catch (error) {
    console.error('Error creating/updating draft:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

const deleteDmsMeetingDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const submittedBy = req.user._id;

  try {
    const deletedDraft = await DmsMeetingDraft.findOneAndDelete({ draftId, submittedBy });

    if (deletedDraft) {
      return res.status(202).json(
        new ApiResponse(202, {}, 'Draft removed successfully')
      );
    } else {
      return res.status(404).json(
        new ApiError(404, 'No draft found to remove')
      );
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

const getDmsMeetingDrafts = asyncHandler(async (req, res) => {
  const submittedBy = req.user._id;

  // console.log(submittedBy);

  try {
    // Fetch all drafts based on submittedBy
    const reports = await DmsMeetingDraft.find({ submittedBy }).sort({ createdAt: -1 }); // Sorting by creation date

    // console.log("report: ", reports);

    const currentDate = new Date();
    const expiryDates = reports.map(report => {
        // Calculate expiry date for each report
        const expiryDate = new Date(report.createdAt);
        expiryDate.setDate(expiryDate.getDate() + 7); // Add 7 days
        return expiryDate;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: reports,
          expiryDates
        },
        "Meeting drafts retrieved successfully."
      )
    );
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});


const generateActivityId = async () => {

  const prefix = 'ACT';
  const limit = 10000;

  // Find the last meeting report with the given prefix
  const lastReport = await ActivityReport.findOne({ 
      activityId: { $regex: `^${prefix}` }
  }).sort({ meetingId: -1 });

  let lastId = lastReport ? lastReport.activityId : `${prefix}0000`;

  // Extract the sequence number and increment it
  const sequence = parseInt(lastId.slice(-4), 10);
  const newSequence = (sequence + 1) % limit;

  // Format the new sequence with leading zeros
  const formattedSequence = String(newSequence).padStart(4, '0');

  // Create the new activity ID
  const newActivityId = `${prefix}${formattedSequence}`;

  return newActivityId;
};

const createActivityReport = asyncHandler(async (req, res) => {
  let { 
    activityName,
    facultyName,
    venue,
    activityMode,
    startDate,
    endDate,
    isDraft,
    isJointActivity,
    activityAim,
    activityGroundwork,
    expense,
    feedbackList,
    chairPersons,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
  } = req.body;

  // console.log(req.body)

  const submittedBy = req.user._id;
  // console.log("submitted By: ",submittedBy)

  // console.log("Feedback List Type:", typeof feedbackList);
  // console.log("Feedback List:", feedbackList);


  if ([activityName, facultyName, venue, activityMode, startDate, endDate, coverImageUrl, attendanceImageUrl, supportDocumentUrl].some(field => !field || field.trim() === '')) {
    throw new ApiError(400, "All required fields must be filled.");
  }

  if (typeof chairPersons === 'string') {
    chairPersons = chairPersons.split(',').map(person => person.trim());
  }

  if (!chairPersons || chairPersons.length === 0) {
    return res.status(400).json({ message: 'At least one chairperson must be selected.' });
  }

  // Generate a new activity ID
  const activityId = await generateActivityId();
  // console.log(activityId)

  let feedbackArray = [];
  if (feedbackList) {
    try {
      feedbackArray = JSON.parse(feedbackList);
      // Validate feedbackArray if needed
      if (!Array.isArray(feedbackArray)) {
        throw new Error('Feedback list must be an array');
      }
    } catch (error) {
      throw new ApiError(400, 'Invalid feedback list format');
    }
  }

  // Current date (date of submission)
  const submitDate = new Date();
  // End date from form
  const endDateObj = new Date(endDate);
  // The 3rd of the next month
  const thirdOfNextMonth = new Date(endDateObj.getFullYear(), endDateObj.getMonth() + 1, 3);
  // 7 days after the end date
  const sevenDaysAfterEndDate = new Date(endDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);

  let status = '';
  // console.log(`submitDate: ${submitDate}`);
  // console.log(`endDateObj: ${endDateObj}`);
  // console.log(`sevenDaysAfterEndDate: ${sevenDaysAfterEndDate}`);
  // console.log(`thirdOfNextMonth: ${thirdOfNextMonth}`);
  // console.log(`isDraft: ${isDraft}`);
  // Check if the report is a draft

  if (isDraft===true) {
    status = 'draft';
  } else if ((submitDate <= thirdOfNextMonth) && (submitDate <= sevenDaysAfterEndDate)) {
    status = 'early';
  } else if (submitDate <= thirdOfNextMonth) {
    status = 'on-time';
  } else {
    status = 'late';
  }

  // Create the formData object to be saved
  const formData = {
    activityId,
    activityName,
    facultyName,
    venue,
    activityMode,
    startDate,
    endDate,
    isDraft,
    isJointActivity,
    activityAim,
    activityGroundwork,
    expense,
    feedbackList: feedbackArray,
    chairPersons,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
    status,
    submittedBy
  };

  // Save the formData to the database
  const activityReport = await ActivityReport.create(formData);

  // console.log(activityReport)


  if (!activityReport) {
    throw new ApiError(500, "Something went wrong while creating the activity report");
  }

  return res
          .status(201)
          .json(
            new ApiResponse(
              201, 
              activityReport, 
              "Activity report created successfully"
            )
          );
});

const getActivityReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, searchQuery = '', userId } = req.query;

  const currentPage = Math.max(parseInt(page, 10), 1);
  const pageSize = Math.max(parseInt(limit, 10), 1);
  const skip = (currentPage - 1) * pageSize;

  // const submittedBy = req.user._id;
  // console.log(submittedBy);

  const userObjectId = new mongoose.Types.ObjectId(userId);
  // console.log("user object id: ", userObjectId)

  const submittedBy = userObjectId || req.user._id; // Fallback to current user's ID if userId is not provided
  // console.log("submitted by: ",submittedBy);


  // Search filter for activityName and activityId
  const searchFilter = searchQuery
    ? {
        $or: [
          { activityName: { $regex: searchQuery, $options: 'i' } },
          { activityId: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {};

  // Count documents based on filters
  const totalReports = await ActivityReport.countDocuments({
    submittedBy,
    ...searchFilter,
  });

  // Fetch reports with pagination and sorting
  const reports = await ActivityReport.find({
    submittedBy,
    ...searchFilter,
  })
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 }); // Sorting by creation date


  // console.log("report: ", reports);
  
  const totalPages = Math.ceil(totalReports / pageSize);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        data: reports,
        totalPages,
        currentPage,
        totalReports,
      },
      "Activity reports retrieved successfully."
    )
  );
});

const deleteActivityReport = asyncHandler(async (req, res) => {
  const { activityId } = req.params;
  const submittedBy = req.user._id;

  try {
    const deletedProject = await ActivityReport.findOneAndDelete({ activityId });

    if (deletedProject) {
      return res.status(202).json(
        new ApiResponse(202, {}, 'Project report removed successfully')
      );
    } else {
      return res.status(404).json(
        new ApiError(404, 'No project found to remove')
      );
    }
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

const generateDraftId = async () => {

  const prefix = 'DRAFT';
  const limit = 1000;

  // Find the last meeting report with the given prefix
  const lastReport = await ActivityDraft.findOne({ 
    draftId: { $regex: `^${prefix}` }
  }).sort({ draftId: -1 });

  let lastId = lastReport ? lastReport.draftId : `${prefix}0000`;

  // Extract the sequence number and increment it
  const sequence = parseInt(lastId.slice(-4), 10);
  const newSequence = (sequence + 1) % limit;

  // Format the new sequence with leading zeros
  const formattedSequence = String(newSequence).padStart(4, '0');

  // Create the new meeting ID
  const newDraftId = `${prefix}${formattedSequence}`;

  return newDraftId;
};

const createActivityDraft = asyncHandler(async (req, res) => {
  const {
    draftId, // Include draftId from request body
    activityName,
    facultyName,
    venue,
    activityMode,
    startDate,
    endDate,
    isDraft,
    isJointActivity,
    activityAim,
    activityGroundwork,
    expense,
    feedbackList,
    chairPersons,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
  } = req.body;

  const submittedBy = req.user._id;

  // console.log("is draft: ", isDraft)

  if (!activityName) {
    return res.status(400).json(new ApiError(400, 'Activity name is required.'));
  }

  // console.log("Request Body:", req.body);
  // console.log("draft Id: ",draftId);
  

  try {
    const isDraftBool = isDraft === 'true';
    const isJointActivityBool = isJointActivity === 'true';
    const draftIdValue = draftId === 'null' ? null : draftId;
    
    const activityModeValue = activityMode || null;

    let chairPersonsArray = chairPersons ? chairPersons.split(',').map(person => person.trim()) : [];
    const expenseValue = Number(expense);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await ActivityDraft.deleteMany({ createdAt: { $lt: sevenDaysAgo }, submittedBy });

    // console.log("is draft boolean: ", isDraftBool)

    if (isDraftBool) {
      
      if (draftIdValue) {
        // Update existing draft if draftId is provided
        const updatedDraft = await ActivityDraft.findOneAndUpdate(
          { draftId, submittedBy },
          {
            activityName,
            facultyName,
            venue,
            activityMode: activityModeValue,
            startDate,
            endDate,
            isJointActivity: isJointActivityBool,
            activityAim,
            activityGroundwork,
            expense: expenseValue,
            feedbackList: feedbackList ? JSON.parse(feedbackList) : [],
            chairPersons: chairPersonsArray,
            coverImageUrl,
            attendanceImageUrl,
            supportDocumentUrl,
            updatedAt: Date.now() // Update the timestamp
          },
          { new: true } // Return the updated document
        );

        if (!updatedDraft) {
          console.error("not able to update")
          return res.status(404).json(new ApiError(404, 'Draft not found.'));
        }

        return res.status(200).json(
          new ApiResponse(200, updatedDraft, 'Draft updated successfully')
        );
      } else {
        // Create a new draft if no draftId is provided
        const newDraftId = await generateDraftId();
        // console.log("DraftId: ", newDraftId)
        const newDraft = new ActivityDraft({
          draftId: newDraftId,
          submittedBy,
          activityName,
          facultyName,
          venue,
          activityMode: activityModeValue,
          startDate,
          endDate,
          isJointActivity: isJointActivityBool,
          activityAim,
          activityGroundwork,
          expense: expenseValue,
          feedbackList: feedbackList ? JSON.parse(feedbackList) : [],
          chairPersons: chairPersonsArray,
          coverImageUrl,
          attendanceImageUrl,
          supportDocumentUrl
        });

        await newDraft.save();

        return res.status(201).json(
          new ApiResponse(201, {}, 'Draft created successfully')
        );
      }
    } else {
      return res.status(400).json(
        new ApiError(400, 'isDraft must be true to create or update a draft')
      );
    }
  } catch (error) {
    console.error('Error creating/updating draft:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});


const deleteActivityDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const submittedBy = req.user._id;

  try {
    const deletedDraft = await ActivityDraft.findOneAndDelete({ draftId, submittedBy });

    if (deletedDraft) {
      return res.status(202).json(
        new ApiResponse(202, {}, 'Draft removed successfully')
      );
    } else {
      return res.status(404).json(
        new ApiError(404, 'No draft found to remove')
      );
    }
  } catch (error) {
    console.error('Error deleting draft:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

const getActivityDrafts = asyncHandler(async (req, res) => {
  const submittedBy = req.user._id;

  // console.log(submittedBy);

  try {
    // Fetch all drafts based on submittedBy
    const reports = await ActivityDraft.find({ submittedBy }).sort({ createdAt: -1 }); // Sorting by creation date

    // console.log("report: ", reports);

    const currentDate = new Date();
    const expiryDates = reports.map(report => {
        // Calculate expiry date for each report
        const expiryDate = new Date(report.createdAt);
        expiryDate.setDate(expiryDate.getDate() + 7); // Add 7 days
        return expiryDate;
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          data: reports,
          expiryDates
        },
        "Activity drafts retrieved successfully."
      )
    );
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return res.status(500).json(new ApiError(500, 'Internal server error'));
  }
});

export {
  createMeetingReport,
  getMeetingReports,
  deleteMeetingReport,

  createDmsMeetingDraft,
  getDmsMeetingDrafts,
  deleteDmsMeetingDraft,
  
  createActivityReport,
  getActivityReports,
  deleteActivityReport,
  
  createActivityDraft,
  getActivityDrafts,
  deleteActivityDraft,
};
