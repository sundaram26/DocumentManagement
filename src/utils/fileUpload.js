import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { ApiError } from "./ApiError.js";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath, folderName) => {
    try {
        if(!localFilePath) return null

        // Extract the original file name from the local file path
        const originalFileName = localFilePath.split("/").pop();
        console.log("original file name: ", originalFileName)
        console.log("folder name: ", folderName)
        // console.log("public_id: ", originalFileName.split(".")[0])
        
        //upload the file on cloudinary
        const response = await cloudinary.uploader
        .upload(
            localFilePath, 
            {
                resource_type: "raw",
                folder: folderName,
                // access_control: [
                //     {
                //       access_type: "anonymous",
                //       permission: "read" 
                //     }
                // ]
            },
        )
        //file has been uploaded successfully

        console.log("Cloudinary response: ", response.access_control)
        
        fs.unlinkSync(localFilePath)
        // return response.url;

        return {
            secure_url: response?.secure_url,
            public_id: response?.public_id
        }
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove file if upload fails
        } //remove the locally saved temporary file as the upload operation got failed
        throw new ApiError('Failed to upload file to Cloudinary');
    }
}

export { uploadOnCloudinary }