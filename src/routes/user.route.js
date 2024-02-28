import { Router } from "express";
import {
  registerUser,
  loginUser,
  imageCleanup,
  logoutUser,
  updateUser,
  refreshTokenUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
  imageCleanup
);

userRouter.route("/login").get(loginUser);

userRouter.route("/logout").post(authenticate, logoutUser);

userRouter.route("/refresh-token").post(refreshTokenUser);

userRouter.route("/update").put(
  authenticate,
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updateUser,
  imageCleanup
);

export { userRouter };
