# Renewal ADS Bot

Renewal ADS Bot helps you renew expired ads (kijiji / subito) present in your email folder

## Usage

Create .env file

```bash
nano .env
```
Insert three .env variables

```bash
EMAIL = # your email (google)
SUBITO_PSW = # subito password
GMAIL_PSW = # gmail password
```

Change Xpath of your folder

```js
const folderXpath =
  "/html/body/div[7]/div[3]/div/div[2]/div[1]/div[1]/div[1]/div/div/div/div[2]/div/div/div[1]/div[5]/div/div[4]/div/div/div[3]/span/a"; // <- change this
```

## License
[MIT](https://choosealicense.com/licenses/mit/)