const asyncHandler = require("express-async-handler");
const { Server } = require("socket.io");
const ConferenceRoom = require("../model/ConferenceRoom.js");
const { User } = require("../model/User.js"); // Import base User model
const cloudinary = require("../cloudinary.js"); // Import Cloudinary config
const streamifier = require("streamifier"); // To convert buffer to stream for Cloudinary

// --- Helper function to check if user is a participant ---
const isParticipant = (room, userId) => {
  return room.participants.some(participantId => participantId.toString() === userId.toString());
};

// --- Helper function for Cloudinary upload ---
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        return reject(new Error("Failed to upload file to Cloudinary."));
      }
      resolve(result);
    });
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// --- Controller Functions for REST API ---
const conferenceCtrl = {
  //! Create a Video Conference Room
  createRoom: asyncHandler(async (req, res) => {
    const { title } = req.body;
    const hostId = req.user;

    if (!title || !hostId) {
      res.status(400);
      throw new Error("Title and host ID are required");
    }
    const hostUser = await User.findById(hostId);
    if (!hostUser) {
      res.status(404);
      throw new Error("Host user not found");
    }
    const room = await ConferenceRoom.create({
      title,
      host: hostId,
      participants: [hostId],
      status: 'Waiting',
    });
    console.log(`Room created: ${room.title} by ${hostUser.username}`);
    res.status(201).json({ message: "Room created successfully", room });
  }),

  //! Get all active/waiting rooms
  getRooms: asyncHandler(async (req, res) => {
    const rooms = await ConferenceRoom.find({ status: { $ne: 'Ended' } })
                                      .populate('host', 'username email role')
                                      .select('title host participants status createdAt');
    res.status(200).json(rooms);
  }),

  //! Get details of a specific room
  getRoomById: asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const room = await ConferenceRoom.findById(roomId)
                                     .populate('host', 'username email role')
                                     .populate('participants', 'username email role');
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }
    res.status(200).json(room);
  }),

  //! Join a room
  joinRoom: asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user;
    const room = await ConferenceRoom.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }
    if (room.status === 'Ended') {
      res.status(400);
      throw new Error("Cannot join an ended room");
    }
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (!isParticipant(room, userId)) {
      await ConferenceRoom.updateOne({ _id: roomId }, { $addToSet: { participants: userId } });
      console.log(`User ${user.username} joined room ${room.title}`);
    }
    const updatedRoom = await ConferenceRoom.findById(roomId).populate('participants', 'username');
    res.status(200).json({ message: "Joined room successfully", room: updatedRoom });
  }),

  //! Get Chat Messages
  getChatMessages: asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const userId = req.user;
      const room = await ConferenceRoom.findById(roomId).select('participants chatMessages');
      if (!room) {
          res.status(404);
          throw new Error("Room not found");
      }
      if (!isParticipant(room, userId)) {
          res.status(403);
          throw new Error("Not authorized to view chat messages for this room");
      }
      res.status(200).json(room.chatMessages);
  }),

  //! Send Chat Message via REST
  sendChatMessageREST: asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user;
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error("Message is required");
    }
    const room = await ConferenceRoom.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }
    if (!isParticipant(room, userId)) {
      res.status(403);
      throw new Error("Not authorized to send messages in this room");
    }
    const user = await User.findById(userId).select('username');
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    const newMessage = {
      user: userId,
      username: user.username,
      message: message,
      timestamp: new Date()
    };
    room.chatMessages.push(newMessage);
    await room.save();
    res.status(201).json({ message: "Message sent", chat: newMessage });
  }),

  //! Handle File Submission (Upload to Cloudinary)
  handleSubmission: asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user;
    const { description } = req.body;
    const file = req.file; // File object from multer (in memory)

    if (!file) {
      res.status(400);
      throw new Error("No file submitted");
    }

    const room = await ConferenceRoom.findById(roomId);
    if (!room) {
      res.status(404);
      throw new Error("Room not found");
    }

    // Authorization: Check if user is a participant
    if (!isParticipant(room, userId)) {
      res.status(403);
      throw new Error("Not authorized to submit files to this room");
    }

    // Find the submitting user
    const user = await User.findById(userId).select('username');
    if (!user) {
      res.status(404);
      throw new Error("Submitting user not found");
    }

    try {
      // Upload file buffer to Cloudinary
      const uploadResult = await uploadToCloudinary(file.buffer, {
        resource_type: "auto", // Automatically detect resource type (image, video, raw)
        folder: `conference_submissions/${roomId}`, // Organize uploads by room ID
        // Use original filename but make it unique to avoid overwrites if needed
        public_id: `${Date.now()}_${file.originalname.replace(/\.[^/.]+$/, "")}`
      });

      const newSubmission = {
          user: userId,
          username: user.username,
          originalFileName: file.originalname,
          storagePath: uploadResult.secure_url, // URL from Cloudinary
          cloudinaryPublicId: uploadResult.public_id, // Public ID from Cloudinary
          fileType: uploadResult.resource_type === 'raw' ? file.mimetype : uploadResult.resource_type, // Store 'raw' or specific type like 'image', 'video'. Use mimetype for raw.
          description: description || '',
      };

      // Add the submission metadata to the room document
      room.submissions.push(newSubmission);
      await room.save();

      console.log(`File submitted by ${user.username} to room ${room.title}: ${file.originalname} (Cloudinary)`);
      res.status(201).json({ message: "File submitted successfully", submission: newSubmission });

    } catch (uploadError) {
      console.error("File upload process failed:", uploadError);
      res.status(500);
      throw new Error("File upload failed. Please try again."); // Throw error to be caught by error handler
    }
  }),

  //! Get Submissions for a Room
  getSubmissions: asyncHandler(async (req, res) => {
      const { roomId } = req.params;
      const userId = req.user;
      const room = await ConferenceRoom.findById(roomId).select('participants submissions');
      if (!room) {
          res.status(404);
          throw new Error("Room not found");
      }
      if (!isParticipant(room, userId)) {
          res.status(403);
          throw new Error("Not authorized to view submissions for this room");
      }
      res.status(200).json(room.submissions);
  }),

   //! Record an Emotion Event via REST
   recordEmotionEventREST: asyncHandler(async (req, res) => {
        const { roomId } = req.params;
        const userId = req.user;
        const { emotion, confidence } = req.body;
        if (!emotion) {
            res.status(400);
            throw new Error("Emotion data is required");
        }
        const room = await ConferenceRoom.findById(roomId);
        if (!room) {
            res.status(404);
            throw new Error("Room not found");
        }
        if (!isParticipant(room, userId)) {
            res.status(403);
            throw new Error("User is not a participant in this room");
        }
        const user = await User.findById(userId).select('username');
        if (!user) {
            res.status(404);
            throw new Error("User not found");
        }
        const newEmotionEvent = {
            user: userId,
            username: user.username,
            emotion: emotion,
            confidence: confidence,
        };
        room.emotionData.push(newEmotionEvent);
        await room.save();
        console.log(`Emotion event recorded for ${user.username} in room ${room.title}: ${emotion}`);
        res.status(201).json({ message: "Emotion event recorded", event: newEmotionEvent });
   }),

   //! Get Emotion Data for a Room
   getEmotionData: asyncHandler(async (req, res) => {
        const { roomId } = req.params;
        const userId = req.user;
        const filterByUserId = req.query.userId;
        const room = await ConferenceRoom.findById(roomId).select('participants emotionData');
        if (!room) {
            res.status(404);
            throw new Error("Room not found");
        }
        if (!isParticipant(room, userId)) {
            res.status(403);
            throw new Error("Not authorized to view emotion data for this room");
        }
        let responseData = room.emotionData;
        if (filterByUserId) {
            responseData = room.emotionData.filter(event => event.user.toString() === filterByUserId);
        }
        res.status(200).json(responseData);
   }),

   //! Update Room Status
   updateRoomStatus: asyncHandler(async (req, res) => {
        const { roomId } = req.params;
        const userId = req.user;
        const { status } = req.body;
        if (!status || !['Active', 'Ended'].includes(status)) {
            res.status(400);
            throw new Error("Invalid status provided. Must be 'Active' or 'Ended'.");
        }
        const room = await ConferenceRoom.findById(roomId);
        if (!room) {
            res.status(404);
            throw new Error("Room not found");
        }
        if (room.host.toString() !== userId) {
             res.status(403);
             throw new Error("Only the host can change the room status.");
        }
        room.status = status;
        await room.save();
        console.log(`Room ${room.title} status changed to ${status} by host`);
        res.status(200).json({ message: `Room status updated to ${status}`, room });
   })

};

// --- Socket.IO Integration (Remains the same) ---
const initializeSocket = (server) => {
  const io = new Server(server, {
      cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Room Event
    socket.on("join-room", async ({ roomId, userId }) => {
        console.log(`Socket ${socket.id} attempting to join room ${roomId} as user ${userId}`);
        try {
            const room = await ConferenceRoom.findById(roomId);
            const user = await User.findById(userId).select('username');
            if (!room || !user) {
                console.error(`Join attempt failed: Room ${roomId} or User ${userId} not found.`);
                socket.emit('join-error', { message: 'Room or User not found' });
                return;
            }
            if (!isParticipant(room, userId)) {
                 console.warn(`User ${userId} (${user.username}) is not listed as a participant in room ${roomId}. Allowing join for signaling.`);
                 // Potentially deny join here if strict participation is required before socket connection
            }
            socket.join(roomId);
            socket.data.userId = userId;
            socket.data.username = user.username;
            socket.data.roomId = roomId;
            console.log(`User ${userId} (${user.username}) socket ${socket.id} joined room ${roomId}`);
            socket.to(roomId).emit("user-connected", { userId, username: user.username, socketId: socket.id });
            socket.emit("joined-room-success", { roomId });
        } catch (error) {
            console.error(`Error during socket join-room for room ${roomId}:`, error);
            socket.emit('join-error', { message: 'Server error joining room' });
        }
    });

    // Send Chat Message Event
    socket.on("send-message", async ({ roomId, message }) => {
        const userId = socket.data.userId;
        const username = socket.data.username;
        if (!userId || !roomId || !message) {
            socket.emit('message-error', { message: 'Missing data to send message' });
            return;
        }
        try {
            const room = await ConferenceRoom.findById(roomId);
            if (!room || !isParticipant(room, userId)) {
                 socket.emit('message-error', { message: 'Room not found or not authorized' });
                 return;
            }
            const newMessage = {
                user: userId,
                username: username,
                message: message,
                timestamp: new Date()
            };
            await ConferenceRoom.updateOne({ _id: roomId }, { $push: { chatMessages: newMessage } });
            io.to(roomId).emit("new-message", newMessage);
            console.log(`Message from ${username} in room ${roomId}: ${message}`);
        } catch (error) {
             console.error(`Error sending message in room ${roomId}:`, error);
             socket.emit('message-error', { message: 'Server error sending message' });
        }
    });

    // Record Emotion Event via Socket
    socket.on("record-emotion", async ({ roomId, emotion, confidence }) => {
        const userId = socket.data.userId;
        const username = socket.data.username;
        if (!userId || !roomId || !emotion) {
            return;
        }
         try {
            const room = await ConferenceRoom.findById(roomId);
            if (!room || !isParticipant(room, userId)) {
                 console.error(`User ${userId} not participant or room ${roomId} not found for emotion recording.`);
                 return;
            }
            const newEmotionEvent = {
                user: userId,
                username: username,
                emotion: emotion,
                confidence: confidence,
                timestamp: new Date()
            };
            await ConferenceRoom.updateOne({ _id: roomId }, { $push: { emotionData: newEmotionEvent } });
            io.to(roomId).emit("new-emotion-event", newEmotionEvent);
            console.log(`Emotion recorded via socket for ${username} in ${roomId}: ${emotion}`);
        } catch (error) {
             console.error(`Error recording emotion in room ${roomId}:`, error);
        }
    });

    // Handle Signaling for WebRTC
    socket.on('signal', ({ toSocketId, signal }) => {
        io.to(toSocketId).emit('signal', { fromSocketId: socket.id, signal });
    });

    // Disconnect Event
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      if (roomId && userId) {
        socket.to(roomId).emit("user-disconnected", { userId, socketId: socket.id });
      }
    });
  });

  console.log("Socket.IO initialized successfully.");
  return io;
};


module.exports = { conferenceCtrl, initializeSocket };
