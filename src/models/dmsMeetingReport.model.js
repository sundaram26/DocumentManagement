import { mongoose, Schema } from "mongoose";


const dmsMeetingReportSchema = new Schema(
    {
        meetingId: {
            type: String,
            required: true,
            unique: true,
            index: true
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
            required: true
        },
        expense: { 
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

export const DmsMeetingReport = mongoose.model('DmsMeetingReport', dmsMeetingReportSchema);
