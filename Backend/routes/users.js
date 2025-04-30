const express = require("express");
const multer = require("multer");
const userCtrl = require("../controller/user");
const isAuthenticated = require("../middlewares/isAuth");

// Configure Multer for memory storage (to get buffer for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

// Register User with Image Upload
// The 'profileImage' field name must match the name attribute in your form input
router.post('/register', upload.single('profileImage'), userCtrl.register);

// Login User
router.post('/login', userCtrl.login);

// Get Profile (Protected)
router.get('/profile', isAuthenticated, userCtrl.profile);

// Update Profile (Protected)
// If you want image update here too, add: upload.single('profileImage')
router.put('/profile', isAuthenticated, upload.single('profileImage'), userCtrl.updateProfile);

// Logout User
router.post('/logout', userCtrl.logout);

// Get User Details (Protected - likely the same as profile, but added as requested)
router.get('/details', isAuthenticated, userCtrl.getUserDetails);

// Get User by Email (Protected - expects email as query parameter ?email=...)
router.get('/byEmail', isAuthenticated, userCtrl.getUserbyEmail);

module.exports = router;
