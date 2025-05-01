'use strict';
const express = require('express');
const {
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getClassroomDetails,
    getClassroomParticipants,
} = require('../controller/classroomController'); // Adjust path if controller is elsewhere

// Import authentication middleware
const isAuthenticated = require("../middlewares/isAuth"); // General authentication check
const isStudentAuthenticated = require('../middlewares/isStudentAuthenticated');
const isTeacherAuthenticated = require('../middlewares/isTeacherAuthenticated');

const router = express.Router();

// Route to create a classroom - Only teachers
router.post('/', isTeacherAuthenticated, createClassroom);

// Route to join a classroom - Only students (can be changed to isAuth if teachers can also join)
router.post('/join', isStudentAuthenticated, joinClassroom);

// Route to get the user's classrooms (taught or enrolled)
router.get('/myclassrooms', isAuthenticated, getMyClassrooms); // Use general isAuth middleware

// Routes for specific classroom ID - require user to be authenticated first
// Authorization (is user part of class?) is handled within the controller
router.get('/:id', isAuthenticated, getClassroomDetails);
router.get('/:id/participants', isAuthenticated, getClassroomParticipants);


module.exports = router;