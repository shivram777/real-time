const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const ConnectBD = require("./Config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./Middleware/errorMiddleware");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();
const PORT = process.env.PORT || 8000;
ConnectBD();

//Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

//-----------------------------deployment-------------------------------
// const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "/FrontEnd/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname1, "FrontEnd", "build", "index.html"));
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API Running");
//   });
// }
//-----------------------------deployment-------------------------------

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "https://scintillating-tartufo-f5c356.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return;

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    socket.leave(userData._id);
  });
});
