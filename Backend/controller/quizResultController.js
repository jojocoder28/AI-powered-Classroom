const QuizResult = require("../model/QuizResult");
const User = require("../model/User"); // Assuming your User model path
const Classroom = require("../model/Classroom"); // Assuming your Classroom model path
const ErrorHandler = require("../utils/errorHandler"); // Assuming your error handler utility
const asyncHandler = require("express-async-handler"); // Assuming you use express-async-handler

// Function to save a quiz result
exports.saveQuizResult = asyncHandler(async (req, res, next) => {
  const { studentId, classroomId, assignmentPaths, score, totalQuestions, detailedResults } = req.body;

  // Basic validation
  if (!studentId || !classroomId || !assignmentPaths || score === undefined || totalQuestions === undefined || !detailedResults) {
    return next(new ErrorHandler("Missing required fields", 400));
  }

  // Calculate percentage
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const quizResult = new QuizResult({
    student: studentId,
    classroom: classroomId,
    assignments: assignmentPaths, // Store the array of assignment paths
    score: score,
    totalQuestions: totalQuestions,
    percentage: percentage,
    detailedResults: detailedResults,
  });

  await quizResult.save();

  res.status(201).json({
    success: true,
    message: "Quiz result saved successfully",
    quizResult,
  });
});

// Optional: Function to get a student's quiz results for a classroom and assignments
// This endpoint expects studentId, classroomId, and assignmentPaths in the request body
exports.getStudentQuizResults = asyncHandler(async (req, res, next) => {
  const { studentId, classroomId, assignmentPaths } = req.body;

   // Basic validation
  if (!studentId || !classroomId || !assignmentPaths) {
    return next(new ErrorHandler("Missing required fields", 400));
  }

  try {
    // Find quiz results matching student, classroom, and *all* provided assignment paths
    // Using $all ensures that the assignments array in the document contains all specified paths
    const quizResults = await QuizResult.find({
      student: studentId,
      classroom: classroomId,
      assignments: { $all: assignmentPaths }
    })
    .sort({ takenAt: -1 })
    .populate('student', 'username') // Optionally populate student username
    .populate('classroom', 'name'); // Optionally populate classroom name

    res.status(200).json({
      success: true,
      quizResults,
    });

  } catch (error) {
     console.error("Error fetching student quiz results:", error);
     next(error);
  }
});


exports.getQuizResult = asyncHandler(async (req, res, next) => {
  const { studentId, classroomId, assignmentPaths } = req.body;

  if (!studentId || !classroomId || !assignmentPaths || !Array.isArray(assignmentPaths)) {
     return next(new ErrorHandler("Please provide studentId, classroomId, and assignmentPaths (as an array) to fetch the quiz result", 400));
  }
const quizResult = await QuizResult.findOne({
  student: studentId,
  classroom: classroomId,
  assignmentPaths: { $all: assignmentPaths, $size: assignmentPaths.length },
})
.sort({ createdAt: -1 }) // Get the latest result
.limit(1);

if (!quizResult) {
  // No result found is not an error, just means no previous result exists
  return res.status(200).json({
    success: true,
    quizResult: null,
    message: "No previous quiz result found for these documents."
  });
}

res.status(200).json({
  success: true,
  quizResult,
});
});
