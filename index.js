const ghostly = require('./article');
const rss = require('./rss');
require('dotenv').config();

// launch rss and article parser to get 1 article at a time.
rss();
ghostly();

setTimeout(function(){
    process.exit(0);
    }, 60 * 60 * 1000 * process.env.TIME_DELAY); 