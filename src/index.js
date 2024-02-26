import "dotenv/config";
import express from "express";
const PORT = process.env.PORT || 8081;

const app = express();

app.listen(PORT, () => {
  console.log(`Backend server started at http://localhost:8080`);
});
