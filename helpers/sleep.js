function sleep() {
    return new Promise((resolve) => {
      let timeInMs = (Math.random() * (3000 - 1000 + 1)) + 2200;
      setTimeout(resolve, timeInMs);
  
      console.log(timeInMs)
    });
  }

module.exports = {
    sleep,
};