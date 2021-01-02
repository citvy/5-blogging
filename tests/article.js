const Mercury = require("@postlight/mercury-parser");
const fs = require('fs');
const puppeteer = require('puppeteer');
const GhostAdminAPI = require('@tryghost/admin-api');
const { exec } = require('child_process');
const fetch = require('node-fetch');
require('dotenv').config();


function ghostly() {
    let text = JSON.parse(fs.readFileSync('links.json', 'utf8'));
    let url = text.shift();

    if (url) {
        fs.appendFile('newlinks.txt', JSON.stringify(url), function (err) {
            if (err) return console.log(err);
        });

        fs.writeFile('links.json', JSON.stringify(text), function (err) {
            if (err) return console.log(err);
        });

        Mercury.parse(url).then(result => {
            if (result.title)
                console.log('');
            else {
                throw 'no title';
            }
            let objR = {
                title: result.title,
                excerpt: result.excerpt
            }
            console.log('result.lead_image_url', result.lead_image_url);

            fs.writeFile(`article/index.html`, result.content + `<div id="google_translate_element"></div>

            <script type="text/javascript" src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
            <script>
            function googleTranslateElementInit() {
            new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'ru', autoDisplay: false, multilanguagePage: true}, 'google_translate_element');
            }
            var a = document.querySelector("#google_translate_element select");
            a.selectedIndex=1;
            a.dispatchEvent(new Event('change'));
            </script>`, function (err) {
                if (err) return console.log(err);
                // console.log('Removed 1 link > links.json');
                fs.writeFile(`article/index.txt`, JSON.stringify(objR), function (err) {
                    if (err) return console.log(err);
                    console.log('Removed 1 link > links.json');
                    (async () => {
                        const browser = await puppeteer.launch({ ignoreDefaultArgs: true, headless: process.env.TESTMODE ? false : true, args: ['--no-sandbox', '--lang=ru-RU, ru', '--disable-web-security', 'ignoreDefaultArgs'] });

                        const page = await browser.newPage();
                        // Set the language forcefully on javascript
                        await page.evaluateOnNewDocument(() => {
                            Object.defineProperty(navigator, "language", {
                                get: function () {
                                    return "ru-RU";
                                }
                            });
                            Object.defineProperty(navigator, "languages", {
                                get: function () {
                                    return ["ru-RU", "ru"];
                                }
                            });
                        });
                        const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
                        const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
                        await page.setUserAgent(chromeUserAgent);
                        await page.setExtraHTTPHeaders({
                            'Accept-Language': 'ru'
                        });
                        await page.waitFor(2000);
                        // await page.goto(`https://translate.google.com/translate?depth=5&pto=aue&rurl=translate.google.com&sl=en&sp=nmt4&tl=ru&u=https://citvy.github.io/50pages/${articleFile}.html`);
                        await page.goto(`file:///Users/rostyslav/Desktop/merc-parser/article/index.html#googtrans(en|ru)`);
                        await page.waitFor(4000);
                        let bodyHTML = await page.evaluate(() => {
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
                        await page.goto(`https://translate.google.com/#view=home&op=translate&sl=en&tl=ru&text=${encodeURIComponent(objR.title)}`)
                        await page.waitFor(4000);

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
                    
                            })
                            .catch(err => {
                                console.log('Error happened during fetching!', err);
                            });
                    })();
                });
                console.log(objR);
            })
        }
        )
    }
}

ghostly();

// setTimeout(function () {
//     process.exit(0);
// }, 60 * 1000 * 60 * 24);