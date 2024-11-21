import mongoose, { Schema } from "mongoose";


const rotaractMouSchema = new Schema(
    {
        mouId: {
            type: String,
            required: true
        },
        sponsorName: { 
            type: String, 
            required: true 
        },
        sponsorAmount: { 
            type: Number, 
            default: 0,
            required: true
        },
        deliverablesOfferedBySponsor: {
            type: String,
            required: true
        },
        deliverablesOfferedByClub: {
            type: String,
            required: true
        },
        dateOfSigning: { 
            type: Date, 
            required: true
        },
        mouPdfUpload: {
            type: String,
            required: true,
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

export const RotaractMou = mongoose.model('RotaractMou', rotaractMouSchema);
