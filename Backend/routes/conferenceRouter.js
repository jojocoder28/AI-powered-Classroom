const express = require("express");
const multer = require("multer"); // Import multer
const { conferenceCtrl } = require("../controller/conferenceController.js");
const isAuthenticated = require("../middlewares/isAuth.js");

// --- Multer Configuration (Using Memory Storage for Cloudinary) ---
// Store files in memory as buffers, suitable for uploading to services like Cloudinary
const storage = multer.memoryStorage();

// Configure multer instance
const upload = multer({ 
    storage: storage,
    // Add file filter if needed (e.g., based on mimetype)
    fileFilter: function (req, file, cb) {
        // You can add more sophisticated checks here based on file.mimetype
        // Example: Allow common document/image types
        // const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        // if (!allowedTypes.includes(file.mimetype)) {
        //     return cb(new Error('Invalid file type!'), false);
        // }
        cb(null, true); // Accept the file
    },
    // Add size limits if needed
    // limits: { fileSize: 1024 * 1024 * 10 } // Example: 10MB limit
}); 

// --- Router Setup ---
const router = express.Router();

// Apply authentication middleware to all conference routes
router.use(isAuthenticated);

// --- Basic Room Management ---
router.post("/create", conferenceCtrl.createRoom);        // Create a new room
router.get("/rooms", conferenceCtrl.getRooms);             // Get list of active/waiting rooms
router.get("/rooms/:roomId", conferenceCtrl.getRoomById);  // Get details of a specific room
router.post("/join/:roomId", conferenceCtrl.joinRoom);       // Join a specific room
router.patch("/status/:roomId", conferenceCtrl.updateRoomStatus); // Update room status (e.g., end room - host only)

// --- Chat Routes ---
router.get("/chat/:roomId", conferenceCtrl.getChatMessages); // Get existing chat messages for a room
router.post("/chat/:roomId", conferenceCtrl.sendChatMessageREST); // Send chat message via REST

// --- Submission Routes ---
// POST uses multer middleware (`upload.single('submissionFile')`) to handle the file upload.
// 'submissionFile' must match the name attribute of the file input field in the frontend form.
router.post("/submit/:roomId", upload.single('submissionFile'), conferenceCtrl.handleSubmission); // Upload file to Cloudinary
router.get("/submissions/:roomId", conferenceCtrl.getSubmissions); // Get list of submissions for a room
// Optional: Add a route for deleting submissions (requires controller logic)
// router.delete("/submissions/:roomId/:submissionId", conferenceCtrl.deleteSubmission);

// --- Emotion Detection Routes ---
router.post("/emotion/:roomId", conferenceCtrl.recordEmotionEventREST); // Record an emotion event via REST
router.get("/emotion/:roomId", conferenceCtrl.getEmotionData); // Get emotion data

module.exports = router;
