'use strict';
require('dotenv').config();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { User } = require("../model/User"); // Adjust path if needed
const { ErrorHandler } = require("../utils/errorHandler"); // Adjust path if needed

const isStudentAuthenticated = asyncHandler(async (req, res, next) => {
    const { userToken } = req.cookies; // Look specifically for userToken

    if (!userToken) {
        return next(new ErrorHandler("Student is not authenticated!", 401)); // Use 401 for unauthorized
    }

    try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decoded.id);

        if (!req.user) {
             return next(new ErrorHandler("User not found.", 404));
        }

        if (req.user.role !== "Student") {
            return next(
                new ErrorHandler(`Role (${req.user.role}) not authorized for this resource! Access denied.`, 403) // Use 403 for forbidden
            );
        }
        next(); // User is authenticated and is a Student
    } catch (error) {
         // Handle potential JWT errors (expired, invalid signature etc.)
         return next(new ErrorHandler("Authentication failed: Invalid token.", 401));
    }
});

module.exports = isStudentAuthenticated;