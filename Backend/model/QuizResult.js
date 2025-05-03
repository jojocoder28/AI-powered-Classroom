const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const QuizResultSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Assuming your User model is named 'User'
    required: true,
    index: true // Index by student for quick retrieval of a student's results
  },
  classroom: {
    type: Schema.Types.ObjectId,
    ref: 'Classroom', // Assuming you have a Classroom model
    required: true,
    index: true // Index by classroom to find results for a specific class
  },
  // Storing storagePaths as strings based on the frontend code
  assignments: [
    {
       type: String,
       required: true
    }
  ],
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: { // Store percentage for easier sorting/comparison
    type: Number,
    required: true
  },
  detailedResults: [ // Optional: Store details about each question
    {
      question: { type: String, required: true },
      selectedAnswer: { type: String }, // Store the option selected by the student
      correctAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true }
    }
  ],
  takenAt: {
    type: Date,
    default: Date.now,
    index: true // Index by time for chronological queries
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Add compound index for querying results for a specific student in a classroom based on assignments
QuizResultSchema.index({ student: 1, classroom: 1, assignments: 1, takenAt: -1 });


const QuizResult = mongoose.model("QuizResult", QuizResultSchema);

module.exports = QuizResult;