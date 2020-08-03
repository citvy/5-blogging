const Mercury = require("@postlight/mercury-parser");
const fs = require('fs');
const request = require('request');

let text = JSON.parse(fs.readFileSync('links.txt', 'utf8'));
let url = text.shift();
// console.log(url);

const download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

fs.writeFile('links.txt', JSON.stringify(text), function (err) {
    if (err) return console.log(err);
    // console.log('Removed 1 link > links.txt');
});

Mercury.parse(url).then(result => {
    let objR = {
        title: result.title,
        excerpt: result.excerpt
    }

    download(result.lead_image_url, 'article/article.png', function () {
        console.log('img');
    });

    fs.writeFile('article/article.html', result.content, function (err) {
        if (err) return console.log(err);
        // console.log('Removed 1 link > links.txt');
        fs.writeFile('article/article.txt', JSON.stringify(objR), function (err) {
            if (err) return console.log(err);
            // console.log('Removed 1 link > links.txt');
        });
    });
    console.log(objR);
});