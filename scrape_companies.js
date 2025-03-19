const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeCompanies() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a random user agent to avoid blocking
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36");

    console.log("🌍 Navigating to the website...");
    await page.goto('https://www.scrapethissite.com/pages/forms/', { waitUntil: 'load' });

    let companies = [];

    while (true) {
        console.log("🔍 Scraping company data...");

        let companyData = await page.evaluate(() => {
            let results = [];
            document.querySelectorAll('.col-md-4').forEach(company => {
                results.push({
                    name: company.querySelector('.name') ? company.querySelector('.name').textContent.trim() : 'N/A',
                    industry: company.querySelector('.industry') ? company.querySelector('.industry').textContent.trim() : 'N/A',
                    address: company.querySelector('.address') ? company.querySelector('.address').textContent.trim() : 'N/A',
                    phone: company.querySelector('.phone') ? company.querySelector('.phone').textContent.trim() : 'N/A',
                });
            });
            return results;
        });

        companies.push(...companyData);
        console.log(`✅ Scraped ${companyData.length} companies from this page.`);

        // Check for a next button
        const nextButton = await page.$('a.next');
        if (nextButton) {
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'load' }),
                nextButton.click()
            ]);
        } else {
            break;
        }
    }

    // Save data to a CSV file
    const csvContent = "Company Name,Industry,Address,Phone\n" + companies.map(c => `"${c.name}","${c.industry}","${c.address}","${c.phone}"`).join("\n");
    fs.writeFileSync('business_data.csv', csvContent, 'utf8');

    console.log("📂 Data saved to business_data.csv");

    await browser.close();
}

// Run the function
scrapeCompanies();
