const axios = require('axios');
const _ = require('lodash');
const jsdom = require("jsdom");
const fs = require('fs');

function rss() {
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

    axios.get('https://news.google.com/rss/search?q=real+estate+tips+when:1d&hl=en-US&gl=US&ceid=US:en').then((resp) => {
        let links = [];
        parseData(resp.data).map((elem, index) => {
            console.log(elem);
            if ((elem.link.indexOf('market') == -1) && (elem.link.indexOf('report') == -1) && (elem.link.indexOf('industry') == -1)) {
                links.push(elem.link);
            }
            else {
                console.log('dropped', elem.link);
            }
        });
        console.log(links.length)
        if(links.length < 1)
            throw 'fuck those 0 links';
        fs.writeFile('links.txt', JSON.stringify(links), function (err) {
            if (err) return console.log(err);
            console.log('Links [] > links.txt');
        });
    });
}

module.exports = rss;