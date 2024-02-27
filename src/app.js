import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { upload } from "./middlewares/multer.middleware.js";
import { CORS_ORIGIN } from "./constants.js";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN,
  })
);
app.use(
  express.json({
    limit: "64kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "64kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import { userRouter } from "./routes/user.route.js";

app.use("/api/users", userRouter);

export default app;
