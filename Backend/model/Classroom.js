'use strict';
const mongoose = require('mongoose');

// Helper function to generate a random alphanumeric code
const generateCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Schema for individual assignments
const assignmentSchema = new mongoose.Schema({
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  originalFileName: {
    type: String,
    required: true,
    trim: true,
  },
  storagePath: { // Store the Cloudinary URL
    type: String,
    required: true,
  },
  cloudinaryPublicId: { // Store Cloudinary public ID for potential deletion
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt for assignments
});

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required.'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Make sure 'User' matches your User model name
    required: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Make sure 'User' matches your User model name
    },
  ],
  joinCode: {
    type: String,
    required: true,
    unique: true,
    default: () => generateCode(8), // Auto-generate an 8-character code
  },
  assignments: [assignmentSchema], // Array of assignment sub-documents
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically for the classroom
});

// Optional: Add an index on joinCode for faster lookups
//classroomSchema.index({ joinCode: 1 });

// Optional: Add an index on teacher for faster lookups of classrooms taught by a user
classroomSchema.index({ teacher: 1 });

// Optional: Add an index on students for faster lookups of classrooms a student is in
classroomSchema.index({ students: 1 });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;