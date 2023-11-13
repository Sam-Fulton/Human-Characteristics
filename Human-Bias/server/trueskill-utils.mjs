import { Rating, quality_1vs1, rate_1vs1 } from 'ts-trueskill';

function updateRankings(currentRankings, label, imageFilenames) {
    const ratings = {};

    if (!currentRankings[label]) {
      currentRankings[label] = {};
    }

  imageFilenames.forEach((image) => {
      const filename = image.filename;
      if (!currentRankings[label][filename]) {
          currentRankings[label][filename] = 0;
      }
  });

    imageFilenames.forEach((image) => {
        const filename = image.filename;
        ratings[filename] = new Rating(0, 1);
    });

    for (let i = imageFilenames.length - 1; i > 0; i--) {
        const winner = imageFilenames[i].filename;
        const loser = imageFilenames[i - 1].filename;

        const quality = quality_1vs1(ratings[winner], ratings[loser]);

        const K = 32;

        const [newWinnerRating, newLoserRating] = rate_1vs1(ratings[winner], ratings[loser], K, quality);

        ratings[winner] = newWinnerRating;
        ratings[loser] = newLoserRating;
    }

    imageFilenames.forEach((image) => {
        const filename = image.filename;
        currentRankings[label][filename] = ratings[filename].mu;
    });

    console.log(currentRankings);

    return currentRankings;
}

export {
    updateRankings
};
