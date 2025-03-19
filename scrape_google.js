const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');  
puppeteer.use(StealthPlugin());

async function scrapeGoogle(searchQuery) {
    console.log(`🔍 Searching for: ${searchQuery}`);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: false, // Set to true for silent execution
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const page = await browser.newPage();

    // Use a realistic user-agent to prevent detection
    await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Open Google
    await page.goto('https://www.google.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Handle Google's cookie pop-up if it appears
    try {
        await page.waitForSelector('button[aria-label="Accept all"]', { timeout: 5000 });
        await page.click('button[aria-label="Accept all"]');
        console.log("✅ Accepted cookies");
    } catch (error) {
        console.log("No cookie pop-up detected.");
    }

    // Ensure the search bar is available
    await page.waitForSelector('textarea[name="q"], input[name="q"]', { timeout: 20000 });

    // Type search query
    await page.type('textarea[name="q"], input[name="q"]', searchQuery);
    await page.keyboard.press('Enter');

    // Wait for results
    await page.waitForSelector('div[id="search"]', { timeout: 45000 });

    // Extract data
    const extractedData = await page.evaluate(() => {
        let phone = document.querySelector('[data-attrid*="phone"]')?.innerText || 'Not found';
        let address = document.querySelector('[data-attrid*="address"]')?.innerText || 'Not found';
        let website = document.querySelector('.tF2Cxc a')?.href || 'Not found';

        return { phone, address, website };
    });

    console.log(`✅ Extracted Data:`, extractedData);

    await browser.close();
}

// Run the function
scrapeGoogle("Tesla office phone number and address");
