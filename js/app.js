// TODO - Add edit-item functionality
// TODO - Refactor


const totalBalanceEl = document.getElementById('total-balance');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const formEl = document.getElementById('form');
const nameInputEl = document.getElementById('name-input');
const amountInputEl = document.getElementById('amount-input');
const transactionContainerEl = document.getElementById('transaction-container');
const transactionListEl = document.getElementById('transaction-list');
const notificationEl = document.getElementById('notification-popup');
const confirmationEl = document.getElementById('confirmation-popup');

let transactions = localStorage.getItem('transactions') !== null 
                    ? JSON.parse(localStorage.getItem('transactions'))
                    : [];

// =====================
// ===== FUNCTIONS =====
// =====================

const storeTransactions = () => {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

const capitalize = (string) => string[0].toUpperCase().concat(string.slice(1).toLowerCase());

const getId = () => Math.floor(Math.random() * 10**9);

const getDate = () => {
  const date = new Date;
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
}

const clearFormInputFields = () => {
  nameInputEl.value = '';
  amountInputEl.value = '';
}

const deselectFormInputField = (e) => {
  if (e.keyCode === 13) e.target.blur();
}

const showNotification = (msg) => {
  document.getElementById('notification-message').textContent = msg;
  notificationEl.classList.add('show');
  setTimeout(() => notificationEl.classList.remove('show'), 3000);
}

const validateForm = () => {
  nameInputEl.style.boxShadow = 'var(--box-shadow-marking)';
  amountInputEl.style.boxShadow = 'var(--box-shadow-marking)';
  nameInputEl.addEventListener('click', () => {
    nameInputEl.style.boxShadow = 'var(--box-shadow-item)';
  });
  amountInputEl.addEventListener('click', () => {
    amountInputEl.style.boxShadow = 'var(--box-shadow-item)';
  });
}

const addNewTransaction = (e) => {
  e.preventDefault();
  let transaction;
  if (!nameInputEl.value.trim() || !amountInputEl.value.trim()) {
    showNotification("Please fill in both input fields");
    validateForm();
    return;
  } else {
    transaction = {
      id: getId(),
      date: getDate(),
      name: capitalize(nameInputEl.value),
      amount: Number(amountInputEl.value),
      isMarked: false
    }
  }
  transactions.push(transaction);
  populateTransactionList(transaction);
  clearFormInputFields();
  updateTransactionValues();
  storeTransactions(transaction);
}

const populateTransactionList = (transaction) => {
  const li = document.createElement('li');
  const operatorType = transaction.amount < 0 ? 'negative' : 'positive';
  const markedItem = transaction.isMarked ? 'mark-transaction-item' : '';
  li.className = `transaction-item ${operatorType} ${markedItem}`;
  li.dataset.id = transaction.id;
  li.innerHTML = 
  `
    <header class="transaction-item__header">
      <span class="li-toggle-btn" id="li-toggle-btn">></span>
      <span class="item-name" id="item-name">${capitalize(transaction.name)}</span>
      <span class="item-date" id="item-date">${transaction.date}</span>
      <span class="item-amount" id="item-amount">${formatCurrency(transaction.amount)}</span>
    </header>
    <div id="transaction-item__content" class="transaction-item__content">
      <div class="item-info" id="item-info">
        <ul>
        <li><span>Item name:</span><span>${capitalize(transaction.name)}</span></li>
        <li><span>Transaction date:</span><span>${transaction.date}</span></li>
        <li><span>Transaction amount:</span><span>${formatCurrency(transaction.amount)}</span></li>
          <li><span>Previous occasions:</span><span>none</span></li>
        </ul>
      </div>
      <div class="buttons">
        <button class="mark-item-btn ${
          transaction.isMarked ? 'mark-transaction-item' : ''
        }"><i class="fa-solid fa-marker"></i><span>Mark</span></button>
        <button class="edit-item-btn"><i class="fa-regular fa-pen-to-square"></i><span>Edit</span></button>
        <button class="delete-item-btn"><i class="fa-regular fa-trash-can"></i><span>Remove</span></button>
      </div>
    </div>
  `
  transactionListEl.prepend(li);
}

const formatCurrency = (currency) => {
  return new Intl.NumberFormat("en-US", { 
    style: "currency", "currency":"USD" }).format(currency);

}


const updateTransactionValues = () => {
  const amounts = transactions.map(transaction => transaction.amount);
  const balance = amounts.reduce((acc, val) => acc += val, 0);
  const income = amounts
                  .filter(amount => amount > 0)
                  .reduce((acc, val) => acc += val, 0);
  const expense = Math.abs(amounts
                    .filter(amount => amount < 0)
                    .reduce((acc, val) => acc += val, 0));

  totalBalanceEl.style.color = `var(--clr-${balance > 0 
                                ? 'positive' : balance < 0 
                                ? 'negative' : 'light'})`;
  totalBalanceEl.innerText = formatCurrency(balance);
  totalIncomeEl.textContent = `+ ${formatCurrency(income)}`;
  totalExpenseEl.textContent = `- ${formatCurrency(expense)}`;
}

const showConfirmClearList = () => {
  confirmationEl.classList.add('show');
}

const hideConfirmClearList = () => {
  confirmationEl.classList.remove('show');
}

const clearTransactionList = (e) => {
  if (e.target.parentElement.classList.contains('clear-transactions-btn') 
      && transactions.length > 0) {
    showConfirmClearList();
    const btns = document.getElementById('confirmation-btns');
    btns.addEventListener('click', (e) => {
      if (e.target.textContent === 'Yes') {
        hideConfirmClearList()
        transactions = [];
        init();
      } else if (e.target.textContent === 'No') {
        hideConfirmClearList()
        return;
      }
    });
  }
}

const expandTransactionItem = (e) => {
  if (e.target.classList.contains('li-toggle-btn')) {
    const itemContent = e.target.parentElement.nextElementSibling;
    itemContent.classList.toggle('expand-section');
  }
}

const markTransactionItem = (e) => {
    if (e.target.classList.contains('mark-item-btn') ||
      e.target.parentElement.classList.contains('mark-item-btn')) {

    let id;

    e.path.forEach(el => {

      if (el.classList && el.classList.contains('transaction-item')) {
        id = el.dataset.id;
        transactions.forEach(transaction => {
          if (transaction.id === Number(id) && transaction.isMarked) {
            transaction.isMarked = false;
          } else if ((transaction.id === Number(id) && !transaction.isMarked)) {
            transaction.isMarked = true;
          } 
        })
        storeTransactions();
        updateMarkings()
      }
    })
  }
}

const editTransactionItem = (e) => {
  // if (e.target.classList.contains('edit-item-btn') ||
  //     e.target.parentElement.classList.contains('edit-item-btn')) {

    
  //   let id;
  //   e.path.forEach(el => {
  //     el.classList && el.classList.contains('transaction-item') && (id = el.dataset.id);
  //   })



  // }
}

const removeTransactionItem = (e) => {
  if (e.target.classList.contains('delete-item-btn') ||
      e.target.parentElement.classList.contains('delete-item-btn')) {

    let id;

    e.path.forEach(el => {
      el.classList && el.classList.contains('transaction-item') && (id = el.dataset.id);
    })
    transactions = transactions.filter(transaction => transaction.id !== Number(id));
    init();

  }
}

const updateMarkings = () => {
  transactions.forEach(transaction => {
    let listItem;
    let markBtn;
    Array.from(transactionListEl.children).forEach(li => {
      if (transaction.id === Number(li.dataset.id)) {
        listItem = li
        markBtn = li.children[1].children[1].children[0];
      }
    });
    if (transaction.isMarked === true) {
      listItem.classList.add('mark-transaction-item');
      markBtn.classList.add('mark-transaction-item');
    } else if (transaction.isMarked === false) {
      listItem.classList.remove('mark-transaction-item');
      markBtn.classList.remove('mark-transaction-item');
    }
  });
}



const init = () => {
  if (transactions === null) return;
  transactionListEl.innerHTML = '';
  transactions.forEach(populateTransactionList);
  updateMarkings();
  updateTransactionValues();
  storeTransactions();
}

// ===========================
// ===== EVENT LISTENERS =====
// ===========================

formEl.addEventListener('submit', addNewTransaction);
nameInputEl.addEventListener('keyup', deselectFormInputField);
amountInputEl.addEventListener('keyup', deselectFormInputField);
transactionContainerEl.addEventListener('click', (e) => {
  clearTransactionList(e);
  expandTransactionItem(e);
  markTransactionItem(e);
  editTransactionItem(e);
  removeTransactionItem(e);
});
document.addEventListener('DOMContentLoaded', init);