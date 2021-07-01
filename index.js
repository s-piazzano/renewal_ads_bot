require("dotenv").config();
const renewalBot = require("./renewalBot");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const { is_present } = require("./renewalBot");
const { Browser } = require("puppeteer-extra/dist/puppeteer");

puppeteer.use(StealthPlugin());

//Variables
let pages;
let kijiji_counter = 0;
let subito_counter = 0;
//Const
const mailTitleXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/div[1]/div/div[2]/div[4]/div[2]/div/table/tbody/tr/td[5]/div[2]/span/span";
const folderXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[1]/div[1]/div/div/div/div[2]/div/div/div[1]/div[3]/div/div[4]/div/div/div[3]/span/a";
const kijijiBtnXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/div[1]/div/div[3]/div/table/tr/td[1]/div[2]/div[2]/div/div[3]/div/div/div/div/div/div[1]/div[2]/div[3]/div[3]/div/div[1]/table/tbody/tr/td/table[3]/tbody/tr/td/table/tbody/tr[2]/td/table/tbody/tr/td[2]/a";
const subitoBtnXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/div[1]/div/div[3]/div/table/tr/td[1]/div[2]/div[2]/div/div[3]/div/div/div/div/div/div[1]/div[2]/div[3]/div[3]/div[1]/div/div/a[2]";
const subitoRenewalBtnXpath =
  "/html/body/div[2]/div/div/div[3]/div/div/form/div[3]/div/a";
const subitoCoockieBtnXpath =
  "/html/body/div[1]/div/div/div/div/div[2]/button[2]/span";
const trashBtnXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[2]/div/div/div/div/div[1]/div[3]/div[1]/div/div[2]/div[3]/div";
const selectBtnXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[2]/div/div/div/div/div[2]/div/div[1]/div/div[3]/div[4]/div[2]/div/table/tbody/tr[1]/td[2]/div";

const services = [
  {
    url: "https://mail.google.com/mail/u/0/#inbox",
    email: process.env.EMAIL,
    psw: process.env.GMAIL_PSW,
    closePage: false,
  },

  {
    url: "https://areariservata.subito.it/login_form",
    email: process.env.EMAIL,
    psw: process.env.SUBITO_PSW,
    closePage: true,
  },
];

(async () => {
  const broswer = await puppeteer.launch({ headless: true });

  console.log("Running test...");
  //Inizializzo pages e chiudo la pagina 0 per liberare la RAM
  pages = await broswer.pages();
  await pages[0].close();
  //Effettuo il login su Gmail/Subito
  for (i = 0; i < services.length; i++) {
    await renewalBot.login(broswer, services[i]);
  }
  //Aggiorno pages
  pages = await broswer.pages();
  //Clicco sulla folder
  await renewalBot.click_xpath(pages[0], folderXpath);
  //Verifico se sono presenti email
  if (await is_present(pages[0], mailTitleXpath)) {
    //Ciclo le mail
    do {
      console.log(await renewalBot.extract_text(pages[0], mailTitleXpath));
      switch (await renewalBot.extract_text(pages[0], mailTitleXpath)) {
        case "Kijiji Italia":
          renewalBot.click_xpath(pages[0], mailTitleXpath);
          if (await renewalBot.is_present(pages[0], kijijiBtnXpath)) {
            await renewalBot.click_xpath(pages[0], kijijiBtnXpath);
            await pages[0].waitForTimeout(2000);
            pages = await broswer.pages();
            //Libero la RAM e chiudo
            await pages[1].goto("about:blank");
            await pages[1].close();
            //Cancello l'email
            await renewalBot.click_xpath(pages[0], trashBtnXpath);
            //Incremento di 1 il counter
            kijiji_counter += 1;
            console.log("Rinnovato");
          } else {
            await renewalBot.click_xpath(pages[0], trashBtnXpath);
            await pages[0].waitForTimeout(1000);
          }
          break;
        case "Subito":
          renewalBot.click_xpath(pages[0], mailTitleXpath);
          await pages[0].waitForTimeout(1000);
          if (await renewalBot.is_present(pages[0], subitoBtnXpath)) {
            console.log("entrato");
            await renewalBot.click_xpath(pages[0], subitoBtnXpath);
            await pages[0].waitForTimeout(3000);
            pages = await broswer.pages();
            await pages[1].goto("about:blank");
            await pages[1].close();
            console.log("Rinnovato!");
            subito_counter += 1;
            //Cestino l'email
            await renewalBot.click_xpath(pages[0], trashBtnXpath);
            //Aspetto 1 s.
            await pages[0].waitForTimeout(1000);
          } else {
            console.log("Bottune Subito non trovato");
            await pages[0].waitForTimeout(1000);
          }
          break;
        default:
          await renewalBot.click_xpath(pages[0], selectBtnXpath);
          await renewalBot.click_xpath(pages[0], trashBtnXpath);
          break;
      }
      //Se non sono presenti più email, esco.
    } while ((await is_present(pages[0], mailTitleXpath)) != false);
    //Print dei dati statistici
    console.log(
      `Processo Terminato!\nAnnunci Kijiji rinnovati: ${kijiji_counter}\nAnnunci Subito rinnovati: ${subito_counter}\nIn chiusura.`
    );
    await broswer.close();
  } else {
    console.log("Nessuna mail presente!\nIn chiusura.");
    await broswer.close();
  }
})();
