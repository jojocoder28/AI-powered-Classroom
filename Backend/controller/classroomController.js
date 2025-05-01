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
        return res.status(200).json({ success: true, message: "Already enrolled in this classroom", classroom });
    }

    classroom.students.push(studentId);
    await classroom.save();

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
    res.status(200).json({
        success: true,
        message: "Browsing all classrooms not implemented.",
        count: 0,
        classrooms: [],
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
                                     .populate('students', 'firstName lastName email role');

    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    // Authorization: User must be the teacher or an enrolled student
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

    // Authorization: User must be the teacher or an enrolled student
    const isTeacher = classroom.teacher._id.equals(userId);
    const isStudent = classroom.students.some(student => student._id.equals(userId));

    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to view participants of this classroom", 403));
    }

    const participants = [classroom.teacher, ...classroom.students].filter(p => p);

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

    // 1. Find the classroom to verify existence and user membership
    const classroom = await Classroom.findById(classroomId).select('_id teacher students');
    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }

    // 2. Authorization: User must be the teacher or an enrolled student
    const isTeacher = classroom.teacher.equals(userId);
    const isStudent = classroom.students.includes(userId);
    if (!isTeacher && !isStudent) {
        return next(new ErrorHandler("You are not authorized to view assignments for this classroom", 403));
    }

    // 3. TODO: Fetch actual assignments from the database
    //    - You'll need an Assignment model (Schema)
    //    - The Assignment model should have a reference to the Classroom (e.g., classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' })
    //    - Example query: const assignments = await Assignment.find({ classroom: classroomId }).populate('uploadedBy', 'firstName lastName');

    console.log(`Placeholder: Fetching assignments for classroom ${classroomId} by user ${userId}`);

    // --- Placeholder Data (Replace with actual DB query results) ---
    const mockAssignments = [
        { _id: 'assign1', classroom: classroomId, title: 'Project Proposal', fileName: 'proposal_template.pdf', fileUrl: '#', uploadedBy: 'teacher_id_placeholder', createdAt: new Date(Date.now() - 86400000) },
        { _id: 'assign2', classroom: classroomId, title: 'Milestone 1', fileName: 'milestone1_report.docx', fileUrl: '#', uploadedBy: 'teacher_id_placeholder', createdAt: new Date() },
    ];
    // --- End Placeholder ---

    res.status(200).json({
        success: true,
        // message: "Assignments fetched successfully", // Optional message
        assignments: mockAssignments, // Use actual query results here
    });
});

// @desc    Upload an assignment file to Cloudinary and save metadata
// @route   POST /api/v1/classroom/:id/assignments
// @access  Private (Teachers Only via router middleware)
const uploadAssignment = asyncHandler(async (req, res, next) => {
    const classroomId = req.params.id;
    const teacherId = req.user._id; // User ID from isTeacherAuthenticated
    const title = req.body.title; // Optional title from form data

    // 1. Verify Classroom and Teacher Authorization
    const classroom = await Classroom.findById(classroomId).select('_id teacher');
    if (!classroom) {
        return next(new ErrorHandler(`Classroom not found with id ${classroomId}`, 404));
    }
    // Ensure the user making the request is the teacher of *this* classroom
    if (!classroom.teacher.equals(teacherId)) {
        return next(new ErrorHandler("You are not authorized to upload assignments to this classroom", 403));
    }

    // 2. Check if file exists in request (uploaded by multer to memory)
    if (!req.file) {
        return next(new ErrorHandler("No file uploaded. Please select a file.", 400));
    }

    // 3. Upload file buffer to Cloudinary
    let uploadResult;
    try {
        uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `classroom_assignments/${classroomId}`, // Organize uploads by classroom
                    resource_type: "auto" // Automatically detect resource type (image, pdf, docx etc.)
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
                        return reject(new ErrorHandler("Error uploading file to cloud storage.", 500));
                    }
                    resolve(result);
                }
            );
            // Pipe the buffer from multer (req.file.buffer) into the Cloudinary stream
            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        });

        console.log('Cloudinary Upload Result:', uploadResult);

    } catch (error) {
        return next(error); // Pass error to global error handler
    }

    // 4. TODO: Save assignment metadata to your database
    //    - Create an Assignment model (Schema) if you haven't already.
    //    - It should include fields like: classroom (ref), uploadedBy (ref), title, fileName, fileUrl (from uploadResult.secure_url), publicId (from uploadResult.public_id), fileType (from uploadResult.resource_type), fileSize (from uploadResult.bytes), etc.
    //    - Example: const newAssignment = await Assignment.create({ classroom: classroomId, uploadedBy: teacherId, title: title || req.file.originalname, fileName: req.file.originalname, fileUrl: uploadResult.secure_url, publicId: uploadResult.public_id, ... });

    // --- Placeholder Response (Replace with actual saved assignment data) ---
    const savedAssignmentPlaceholder = {
        _id: `db_${Date.now()}`, // Replace with actual DB ID
        classroom: classroomId,
        uploadedBy: teacherId,
        title: title || req.file.originalname,
        fileName: req.file.originalname,
        fileUrl: uploadResult.secure_url, // The crucial URL from Cloudinary
        publicId: uploadResult.public_id, // Needed if you want to delete from Cloudinary later
        fileType: uploadResult.resource_type,
        fileSize: uploadResult.bytes,
        createdAt: new Date(),
    };
    // --- End Placeholder ---

    res.status(201).json({
        success: true,
        message: "Assignment uploaded successfully!",
        assignment: savedAssignmentPlaceholder, // Return the saved assignment details
    });
});


module.exports = {
    // Classroom Management
    createClassroom,
    joinClassroom,
    getMyClassrooms,
    getAvailableClassrooms,
    getClassroomDetails,
    getClassroomParticipants,
    // Assignments
    getAssignments,
    uploadAssignment,
    // TODO: Export controllers for deleteAssignment, submitAssignment etc.
};
