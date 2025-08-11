const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.includes('linkedin.com')) {
    return res.status(400).json({ error: 'Invalid LinkedIn URL' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true, // set to false to see the browser
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    const page = await browser.newPage();

    // Set a normal browser user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for main heading
    await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});

    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.innerText.trim() : '';
      };

      return {
        title: getText('h1'),
        headline: getText('.top-card-layout__headline'),
        location: getText('.text-body-small.inline'),
        about: getText('.core-section-container__content') || getText('section.about p'),
      };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch LinkedIn public data', details: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(4000, () => console.log('Server running on http://localhost:4000'));
