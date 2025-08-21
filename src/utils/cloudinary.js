import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
(async function() {

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    
    const uploadOnCloudinary = async (filePath, publicId) => {
        try {
            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
                public_id: publicId
            });
            console.log("File uploaded successfully:", result.secure_url);
            return result;
        } catch (error) {
            fs.unlinkSync(filePath); // Clean up the file if upload fails
            console.error("Error uploading to Cloudinary:", error);
            throw error;
        }
    };

    // Upload an image
    const uploadResult = await uploadOnCloudinary(
        'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
        'shoes'
    );

    console.log(uploadResult);
       });
    
    console.log(uploadResult);
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });

    console.log(autoCropUrl);