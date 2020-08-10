const axios = require('axios');
const _ = require('lodash');
const jsdom = require("jsdom");
const fs = require('fs');

function parseData(data) {
    parser = new new jsdom.JSDOM().window.DOMParser;
    var xmlDoc = parser.parseFromString(data, "text/xml");
    var items = Array.from(xmlDoc.getElementsByTagName('item'));

    var feeds = [];
    items.forEach(function (item) {
        feeds.push({
            link: getNode(item, 'link'),
            pubDate: getNode(item, 'pubDate'),
        });
    });
    return feeds;
}

function getNode(node, tagToRetrieve) {
    var htmlData = node.getElementsByTagName(tagToRetrieve)[0].innerHTML;
    return _.unescape(htmlData);
}

axios.get('https://news.google.com/rss/search?q=real+estate+trends+when:1d&hl=en-US&gl=US&ceid=US:en').then((resp) => {
    let links = [];
    parseData(resp.data).map((elem, index) => {
        if (elem.link.indexOf('marketresearchposts.com') == -1 && link.indexOf('reportlinker.com') == -1 && link.indexOf('jdsupra.com') == -1)
            links.push(elem.link);
    });
    console.log(links.length)
    fs.writeFile('links.txt', JSON.stringify(links), function (err) {
        if (err) return console.log(err);
        console.log('Links [] > links.txt');
    });
});

