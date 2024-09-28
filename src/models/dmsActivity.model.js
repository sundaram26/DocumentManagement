// models/ProjectReport.js
import mongoose, { Schema } from "mongoose";


const feedbackSchema = new Schema(
    {
        feedbackGivenBy: { 
            type: String, 
        },
        feedbackMessage: { 
            type: String, 
        },
    }, 
    {
        _id: false // Feedback entries won't get their own IDs
    }
);

const activityReportSchema = new Schema(
    {
        activityId: {
            type: String,
            required: true
        },
        activityName: { 
            type: String, 
            required: true 
        },
        facultyName: { 
            type: String,
            required: true 
        },
        venue: { 
            type: String, 
            required: true 
        },
        activityMode: { 
            type: String, 
            enum: ['online', 'on-ground'], 
            required: true
        },
        startDate: { 
            type: Date, 
            required: true

        },
        endDate: { 
            type: Date,
            required: true
        },
        isDraft: { 
            type: Boolean, 
            default: false 
        },
        isJointActivity: { 
            type: Boolean, 
            default: false 
        },
        status: { 
            type: String, 
            enum: ['early', 'on-time', 'late'], 
            default: null 
        },
        expense: { 
            type: Number,
            default: 0,
            required: true
        },
        activityAim: {
            type: String,
            required: true
        },
        activityGroundwork: {
            type: String,
            required: true
        },
        feedbackList: [
            feedbackSchema
        ],
        chairPersons: { 
            type: [String],
            enum: [
                'Mr. Anil S. Tiwari',
                'Dr. Anand Dharmadhikari',
                'Dr. Madhu Shukrey',
                'Dr. Rinky Rajwani',
                'Mr. Suraj Agarwala',
                'Dr. Chandra Iyer',
                'Mr. Ganesh Kumawat',
                'Ms. Akanksha Thakur',
                'Ms. Saroj Iyengar',
                'Dr. Sadhana Kapote',
                'Mr. Arnold Jathanna',
                'Ms. Navya Premdarsh',
                'Ms. Glodit Raphel',
                'Ms. Revati Hunswadkar',
                'Dr. Priya Pandharpatte',
                'Ms. Avani Nebhani',
                'Dr. Abhijeet Rawal',
                'Mr. Samarth Nebhani',
                'Ms. Nishmita Rana',
                'Ms. Komal Tiwari',
                'Dr. Amrita Harjani',
                'Ms. Dia Jotwani'
            ],
            required: true 
        },
        coverImageUrl: { 
            type: String,
            required: true 
        },
        attendanceImageUrl: { 
            type: String,
            required: true
        },
        supportDocumentUrl: { 
            type: String,
            required: true
        },
        submittedBy: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
        },
    }, 
    {
        timestamps: true,
    }
);

export const ActivityReport = mongoose.model('ActivityReport', activityReportSchema);
