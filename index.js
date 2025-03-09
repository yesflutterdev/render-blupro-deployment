const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const authRouter = require('./routes/auth');
const feedRouter = require('./routes/feed');
const activityRouter = require('./routes/activity');
const connectRouter = require('./routes/connect');
const chatRouter = require('./routes/chat');
const updateUserRouter = require('./routes/updateUser');
const streamRouter = require('./routes/stream');
const learnRouter = require('./routes/learn');
const userPoints = require('./routes/userPoints');
const bcrypt = require("bcrypt");
const swaggerUi = require('swagger-ui-express');
const Stream = require('./models/stream');
const Ably = require('ably');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const ably = new Ably.Realtime('z_UCjw.UPLdCg:ErMqJR0MTJyz5fDlDv_ANwEKihmy3p-xeS3wIr0ssec');

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(userPoints);
app.use(authRouter);
app.use(chatRouter);
app.use(feedRouter);
app.use(activityRouter);
app.use(connectRouter);
app.use(updateUserRouter);
app.use(learnRouter);
app.use(streamRouter);

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

const DB = "mongodb+srv://noone:Noone410.@cluster0.ygc0q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose.set('strictQuery', false);

mongoose.connect(DB).then(() => {
  console.log("Connection Successful to DB");
}).catch((e) => {
  console.log(e);
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send-message", async ({ roomId, sender, text, mediaUrl }) => {
    try {
      const Message = require("./models/Message");
      const Room = require("./models/Room");

      const newMessage = new Message({ roomId, sender, text, mediaUrl });
      await newMessage.save();
      console.log("------" + newMessage);

      await Room.findByIdAndUpdate(roomId, {
        lastMessage: text,
        lastMessageTime: newMessage.createdAt,
      });

      io.to(roomId).emit("receive-message", newMessage);

      // Publish message to Ably
      const channel = ably.channels.get(roomId);
      channel.publish("receive-message", newMessage);
    } catch (error) {
      console.error("Error handling send-message event:", error.message);
    }
  });

  socket.on("send-comment", async ({ streamId, userId, text, userName }, callback) => { 
    try {
      const stream = await Stream.findById(streamId);
      if (!stream) {
        if (callback) callback({ status: "error", message: "Stream not found" });
        return;
      }

      const newComment = { userId, text, userName, createdAt: new Date() };
      stream.comments.push(newComment);
      await stream.save();

      io.to(streamId).emit("receive-comment", newComment);

      // Publish comment to Ably
      const channel = ably.channels.get(streamId);
      channel.publish("receive-comment", newComment);

      if (callback) callback({ status: "ok" });
    } catch (error) {
      console.error("Error handling send-comment event:", error.message);
      if (callback) callback({ status: "error", message: "Server error" });
    }
  });

  socket.on("join-room-stream-comments", async (streamId) => {
    try {
      console.log("inside join-room-stream-comments");
      const stream = await Stream.findById(streamId);
      if (stream) {
        console.log("yes stream exist");
        socket.emit("existing-comments", stream.comments);
      }
      socket.join(streamId); 
    } catch (error) {
      console.error("Error handling join-room event:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// Change app.listen to httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
