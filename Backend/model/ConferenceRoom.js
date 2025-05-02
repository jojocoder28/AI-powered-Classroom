const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// --- Sub-Schema for Chat Messages ---
const ChatMessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// --- Sub-Schema for File Submissions ---
const SubmissionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
      type: String,
      required: true
  },
  originalFileName: { // The name of the file uploaded by the user
    type: String,
    required: true
  },
  storagePath: { // Cloudinary secure URL for the file
    type: String,
    required: true
  },
  cloudinaryPublicId: { // Cloudinary public ID for management (e.g., deletion)
    type: String,
    required: true
  },
  fileType: { // Store the detected file type (e.g., pdf, docx, png)
    type: String,
    required: true
  },
  description: { // Optional description for the submission
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

// --- Sub-Schema for Emotion Events ---
const EmotionEventSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    emotion: {
        type: String,
        required: true
    },
    confidence: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });


// --- Main Conference Room Schema ---
const ConferenceRoomSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // --- Conference Image (Optional - if you want a separate image FOR the room itself) ---
    // imageUrl: {
    //     type: String,
    //     default: null
    // },
    // imagePublicId: {
    //     type: String,
    //     default: null
    // },
    // --- Embedded Data ---
    chatMessages: [ChatMessageSchema],
    submissions: [SubmissionSchema], // Using updated SubmissionSchema
    emotionData: [EmotionEventSchema],
    status: {
      type: String,
      enum: ['Waiting', 'Active', 'Ended'],
      default: 'Waiting'
    }
  },
  { timestamps: true }
);

// Indexing
ConferenceRoomSchema.index({ host: 1 });
ConferenceRoomSchema.index({ 'participants': 1 });
ConferenceRoomSchema.index({ 'chatMessages.timestamp': -1 });
ConferenceRoomSchema.index({ 'submissions.submittedAt': -1 });
ConferenceRoomSchema.index({ 'emotionData.timestamp': -1 });
ConferenceRoomSchema.index({ 'emotionData.user': 1 });


const ConferenceRoom = mongoose.model("ConferenceRoom", ConferenceRoomSchema);
module.exports = ConferenceRoom;
