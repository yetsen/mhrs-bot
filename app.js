let mhrsUser = "";
let mhrsToken = "";
let isAuth = "";


async function main() {
    const CREDS = require('./creds.js');
    const puppeteer = require('puppeteer');

    let citySelector = 'span[title="' + CREDS.city +'"]';
    let clinicSelector = 'span[title="' + CREDS.clinic +'"]';

    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 720});
    await page.goto('https://mhrs.gov.tr/vatandas/#/', { waitUntil: 'networkidle0' }); // wait until page load

    await page.evaluate((mhrsUser, mhrsToken, isAuth) => {
            console.log(mhrsUser);
            console.log(mhrsToken);
            localStorage.setItem("users-v-mhrs", mhrsUser);
            localStorage.setItem("token-v-mhrs", mhrsToken);
            localStorage.setItem("isAuth-v-mhrs", isAuth);
        }, mhrsUser, mhrsToken, isAuth
    )
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    await page.type('#LoginForm_username', CREDS.username);
    await page.type('#LoginForm_password', CREDS.password);

    await page.click('button[type=submit]');

    await page.waitForSelector('.hasta-randevu-card')
    await page.waitForTimeout(1500);
    await page.evaluate(() => {

            mhrsUser = localStorage.getItem("users-v-mhrs");
            mhrsToken = localStorage.getItem("token-v-mhrs");
            console.log(mhrsToken);
            console.log(mhrsUser);
        }
    )
    await page.click('.hasta-randevu-card')

    await page.waitForSelector('.genel-arama-button');
    await page.waitForTimeout(500);
    await page.click('.genel-arama-button');
    await page.waitForSelector('label[title=City]');
    await page.waitForTimeout(500);

    let endDate = new Date();
    endDate.setDate(endDate.getDate()+5);
    await page.click('input[placeholder="Starting Date Please Select"]');
    await page.waitForSelector('.ant-calendar-today-btn');
    await page.click('.ant-calendar-today-btn');
    await page.click('input[placeholder="Ending Date Please Select"]')
    await page.keyboard.type(CREDS.lastDate);
    await page.keyboard.press('Enter');

    await page.waitForSelector('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(3) > div.ant-col.ant-form-item-control-wrapper > div > span > span.ant-select-enabled');
    await page.click('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(3) > div.ant-col.ant-form-item-control-wrapper > div > span > span');
    await page.waitForTimeout(500);
    await page.click(citySelector);


    await page.waitForSelector('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(5) > div.ant-col.ant-form-item-control-wrapper > div > span > span.ant-select-enabled')
    await page.waitForTimeout(500);
    await page.click('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(5) > div.ant-col.ant-form-item-control-wrapper > div > span > span > span')
    await page.waitForTimeout(500);
    await page.click(clinicSelector);

    await page.waitForSelector('button[type=submit]:not([disabled])');
    await page.waitForTimeout(500);
    await page.click('button[type=submit]');

    await page.waitForSelector('.ant-list-item:nth-child(1)');
    await page.waitForTimeout(1000);
    await page.click('.ant-list-item:nth-child(1)');
    await page.waitForSelector('.ant-collapse-item:not(.ant-collapse-item-disabled):nth-child(1)');
    await page.waitForTimeout(1000);
    await page.click('.ant-collapse-item:not(.ant-collapse-item-disabled):nth-child(1)');
    await page.waitForSelector('button.slot-saat-button[type=button]:not([disabled])');
    await page.waitForTimeout(1000);
    await page.click('button.slot-saat-button[type=button]:not([disabled]):nth-child(1)');

    try {
        await page.waitForSelector('.ant-modal-confirm-btns > button[type=button]', {timeout: 3000})
        await page.waitForTimeout(500);
        await page.click('.ant-modal-confirm-btns > button[type=button]')
    } catch {

    } finally {
        await page.waitForSelector('div.ant-modal-footer > div > button.ant-btn.ant-btn-primary');
        await page.waitForTimeout(1000);
        await page.click('div.ant-modal-footer > div > button.ant-btn.ant-btn-primary');
    }



}

main();