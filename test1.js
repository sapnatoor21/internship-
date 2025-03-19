const puppeteer = require("puppeteer");

async function scrapeGoogle(query) {
    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log(`🔍 Searching for: ${query}`);

    // Open Google Search
    await page.goto("https://www.google.com/", { waitUntil: "domcontentloaded", timeout: 60000 });

    // Handle cookie pop-ups (if any)
    try {
        await page.waitForSelector("button", { timeout: 3000 });
        const acceptButton = await page.$x("//button[contains(text(), 'Accept')]");
        if (acceptButton.length > 0) {
            await acceptButton[0].click();
            console.log("✅ Accepted cookies");
        }
    } catch (err) {
        console.log("No cookie pop-up detected.");
    }

    // Ensure Google search bar is visible
    await page.waitForSelector('textarea[name="q"]', { visible: true });

    // Type the query and search
    await page.type('textarea[name="q"]', query, { delay: 100 });
    await page.keyboard.press("Enter");
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Wait for Google to fully load results
    await new Promise(resolve => setTimeout(resolve, 3000)); // ⬅️ Fixed wait time

    // Take a screenshot to check if data is visible
    await page.screenshot({ path: "google_result.png" });

    // Extract business details
    const result = await page.evaluate(() => {
        const data = {};

        // Extract Phone Number
        const phoneElement = document.querySelector('[data-attrid="kc:/local:alt phone"], span[aria-label="Phone number"]');
        data.phone = phoneElement ? phoneElement.innerText.replace("Phone: ", "").trim() : "Not found";

        // Extract Address
        const addressElement = document.querySelector('[data-attrid="kc:/location:address"], span[aria-label="Address"]');
        data.address = addressElement ? addressElement.innerText.trim() : "Not found";

        // Extract Website
        const websiteElement = document.querySelector('a[href^="http"]:not([href*="google"])');
        data.website = websiteElement ? websiteElement.href : "Not found";

        return data;
    });

    console.log("✅ Extracted Data:", result);

    // Close the browser
    await browser.close();
}

// Example search
scrapeGoogle("Tesla office phone number and address");
