import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";


const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB();

server.on("error", (error) => {
  console.error("Server failed to start:", error.message);
});
