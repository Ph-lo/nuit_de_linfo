const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


rooms = {};
matches = {};
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log(`user connected ${socker.id}`);
  socket.on("select_room", (roomName) => {
    if (rooms[roomName] !== undefined && rooms[roomName].connected) {
      matches[socket.id] = rooms[roomName];
      matches[rooms[roomName].id] = socket;
      socket.emit('startGame');
      rooms[roomName].emit('startGame');
      delete rooms[roomName]; 
    } else {
      rooms[roomName] = socket;
    }
  });
  socket.on("disconnect", () => {
    console.log(`user disconnected ${socker.id}`);
  });
});

server.listen(8080, () => {
  console.log("listening localhost:8080");
});
