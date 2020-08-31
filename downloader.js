/**
 * @name Download track
 *
 * @desc Find a track by class selector, downloads the image, saves it to disk and read it again.
 *
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const validTrack = require('./validTrack');
const removeArtistsFromTrackName = require('./removeArtistsFromTrackName');

const SITE = 'zippyshare.com';
const _SEPARATOR = '_SEPARATOR_';

String.prototype.replaceAll = function (search, replace) {
  return this.replace(new RegExp(search, 'g'), replace);
};

const searchGoogle = async (searchQuery) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(0);
  await page.goto('https://google.com');

  // await page.waitForSelector('input[name=q]');
  console.log(`> searching on google for: ${searchQuery}`);

  //Finds input element with name attribue 'q' and types searchQuery
  await page.type('input[name=q]', searchQuery);

  //Finds an input with name 'btnK', after so it executes .click() DOM Method
  await page.$eval('input[name=btnK]', (button) => button.click());

  //Wait for one of the div classes to load
  await page.waitForSelector('div[id=search]');

  //Find all div elements with class 'bkWMgd'
  const searchResults = await page.$$eval('div[id=rso]', (results) => {
    //Array to hold all our results
    let data = [];

    //Iterate over all the results
    results.forEach((parent) => {
      //Check if parent has h2 with text 'Web Results'
      const ele = parent.querySelector('h2');

      //If element with 'Web Results' Title is not found  then continue to next element
      if (ele === null) {
        return;
      }

      //Check if parent contains 1 div with class 'g' or contains many but nested in div with class 'srg'
      let gCount = parent.querySelectorAll('div[class=g]');

      //If there is no div with class 'g' that means there must be a group of 'g's in class 'srg'
      if (gCount.length === 0) {
        //Targets all the divs with class 'g' stored in div with class 'srg'
        gCount = parent.querySelectorAll('div[class=srg] > div[class=g]');
      }

      //Iterate over all the divs with class 'g'
      gCount.forEach((result) => {
        //Target the title
        const title = result.querySelector(
          'div[class=rc] > div[class=r] > a >  h3'
        ).innerText;

        //Target the url
        const url = result.querySelector('div[class=rc] > div[class=r] > a')
          .href;

        //Target the description
        const description = result.querySelector(
          'div[class=rc] > div[class=s] > div > span[class=st]'
        ).innerText;

        //Add to the return Array
        data.push({ title, description, url });
      });
    });

    //Return the search results
    return data;
  });

  await browser.close();

  return searchResults;
};

const downloadTrack = async (url) => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: path.resolve(__dirname, 'downloaded'),
  });

  await page.goto(url);

  const selector = 'a[id=dlbutton]';
  if (!(await page.$(selector))) {
    console.log('\nX Download button not found\nX url: ' + url + '\n');
    return;
  }

  await page.click(selector);
  // await page.waitFor(10000);
};

/**
 * Get search texts for downloading tracks
 * @param {Strig} csvFile Csv file name
 */
const getSearchTexts = (csvFile = 'in-test.csv', callback) => {
  const csv = require('csv-parser');

  let searchTexts = [];

  console.log('\nreading csv:');

  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (row) => {
      let trackName = row['Track Name'];
      const artistName = row['Artist Name'];

      if (!trackName || !artistName) return;

      trackName = removeArtistsFromTrackName(trackName, artistName);

      const searchTextResult = `${trackName}${_SEPARATOR}${artistName}${_SEPARATOR}${SITE}`;

      searchTexts.push(searchTextResult);
    })
    .on('end', () => {
      console.log('CSV file successfully processed');

      callback(searchTexts);
    });

  // return searchTexts;
};

/**
 *
 * @param {String} searchText Search text with separators
 */
const getTrackNameFromSearchText = (searchText) => {
  return searchText
    .split(_SEPARATOR)[0]
    .replaceAll(',', '')
    .replaceAll('-', '')
    .replace(/\s\s+/g, ' ');
  // .replaceAll(' ')
};

/**
 *
 * @param {String} searchText Text with _separator
 */
const getGoogleSearchText = (searchText) => {
  const result = searchText
    .replaceAll(_SEPARATOR, ' ')
    .replaceAll(',', '')
    .replaceAll('-', '')
    .replace(/\s\s+/g, ' ')
    .toLowerCase();
  return result;
};

const downloadAllTracks = async (searchTexts) => {
  let zippyshareResults = [];

  for (const searchText of searchTexts) {
    const googleSearchText = getGoogleSearchText(searchText);
    const results = await searchGoogle(googleSearchText);

    const validResult = [...results].find((zippyshareResult) => {
      const trackName = getTrackNameFromSearchText(searchText);

      return (
        zippyshareResult.url.toLowerCase().includes(SITE) &&
        validTrack(zippyshareResult.description, trackName)
      );
    });

    if (!validResult) continue;

    // zippyshareResults.push(validResult);
    const { url, title } = validResult;
    console.log(`$ Downloading track: ${title}`);
    await downloadTrack(url);
  }

  // for (const result of zippyshareResults) {
  //   const { url, title } = result;
  //   console.log(`$ Downloading track: ${title}`);
  //   await downloadTrack(url);
  // }
};

(async () => {
  getSearchTexts('in-test.csv', downloadAllTracks);
})();
