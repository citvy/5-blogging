const Mercury = require("@postlight/mercury-parser");
const fs = require('fs');
const puppeteer = require('puppeteer');
const GhostAdminAPI = require('@tryghost/admin-api');
const { exec } = require('child_process');
const fetch = require('node-fetch');
require('dotenv').config();

const api = new GhostAdminAPI({
    url: 'https://citvy.com/blog',
    version: "v3",
    key: process.env.KEY
});

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function ghostly() {
    let text = JSON.parse(fs.readFileSync('links.txt', 'utf8'));
    let url = text.shift();
    if (url) {
        fs.appendFile('newlinks.txt', JSON.stringify(url), function (err) {
            if (err) return console.log(err);
        });

        fs.writeFile('links.txt', JSON.stringify(text), function (err) {
            if (err) return console.log(err);
        });

        Mercury.parse(url).then(result => {
            let objR = {
                title: result.title,
                excerpt: result.excerpt
            }
            console.log('result.lead_image_url', result.lead_image_url);
            // let articleFile = makeid(64);
            fs.writeFile(`article/index.html`, result.content, function (err) {
                if (err) return console.log(err);
                // console.log('Removed 1 link > links.txt');
                fs.writeFile(`article/index.txt`, JSON.stringify(objR), function (err) {
                    if (err) return console.log(err);
                    // console.log('Removed 1 link > links.txt');
                });
            });
            // deploy to .git live repo
            let yourscript = exec('sh g.sh',
                (error, stdout, stderr) => {
                    console.log(stdout);
                    console.log(stderr);
                    if (error !== null) {
                        console.log(`exec error: ${error}`);
                    }
                });

            (async () => {
                const browser = await puppeteer.launch({ headless: process.env.TESTMODE ? false : true, args: ['--no-sandbox', '--lang=ru-RU'] });

                const page = await browser.newPage();

                
                const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
                const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
                await page.setUserAgent(chromeUserAgent);
                await page.setExtraHTTPHeaders({
                    'accept-language': 'en-US,en;q=0.8'
                });
                await page.waitFor(process.env.TESTMODE ? 1000 * 60 : 1000 * 60 * 60 * process.env.TIME_DELAY);
                // await page.goto(`https://translate.google.com/translate?depth=5&pto=aue&rurl=translate.google.com&sl=en&sp=nmt4&tl=ru&u=https://citvy.github.io/50pages/${articleFile}.html`);
                await page.goto(`https://translate.googleusercontent.com/translate_c?depth=7&pto=aue&rurl=translate.google.com&sl=en&sp=nmt4&tl=ru&u=https://citvy.github.io/50pages/&usg=ALkJrhiJFd9iftDfY6efGW42hmecSF9MEw`);
                const SELECTOR = '/html/body/div[3]/iframe';
                await autoScroll(SELECTOR);
                await page.waitFor(15000);
                // console.log(frame);

                let bodyHTML = await SELECTOR.evaluate(() => {
                    function stripScripts(s) {
                        var div = document.createElement('div');
                        div.innerHTML = s;
                        var scripts = div.getElementsByTagName('script');
                        var i = scripts.length;
                        while (i--) {
                            scripts[i].parentNode.removeChild(scripts[i]);
                        }
                        return div.innerHTML;
                    }

                    function removeElementsByClass(className) {
                        var elements = document.getElementsByClassName(className);
                        while (elements.length > 0) {
                            elements[0].parentNode.removeChild(elements[0]);
                        }
                    }
                    removeElementsByClass('skiptranslate');
                    removeElementsByClass('goog-te-spinner-pos');
                    removeElementsByClass('gmnoprint');
                    removeElementsByClass('notranslate');
                    return stripScripts(document.body.innerHTML);
                });
                console.log(bodyHTML);
                // throw 'fuck';

                await page.goto(`https://translate.google.com/#view=home&op=translate&sl=en&tl=ru&text=${encodeURIComponent(objR.title)}`)
                await page.waitFor(35000);
                // await page.click('.tlid-dismiss-button');
                // await page.waitFor(35000);
                // await page.waitForSelector('.tlid-translation');

                let titleText = await page.evaluate(() => {
                    function getElementByXpath(path) {
                        return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                    };
                    return getElementByXpath('/html/body/c-wiz/div/div[2]/c-wiz/div[2]/c-wiz/div[1]/div[2]/div[2]/c-wiz[2]/div[5]/div/div[1]/span[1]/span/span').textContent
                });
                // let titleText = await translate({ text: objR.title, from: 'en', to: 'ru' });
                // let excerptText = await translate({ text: objR.excerpt, from: 'en', to: 'ru' });

                // ##### gets an image from unsplash #####
                console.log('Success $%!');
                fetch('https://source.unsplash.com/1600x900/?city')
                    .then(data => {
                        return api.posts
                            .add(
                                {
                                    title: titleText, html: bodyHTML,
                                    //  excerpt: excerptText,
                                    feature_image: data.url,
                                    authors: [
                                        {
                                            id: '5951f5fca366002ebd5dbef7',
                                            name: 'Rupesh Narayan',
                                            slug: 'rupesh-narayan',
                                            email: 'rupesh@citvy.com',
                                            profile_image: 'https://citvy.com/blog/content/images/2020/07/cG5n.png',
                                            cover_image: 'https://citvy.com/blog/content/images/2020/07/Crummock-Water-Road-Lake-District.jpg',
                                            bio: 'Технический писатель',
                                            website: null,
                                            location: 'Киев',
                                            facebook: 'citvy',
                                            twitter: '@lampgram',
                                            accessibility: '{"nightShift":true,"whatsNew":{"lastSeenDate":"2020-06-29T16:11:36.000+00:00"}}',
                                            status: 'active',
                                            meta_title: null,
                                            meta_description: null,
                                            tour: '["getting-started","using-the-editor","featured-post","upload-a-theme"]',
                                            last_seen: '2020-08-07T21:44:58.000Z',
                                            created_at: '2020-04-04T13:57:25.000Z',
                                            updated_at: '2020-08-07T21:44:58.000Z',
                                            roles: [
                                                {
                                                    "id": "5ddc9063c35e7700383b27e3",
                                                    "name": "Author",
                                                    "description": "Authors",
                                                    "created_at": "2019-11-26T02:39:31.000Z",
                                                    "updated_at": "2019-11-26T02:39:31.000Z"
                                                }
                                            ],
                                            url: 'https://citvy.com/blog/author/rupesh-narayan/'
                                        }
                                    ],
                                    primary_author: {
                                        id: '5951f5fca366002ebd5dbef7',
                                        name: 'Rupesh Narayan',
                                        slug: 'rupesh-narayan',
                                        email: 'rupesh@citvy.com',
                                        profile_image: 'https://citvy.com/blog/content/images/2020/07/cG5n.png',
                                        cover_image: 'https://citvy.com/blog/content/images/2020/07/Crummock-Water-Road-Lake-District.jpg',
                                        bio: 'Технический писатель',
                                        website: null,
                                        location: 'Киев',
                                        facebook: 'citvy',
                                        twitter: '@lampgram',
                                        accessibility: '{"nightShift":true,"whatsNew":{"lastSeenDate":"2020-06-29T16:11:36.000+00:00"}}',
                                        status: 'active',
                                        meta_title: null,
                                        meta_description: null,
                                        tour: '["getting-started","using-the-editor","featured-post","upload-a-theme"]',
                                        last_seen: '2020-08-07T21:44:58.000Z',
                                        created_at: '2020-04-04T13:57:25.000Z',
                                        updated_at: '2020-08-07T21:44:58.000Z',
                                        roles: [
                                            {
                                                "id": "5ddc9063c35e7700383b27e3",
                                                "name": "Author",
                                                "description": "Authors",
                                                "created_at": "2019-11-26T02:39:31.000Z",
                                                "updated_at": "2019-11-26T02:39:31.000Z"
                                            }
                                        ],
                                        url: 'https://citvy.com/blog/author/rupesh-narayan/'
                                    }
                                },
                                { source: 'html' }
                            )
                            .then(async res => {
                                process.env.TESTMODE ? false : await browser.close() 
                            })
                            .catch(err => console.log(err));
                    })
                    .catch(err => {
                        console.log('Error happened during fetching!', err);
                    });
            })();
            console.log(objR);
        })
    }
}

module.exports = ghostly;

// ghostly();

// setTimeout(function () {
//     process.exit(0);
// }, 60 * 1000 * 60 * 24);