import { mongoose, Schema } from "mongoose";


const dmsMeetingDraftSchema = new Schema(
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
        },
        // status: { 
        //     type: String, 
        //     enum: ['early', 'on-time', 'late'],
        //     default: null 
        // },
        meetingSummary: { 
            type: String, 
        },
        expense: { 
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

export const DmsMeetingDraft = mongoose.model('DmsMeetingDraft', dmsMeetingDraftSchema);
