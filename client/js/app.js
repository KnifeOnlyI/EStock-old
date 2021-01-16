const socket = new WebSocket('ws://localhost:8484')

let data = [];
let labels = [];

let ctx = document.getElementById('myChart').getContext('2d');

let lastValue = 0.0;
let cash = 0.0;
let qtyStock = 0;

let i = 0;

let btnBuy = document.querySelector('#buy');
let btnSell = document.querySelector('#sell');
let qtyInput = document.querySelector('#qty');
let pnlInput = document.querySelector('#pnl');
let ops = document.querySelector('#ops');

socket.onopen = () => {
  setInterval(() => {
    socket.send('message');
  }, 4000);
};

socket.onmessage = (event) => {
  if (data.length === 0) {
    btnBuy.disabled = false;
  }

  if (data.length < 50) {
    lastValue = parseFloat(event.data).toFixed(2);

    data.push(lastValue);
    labels.push(data.length);

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

    setPnl(cash + (lastValue * qtyStock));
    i++;
  } else {
    cash += qtyStock * lastValue;

    qtyStock = 0;
  }
}

function setPnl(value) {
  pnlInput.value = value.toFixed(2);

  if (value < 0) {
    pnlInput.style.color = 'red';
  } else if (value > 0) {
    pnlInput.style.color = 'green';
  } else {
    pnlInput.style.color = undefined;
  }
}

btnBuy.addEventListener('click', () => {
  const qty = parseInt(qtyInput.value);
  const cashBuy = lastValue * qty;

  addOp(true, lastValue, qty);

  cash -= cashBuy;
  qtyStock += qty;

  btnSell.disabled = false;
});

btnSell.addEventListener('click', () => {
  addOp(false, lastValue, qtyStock);

  cash += qtyStock * lastValue;

  qtyStock = 0;

  btnSell.disabled = true;
});

function addOp(isBuy, price, qty) {
  const newTr = document.createElement('tr');
  const newOp = document.createElement('td');
  const newTurn = document.createElement('td');
  const newQty = document.createElement('td');
  const newPrice = document.createElement('td');

  newOp.innerText = isBuy ? 'Buy' : 'Sell';
  newTurn.innerText = data.length + 1 + '';
  newQty.innerText = qty;
  newPrice.innerText = price + ' €';

  ops.appendChild(newTr);
  newTr.appendChild(newOp);
  newTr.appendChild(newTurn);
  newTr.appendChild(newQty);
  newTr.appendChild(newPrice);
}
