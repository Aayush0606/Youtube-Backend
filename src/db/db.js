import mongoose from "mongoose";
import { DB_NAME, MONGODB_URI } from "../constants.js";

export const connectDB = async () => {
  const connectURL = `${MONGODB_URI}/${DB_NAME}`;
  try {
    const connectionInstance = await mongoose.connect(connectURL);
    console.log(
      `Connected to DB successfully, DB Host : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("Error connecting DB ", error);
    process.exit(1);
  }
};
