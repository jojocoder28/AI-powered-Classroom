// --- controllers/studentActivityController.js ---
const asyncHandler = require("express-async-handler");
const { QuizParticipation, Emotion, AssignmentSubmission } = require("../models/studentActivityModel");
const cloudinary = require('../cloudinary');
const streamifier = require('streamifier');
const { ErrorHandler } = require("../utils/errorHandler");

// Quiz Participation
const submitQuiz = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const { marks } = req.body;

    if (req.user.role !== 'Student') {
        return next(new ErrorHandler("Only students can submit quiz", 403));
    }

    const record = await QuizParticipation.create({ student: studentId, marks });
    res.cookie('quizParticipation', record._id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Quiz submitted", record });
});

const getQuizResults = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const records = await QuizParticipation.find({ student: studentId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: records.length, results: records });
});

// Emotion Capture
const saveEmotion = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const { emotion, timestamp } = req.body;

    if (req.user.role !== 'Student') {
        return next(new ErrorHandler("Only students can capture emotions", 403));
    }

    const record = await Emotion.create({ student: studentId, emotion, timestamp });
    res.cookie('emotionCapture', record._id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Emotion saved", record });
});

const getEmotions = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const records = await Emotion.find({ student: studentId }).sort({ timestamp: -1 });
    res.status(200).json({ success: true, count: records.length, emotions: records });
});

// Assignment Submission
const submitAssignment = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const classroomId = req.params.classroomId;

    if (req.user.role !== 'Student') {
        return next(new ErrorHandler("Only students can submit assignments", 403));
    }

    if (!req.file) {
        return next(new ErrorHandler("No file uploaded", 400));
    }

    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `student_assignments/${classroomId}`,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) return reject(new ErrorHandler("Upload failed", 500));
                    resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });
    } catch (error) {
        return next(error);
    }

    const record = await AssignmentSubmission.create({
        student: studentId,
        classroom: classroomId,
        status: 'Submitted',
        submittedAt: new Date(),
        fileUrl: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id
    });

    res.cookie('assignmentSubmission', record._id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ success: true, message: "Assignment submitted", record });
});

const getAssignments = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;
    const records = await AssignmentSubmission.find({ student: studentId }).populate('classroom', 'name').sort({ submittedAt: -1 });
    res.status(200).json({ success: true, count: records.length, submissions: records });
});

module.exports = {
    submitQuiz,
    getQuizResults,
    saveEmotion,
    getEmotions,
    submitAssignment,
    getAssignments
};
