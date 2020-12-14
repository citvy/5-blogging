const fetch = require('node-fetch');

fetch('https://source.unsplash.com/1600x900/?city')
.then(data => {
    console.log('data:', data.url)
})
.catch(err => {
    console.log('Error happened during fetching!', err);
});