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
import { commentRouter } from "./routes/comment.route.js";
import { likeRouter } from "./routes/like.route.js";
import { dashboardRouter } from "./routes/dashboard.route.js";
import { playlistRouter } from "./routes/playlist.route.js";
import { tweetRouter } from "./routes/tweet.route.js";
import { subscriptionRouter } from "./routes/subscription.route.js";
import { videoRouter } from "./routes/video.route.js";
app.use("/api/users", userRouter);
app.use("/api/comments", commentRouter);
app.use("/api/likes", likeRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/playlists", playlistRouter);
app.use("/api/tweets", tweetRouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/videos", videoRouter);

export default app;
