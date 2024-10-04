import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { RotaractMeetingReport } from "../models/rotaractMeeting.model.js";
import { ProjectReport } from "../models/rotaractProject.model.js"
import { ProjectDraft } from "../models/projectDraft.model.js";
import { RotaractMeetingDraft } from "../models/rotaractMeetingDraft.model.js";
import mongoose from "mongoose";
// import { uploadOnCloudinary } from "../utils/fileUpload.js";

const generateMeetingId = async () => {

    const prefix = 'RCM';
    const year = new Date().getFullYear();
    const limit = 1000;

    // Find the last meeting report with the given prefix
    const lastReport = await RotaractMeetingReport.findOne({ 
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
    income, 
    expense, 
    profit, 
    loss, 
    rotarians, 
    alumnus, 
    interactors, 
    otherGuests, 
    otherClubMembers, 
    otherPis, 
    otherDistrictRotaractors, 
    totalMembers,
    attendanceImageUrl,
    coverImageUrl,
    supportDocumentUrl,
    isDraft, 
    userRole, 
  } = req.body;

  // const {coverImage, supportDocument} = req.files
  // const { meetingSummary } = req.body
  // console.log(req.body);
  
  if (
    income < 0 ||
    expense < 0 ||
    profit < 0 ||
    loss < 0 ||
    rotarians < 0 ||
    alumnus < 0 ||
    interactors < 0 ||
    otherGuests < 0 ||
    otherClubMembers < 0 ||
    otherPis < 0 ||
    otherDistrictRotaractors < 0 ||
    totalMembers < 0
  ) {
    throw new ApiError(400, "All numeric fields must be positive.");
  }

  const submittedBy = req.user._id;
  // console.log(submittedBy)

  const meetingId = await generateMeetingId();
  // console.log("meeting Id: ",meetingId)

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

  // More debugging outputs
  // console.log('Calculated status:', status);

  const newReport = await RotaractMeetingReport.create({
      meetingId,
      facultyName, 
      venue, 
      meetingType, 
      startDate, 
      endDate, 
      meetingSummary, 
      income, 
      expense, 
      profit, 
      loss, 
      rotarians, 
      alumnus, 
      interactors, 
      otherGuests, 
      otherClubMembers, 
      otherPis, 
      otherDistrictRotaractors, 
      totalMembers,
      attendanceImageUrl,
      coverImageUrl,
      supportDocumentUrl,
      isDraft, 
      status, 
      userRole, 
      submittedBy,
      // coverImageUrl: coverImage,
      // supportDocumentUrl: supportDocument,
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

  // Search filter for projectName and projectId
  const searchFilter = searchQuery
    ? {
        $or: [
          { meetingType: { $regex: searchQuery, $options: 'i' } },
          { meetingId: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {};

  // Count documents based on filters
  const totalReports = await RotaractMeetingReport.countDocuments({
    submittedBy,
    ...searchFilter,
  });

  // Fetch reports with pagination and sorting
  const reports = await RotaractMeetingReport.find({
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
    const deletedMeeting = await RotaractMeetingReport.findOneAndDelete({ meetingId });
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


const generateRotaractMeetingDraftId = async () => {

  const prefix = 'DRAFTM';
  const limit = 1000;

  // Find the last meeting report with the given prefix
  const lastReport = await RotaractMeetingDraft.findOne({ 
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

const createRotaractMeetingDraft = asyncHandler(async (req, res) => {
  const {
    draftId, // Include draftId from request body
    facultyName,
    venue,
    meetingType,
    startDate,
    endDate,
    isDraft,
    meetingSummary,
    income,
    expense,
    profit,
    loss,
    rotarians,
    alumnus,
    interactors,
    otherGuests,
    otherClubMembers,
    otherPis,
    otherDistrictRotaractors,
    totalMembers,
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

    const incomeValue = Number(income);
    const expenseValue = Number(expense);
    const profitValue = Number(profit);
    const lossValue = Number(loss);
    const rotariansValue = Number(rotarians);
    const alumnusValue = Number(alumnus);
    const interactorsValue = Number(interactors);
    const otherGuestsValue = Number(otherGuests);
    const otherClubMembersValue = Number(otherClubMembers);
    const otherPisValue = Number(otherPis);
    const otherDistrictRotaractorsValue = Number(otherDistrictRotaractors);
    const totalMembersValue = Number(totalMembers);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await RotaractMeetingDraft.deleteMany({ createdAt: { $lt: sevenDaysAgo }, submittedBy });

    // console.log("is draft boolean: ", isDraftBool)

    if (isDraftBool) {
      
      if (draftIdValue) {
        // Update existing draft if draftId is provided
        const updatedDraft = await RotaractMeetingDraft.findOneAndUpdate(
          { draftId, submittedBy },
          {
            facultyName,
            venue,
            meetingType,
            startDate,
            endDate,
            meetingSummary,
            income: incomeValue,
            expense: expenseValue,
            profit: profitValue,
            loss: lossValue,
            rotarians: rotariansValue,
            alumnus: alumnusValue,
            interactors: interactorsValue,
            otherGuests: otherGuestsValue,
            otherClubMembers: otherClubMembersValue,
            otherPis: otherPisValue,
            otherDistrictRotaractors: otherDistrictRotaractorsValue,
            totalMembers: totalMembersValue,
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
        const newDraftId = await generateRotaractMeetingDraftId();

        const newDraft = new RotaractMeetingDraft({
          draftId: newDraftId,
          submittedBy,
          facultyName,
          venue,
          meetingType,
          startDate,
          endDate,
          meetingSummary,
          income: incomeValue,
          expense: expenseValue,
          profit: profitValue,
          loss: lossValue,
          rotarians: rotariansValue,
          alumnus: alumnusValue,
          interactors: interactorsValue,
          otherGuests: otherGuestsValue,
          otherClubMembers: otherClubMembersValue,
          otherPis: otherPisValue,
          otherDistrictRotaractors: otherDistrictRotaractorsValue,
          totalMembers: totalMembersValue,
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

const deleteRotaractMeetingDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const submittedBy = req.user._id;

  try {
    const deletedDraft = await RotaractMeetingDraft.findOneAndDelete({ draftId, submittedBy });

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

const getRotaractMeetingDrafts = asyncHandler(async (req, res) => {
  const submittedBy = req.user._id;

  // console.log(submittedBy);

  try {
    // Fetch all drafts based on submittedBy
    const reports = await RotaractMeetingDraft.find({ submittedBy }).sort({ createdAt: -1 }); // Sorting by creation date

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

const generateProjectId = async () => {

  const prefix = 'PROJ';
  const limit = 10000;

  // Find the last meeting report with the given prefix
  const lastReport = await ProjectReport.findOne({ 
      projectId: { $regex: `^${prefix}` }
  }).sort({ projectId: -1 });

  let lastId = lastReport ? lastReport.projectId : `${prefix}0000`;

  // Extract the sequence number and increment it
  const sequence = parseInt(lastId.slice(-4), 10);
  const newSequence = (sequence + 1) % limit;

  // Format the new sequence with leading zeros
  const formattedSequence = String(newSequence).padStart(4, '0');

  // Create the new meeting ID
  const newProjectId = `${prefix}${formattedSequence}`;

  return newProjectId;
};

const createProjectReport = asyncHandler(async (req, res) => {
  let { 
    projectName,
    facultyName,
    venue,
    projectMode,
    startDate,
    endDate,
    avenue1,
    avenue2,
    isDraft,
    isAnInstallation,
    isFlagship,
    isJointProject,
    projectAim,
    projectGroundwork,
    income,
    expense,
    profit,
    loss,
    feedbackList,
    chairPersons,
    rotarians,
    alumnus,
    interactors,
    otherGuests,
    otherClubMembers,
    otherPis,
    otherDistrictRotaractors,
    totalMembers,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
  } = req.body;

  // let { chairPersons } = req.body
  // console.log("chair persons: ",req.body)

  const submittedBy = req.user._id;
  // console.log("submitted By: ",submittedBy)

  // console.log("Feedback List Type:", typeof feedbackList);
  // console.log("Feedback List:", feedbackList);


  if ([projectName, facultyName, venue, projectMode, startDate, endDate, avenue1, coverImageUrl, attendanceImageUrl, supportDocumentUrl].some(field => !field || field.trim() === '')) {
    throw new ApiError(400, "All required fields must be filled.");
  }
  if (avenue2 === 'select' || avenue2 === '') {
    avenue2 = '-'
  }
  // console.log("avenue2: ", avenue2)

  if (typeof chairPersons === 'string') {
    chairPersons = chairPersons.split(',').map(person => person.trim());
  }
  // console.log("chair person: ", chairPersons)

  if (!chairPersons || chairPersons.length === 0) {
    return res.status(400).json({ message: 'At least one chairperson must be selected.' });
  }

  // Generate a new project ID
  const projectId = await generateProjectId();
  // console.log(projectId)

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
    projectId,
    projectName,
    facultyName,
    venue,
    projectMode,
    startDate,
    endDate,
    avenue1,
    avenue2,
    isDraft,
    isAnInstallation,
    isFlagship,
    isJointProject,
    projectAim,
    projectGroundwork,
    income,
    expense,
    profit,
    loss,
    feedbackList: feedbackArray,
    chairPersons,
    rotarians,
    alumnus,
    interactors,
    otherGuests,
    otherClubMembers,
    otherPis,
    otherDistrictRotaractors,
    totalMembers,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
    status,
    submittedBy
  };

  // Save the formData to the database
  const projectReport = await ProjectReport.create(formData);

  // console.log(projectReport)


  if (!projectReport) {
    throw new ApiError(500, "Something went wrong while creating the project report");
  }

  return res
          .status(201)
          .json(
            new ApiResponse(
              201, 
              projectReport, 
              "Project report created successfully"
            )
          );
});

const getProjectReports = asyncHandler(async (req, res) => {
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

  // Search filter for projectName and projectId
  const searchFilter = searchQuery
    ? {
        $or: [
          { projectName: { $regex: searchQuery, $options: 'i' } },
          { projectId: { $regex: searchQuery, $options: 'i' } },
        ],
      }
    : {};

  // Count documents based on filters
  const totalReports = await ProjectReport.countDocuments({
    submittedBy,
    ...searchFilter,
  });

  // Fetch reports with pagination and sorting
  const reports = await ProjectReport.find({
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
      "Project reports retrieved successfully."
    )
  );
});

const deleteProjectReport = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const submittedBy = req.user._id;

  // console.log("Project Id: ", projectId)

  try {
    const deletedProject = await ProjectReport.findOneAndDelete({ projectId });

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
  const lastReport = await ProjectDraft.findOne({ 
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

const createProjectDraft = asyncHandler(async (req, res) => {
  const {
    draftId, // Include draftId from request body
    projectName,
    facultyName,
    venue,
    projectMode,
    startDate,
    endDate,
    avenue1,
    avenue2,
    isDraft,
    isAnInstallation,
    isFlagship,
    isJointProject,
    projectAim,
    projectGroundwork,
    income,
    expense,
    profit,
    loss,
    feedbackList,
    chairPersons,
    rotarians,
    alumnus,
    interactors,
    otherGuests,
    otherClubMembers,
    otherPis,
    otherDistrictRotaractors,
    totalMembers,
    coverImageUrl,
    attendanceImageUrl,
    supportDocumentUrl,
  } = req.body;

  const submittedBy = req.user._id;

  // console.log("is draft: ", isDraft)
  // console.log("rotarians: ", rotarians)

  if (!projectName) {
    return res.status(400).json(new ApiError(400, 'Project name is required.'));
  }

  // console.log("Request Body:", req.body);
  // console.log("draft Id: ",draftId);
  

  try {
    const isDraftBool = isDraft === 'true';
    const isAnInstallationBool = isAnInstallation === 'true';
    const isFlagshipBool = isFlagship === 'true';
    const isJointProjectBool = isJointProject === 'true';
    const draftIdValue = draftId === 'null' ? null : draftId;
    
    const projectModeValue = projectMode || null;
    const avenue1Value = avenue1 || null;
    const avenue2Value = avenue2 || null;

    let chairPersonsArray = chairPersons ? chairPersons.split(',').map(person => person.trim()) : [];
    const incomeValue = Number(income);
    const expenseValue = Number(expense);
    const profitValue = Number(profit);
    const lossValue = Number(loss);
    const rotariansValue = Number(rotarians);
    const alumnusValue = Number(alumnus);
    const interactorsValue = Number(interactors);
    const otherGuestsValue = Number(otherGuests);
    const otherClubMembersValue = Number(otherClubMembers);
    const otherPisValue = Number(otherPis);
    const otherDistrictRotaractorsValue = Number(otherDistrictRotaractors);
    const totalMembersValue = Number(totalMembers);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await ProjectDraft.deleteMany({ createdAt: { $lt: sevenDaysAgo }, submittedBy });

    // console.log("is draft boolean: ", isDraftBool)

    if (isDraftBool) {
      
      if (draftIdValue) {
        // Update existing draft if draftId is provided
        const updatedDraft = await ProjectDraft.findOneAndUpdate(
          { draftId, submittedBy },
          {
            projectName,
            facultyName,
            venue,
            projectMode: projectModeValue,
            startDate,
            endDate,
            avenue1: avenue1Value,
            avenue2: avenue2Value,
            isAnInstallation: isAnInstallationBool,
            isFlagship: isFlagshipBool,
            isJointProject: isJointProjectBool,
            projectAim,
            projectGroundwork,
            income: incomeValue,
            expense: expenseValue,
            profit: profitValue,
            loss: lossValue,
            feedbackList: feedbackList ? JSON.parse(feedbackList) : [],
            chairPersons: chairPersonsArray,
            rotarians: rotariansValue,
            alumnus: alumnusValue,
            interactors: interactorsValue,
            otherGuests: otherGuestsValue,
            otherClubMembers: otherClubMembersValue,
            otherPis: otherPisValue,
            otherDistrictRotaractors: otherDistrictRotaractorsValue,
            totalMembers: totalMembersValue,
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
        const newDraft = new ProjectDraft({
          draftId: newDraftId,
          submittedBy,
          projectName,
          facultyName,
          venue,
          projectMode: projectModeValue,
          startDate,
          endDate,
          avenue1: avenue1Value,
          avenue2: avenue2Value,
          isAnInstallation: isAnInstallationBool,
          isFlagship: isFlagshipBool,
          isJointProject: isJointProjectBool,
          projectAim,
          projectGroundwork,
          income: incomeValue,
          expense: expenseValue,
          profit: profitValue,
          loss: lossValue,
          feedbackList: feedbackList ? JSON.parse(feedbackList) : [],
          chairPersons: chairPersonsArray,
          rotarians: rotariansValue,
          alumnus: alumnusValue,
          interactors: interactorsValue,
          otherGuests: otherGuestsValue,
          otherClubMembers: otherClubMembersValue,
          otherPis: otherPisValue,
          otherDistrictRotaractors: otherDistrictRotaractorsValue,
          totalMembers: totalMembersValue,
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

const deleteProjectDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const submittedBy = req.user._id;

  try {
    const deletedDraft = await ProjectDraft.findOneAndDelete({ draftId, submittedBy });

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

const getProjectDrafts = asyncHandler(async (req, res) => {
  const submittedBy = req.user._id;

  // console.log(submittedBy);

  try {
    // Fetch all drafts based on submittedBy
    const reports = await ProjectDraft.find({ submittedBy }).sort({ createdAt: -1 }); // Sorting by creation date

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
        "Project drafts retrieved successfully."
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

  createRotaractMeetingDraft,
  deleteRotaractMeetingDraft,
  getRotaractMeetingDrafts,

  createProjectReport,
  getProjectReports,
  deleteProjectReport,

  createProjectDraft,
  deleteProjectDraft,
  getProjectDrafts
};
