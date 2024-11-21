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

const projectDraftSchema = new Schema(
    {
        draftId: {
            type: String,
        },
        projectName: { 
            type: String, 
            required: true
        },
        facultyName: { 
            type: String,
        },
        venue: { 
            type: String, 
        },
        projectMode: { 
            type: String, 
            enum: ['online', 'on-ground', 'both'],
            default: null, 
        },
        startDate: { 
            type: Date, 
        },
        endDate: { 
            type: Date,
        },
        avenue1: { 
            type: String, 
            enum: [ 
                'Community Service', 
                'Club Service', 
                'Career Developement', 
                'International Service', 
                'Sports', 
                'Digital Communications', 
                'Partners In Service', 
                'Training, Revival And Sustenance', 
                'Editorial', 
                'Public Relations And Marketing'
            ],
            default: null,
        },
        avenue2: { 
            type: String, 
            enum: [
                '-',
                'Community Service', 
                'Club Service', 
                'Career Developement', 
                'International Service', 
                'Sports', 
                'Digital Communications', 
                'Partners In Service', 
                'Training Revival And Sustenance', 
                'Editorial', 
                'Public Relations And Marketing'
            ], 
            default: null,
        },
        isDraft: { 
            type: Boolean, 
        },
        isAnInstallation: { 
            type: Boolean, 
        },
        isFlagship: { 
            type: Boolean, 
        },
        isJointProject: { 
            type: Boolean, 
        },
        jointProjectPartner: {
            type: String,
        },
        // status: { 
        //     type: String, 
        //     enum: ['draft'], 
        //     default: null,
        // },
        income: { 
            type: Number, 
            default: 0,
        },
        expense: { 
            type: Number,
            default: 0,
        },
        profit: { 
            type: Number,
            default: 0,
        },
        loss: { 
            type: Number,
            default: 0,
        },
        projectAim: {
            type: String,
        },
        projectGroundwork: {
            type: String,
        },
        projectSummary: {
            type: String,
        },
        feedbackList: [
            feedbackSchema
        ],
        chairPersons: { 
            type: [String],
            enum: [
                'Rtr. Arnold Jathanna',
                'Rtr. Krunal Masurekar',
                'Rtr. Bhavna Baphedia',
                'Rtr. Saishruti Pampana',
                'Rtr. Vaishnavi Gholap',
                'Rtr. Sumit Ghadge',
                'Rtr. Sakshi Mukherjee',
                'Rtr. Heeba Khan',
                'Rtr. Purva Bafna',
                'Rtr. Ramnarayan Sahu',
                'Rtr. Arjun Kubera',
                'Rtr. Tushar Shinde',
                'Rtr. Suhani Jain',
                'Rtr. Atifa Qureshi',
                'Rtr. Sumit Bank',
                'Rtr. Mithil Kadam',
                'Rtr. Dimpal Patil',
                'Rtr. Riva Jain',
                'Rtr. Saniya Shaikh',
                'Rtr. Isha Dubey',
                'Rtr. Shreya Nair',
                'Rtr. Anshu Gupta',
                'Rtr. Lavesh Sawant',
                'Rtr. Ketaki Deshmukh'
            ],
            default: [],
            // required: true 
        },
        activeHomeClubMembers: {
            type: Number,
            default: 0
        },
        guestHomeClubMembers: {
            type: Number,
            default: 0
        },
        districtCouncilMembers: {
            type: Number,
            default: 0
        },
        rotarians: { 
            type: Number,
            default: 0,
        },
        alumnus: { 
            type: Number,
            default: 0,
        },
        interactors: { 
            type: Number,
            default: 0,
        },
        otherGuests: { 
            type: Number,
            default: 0,
        },
        otherClubMembers: { 
            type: Number,
            default: 0,
        },
        otherPis: { 
            type: Number,
            default: 0,
        },
        otherDistrictRotaractors: { 
            type: Number,
            default: 0,
        },
        totalMembers: { 
            type: Number,
            default: 0,
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

export const ProjectDraft = mongoose.model('ProjectDraft', projectDraftSchema);
