const loremIpsum = require("lorem-ipsum").loremIpsum;


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
    title_words.sort(() => Math.random());
    body_words.sort(() => Math.random() * 1);
    return {
        title: title_words.join(" ") + '.',
        body: body_words.join(" ") + '.'
    };    
}



console.log(generateArticle("ROMU"));
