import "dotenv/config";
import { PORT } from "./constants.js";
import { connectDB } from "./db/db.js";
import app from "./app.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend server started at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(`Failed to connect DB`);
    process.exit(1);
  });
