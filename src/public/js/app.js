const socket = new WebSocket('ws://localhost:8484')

let data = [];
let labels = [];

let ctx = document.getElementById('myChart').getContext('2d');

let lastValue = 0.0;
let cash = 0.0;

let toBuy = [];
let toSell = [];

let i = 0;

let btnBuy = document.querySelector('#buy');
let btnSell = document.querySelector('#sell');
let btnClose = document.querySelector('#close');
let btnRestart = document.querySelector('#restart');
let qtyInput = document.querySelector('#qty');
let pnlInput = document.querySelector('#pnl');
let cashInput = document.querySelector('#cash');
let ops = document.querySelector('#ops');
let pnlHist = document.querySelector('#pnlHist');

let inGame = true;

socket.onopen = () => {
  setInterval(() => {
    socket.send('message');
  }, 4000);
};

socket.onmessage = (event) => {
  if (data.length === 0) {
    btnBuy.disabled = false;
    btnSell.disabled = false;
  }

  if (data.length < 5) {
    lastValue = parseFloat(event.data).toFixed(2);

    if (data.length > 1) {
      addPnlHist();
    }

    data.push(lastValue);
    labels.push(data.length);

    updateChart();

    setPnl();
    i++;
  } else if (inGame) {
    addPnlHist();
    close();
    setPnl();
    setCash();

    btnBuy.disabled = true;
    btnSell.disabled = true;
    cashInput.hidden = false;

    inGame = false;
  }
}

function close() {
  //addOp(undefined, undefined, undefined);

  for (const opBuy of toBuy) {
    cash -= opBuy.qty * lastValue;
    addOp(true, lastValue, opBuy.qty, true);
  }

  for (const opSell of toSell) {
    cash += opSell.qty * lastValue;
    addOp(false, lastValue, opSell.qty, true);
  }

  toBuy = [];
  toSell = [];

  btnClose.disabled = true;
}

function setPnl() {
  let pnl = 0.0;

  for (const opBuy of toBuy) {
    pnl += (opBuy.qty * opBuy.value) - (opBuy.qty * lastValue);
  }

  for (const opSell of toSell) {
    pnl += (opSell.qty * lastValue) - (opSell.qty * opSell.value);
  }

  pnlInput.value = pnl.toFixed(2);

  if (pnl < 0) {
    pnlInput.style.color = 'red';
  } else if (pnl > 0) {
    pnlInput.style.color = 'green';
  } else {
    pnlInput.style.color = '';
  }
}

function setCash() {
  cashInput.value = cash.toFixed(2);

  if (cash < 0) {
    cashInput.style.color = 'red';
  } else if (cash > 0) {
    cashInput.style.color = 'green';
  } else {
    cashInput.style.color = '';
  }
}

function updateChart() {
  let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Values',
        lineTension: 0,
        data: data,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
          }
        }]
      }
    },
    maintainAspectRatio: false,
  });

  chart.update(0);
}

btnBuy.addEventListener('click', () => {
  const qty = Math.abs(parseInt(qtyInput.value));

  toSell.push({qty: qty, value: lastValue})

  cash -= (qty * lastValue)

  addOp(true, lastValue, qty);

  btnClose.disabled = false;

  setPnl();
});

btnSell.addEventListener('click', () => {
  const qty = Math.abs(parseInt(qtyInput.value));

  toBuy.push({qty: qty, value: lastValue})

  cash += (qty * lastValue)

  addOp(false, lastValue, qty);

  btnClose.disabled = false;

  setPnl();
});

btnClose.addEventListener('click', () => {
  close();

  btnClose.disabled = true;
});

btnRestart.addEventListener('click', () => {
  data = [];
  labels = [];
  cash = 0;
  btnClose.disabled = true;
  cashInput.hidden = true;
  inGame = true;
  setPnl();
  removeAllOpAndHist();
  updateChart();
});

function addOp(isBuy, price, qty, isClose) {
  const newTr = document.createElement('tr');
  const newOp = document.createElement('td');
  const newTurn = document.createElement('td');
  const newQty = document.createElement('td');
  const newPrice = document.createElement('td');

  newOp.innerText = isBuy && qty > 0 ? 'Buy' : 'Sell';
  newTurn.innerText = data.length + '';
  newQty.innerText = qty < 0 ? Math.abs(qty) : qty;
  newPrice.innerText = price + ' €';

  if (isClose) {
    newTr.style.background = 'gray';
    newTr.style.color = 'white';
  }

  ops.appendChild(newTr);
  newTr.appendChild(newOp);
  newTr.appendChild(newTurn);
  newTr.appendChild(newQty);
  newTr.appendChild(newPrice);
}

function addPnlHist() {
  const newTr = document.createElement('tr');
  const newTurn = document.createElement('td');
  const newPnl = document.createElement('td');

  newTurn.innerText = data.length + '';
  newPnl.innerText = pnlInput.value;
  newPnl.style.color = pnlInput.style.color;

  pnlHist.appendChild(newTr);
  newTr.appendChild(newTurn);
  newTr.appendChild(newPnl);
}

function removeAllOpAndHist() {
  ops.innerHTML = '';
  pnlHist.innerHTML = '';
}
