'use strict';
const asyncHandler = require("express-async-handler");
const Classroom = require("../model/Classroom");
const { User } = require("../model/User"); // Assuming User model is in model/User.js
const { ErrorHandler } = require("../utils/errorHandler");

// @desc    Create a new classroom
// @route   POST /api/v1/classrooms
// @access  Private (Teachers Only)
const createClassroom = asyncHandler(async (req, res, next) => {
    const { name, description } = req.body;
    const teacherId = req.user._id; // ID from isTeacherAuthenticated middleware

    if (!name) {
        return next(new ErrorHandler("Classroom name is required", 400));
    }

    const newClassroom = await Classroom.create({
        name,
        description,
        teacher: teacherId,
    });

    // Optional: Add classroom to teacher's teaching list (if you add that field to User model)
    // await User.findByIdAndUpdate(teacherId, { $push: { teachingClassrooms: newClassroom._id } });

    res.status(201).json({
        success: true,
        message: "Classroom created successfully",
        data: newClassroom,
    });
});

// @desc    Join a classroom using a join code
// @route   POST /api/v1/classrooms/join
// @access  Private (Students Only for now, could be generic)
const joinClassroom = asyncHandler(async (req, res, next) => {
    const { joinCode } = req.body;
    const studentId = req.user._id; // ID from isStudentAuthenticated middleware

    if (!joinCode) {
        return next(new ErrorHandler("Join code is required", 400));
    }

    const classroom = await Classroom.findOne({ joinCode });

    if (!classroom) {
        return next(new ErrorHandler("Invalid join code", 404));
    }

    // Check if user is the teacher of the class
    if (classroom.teacher.equals(studentId)) {
         return next(new ErrorHandler("Teachers cannot join their own classroom as a student", 400));
    }

    // Check if student is already enrolled
    if (classroom.students.includes(studentId)) {
        return next(new ErrorHandler("You are already enrolled in this classroom", 400));
    }

    // Add student to the classroom's student list
    classroom.students.push(studentId);
    await classroom.save();

    // Optional: Add classroom to student's enrolled list (if you add that field to User model)
    // await User.findByIdAndUpdate(studentId, { $push: { enrolledClassrooms: classroom._id } });

    res.status(200).json({
        success: true,
        message: "Successfully joined the classroom",
        data: classroom, // Send back updated classroom info
    });
});

// @desc    Get classrooms for the logged-in user (both taught and enrolled)
// @route   GET /api/v1/classrooms/myclassrooms
// @access  Private (Students and Teachers)
const getMyClassrooms = asyncHandler(async (req, res, next) => {
    const userId = req.user._id;
    const userRole = req.user.role;

    let query;
    if (userRole === 'Teacher') {
        // Find classrooms where the user is the teacher
        query = Classroom.find({ teacher: userId });
    } else if (userRole === 'Student') {
        // Find classrooms where the user is in the students array
        query = Classroom.find({ students: userId });
    } else {
        // Should not happen if isAuth middleware works correctly
        return next(new ErrorHandler("Invalid user role", 403));
    }

    const classrooms = await query.populate('teacher', 'name email').exec(); // Populate teacher name/email

    res.status(200).json({
        success: true,
        count: classrooms.length,
        data: classrooms,
    });
});


// @desc    Get details of a specific classroom
// @route   GET /api/v1/classrooms/:id
// @access  Private (User must be teacher or enrolled student)
const getClassroomDetails = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
                                     .populate('teacher', 'name email profileImage') // Populate teacher details
                                     .populate('students', 'name email profileImage'); // Populate student details

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    // Check if the requesting user is the teacher or an enrolled student
    const isTeacher = classroom.teacher._id.equals(userId);
    const isStudent = classroom.students.some(student => student._id.equals(userId));

    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to access this classroom", 403));
    }

    res.status(200).json({
        success: true,
        data: classroom,
    });
});


// @desc    Get participants of a specific classroom
// @route   GET /api/v1/classrooms/:id/participants
// @access  Private (User must be teacher or enrolled student)
const getClassroomParticipants = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const userId = req.user._id;

    const classroom = await Classroom.findById(classroomId)
                                     .select('teacher students') // Select only necessary fields
                                     .populate('teacher', 'name email role profileImage')
                                     .populate('students', 'name email role profileImage');

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    // Authorization check: Ensure user is part of the class
    const isTeacher = classroom.teacher._id.equals(userId);
    // Check if userId exists in the populated students array
    const isStudent = classroom.students.some(student => student._id.equals(userId));

    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to view participants of this classroom", 403));
    }

    // Combine teacher and students into a single participants list
    const participants = [classroom.teacher, ...classroom.students];

    res.status(200).json({
        success: true,
        count: participants.length,
        data: participants,
    });
});


module.exports = {
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getClassroomDetails,
    getClassroomParticipants,
};
