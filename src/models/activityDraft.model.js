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

const activityDraftSchema = new Schema(
    {
        draftId: {
            type: String,
        },
        activityName: { 
            type: String, 
            required: true 
        },
        facultyName: { 
            type: String,
        },
        venue: { 
            type: String, 
        },
        activityMode: { 
            type: String, 
            enum: ['online', 'on-ground'], 
            default: null
        },
        startDate: { 
            type: Date, 
        },
        endDate: { 
            type: Date,
        },
        isDraft: { 
            type: Boolean, 
        },
        isJointActivity: { 
            type: Boolean, 
        },
        // status: { 
        //     type: String, 
        //     enum: ['early', 'on-time', 'late'], 
        // },
        expense: { 
            type: Number,
            default: 0,
        },
        activityAim: {
            type: String,
        },
        activityGroundwork: {
            type: String,
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
            default: null
        },
        coverImageUrl: { 
            type: String,
        },
        attendanceImageUrl: { 
            type: String,
        },
        supportDocumentUrl: { 
            type: String,
        },
        submittedBy: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
        },
        expiresAt: { 
            type: Date,
            default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, 
            index: { expires: '7d' },
        },
    }, 
    {
        timestamps: true,
    }
);

export const ActivityDraft = mongoose.model('ActiviyDraft', activityDraftSchema);
