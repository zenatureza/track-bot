// let trackName = 'Tolaria West - Diego Berrondo & Alex Efe Remix';
// let artistsNames = 'Gorkiz, Alex Efe, Diego Berrondo';

const alphanumericAndWhiteSpaceOnlyRegex = /[^\w\s]/gi;

String.prototype.replaceAll = function (search, replace) {
  return this.replace(new RegExp(search, 'g'), replace);
};

const removeArtistsFromTrackName = (trackName, artistsNames) => {
  // const trackNameSplitted = trackName
  //   .toLowerCase()
  //   .replaceAll(alphanumericAndWhiteSpaceOnlyRegex, '')
  //   .split(' ')
  //   .filter((item) => item);

  const artistsNamesSplitted = artistsNames
    .toLowerCase()
    .replaceAll(alphanumericAndWhiteSpaceOnlyRegex, '')
    .split(' ')
    .filter((item) => item);

  artistsNamesSplitted.forEach((artistNamePart) => {
    if (trackName.toLowerCase().includes(artistNamePart)) {
      // console.log(
      //   `xx artistNamePart (${artistNamePart}) present in trackname!`
      // );
      trackName = trackName.toLowerCase().replaceAll(artistNamePart, '');
    }
  });

  return trackName.replaceAll(alphanumericAndWhiteSpaceOnlyRegex, '');
};

// console.log(removeArtistsFromTrackName(trackName, artistsNames));

module.exports = removeArtistsFromTrackName;
