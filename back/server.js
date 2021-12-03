const loremIpsum = require("lorem-ipsum").loremIpsum;
const { v4: uuidv4 } = require('uuid');
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

rooms = {};
matches = {};

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function generateArticle(keyword) {
  let title = loremIpsum({
    count: 6,
    units: "word",
  }).toLowerCase();
  const body = loremIpsum({
    count: 4,
    units: "sentence",
  }).toLowerCase();
  const title_words = title.split(" ");
  title_words.push(keyword);
  const body_words = body.split(" ");
  const randNbr = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < randNbr; i++)
    body_words.push(keyword);
  shuffleArray(title_words);
  shuffleArray(body_words);
  return {
    title: title_words.join(" ") + '.',
    body: body_words.join(" ") + '.'
  };
}

app.use(express.static(__dirname + '/public'));

io.on("connection", (socket) => {
  console.log(`user connected ${socket.id}`);
  socket.on("select_room", (roomName) => {
    const articles = [];
    for (let i = 0; i < 8; i++) {
      articles.push(generateArticle(roomName));
    }
    socket.emit("search_results", JSON.stringify({ articles }));
    if (rooms[roomName] !== undefined && rooms[roomName].connected) {
      const v4 = uuidv4();
      matches[v4] = { p1: socket, p2: rooms[roomName], float: { x: 540, y: 360 }, intervalId: 0, vector: { x: 10, y: 10}, p1Score: 0, p2Score: 0 };
      matches[v4].intervalId = setInterval(() => {
        matches[v4].float.x += matches[v4].vector.x;
        matches[v4].float.y += matches[v4].vector.y;
        matches[v4].p1.emit('float_position', JSON.stringify({ x: matches[v4].float.x, y: matches[v4].float.y}));  
        matches[v4].p2.emit('float_position', JSON.stringify({ x: matches[v4].float.x, y: matches[v4].float.y}));  
      }, 100);
      socket.emit('start_game', JSON.stringify({ position: 1, id: v4 }));
      rooms[roomName].emit('start_game', JSON.stringify({ position: 2, id: v4 }));
      delete rooms[roomName];
    } else {
      rooms[roomName] = socket;
    }
  });
  socket.on("disconnect", () => {
    console.log(`user disconnected ${socket.id}`);
  });
  socket.on("player_position", (dataRaw) => {
    data = JSON.parse(dataRaw);
    if (matches[data.id]) {
      if (data.player === 1) {
        matches[data.id].p2.emit('enemy_position', data.position);
      } else {
        matches[data.id].p1.emit('enemy_position', data.position);
      }
    }
  });
});

server.listen(8080, '0.0.0.0', () => {
  console.log("listening localhost:8080");
});
