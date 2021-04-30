const admin = require("firebase-admin");
const uuid = require("uuid-v4");
const fs = require("fs");
const puppeteer = require("puppeteer");
const downloader = require("image-downloader");
const url =
  "https://bloggame.net/bo-hinh-nen-pubg-4k-dep-nhat-sieu-sac-net-b89.html";
const pathFolder = "./songoku";
const loginPage = {
  email: 'input[id="email"]',
  pass: 'input[id="pass"]',
  btn: 'button[class="sqdOP yWX7d    y3zKF     "]',
  btn2: 'button[id="loginbutton"]',
};

const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "craw-image.appspot.com",
});

const bucket = admin.storage().bucket();

async function uploadFile(fileName) {
  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuid(),
    },
    contentType: "image/png",
    cacheControl: "public, max-age=31536000",
  };

  // Uploads a local file to the bucket
  await bucket
    .upload(fileName, {
      // Support for HTTP requests made with `Accept-Encoding: gzip`
      gzip: true,
      metadata: metadata,
    })
    .then(async (taskSnapshot) => {
        await taskSnapshot[0]
        .getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        })
        .then((urls) => {
          console.log(urls[0]);
        })
        .catch((error) => {
          console.log(error);
        })
    });
}

async function saveImage(urlLink) {
  try {
    await downloader
      .image({
        url: urlLink,
        dest: pathFolder,
      })
      .then(async (fileName) => {
        await uploadFile("./" + fileName.filename);
      });
  } catch (e) {
    console.log(e);
  }
}

async function main() {
  const browser = await puppeteer.launch({
    //devtools: true
  }); //
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: "load",
    timeout: 0,
  });
  // await page.waitFor(loginPage.btn);
  // await page.click(loginPage.btn);
  // await page.waitFor(loginPage.email);
  // await page.type(loginPage.email, 'lamhoangan3012@yahoo.com.vn');
  // await page.type(loginPage.pass, 'lamhoangan123cmvn');
  // await page.click(loginPage.btn2);
  if (!fs.existsSync(pathFolder)) {
    fs.mkdirSync(pathFolder);
  }

  await setTimeout(async () => {
    const imageSrcSets = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("p img"));
      const srcSetAttribute = imgs.map(
        (i) => "https://bloggame.net/" + i.getAttribute("src")
      );
      return srcSetAttribute;
    });
    await browser.close();
    for (let i = 0; i < imageSrcSets.length; i++) {
      if (imageSrcSets[i]) {
        let k = imageSrcSets[i];
        await saveImage(k);
      }
    }
  }, 20000);
}
main();
