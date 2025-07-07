const http = require("http");
const express = require("express");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 9000;


app.use(express.static(path.resolve("./public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("message", {
      user: "System",
      text: `🔔 ${username} has joined the chat`
    });
  });

  socket.on("user-message", (data) => {
    io.emit("message", data);
  });

  socket.on("typing", (user) => {
    socket.broadcast.emit("typing", user);
  });

  socket.on("stop-typing", () => {
    socket.broadcast.emit("stop-typing");
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("message", {
        user: "System",
        text: `❌ ${socket.username} left the chat`
      });
    }
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
