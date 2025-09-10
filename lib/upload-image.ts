"use server"

import { v2 as cloudinary } from "cloudinary"


cloudinary.config({
    cloud_name: "daod5wsae",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


export const deleteFromCloudinary = async (publicId: string) => {
  
   try {
        const result = await cloudinary.uploader.destroy(publicId);
        
        
        if (result.result === 'ok') {
            console.log('SUCCESS: Image actually deleted');
        } else {
            console.log('FAILED: Image NOT deleted, reason:', result.result);
        }
        
        return result;
    } catch (error) {
        console.error('DELETE ERROR:', error);
        throw error;
    }
};