const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

let allValue = ["§%µµ"];
let isdelete = false;
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("value", (input) => {
    allValue.map((el, index) => {
 
    });
    
    console.log(allValue);
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(8000, () => {
  console.log("listening localhost:8080");
});
