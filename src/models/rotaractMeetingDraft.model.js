import { mongoose, Schema } from "mongoose";


const rotaractMeetingDraftSchema = new Schema(
    {
        draftId: {
            type: String,
            unique: true,
        },
        venue: {
            type: String,
        },
        facultyName: {
            type: String,
        },
        meetingType: { 
            type: String,
        },
        startDate: { 
            type: Date, 
        },
        endDate: { 
            type: Date, 
        },
        isDraft: { 
            type: Boolean, 
            default: false 
        },
        meetingSummary: { 
            type: String, 
            maxlength: 200,
        },
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
            default: 0 
        },
        loss: { 
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
        timestamps: true
    }
)

export const RotaractMeetingDraft = mongoose.model('RotaractMeetingDraft', rotaractMeetingDraftSchema);
