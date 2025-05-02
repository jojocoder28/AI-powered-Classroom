require('dotenv').config();
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const {User} = require("../model/User");
const {ErrorHandler} = require("../utils/errorHandler");  

const isAuthenticated = asyncHandler(
  async (req, res, next) => {
    // console.log(req.cookies)
    const token = req.cookies.userToken;
    if (!token) {
      return next(new ErrorHandler("User is not authenticated!", 400));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Student" && req.user.role !== "Teacher") {
      return next(
        new ErrorHandler(`${req.user.role} not authorized for this resource!`, 403)
      );
    }
    next();
  }
);

module.exports = isAuthenticated;
