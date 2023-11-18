import { rating, rate } from 'openskill';

function updateRankings(currentRankings, label, imageFilenames) {
  const ratings = {};

  if (!currentRankings[label]) {
    currentRankings[label] = {};
  }

  imageFilenames.forEach((image) => {
    const filename = image.filename;
    if (!currentRankings[label][filename]) {
      currentRankings[label][filename] = rating();
    }
    ratings[filename] = currentRankings[label][filename];
  });

  for (let i = imageFilenames.length - 1; i > 0; i--) {
    const winner = imageFilenames[i].filename;
    const loser = imageFilenames[i - 1].filename;

    const [[newWinnerRating], [newLoserRating]] = rate([[ratings[winner]], [ratings[loser]]]);

    ratings[winner] = newWinnerRating;
    ratings[loser] = newLoserRating;
  }

  imageFilenames.forEach((image) => {
    const filename = image.filename;
    currentRankings[label][filename] = ratings[filename];
  });

  console.log(currentRankings);

  return currentRankings;
}

export {
  updateRankings
};
