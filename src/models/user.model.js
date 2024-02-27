import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_EXPIRY,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
} from "../constants.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: [true, "Username already exist"],
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: [true, "Email already exist"],
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Please enter password"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function (password) {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = async function (password) {
  return jwt.sign(
    {
      _id: this._id,
    },
    REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
