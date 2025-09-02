"use server"

import { v2 as cloudinary } from "cloudinary"


cloudinary.config({
    cloud_name: "dgemt0opu",
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})


export const deleteFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};