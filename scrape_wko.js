const puppeteer = require("puppeteer");

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        // Correct URL format
        const url = "https://www.wko.at/neuzugaenge";
        console.log(`Navigating to: ${url}`);

        await page.goto(url, { waitUntil: "load", timeout: 60000 });

        // Wait for a specific selector on the page
        await page.waitForSelector(".search-result-item", { timeout: 30000 });

        // Extract data
        const data = await page.evaluate(() => {
            return Array.from(document.querySelectorAll(".search-result-item"))
                .map(item => item.innerText.trim());
        });

        console.log("Scraped Data:", data);

        await browser.close();
    } catch (error) {
        console.error("Error occurred:", error);
    }
})();
