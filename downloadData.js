const fs = require('fs')
const puppeteer = require('puppeteer')
const url = '';


async() => {
    const browser = await puppeteer.launch();
    const page = browser.newPage();
    (await page).goto(url)
};