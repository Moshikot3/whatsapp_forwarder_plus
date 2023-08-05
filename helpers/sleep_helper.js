function getRandomDelay() {
  return Math.floor(Math.random() * (3000 - 1000 + 1)) + 2200;
}

function sleep(delay) {
  if (typeof delay === 'number') {
    // Sleep for the specified duration
    return new Promise((resolve) => {
      setTimeout(resolve, delay);
      console.log(delay);
    });
  } else {
    // Sleep for a random duration
    return new Promise((resolve) => {
      const timeInMs = getRandomDelay();
      setTimeout(resolve, timeInMs);
      console.log(timeInMs);
    });
  }
}


module.exports = {
    sleep,
};