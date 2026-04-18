import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "127.0.0.1";

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

connectDB();

server.on("error", (error) => {
  console.error("Server failed to start:", error.message);
});
