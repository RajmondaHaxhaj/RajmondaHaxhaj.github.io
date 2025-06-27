// Select elements
const expenseForm = document.getElementById('expense-form');
const descInput = document.getElementById('expense-desc');
const amountInput = document.getElementById('expense-amount');
const categorySelect = document.getElementById('expense-category');
const dateInput = document.getElementById('expense-date');
const expensesList = document.getElementById('expenses-list');

const filterCategory = document.getElementById('filter-category');
const filterMonth = document.getElementById('filter-month');
const clearFiltersBtn = document.getElementById('clear-filters');

let expenses = [];

// Load expenses from localStorage or empty array
function loadExpenses() {
  const saved = localStorage.getItem('expenses');
  expenses = saved ? JSON.parse(saved) : [];
}

// Save expenses to localStorage
function saveExpenses() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// Render expenses list with optional filters
function renderExpenses() {
  expensesList.innerHTML = '';

  // Apply filters
  let filtered = expenses;
  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(e => e.category === filterCategory.value);
  }
  if (filterMonth.value) {
    filtered = filtered.filter(e => e.date.startsWith(filterMonth.value));
  }

  if (filtered.length === 0) {
    expensesList.innerHTML = '<li>No expenses found.</li>';
    updateCharts(filtered);
    return;
  }

  filtered.forEach((expense, index) => {
    const li = document.createElement('li');

    const infoDiv = document.createElement('div');
    infoDiv.className = 'expense-info';

    const desc = document.createElement('div');
    desc.className = 'expense-desc';
    desc.textContent = expense.description;
    infoDiv.appendChild(desc);

    const meta = document.createElement('div');
    meta.className = 'expense-meta';
    meta.textContent = `${expense.category} • $${expense.amount.toFixed(2)} • ${expense.date}`;
    infoDiv.appendChild(meta);

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = 'Delete';
    delBtn.title = 'Delete expense';
    delBtn.addEventListener('click', () => {
      expenses.splice(expenses.indexOf(expense), 1);
      saveExpenses();
      renderExpenses();
    });

    li.appendChild(infoDiv);
    li.appendChild(delBtn);
    expensesList.appendChild(li);
  });

  updateCharts(filtered);
}

// Add new expense handler
expenseForm.addEventListener('submit', e => {
  e.preventDefault();

  const description = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categorySelect.value;
  const date = dateInput.value;

  if (!description || !amount || !category || !date) {
    alert('Please fill all fields correctly.');
    return;
  }

  expenses.push({
    description,
    amount,
    category,
    date,
  });

  saveExpenses();
  renderExpenses();
  expenseForm.reset();
});

// Filter controls handlers
filterCategory.addEventListener('change', renderExpenses);
filterMonth.addEventListener('change', renderExpenses);
clearFiltersBtn.addEventListener('click', () => {
  filterCategory.value = 'all';
  filterMonth.value = '';
  renderExpenses();
});

// CHARTS SETUP
let categoryChart, monthlyChart;

function createCategoryChart(data) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          '#f9d423',
          '#ee0979',
          '#667eea',
          '#764ba2',
          '#ff6a00',
        ],
      }],
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {color: '#f0f0f5', font: {size: 14}}
        },
      }
    }
  });
}

function createMonthlyChart(data) {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChart) monthlyChart.destroy();

  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Monthly Spending ($)',
        data: Object.values(data),
        backgroundColor: '#f9d423',
        borderRadius: 8,
      }],
    },
    options: {
      scales: {
        x: {ticks: {color: '#f0f0f5'}},
        y: {ticks: {color: '#f0f0f5'}, beginAtZero: true}
      },
      plugins: {
        legend: {display: false}
      }
    }
  });
}

function updateCharts(filteredExpenses) {
  // Category data
  const categoryTotals = {};
  filteredExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Monthly data (last 12 months)
  const monthlyTotals = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    monthlyTotals[key] = 0;
  }

  filteredExpenses.forEach(e => {
    if (e.date.slice(0, 7) in monthlyTotals) {
      monthlyTotals[e.date.slice(0, 7)] += e.amount;
    }
  });

  createCategoryChart(categoryTotals);
  createMonthlyChart(monthlyTotals);
}

// Initialize app
loadExpenses();
renderExpenses();
