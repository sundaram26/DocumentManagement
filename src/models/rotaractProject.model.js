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

const projectReportSchema = new Schema(
    {
        projectId: {
            type: String,
            required: true
        },
        projectName: { 
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
        projectMode: { 
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
        avenue1: { 
            type: String, 
            enum: [ 
                'Community Service', 
                'Club Service', 
                'Career Developement', 
                'International Service', 
                'Sports', 
                'Digital Communication', 
                'Partner In Service', 
                'Training, Revival And Sustenance', 
                'Editorial', 
                'Public Relations'
            ],
            required: true
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
                'Digital Communication', 
                'Partner In Service', 
                'Training Revival And Sustenance', 
                'Editorial', 
                'Public Relations'
            ], 
            // required: true
        },
        isDraft: { 
            type: Boolean, 
            default: false 
        },
        isAnInstallation: { 
            type: Boolean, 
            default: false 
        },
        isFlagship: { 
            type: Boolean, 
            default: false 
        },
        isJointProject: { 
            type: Boolean, 
            default: false 
        },
        status: { 
            type: String, 
            enum: ['early', 'on-time', 'late'], 
            default: null
        },
        income: { 
            type: Number, 
            default: 0,
            required: true
        },
        expense: { 
            type: Number,
            default: 0,
            required: true
        },
        profit: { 
            type: Number,
            default: 0,
            required: true
        },
        loss: { 
            type: Number,
            default: 0,
            required: true 
        },
        projectAim: {
            type: String,
            required: true
        },
        projectGroundwork: {
            type: String,
            required: true
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
            required: true 
        },
        rotarians: { 
            type: Number,
            default: 0,
            required: true
        },
        alumnus: { 
            type: Number,
            default: 0,
            required: true 
        },
        interactors: { 
            type: Number,
            default: 0,
            required: true
        },
        otherGuests: { 
            type: Number,
            default: 0,
            required: true 
        },
        otherClubMembers: { 
            type: Number,
            default: 0,
            required: true
        },
        otherPis: { 
            type: Number,
            default: 0,
            required: true 
        },
        otherDistrictRotaractors: { 
            type: Number,
            default: 0,
            required: true 
        },
        totalMembers: { 
            type: Number,
            default: 0,
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

export const ProjectReport = mongoose.model('ProjectReport', projectReportSchema);
