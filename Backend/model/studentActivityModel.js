// --- models/studentActivityModel.js ---
const mongoose = require('mongoose');

const quizParticipationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    marks: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const emotionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true
    }
});

const assignmentSubmissionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Submitted'],
        default: 'Pending'
    },
    submittedAt: Date,
    fileUrl: String,
    cloudinaryPublicId: String
});

const QuizParticipation = mongoose.model('QuizParticipation', quizParticipationSchema);
const Emotion = mongoose.model('Emotion', emotionSchema);
const AssignmentSubmission = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);

module.exports = { QuizParticipation, Emotion, AssignmentSubmission };