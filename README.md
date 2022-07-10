# Instagram Scraper For Serverless Micro's

[![NPM Downloads](https://badgen.net/npm/dm/instagrams)](https://npmjs.com/package/instagrams)
[![Version](https://badge.fury.io/js/instagrams.svg)](https://www.npmjs.com/package/instagrams)

# Installation

```bash
npm i instagrams --save
```

# Get Cookies Before Using Package!

```javascript
const Instagram = require("instagrams");

// getCookies Function Returns Cookies!
(async () => {
  const cookies = await Instagram.getCookies("username", "password");
  console.log(cookies);
  // Copy All From Console And Save It In Text File
})();
```

# Examples

- ## Fetching Account Info!

```js
const Instagram = require("instagrams");
const cookies = ""; // Paste All Cookies Here That You Got From Console!
const scraper = new Instagram(cookies);

// Fetch Account Info Using Promises!
scraper.getProfile("instagram").then((data) => {
  console.log(data);
});
// Fetch Account Info Using Async/Await!
(async () => {
  const profileData = await scraper.getProfile("instagram");
  console.log(profileData);
  // Copy All From Console And Save It In Text File
})();
```

## Thanks To [@Gimenz](https://github.com/Gimenz) For [insta-fetcher](https://www.npmjs.com/package/insta-fetcher) Library!
