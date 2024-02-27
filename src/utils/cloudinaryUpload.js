import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_SECRET,
} from "../constants.js";

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const cloudinaryUpload = async (filePath) => {
  try {
    if (!filePath) return null;
    const uploadObject = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File uploaded successfuly ", uploadObject);
    fs.unlinkSync(filePath);
    return uploadObject;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.log("Not able to upload to cloudinary ", error);
  }
};

export { cloudinaryUpload };
