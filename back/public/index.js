const WIDTH = 1440;
const HEIGTH = 1024;
const config = {
    type: Phaser.CANVAS,
    width: WIDTH,
    height: HEIGTH,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

let game;
let playerNum;
let p1;
let p2;
let player;
let ennemie;
let socket;

config.canvas = document.getElementById('canvas');
game = new Phaser.Game(config);

function generateArticles(articles) {
    const articlesDiv = document.getElementById("articles");
    for (const article of articles) {
        const div = document.createElement("div");
        div.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.body}</p>
        `;
        articlesDiv.appendChild(div);
    }
}

window.onload = () => {
    // Handle URL redirect on form submit
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        window.location.href = (window.location.href.split('?')[0]) + `?q=${input.value}`;
    });

    // Handle game logic
    socket = io();

    socket.on("connect", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query)
            socket.emit('select_room', query);
    });
    socket.on("search_results", (results) => {
        const data = JSON.parse(results);
        generateArticles(data.articles);
    });
    socket.on("startGame", (position) => {
        console.log(`Game Start as ${position}`);
        playerNum = position;
        config.canvas = document.getElementById('canvas');
        game = new Phaser.Game(config);
    });
    socket.on("enemy_position", (position) => {
        const before = enemy.y;
        enemy.y = position;
        if (before > enemy.y) {
            enemy.angle = 0;
        } else if (before < enemy.y) {
            enemy.angle = 180;
        }
    });

};

function preload() {
    this.load.image('boat', 'assets/boat.png');
    this.load.image('float', 'assets/float.png');
    this.input.keyboard.addCapture('UP,DOWN');
}

function create() {
    this.isOutWorldBounds = (object) => (object.getBounds().bottom > game.config.height || object.getBounds().top < 0);
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    p1 = this.add.sprite(150, 200, 'boat');
    p2 = this.add.sprite(WIDTH - 170, 200, 'boat');
    if (playerNum == 1) { 
        player = p1;
        enemy = p2; 
    } else {
        player = p2;
        enemy = p1;
    }
}

function update() {
    const before = player.y;
    if (this.up.isDown) {
        player.y -= 4;
    }
    if (this.down.isDown) {
        player.y += 4;
    }
    if (this.isOutWorldBounds(player)) {
        player.y = before;
    }
    if (before > player.y) {
        player.angle = 0;
    } else if (before < player.y) {
        player.angle = 180;
    }
    socket.emit('player_position', player.y);
}