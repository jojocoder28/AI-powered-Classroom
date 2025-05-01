'use strict';
const asyncHandler = require("express-async-handler");
const Classroom = require("../model/Classroom");
const { User } = require("../model/User");
const { ErrorHandler } = require("../utils/errorHandler");
const cloudinary = require('../cloudinary'); // Import configured Cloudinary instance
const streamifier = require('streamifier'); // To upload buffer to Cloudinary

// --- Classroom Management Controllers ---

// @desc    Create a new classroom
// @route   POST /api/v1/classroom
// @access  Private (Teachers Only via router middleware)
const createClassroom = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const teacherId = req.user._id;

    if (!name) {
        return next(new ErrorHandler("Classroom name is required", 400));
    }

    const newClassroom = await Classroom.create({
        name,
        description,
        teacher: teacherId,
    });

    res.status(201).json({
        success: true,
        message: "Classroom created successfully",
        classroom: newClassroom,
    });
});

// @desc    Join a classroom using a join code
// @route   POST /api/v1/classroom/join
// @access  Private (Students Only via router middleware)
const joinClassroom = asyncHandler(async (req, res, next) => {
    const { joinCode } = req.body;
    const studentId = req.user._id;

    if (!joinCode) {
        return next(new ErrorHandler("Join code is required", 400));
    }

    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
        return next(new ErrorHandler("Invalid join code", 404));
    }

    if (classroom.teacher.equals(studentId)) {
        return next(new ErrorHandler("Teachers cannot join their own classroom as a student", 400));
    }

    if (classroom.students.includes(studentId)) {
        res.cookie('classroomSession', classroom._id.toString(), {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ success: true, message: "Already enrolled in this classroom", classroom });
    }

    classroom.students.push(studentId);
    await classroom.save();

    res.cookie('classroomSession', classroom._id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        success: true,
        message: "Successfully joined the classroom",
        classroom,
    });
});

// @desc    Get classrooms for the logged-in user (taught OR enrolled)
// @route   GET /api/v1/classroom/my-classrooms
// @access  Private (Authenticated Users via router middleware)
const getMyClassrooms = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;

    const classrooms = await Classroom.find({
        $or: [{ teacher: userId }, { students: userId }]
    })
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: classrooms.length,
        classrooms,
    });
});

// @desc    Get ALL available classrooms (Placeholder)
// @route   GET /api/v1/classroom/available
// @access  Private (Students Only via router middleware)
const getAvailableClassrooms = asyncHandler(async (req, res, next) => {
    const studentId = req.user._id;

    const classrooms = await Classroom.find({
        teacher: { $ne: studentId },
        students: { $nin: [studentId] }
    })
    .populate('teacher', 'firstName lastName')
    .select('name description teacher joinCode')
    .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: classrooms.length,
        classrooms,
    });
});

// @desc    Get details of a specific classroom
// @route   GET /api/v1/classroom/:id
// @access  Private (Authenticated Users, authorization check below)
const getClassroomDetails = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
                                     .populate('teacher', 'firstName lastName email role')
                                     .populate('students', 'firstName lastName email role')
                                     .populate('assignments.uploader', 'firstName lastName');

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    const isTeacher = classroom.teacher._id.equals(userId);
    const isStudent = classroom.students.some(student => student._id.equals(userId));

    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to access this classroom", 403));
    }

    res.status(200).json({
        success: true,
        classroom,
    });
});

// @desc    Get participants of a specific classroom
// @route   GET /api/v1/classroom/:id/participants
// @access  Private (Authenticated Users, authorization check below)
const getClassroomParticipants = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
                                     .select('teacher students')
                                     .populate('teacher', 'firstName lastName email role')
                                     .populate('students', 'firstName lastName email role');

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    const isTeacher = classroom.teacher._id.equals(userId);
    const isStudent = classroom.students && classroom.students.some(student => student._id.equals(userId));

    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to view participants of this classroom", 403));
    }

    const participants = [classroom.teacher, ...(classroom.students || [])].filter(p => p);

    res.status(200).json({
        success: true,
        count: participants.length,
        participants,
    });
});

// --- Assignments Controllers ---

// @desc    Get assignments for a specific classroom
// @route   GET /api/v1/classroom/:id/assignments
// @access  Private (Authenticated Users, authorization check below)
const getAssignments = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
                                     .select('_id teacher students assignments')
                                     .populate('assignments.uploader', 'firstName lastName');

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    const isTeacher = classroom.teacher.equals(userId);
    const isStudent = classroom.students.includes(userId);
    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to view assignments for this classroom", 403));
    }

    res.status(200).json({
        success: true,
        assignments: classroom.assignments || [],
    });
});

// @desc    Upload an assignment file to Cloudinary and save metadata
// @route   POST /api/v1/classroom/:id/assignments
// @access  Private (Teachers Only via router middleware)
const uploadAssignment = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const teacherId = req.user._id;
    const title = req.body.title;
    const description = req.body.description;

    const classroom = await Classroom.findById(classroomId).select('_id teacher students');
    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }
    if (!classroom.teacher.equals(teacherId)) {
        return next(new ErrorHandler("You are not authorized to upload assignments to this classroom", 403));
    }

    if (!req.file) {
        return next(new ErrorHandler("No file uploaded. Please select a file.", 400));
    }

    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `classroom_assignments/${classroomId}`,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return reject(new ErrorHandler("Error uploading file to cloud storage.", 500));
                    }
                    resolve(result);
                }
            );
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });
    } catch (error) {
        return next(error);
    }

    const newAssignment = {
        uploader: teacherId,
        title: title || req.file.originalname,
        description: description || null,
        originalFileName: req.file.originalname,
        storagePath: uploadResult.secure_url,
        cloudinaryPublicId: uploadResult.public_id,
        fileType: uploadResult.format || req.file.mimetype,
    };

    try {
        classroom.assignments.push(newAssignment);
        await classroom.save();
        const savedAssignment = classroom.assignments[classroom.assignments.length - 1];

        res.status(201).json({
            success: true,
            message: "Assignment uploaded successfully!",
            assignment: savedAssignment,
        });

    } catch(dbError) {
        console.error("Error saving assignment to DB:", dbError);
        try {
            await cloudinary.uploader.destroy(uploadResult.public_id);
        } catch (deleteError) {
            console.error("Failed to delete Cloudinary file after DB error:", deleteError);
        }
        return next(new ErrorHandler("Failed to save assignment details after upload.", 500));
    }
});

module.exports = {
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getAvailableClassrooms,
    getClassroomDetails,
    getClassroomParticipants,
    getAssignments,
    uploadAssignment,
};
