const ghostly = require('./article');
const rss = require('./rss');
require('dotenv').config();

// launch google news links parser
rss().then((linksLength) => {
    console.log('links length', linksLength);
    // basically, we split there in 2 pieces. First case is when the number of articles is less than the total time in hours - it means that we need to wait before restarting the circle to avoid repeating links. Second case is easy, just runs a delayed circle with 1 hour intervals.
    setTimeout(() => ghostly(), 3000);
    if (linksLength < process.env.TIME_DELAY) {
        var timesRun = 1;
        var interval = setInterval(function () {
            timesRun += 1;
            if (timesRun === linksLength) {
                clearInterval(interval);
                setTimeout(() => {
                    throw 'so few news articles, restarting for another circle...';
                }, (process.env.TIME_DELAY - linksLength) * 1000 * 60 * 60);
            }
            ghostly(); //do whatever here..
        }, 1000 * 60 * 60); // interval is 1 hour
    }
    else {
        var timesRun = 1;
        var interval = setInterval(function () {
            timesRun += 1;
            if (timesRun === linksLength) {
                clearInterval(interval);
                throw 'restarting for another circle...';
            }
            ghostly(); //do whatever here..
        }, 1000 * 60 * 60); // interval is 1 hour
    }
});
