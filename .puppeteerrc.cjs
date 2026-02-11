const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // This tells Puppeteer to store the browser in this specific folder
  cacheDirectory: join(__dirname, ".cache", "puppeteer"),
};
