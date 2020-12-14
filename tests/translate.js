const translate = require('html-google-translate');

async function Tr() {
    const html = '<p><i>I</i> love <a href="#">you</a>!</p>'

    const transHtml = await translate(html, {
        from: 'en',
        to: 'es',
    })

    console.log(transHtml, '\n\n\n', html);
}

Tr();
// '<p><i>Me</i> encanta <a href="#">que</a> !</p>'

// broken fully, deprecated