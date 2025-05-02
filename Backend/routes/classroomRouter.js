'use strict';
const express = require('express');
const multer = require('multer');
const path = require('path');
const {
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getAvailableClassrooms,
    getClassroomDetails,
    getClassroomParticipants,
    getAssignments,
    uploadAssignment,
    // TODO: Add controller for deleteAssignment if needed
    // TODO: Add controller for submitAssignment (student)
} = require('../controller/classroomController');

// Import authentication middleware
const isAuthenticated = require("../middlewares/isAuth");
const isStudentAuthenticated = require('../middlewares/isStudentAuthenticated');
const isTeacherAuthenticated = require('../middlewares/isTeacherAuthenticated');

const router = express.Router();

// --- Multer Setup for File Uploads (In-Memory Storage for Cloudinary) ---
const storage = multer.memoryStorage(); // Use memory storage

// Optional: File filter (example: allow common document/image types)
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only common document/image formats allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Example: Limit file size to 10MB
});

// --- Teacher Routes ---
router.post('/', isTeacherAuthenticated, createClassroom);

// Teacher uploads an assignment file
// Uses isTeacherAuthenticated middleware
// Uses multer memory storage: upload.single('assignmentFile')
router.post(
    '/:id/assignments',
    isTeacherAuthenticated, // Ensure only teachers can access this route
    upload.single('assignmentFile'), // MUST match FormData key in frontend
    uploadAssignment
);

// TODO: Add route for Teacher to delete an assignment (e.g., DELETE /:id/assignments/:assignmentId)

// --- Student Routes ---
router.post('/join', isAuthenticated, joinClassroom);
router.get('/available', isAuthenticated, getAvailableClassrooms);

// TODO: Add route for Student to submit an assignment (e.g., POST /:id/assignments/:assignmentId/submit)
// This would likely use isStudentAuthenticated and potentially different controller logic

// --- Common Routes (Authenticated Users) ---
// Added a check for hyphen vs no hyphen, frontend uses my-classrooms
router.get('/myclassrooms', isAuthenticated, getMyClassrooms);
// router.get('/getdetails/:id', isAuthenticated, getClassroomDetails);

// These routes require authentication, and the controller handles specific authorization (is user in class?)
router.get('/:id', isAuthenticated, getClassroomDetails);
router.get('/:id/participants', isAuthenticated, getClassroomParticipants);
router.get('/:id/assignments', isAuthenticated, getAssignments);

module.exports = router;
