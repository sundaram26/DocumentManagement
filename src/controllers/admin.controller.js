import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getUnapprovedUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({ isVerified: true, isApproved: false });
        // console.log("Users: ", users)
        if (!users.length) {
            // return res.json(new ApiResponse(201, "No unapproved users found"))
            throw new ApiError(404, "No unapproved users found");
        }

        res.json(new ApiResponse(200, users, "Unapproved users fetched successfully"));
    } catch (error) {
        res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message));
    }
});

const approveUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        // console.log("user id: ", userId)

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        if (user.isApproved) {
            return res.json(new ApiResponse(200, user, "User is already approved"));
        }

        user.isApproved = true;
        await user.save();

        res.json(new ApiResponse(200, user, "User approved successfully"));
    } catch (error) {
        console.error('Error approving user:', error);
        throw new ApiError(500, "Internal server error");
    }
});

const disapproveUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User does not exist");
        }

        // Delete the user from the database
        await user.deleteOne()

        res.json(new ApiResponse(200, null, "User disapproved and deleted successfully"));
    } catch (error) {
        console.error('Error disapproving and deleting user:', error);
        throw new ApiError(500, "Internal server error");
    }
});

const getUsers = asyncHandler(async (req, res, next) => {
    try {
      const users = await User.find().select('-password -refreshToken');
  
      if (!users || users.length === 0) {
        throw new ApiError(404, 'No users found');
      }
  
      return res.status(200).json(
        new ApiResponse(200, users, 'Users fetched successfully')
      );
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
});

const getReportsByUser = asyncHandler(async (req, res, next) => {
    try {
        const { userId } = req.params;

        const reports = await Report.find({ submittedBy: userId });

        if (!reports || reports.length === 0) {
            throw new ApiError(404, 'No reports found for this user');
        }

        return res.status(200).json(
            new ApiResponse(200, reports, 'Reports fetched successfully')
        );
    } catch (error) {
        next(new ApiError(500, 'Error fetching reports'));
    }
});

export {
    getUnapprovedUsers,
    approveUser,
    disapproveUser,
    getUsers,
    getReportsByUser
}