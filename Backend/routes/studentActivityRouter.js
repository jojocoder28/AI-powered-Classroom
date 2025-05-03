// --- routes/studentActivityRouter.js ---
const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const {
    submitQuiz,
    getQuizResults,
    saveEmotion,
    //getEmotions,
    submitAssignment,
    getAssignments,
    getLatestEmotionsForStudents // Import the new controller function
} = require('../controller/studentActivityController');

const isStudentAuthenticated = require('../middlewares/isStudentAuthenticated');
const isTeacherAuthenticated = require('../middlewares/isTeacherAuthenticated'); // Import teacher middleware

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// --- POST Routes ---
router.post('/quiz', isStudentAuthenticated, submitQuiz);
router.post('/emotion', isStudentAuthenticated, saveEmotion);
router.post('/assignment/:classroomId', isStudentAuthenticated, upload.single('assignmentFile'), submitAssignment);
router.post('/latestEmotions', isTeacherAuthenticated, getLatestEmotionsForStudents); // New route for fetching latest emotions

// --- GET Routes ---
router.get('/quiz', isStudentAuthenticated, getQuizResults);
//router.get('/emotion', isStudentAuthenticated, getEmotions);
router.get('/assignment', isStudentAuthenticated, getAssignments);

module.exports = router;
