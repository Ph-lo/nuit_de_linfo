const loremIpsum = require("lorem-ipsum").loremIpsum;
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
    for(let i = 0; i < randNbr; i++)
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
    socket.emit("search_results", JSON.stringify({articles}));
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
    if (matches[socket.id]) {
      matches[socket.id].emit('surrend');
      delete matches[matches[socket.id].id];
      delete matches[socket.id];
    }
    console.log(`user disconnected ${socket.id}`);
  });
});

server.listen(8080, () => {
  console.log("listening localhost:8080");
});
