const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require("socket.io");
const router = require("./routes/users");
const conferenceRouter = require("./routes/conferenceRouter");
const { initializeSocket } = require("./controller/conferenceController");
const classroomRouter = require('./routes/classroomRouter');
const errorHandler = require("./middlewares/errorHandler");
const cookieParser = require('cookie-parser');
const studentActivityRouter = require("./routes/studentActivityRouter");

dotenv.config();
const dburl = process.env.MONGO_URI;
const app = express();
app.use(cookieParser());

const server = http.createServer(app); // Create HTTP server for Socket.io
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true
  }
});


//! Connect to MongoDB
mongoose
  .connect(dburl)
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

//! Middlewares
app.use(cors({
  origin: 'http://localhost:5173', // your frontend's origin
  credentials: true                // allow cookies and credentials
}));
app.use(express.json()); // Parse JSON request body

//! Routes
app.use("/api/users", router);
app.use("/api/conference", conferenceRouter);
app.use('/api/classrooms', classroomRouter);
app.use("/api/studentactivity", studentActivityRouter);

//! Initialize Socket.io
initializeSocket(io);

//! Error Handler Middleware
app.use(errorHandler);

//! Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
