const cron = require("node-cron");
const express = require("express");
const nodeMailer = require("nodemailer");
const credents = require("./credents");
const data = require("./products");
const fs = require("fs");
const puppeteer = require("puppeteer");

app = express();

// Schedule tasks to be run on the server
cron.schedule("* * * * *", function() {
    console.log("-----------------------------------------");
    console.log("Runnning Cron Job");
    (async () => {

        try {
          const browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized', '--no-sandbox']
          });

          const page = await browser.newPage();
          page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'
          );
      
          const url =
            "https://www.newegg.com/DailyDeal?N=8000%20700000003&Order=RATING&PageSize=50";
          const url2 =
            "https://www.amazon.com/Huawei-Kepler-MateBook-14-Mystic/dp/B07G7GSM29/?tag=wpcentralb-20&ascsubtag=UUwpUdUnU65987YYwYg";

          await page.goto(url);
      
          await page.evaluate(() =>
            window.scrollTo(0, 2300),
          );
          await page.waitFor(5200);
          // console.log(`lastPosition: ${lastPosition}`);
      
          const products = await page.evaluate(() =>
          Array.from(document.querySelectorAll("div.item-container")).map(compact => ({
            image: compact.querySelector("a.item-img img").getAttribute("src").valueOf(),
            title: compact.querySelector(".item-info a.item-title").innerText.trim(),
            oldPrice: compact.querySelector(".item-info .item-action .price li.price-was").innerText.trim(),
            newPrice: compact.querySelector(".item-info .item-action .price li.price-current").innerText.trim(),
            changedPrice: null
          })),
          );

          await page.goto(url2);
          await page.waitFor(3000)

          const product1 = await page.evaluate(() =>
            Array.from(document.querySelectorAll("#dp-container"))
            .map(doit => ({
                image: doit.querySelector("#imgTagWrapperId img").getAttribute("src").valueOf(),
                title: doit.querySelector("span#productTitle").innerText.trim(),
                oldPrice: null,
                newPrice: doit.querySelector("#priceblock_ourprice").innerText.trim()
            }))
          )
          var allProducts = products.concat(product1);
          console.log("--------------------------------------");
          console.log(allProducts);
          // console.log(product1);
          console.log("Checking if the products have been updated...")
          const numberOfChanges = await checkIfDataChanged(data, allProducts);
          if (numberOfChanges > 0) { 
            console.log(`\t${numberOfChanges} changes detected! Updaing file now...`);
            fs.writeFile(
              './products.json',
              JSON.stringify(allProducts, null, 2),
              (err) => err ? console.error('data not written!', err) : console.log('\tData file updated!')
            );
          } else {
            console.log(`\t${numberOfChanges} change(s) detected, will check again later...`);
          }

          // await page.goto(domain);

          // await browser.close();

          // await open(domain, {app: 'chrome', wait: true});
          await browser.close();

        } catch (error) {
          console.log(error);
        }
        
      })();
});

app.listen(8000);


// Loops through the array of the newProducts and compares with oldProducts to detect changes
async function checkIfDataChanged(oldProducts, newProducts) {
  numberOfChanges = 0;
  // TODO: need to compare the length of newProducts and oldProducts. Otherwise, the check is at the 
  // wrong index position and giving false positives. (Onlt works if arrays are same length)
  if (oldProducts.length == newProducts.length) {
    for (i=0;i<newProducts.length;i++) {
      if (oldProducts[i].title == newProducts[i].title && oldProducts[i].newPrice == newProducts[i].newPrice) {
        // console.log("data did not change :(");
      } else {
        console.log("---------------------------");
        console.log("Data has been changed!");
        console.log("---------------------------");
        console.log(`${oldProducts[i].title}\n\t${newProducts[i].title}`);
        console.log(`${oldProducts[i].newPrice}\t==> \"${newProducts[i].newPrice}\"`);
        numberOfChanges++;
      }
    }
  } else {
    console.log("-------------------------------------");
    console.log("The number of products has changed");
    numberOfChanges = oldProducts.length - newProducts.length;
    if (numberOfChanges < 0) {
      numberOfChanges = Math.abs(numberOfChanges);
      console.log(`There are ${numberOfChanges} product(s) more than previous fetch`);
      return numberOfChanges;
    } else {
      console.log(`There are ${numberOfChanges} product(s) less then previous fetch`)
    }
  }
  return numberOfChanges;
}