
const puppeteer = require("puppeteer");

(async () => {

    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--lang=ru-RU, ru', '--disable-web-security'] });

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
    await page.goto(`file:///Users/rostyslav/Desktop/merc-parser/article/index.html`);

    //   await browser.close();

})();

