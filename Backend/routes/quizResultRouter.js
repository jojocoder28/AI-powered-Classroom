const express = require("express");
const quizResultController = require("../controller/quizResultController");
const isStudentAuthenticated = require("../middlewares/isStudentAuthenticated"); // Assuming you have this middleware

const router = express.Router();

// Route to save a quiz result
// Protecting this route to ensure only authenticated students can save results
router.post('/save', isStudentAuthenticated, quizResultController.saveQuizResult);

// Optional: Route to get a student's historical quiz results
// Using POST for simplicity to send assignmentPaths in the body, adjust to GET with query params if preferred.
router.post('/history', isStudentAuthenticated, quizResultController.getStudentQuizResults);


module.exports = router;