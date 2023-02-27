const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const scrape = async () => {
    const creature = "a-mi-kuk";
    const html = await axios.get(`https://www.5esrd.com/database/creature/${creature}/`);
    const $ = await cheerio.load(html.data); //cheerio tutorials: https://cheerio.js.org/

    const name = $('#article-content > h1').text();
    console.log(name);
};

scrape();