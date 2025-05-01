'use strict';
const express = require('express');
const {
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getAvailableClassrooms, // Import the new controller function
    getClassroomDetails,
    getClassroomParticipants,
} = require('../controller/classroomController'); // Adjust path if controller is elsewhere

// Import authentication middleware
const isAuthenticated = require("../middlewares/isAuth"); // General authentication check
const isStudentAuthenticated = require('../middlewares/isStudentAuthenticated');
const isTeacherAuthenticated = require('../middlewares/isTeacherAuthenticated');

const router = express.Router();

// --- Teacher Routes ---
// Route to create a classroom - Only teachers
router.post('/', isTeacherAuthenticated, createClassroom);

// --- Student Routes ---
// Route to join a classroom - Only students
router.post('/join', isStudentAuthenticated, joinClassroom);
// Route to get classrooms available for joining - Only students
router.get('/available', isStudentAuthenticated, getAvailableClassrooms);

// --- Common Routes (Authenticated Users) ---
// Route to get the user's classrooms (taught or enrolled)
router.get('/myclassrooms', isAuthenticated, getMyClassrooms);

// Routes for specific classroom ID - require user to be authenticated first
// Authorization (is user part of class?) is handled within the controller
router.get('/:id', isAuthenticated, getClassroomDetails);
router.get('/:id/participants', isAuthenticated, getClassroomParticipants);

module.exports = router;
