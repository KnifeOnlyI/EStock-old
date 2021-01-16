const WebSocket = require('ws');
const stockService = require('./services/stock-service')

const ws = new WebSocket.Server({port: 8484});

let isinList = [
  'FR0000131104', // BNP Paribas
  'FR0000130809', // Société générale
  'FR0000045072', // Crédit agricole
  'DE000CBK1001', // Commerzbank
  'DE0005140008', // Deutsche bank
  'FR0000120685', // Natixis
];

let value = 0.0;

setInterval(() => {
  stockService.getValueForAllIsin(isinList).then((v) => {
    value = v;
  });
}, 4000);

ws.on('connection', (ws, res) => {
  ws.on('message', (data) => {
    ws.send(value + '');
  });
});
