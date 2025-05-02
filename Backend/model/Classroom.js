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
  // We will add assignments later
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Optional: Add an index on joinCode for faster lookups
//classroomSchema.index({ joinCode: 1 });

// Optional: Add an index on teacher for faster lookups of classrooms taught by a user
classroomSchema.index({ teacher: 1 });

// Optional: Add an index on students for faster lookups of classrooms a student is in
classroomSchema.index({ students: 1 });

const Classroom = mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;