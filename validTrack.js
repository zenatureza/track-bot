String.prototype.replaceAll = function (search, replace) {
  return this.replace(new RegExp(search, 'g'), replace);
};

const alphanumericAndWhiteSpaceOnlyRegex = /[^\w\s]/gi;

function round(number, precision) {
  var factor = Math.pow(10, precision);
  var tempNumber = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;
}

const MIN_MATCHING_PERC = 0.6;

const validTrack = (searchResult, csvSearchText) => {
  const searchResultSplitted = searchResult
    .toLowerCase()
    .replaceAll(alphanumericAndWhiteSpaceOnlyRegex, '')
    .replaceAll('mp3', '')
    .split(' ');

  const csvSearchTextSplitted = csvSearchText
    .toLowerCase()
    .replaceAll(alphanumericAndWhiteSpaceOnlyRegex, '')
    .split(' ');

  const intersection = csvSearchTextSplitted.filter((element) =>
    searchResultSplitted.includes(element)
  );

  const matchingPercentage = round(
    intersection.length / csvSearchTextSplitted.length,
    1
  );

  // console.log(
  //   `\n\n\n**** MATCHING PERC FOR: \n\t${searchResult} \n\t${csvSearchText}\n\n% = ${matchingPercentage}`
  // );

  return matchingPercentage >= MIN_MATCHING_PERC;
};

module.exports = validTrack;
