const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeCompanies() {
    console.log("Launching Puppeteer...");
    
    // Launch the browser
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    console.log("Fetching company list...");

    // Navigate to the website with the list of companies
    await page.goto('https://www.wirtschaft.at/l/neueintragungen?page=1&limit=1000', {
        waitUntil: 'domcontentloaded'
    });

    // Wait for the company list to load
    await page.waitForSelector('.search-result-item');

    // Scrape company links
    const companyLinks = await page.evaluate(() => {
        return [...document.querySelectorAll('.search-result-item a')]
            .map(link => link.href)
            .slice(0, 10);  // Limiting to 10 for testing
    });

    console.log(`Found ${companyLinks.length} company links.`);

    let companyData = [];

    // Loop through each company page
    for (let link of companyLinks) {
        console.log(`Scraping company data from: ${link}`);
        await page.goto(link, { waitUntil: 'domcontentloaded' });

        try {
            // Extract company details
            const companyDetails = await page.evaluate(() => {
                const name = document.querySelector('h1')?.innerText.trim() || 'N/A';
                const address = document.querySelector('.address')?.innerText.trim() || 'N/A';
                const phone = document.querySelector('.phone a')?.innerText.trim() || 'N/A';

                return { name, address, phone };
            });

            console.log(companyDetails);
            companyData.push(companyDetails);
        } catch (error) {
            console.log("Error fetching details:", error);
        }
    }

    // Save results to JSON file
    fs.writeFileSync('company_data.json', JSON.stringify(companyData, null, 2));
    console.log("Company data saved successfully.");

    await browser.close();
}

scrapeCompanies();
