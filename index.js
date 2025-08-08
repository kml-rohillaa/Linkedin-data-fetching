const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Route to scrape LinkedIn profile
app.post('/scrape-profile', async (req, res) => {
    console.log({req})
  const { url } = req.body;
  if (!url || !url.includes('linkedin.com/in/')) {
    return res.status(400).json({ error: 'Invalid LinkedIn profile URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log({page})
    // Wait and extract basic profile details
    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText?.trim() || '';
       
      return {
        fullName: getText('.text-heading-xlarge'),
        headline: getText('.text-body-medium.break-words'),
        location: getText('.text-body-small.inline.t-black--light.break-words'),
        about: getText('.pv-about-section .pv-shared-text-with-see-more'),
      };
    });
    console.log({data})

    await browser.close();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to scrape LinkedIn company page
app.post('/scrape-company', async (req, res) => {
    console.log({req})
  const { url } = req.body;
  if (!url || !url.includes('linkedin.com/company/')) {
    return res.status(400).json({ error: 'Invalid LinkedIn company URL' });
  }

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      const getText = (selector) =>
        document.querySelector(selector)?.innerText?.trim() || '';

      return {
        companyName: getText('h1'),
        tagline: getText('h2'),
        description: getText('.break-words.white-space-pre-wrap'),
        followers: getText('div.org-top-card-summary__followers-count'),
        location: getText('.org-top-card-summary__headquarter'),
        website: getText('.org-about-company-module__website'),
        industry: getText('.org-about-company-module__industry'),
        companySize: getText('.org-about-company-module__company-size-definition-text'),
      };
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
