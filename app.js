let mhrsUser = "";
let mhrsToken = "";
let isAuth = "";

let isAppointmentTaken = false;

async function main() {
    const CREDS = require('./creds.js');
    const puppeteer = require('puppeteer');

    let citySelector = 'span[title="' + CREDS.city +'"]';
    let clinicSelector = 'span[title="' + CREDS.clinic +'"]';

    const browser = await puppeteer.launch({headless: true});
    console.log("starting... " + new Date());
    const context = browser.defaultBrowserContext();
    await context.overridePermissions("https://mhrs.gov.tr", ['geolocation']);
    const page = await browser.newPage();
    await page.setViewport({width: 1200, height: 720});
    await page.goto('https://mhrs.gov.tr/vatandas/#/', { waitUntil: 'networkidle0' }); // wait until page load

    await page.evaluate((mhrsUser, mhrsToken, isAuth) => {
            localStorage.setItem("users-v-mhrs", mhrsUser);
            localStorage.setItem("token-v-mhrs", mhrsToken);
            localStorage.setItem("isAuth-v-mhrs", isAuth);
        }, mhrsUser, mhrsToken, isAuth
    )
    await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    let loginElement = (await page.$('#LoginForm_username')) || "";
    if (loginElement !== "") {
        console.log("Login is required " + new Date());
        await page.type('#LoginForm_username', CREDS.username);
        await page.type('#LoginForm_password', CREDS.password);

        await page.click('button[type=submit]');   
    } else {
        console.log("Login is not required " + new Date())
    }

    await page.waitForSelector('.hasta-randevu-card')
    await page.waitForTimeout(1500);
    const localStorage = await page.evaluate(() =>  Object.assign({}, window.localStorage));
    mhrsUser = localStorage["users-v-mhrs"];
    mhrsToken = localStorage["token-v-mhrs"];
    isAuth = localStorage["isAuth-v-mhrs"];

    await page.click('.hasta-randevu-card')

    await page.waitForSelector('.genel-arama-button');
    await page.waitForTimeout(500);
    await page.click('.genel-arama-button');
    await page.waitForSelector('label[title=City]');
    await page.waitForTimeout(500);

    console.log("Search for appointment page is opened " + new Date());
    if (CREDS.lastDate !== '') {
        await page.click('input[placeholder="Starting Date Please Select"]');
        await page.waitForSelector('.ant-calendar-today-btn');
        await page.click('.ant-calendar-today-btn');
        await page.click('input[placeholder="Ending Date Please Select"]')
        await page.keyboard.type(CREDS.lastDate);
        await page.keyboard.press('Enter');

        console.log("Dates are filled " + new Date());

    }

    await page.waitForSelector('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(3) > div.ant-col.ant-form-item-control-wrapper > div > span > span.ant-select-enabled');
    await page.waitForTimeout(500);
    await page.click('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(3) > div.ant-col.ant-form-item-control-wrapper > div > span > span');
    await page.waitForSelector(citySelector);
    await page.click(citySelector);

    console.log("City is filled " + new Date());

    await page.waitForSelector('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(5) > div.ant-col.ant-form-item-control-wrapper > div > span > span.ant-select-enabled')
    await page.waitForTimeout(500);
    await page.click('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(5) > div.ant-col.ant-form-item-control-wrapper > div > span > span > span')
    await page.waitForSelector(clinicSelector);
    await page.click(clinicSelector);

    console.log("Clinic is filled " + new Date());

    if (CREDS.hospital !== '') {
        await page.waitForTimeout(500);
        await page.waitForSelector('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(6) > div.ant-col.ant-form-item-control-wrapper > div > span > span > span > span')
        await page.waitForTimeout(500);
        await page.click('#vatandasApp > section > main > div > div.randevu__container > div > div.ant-card-body > div > div.ant-tabs-content.ant-tabs-content-animated.ant-tabs-top-content > div > div.rand-arama__container > form > div:nth-child(6) > div.ant-col.ant-form-item-control-wrapper > div > span > span > span > span')
        await page.waitForTimeout(500);
        const [button] = await page.$x("//span[contains(text(), '" + CREDS.hospital + "')]");
        if (button) {
            await button.click();
        }
        console.log("Hospital is filled " + new Date());
    }

    await page.waitForSelector('button[type=submit]:not([disabled])');
    await page.waitForTimeout(500);
    await page.click('button[type=submit]');
    try {
        await page.waitForSelector('.ant-list-item:nth-child(1)');
    } catch {
        console.log("appointment not taken " + new Date());
        page.close();
        browser.close();
        return
    }

    await page.waitForTimeout(1000);
    try {
        await page.waitForSelector('body > div:nth-child(10) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary', {timeout: 3000});
        await page.waitForTimeout(500);
        await page.click('body > div:nth-child(10) > div > div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-footer > button.ant-btn.ant-btn-primary');
    } catch {

    } finally {
        await page.waitForTimeout(500);
        await page.click('.ant-list-item:nth-child(1)');
    }
    await page.waitForSelector('.ant-collapse-item:not(.ant-collapse-item-disabled):nth-child(1)');
    await page.waitForTimeout(1000);
    await page.click('.ant-collapse-item:not(.ant-collapse-item-disabled):nth-child(1)');
    await page.waitForTimeout(500);
    await page.waitForSelector('button.slot-saat-button[type=button]:not([disabled])');
    await page.waitForTimeout(1000);
    await page.click('button.slot-saat-button[type=button]:not([disabled])');
    console.log("Hour is selected " + new Date());
    try {
        await page.waitForSelector('.ant-modal-confirm-btns > button[type=button]', {timeout: 3000})
        await page.waitForTimeout(500);
        await page.click('.ant-modal-confirm-btns > button[type=button]')
    } catch {

    } finally {
        await page.waitForSelector('div.ant-modal-footer > div > button.ant-btn.ant-btn-primary');
        await page.waitForTimeout(1000);
        await page.click('div.ant-modal-footer > div > button.ant-btn.ant-btn-primary');

        isAppointmentTaken = true;
        console.log("appointment taken");
        await page.waitForTimeout(10000);
        page.close();
        browser.close();
    }


}

const schedule = require('node-schedule');

schedule.scheduleJob('*/1 * * * *', function () {
    if (!isAppointmentTaken)
        main();
});