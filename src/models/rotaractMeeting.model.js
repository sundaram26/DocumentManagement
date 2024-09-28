import { mongoose, Schema } from "mongoose";


const rotaractMeetingReportSchema = new Schema(
    {
        meetingId: {
            type: String,
            required: true,
            unique: true,
            // index: true
        },
        venue: {
            type: String,
            required: true
        },
        facultyName: {
            type: String,
            required: true
        },
        meetingType: { 
            type: String,
            required: true 
        },
        startDate: { 
            type: Date, 
            required: true, 
        },
        endDate: { 
            type: Date, 
            required: true 
        },
        isDraft: { 
            type: Boolean, 
            default: false 
        },
        status: { 
            type: String, 
            enum: ['early', 'on-time', 'late'], 
            default: null 
        },
        meetingSummary: { 
            type: String, 
            maxlength: 200,
            required: true
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
            default: 0 
        },
        loss: { 
            type: Number, 
            default: 0 
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
        timestamps: true
    }
)

export const RotaractMeetingReport = mongoose.model('RotaractMeetingReport', rotaractMeetingReportSchema);
