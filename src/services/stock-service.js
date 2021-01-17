let fetch = require('node-fetch')
let htmlParser = require('node-html-parser');

function marketIsClose() {
  const date = new Date();

  return (
    (date.getDay() === 6 || date.getDay() === 0) ||
    (date.getHours() > 17 && date.getMinutes() > 30) ||
    (date.getHours() < 9)
  );
}

function getValue(html) {
  let value = parseFloat(html.querySelector('.c-faceplate__price').childNodes[0].innerText);

  if (marketIsClose()) {
    const volatility = 0.5;

    value = value + (Math.random() * (volatility - (-volatility)) + (-volatility));
  }

  return value;
}

function getAllPromises(isinList) {
  let promises = [];

  for (const isin of isinList) {
    promises.push(fetch(`https://www.boursorama.com/cours/${isin}`)
      .then((r) => r.text())
    );
  }

  return promises;
}

async function getValueForAllIsin(isinList) {
  let value = 0.0;

  await Promise.all(getAllPromises(isinList)).then((responses) => {
    for (const response of responses) {
      value += parseFloat(getValue(htmlParser.parse(response)));
    }
  })

  return value.toFixed(2);
}

module.exports = {
  getValueForAllIsin: getValueForAllIsin,
}
