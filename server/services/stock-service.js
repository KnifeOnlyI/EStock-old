let fetch = require('node-fetch')
let htmlParser = require('node-html-parser');

function getValue(html) {
  const volatility = 0.5;
  let value = parseFloat(html.querySelector('.c-faceplate__price').childNodes[0].innerText);

  //return value;
  return value + (Math.random() * (volatility - (-volatility)) + (-volatility));
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
