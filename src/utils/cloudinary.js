import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        
        const result = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto"
        });
        
        // File uploaded successfully, remove from local storage
        fs.unlinkSync(filePath);
        return result;
        
    } catch (error) {
        fs.unlinkSync(filePath); // Clean up the file if upload fails
        console.error("Error uploading to Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };