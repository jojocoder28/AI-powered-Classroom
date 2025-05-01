'use strict';
require('dotenv').config();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { User } = require("../model/User"); // Adjust path if needed
const { ErrorHandler } = require("../utils/errorHandler"); // Adjust path if needed

const isTeacherAuthenticated = asyncHandler(async (req, res, next) => {
    const { teacherToken } = req.cookies; // Look specifically for teacherToken

    if (!teacherToken) {
        return next(new ErrorHandler("Teacher is not authenticated!", 401));
    }

     try {
        const decoded = jwt.verify(teacherToken, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
             return next(new ErrorHandler("User not found.", 404));
        }

        if (req.user.role !== "Teacher") {
            return next(
                new ErrorHandler(`Role (${req.user.role}) not authorized for this resource! Access denied.`, 403)
            );
        }
        next(); // User is authenticated and is a Teacher
    } catch (error) {
         return next(new ErrorHandler("Authentication failed: Invalid token.", 401));
    }
});

module.exports = isTeacherAuthenticated;