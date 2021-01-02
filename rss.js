const axios = require('axios');
const _ = require('lodash');
const jsdom = require("jsdom");
const fs = require('fs');
require('dotenv').config();

async function rss() {
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

    const resp = await axios.get(`https://news.google.com/rss/search?q=real+estate+tips+when:${process.env.TIME_DELAY}h&hl=en-US&gl=US&ceid=US:en`);
    let links = [];

    parseData(resp.data).map((elem, index) => {
        if ((elem.link.indexOf('market') == -1) && (elem.link.indexOf('report') == -1) && (elem.link.indexOf('industry') == -1) && (elem.link.indexOf('www.desmoinesregister.com') == -1)) {
            links.push(elem.link);
        }
        else {
            console.log('dropped', elem.link);
        }
    });
    if (!links || links.length < 1)
        throw 'fuck those 0 links';
    fs.writeFile('links.json', JSON.stringify(links), function (err) {
        if (err) return console.log(err);
        console.log('Links [] > links.json');
    });
    return links.length; // return number of links
}

module.exports = rss;