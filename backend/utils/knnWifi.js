function euclidean(a, b) {
  return Math.sqrt(
    a.reduce((sum, val, i) => sum + (val - b[i]) ** 2, 0)
  );
}

exports.predictClassroom = (inputVector, dataset, k = 3) => {
  const distances = [];

  for (const classroom in dataset) {
    dataset[classroom].forEach(sample => {
      distances.push({
        classroom,
        distance: euclidean(inputVector, sample),
      });
    });
  }

  distances.sort((a, b) => a.distance - b.distance);

  const topK = distances.slice(0, k);

  const votes = {};
  topK.forEach(d => {
    votes[d.classroom] = (votes[d.classroom] || 0) + 1;
  });

  return Object.keys(votes).reduce((a, b) =>
    votes[a] > votes[b] ? a : b
  );
};
