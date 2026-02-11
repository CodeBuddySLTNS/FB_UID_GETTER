const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/fbuid", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.json({ success: false, message: "URL parameter is required" });
  }

  const uid = await getFbUid(url);
  if (uid) {
    res.json({ success: true, uid });
  } else {
    res.json({
      success: false,
      message:
        "Profile not found. Your profile might be private or the URL is incorrect.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

async function getFbUid(url) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log(`Navigating to ${url}...`);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const uid = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="al:android:url"]');
      if (meta) {
        const content = meta.getAttribute("content");
        const match = content.match(/fb:\/\/profile\/(\d+)/);
        if (match) return match[1];
      }

      const html = document.body.innerText;
      const matchID =
        document.documentElement.innerHTML.match(/"userID":"(\d+)"/);
      if (matchID) return matchID[1];

      return null;
    });

    await browser.close();
    return uid;
  } catch (error) {
    console.error("Error fetching UID:", error);
    return null;
  }
}
