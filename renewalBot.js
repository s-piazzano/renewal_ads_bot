const renewalBot = {
  login: async (broswer, service) => {
    
      const page = await broswer.newPage();
      await page.goto(service.url);
      await page.waitForSelector(`input[type='email']`);
      await page.type(`input[type='email']`, service.email, { delay: 30 });
      if (
        (await page.waitForSelector(`input[type='password']`, {visible: true, timeout: 1000}).catch(() => false)) == false
      ) {
        await page.keyboard.press("Enter");
        await page.waitForTimeout(2000);
      }
      await page.type(`input[type='password']`, service.psw, { delay: 30 });
      await page.keyboard.press("Enter");
      console.log(`Login su ${service.url} effettuato`);
      //Verifico closePage e chiudo
      if (service.closePage) {
        await page.waitForTimeout(2000);
        await page.close();
      }
      await page.waitForTimeout(2000);
  },
  is_present: async (page, xpath) => {
    if (
      await page
        .waitForXPath(xpath, { visible: true, timeout: 4000 })
        .catch(() => false)
    ) {
      return true;
    } else {
      return false;
    }
  },
  click_xpath: async (page, xpath) => {
    await page.waitForXPath(xpath);
    const point = await page.$x(xpath);
    await point[0].click();
    await page.waitForTimeout(1000);
  },
  extract_text: async (page, xpath) => {
    await page.waitForXPath(xpath);
    const point = await page.$x(xpath);
    const text = await point[0].getProperty("textContent");
    return text._remoteObject.value;
  }
};

module.exports = renewalBot;