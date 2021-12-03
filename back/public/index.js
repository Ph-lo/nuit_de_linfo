const WIDTH = 1080;
const HEIGTH = 720;
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

let gameId;
let game;
let playerNum;
let p1;
let p2;
let text;
let float;
let floatVec;
let player;
let ennemie;
let socket;
let lock = false;

playerNum = 1;
config.canvas = document.getElementById('canvas');
config.canvas.style.display = "block";
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
    socket.on("start_game", (dataRaw) => {
        const data = JSON.parse(dataRaw);
        console.log(`Game Start as ${data.position}`);
        playerNum = data.position;
        gameId = data.id;
        config.canvas = document.getElementById('canvas');
        config.canvas.style.display = "block";
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
    socket.on("float_position", (positionRaw) => {
        const { position, vector } = JSON.parse(positionRaw);
        float.x = position.x;
        float.y = position.y;
        floatVec = vector;
    });
    socket.on("score", (dataRaw) => {
        lock = false;
        const { p1, p2 } = JSON.parse(dataRaw);
        text.setText(
            `${p1} - ${p2}`
        );
    });
};

function preload() {
    this.load.image('background', 'assets/background.png');
    this.load.image('boat', 'assets/boat.png');
    this.load.image('float', 'assets/float.png');
    this.input.keyboard.addCapture('UP,DOWN');
}

function create() {
    const image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
    const scaleX = this.cameras.main.width / image.width
    const scaleY = this.cameras.main.height / image.height
    const scale = Math.max(scaleX, scaleY)
    image.setScale(scale).setScrollFactor(0)

    this.isOutWorldBoundsVerti = (object) => (object.getBounds().bottom > game.config.height || object.getBounds().top < 0);
    this.isOutWorldBoundsHori = (object) => (object.getBounds().right < 0 || object.getBounds().left > WIDTH);
    this.checkOverlap = (spriteA, spriteB) => {
	    var boundsA = spriteA.getBounds();
	    var boundsB = spriteB.getBounds();
	    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
	}
    this.up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.down = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
    float = this.add.sprite(WIDTH / 2, HEIGTH / 2, 'float');
    p1 = this.add.sprite(150, 200, 'boat');
    p2 = this.add.sprite(WIDTH - 170, 200, 'boat');
    if (playerNum == 1) {
        player = p1;
        enemy = p2;
    } else {
        player = p2;
        enemy = p1;
    }
    const style = { font: "bold 32px Arial", fill: "#000" };
    text = this.add.text(WIDTH / 2 - 30, HEIGTH / 5, "0 - 0", style);
}

function update() {
    const before = player.y;
    if (this.up.isDown) {
        player.y -= 4;
    }
    if (this.down.isDown) {
        player.y += 4;
    }
    if (this.isOutWorldBoundsVerti(player)) {
        player.y = before;
    }
    if (before > player.y) {
        player.angle = 0;
    } else if (before < player.y) {
        player.angle = 180;
    }
    if (playerNum === 1) {
        if (this.isOutWorldBoundsVerti(float)) {
            socket.emit('float_vec', JSON.stringify({ id: gameId, x: floatVec.x, y: -floatVec.y }));
        }
        if (this.isOutWorldBoundsHori(float) && lock === false) {
            lock = true;
            if (float.getBounds().right < 0)
                socket.emit('score', JSON.stringify({ id: gameId, player: 2 }));
            else
                socket.emit('score', JSON.stringify({ id: gameId, player: 1 }));
        }
        if (this.checkOverlap(float, p1) || this.checkOverlap(float, p2)) {
            socket.emit('float_vec', JSON.stringify({ id: gameId, x: -floatVec.x + Math.floor(Math.random() * 30) - 15, y: -floatVec.y + Math.floor(Math.random() * 30) - 15}));
        }
    }
    socket.emit('player_position', JSON.stringify({ player: playerNum, position: player.y, id: gameId }));
}