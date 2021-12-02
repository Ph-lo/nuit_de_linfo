
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
    const socket = io();

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
    socket.on("startGame", () => {
        console.log('Game Start');
    });
};