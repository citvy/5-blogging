const puppeteer = require("puppeteer");

(async () => {

    const browser = await puppeteer.launch({
        headless: false, args: ['--disable-web-security'], slowMo: 250,devtools: true
    });

    const page = await browser.newPage();
    await page.goto('https://translate.google.com/translate?depth=7&pto=aue&rurl=translate.google.com&sl=en&sp=nmt4&tl=ru&u=https://citvy.github.io/50pages/');
    await page.waitFor(2000);
    const iframeParagraph = await page.evaluate(() => {
        // await page.waitFor(7000);
        const iframe = document.querySelector('[sandbox="allow-same-origin allow-forms allow-scripts allow-popups"]');
        // grab iframe's document object
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        const iframeP = iframeDoc.getElementsByTagName("body")[0];

        return iframeP.innerHTML;
    });

    console.log(iframeParagraph); // prints "This is a paragraph"

    await browser.close();

})();