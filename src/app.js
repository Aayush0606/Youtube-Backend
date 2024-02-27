import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
app.use((req, res, next) => {
  if (req.method === "GET") console.log("\x1b[32m", req.method, req.url);
  else if (req.method === "POST") console.log("\x1b[33m", req.method, req.url);
  else if (req.method === "PUT") console.log("\x1b[34m", req.method, req.url);
  else if (req.method === "DELETE")
    console.log("\x1b[31m", req.method, req.url);
  else console.log("\x1b[35m", req.method, req.url);
  next();
});

import { userRouter } from "./routes/user.route.js";

app.use("/api/users", userRouter);

export default app;
