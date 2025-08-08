// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/scrape-profile', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const fullName = await page.$eval('h1.text-heading-xlarge', el => el.innerText.trim());
    const headline = await page.$eval('div.text-body-medium.break-words', el => el.innerText.trim());
    const location = await page.$eval('span.text-body-small.inline.t-black--light.break-words', el => el.innerText.trim());

    await browser.close();

    return res.json({ fullName, headline, location });
  } catch (error) {
    await browser.close();
    return res.status(500).json({ error: 'Failed to scrape LinkedIn profile', details: error.message });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
