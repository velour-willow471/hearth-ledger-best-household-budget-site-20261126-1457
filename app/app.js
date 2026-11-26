// Hearth Ledger — the household budget app itself.
//
// One page, five hash-routed views: Dashboard, Transactions, Budgets, Goals
// and Reports. All state lives in `state`, is seeded from data.js, and is
// saved to localStorage on every change, so an added transaction or an edited
// budget survives a reload. A "Reset to the November ledger" button on the
// Transactions page restores the original figures.

import { HOUSEHOLD, CATEGORIES, TRANSACTIONS, GOALS, HISTORY, TIPS } from "./data.js";
import { money, drawDonut, drawMonthBars, drawBudgetBars } from "./charts.js";

const STORE_KEY = "hearth-ledger-v1";
const ROUTES = [
  { hash: "#/", label: "Dashboard" },
  { hash: "#/transactions", label: "Transactions" },
  { hash: "#/budgets", label: "Budgets" },
  { hash: "#/goals", label: "Goals" },
  { hash: "#/reports", label: "Reports" },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && Array.isArray(saved.transactions) && Array.isArray(saved.categories)) {
      return saved;
    }
  } catch (err) {
    // A damaged save is ignored; the November ledger is the fallback.
  }
  return {
    transactions: clone(TRANSACTIONS),
    categories: clone(CATEGORIES),
    goals: clone(GOALS),
  };
}

let state = loadState();

// Charts on the current page, redrawn when the window is resized. The list
// is rebuilt on every route change, so a resize never touches a canvas that
// has been replaced by another page.
let liveCharts = [];

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function categoryById(id) {
  return state.categories.find((c) => c.id === id);
}

function incomeTotal() {
  return state.transactions
    .filter((t) => t.kind === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

function spentByCategory() {
  const totals = {};
  for (const c of state.categories) totals[c.id] = 0;
  for (const t of state.transactions) {
    if (t.kind === "expense" && totals[t.category] !== undefined) {
      totals[t.category] += t.amount;
    }
  }
  return totals;
}

function spendingTotal() {
  // Spending is every expense except the savings transfer.
  return state.transactions
    .filter((t) => t.kind === "expense" && t.category !== "savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

function savingsTransferred() {
  return state.transactions
    .filter((t) => t.kind === "expense" && t.category === "savings")
    .reduce((sum, t) => sum + t.amount, 0);
}

function budgetTotal() {
  return state.categories.reduce((sum, c) => sum + c.budget, 0);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nav(activeHash) {
  return (
    "<nav class=\"nav\" aria-label=\"Sections\">" +
    ROUTES.map(
      (r) =>
        `<a href="${r.hash}"${r.hash === activeHash ? ' aria-current="page"' : ""}>${r.label}</a>`,
    ).join("") +
    "</nav>"
  );
}

function header(activeHash) {
  return (
    `<header class="site-header"><div class="wrap header-inner">` +
    `<a class="brand" href="#/"><span class="brand-mark" aria-hidden="true">⌂</span> Hearth Ledger</a>` +
    nav(activeHash) +
    `</div></header>`
  );
}

function footer() {
  return (
    `<footer class="site-footer"><div class="wrap">` +
    `<p><strong>${escapeHtml(HOUSEHOLD.name)}</strong> · ${escapeHtml(HOUSEHOLD.members)} · ${escapeHtml(HOUSEHOLD.month)}</p>` +
    `<p>All figures are this household's own November 2026 ledger. Your edits are saved in this browser only — nothing leaves your device.</p>` +
    `</div></footer>`
  );
}

function renderPage(activeHash, inner) {
  liveCharts = [];
  const app = document.getElementById("app");
  app.innerHTML = header(activeHash) + `<main class="wrap">${inner}</main>` + footer();
  window.scrollTo(0, 0);
}

// ---------- Dashboard ----------

function dashboardView() {
  const income = incomeTotal();
  const spent = spendingTotal();
  const saved = savingsTransferred();
  const left = income - spent - saved;
  const actuals = spentByCategory();
  const slices = state.categories
    .filter((c) => c.id !== "savings" && actuals[c.id] > 0)
    .map((c) => ({ label: c.name, value: actuals[c.id], color: c.color }));
  const over = state.categories.filter((c) => actuals[c.id] > c.budget);
  const recent = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const topCats = [...state.categories]
    .filter((c) => c.id !== "savings")
    .map((c) => ({ ...c, actual: actuals[c.id] }))
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 5);

  renderPage(
    "#/",
    `<section class="hero">
       <h1>${escapeHtml(HOUSEHOLD.month)} budget</h1>
       <p class="lede">${escapeHtml(HOUSEHOLD.name)} — ${escapeHtml(HOUSEHOLD.members)}. ${escapeHtml(HOUSEHOLD.note)}</p>
     </section>
     <section class="cards" aria-label="Month at a glance">
       <div class="card"><span class="card-label">Income</span><strong class="card-value">${money(income)}</strong><span class="card-sub">Take-home pay, November</span></div>
       <div class="card"><span class="card-label">Spent</span><strong class="card-value">${money(spent)}</strong><span class="card-sub">All spending except savings</span></div>
       <div class="card"><span class="card-label">To savings</span><strong class="card-value">${money(saved)}</strong><span class="card-sub">${((saved / income) * 100).toFixed(1)}% of income</span></div>
       <div class="card highlight"><span class="card-label">Left over</span><strong class="card-value">${money(left)}</strong><span class="card-sub">Unspent at 30 November</span></div>
     </section>
     ${over.length ? `<p class="alert" role="alert">Over budget this month: ${over.map((c) => `${escapeHtml(c.name)} by ${money(actuals[c.id] - c.budget)}`).join("; ")}. <a href="#/budgets">See budgets →</a></p>` : ""}
     <section class="two-col">
       <div class="panel">
         <h2>Where the money went</h2>
         <canvas id="donut" class="chart donut" width="640" height="360" role="img" aria-label="Donut chart of November spending by category"></canvas>
         <ul class="legend-list">${slices.map((s) => `<li><span class="swatch" style="background:${s.color}"></span>${escapeHtml(s.label)} — ${money(s.value)}</li>`).join("")}</ul>
       </div>
       <div class="panel">
         <h2>Biggest spending</h2>
         <ol class="ranked">${topCats.map((c) => `<li><span>${escapeHtml(c.name)}</span><span>${money(c.actual)} <small>of ${money(c.budget)} budgeted</small></span></li>`).join("")}</ol>
         <h2>Latest transactions</h2>
         <ul class="mini-list">${recent.map((t) => `<li><span>${escapeHtml(t.date.slice(5))} · ${escapeHtml(t.description)}</span><span class="${t.kind}">${t.kind === "income" ? "+" : "−"}${money(t.amount)}</span></li>`).join("")}</ul>
         <p><a class="button" href="#/transactions">All transactions →</a></p>
       </div>
     </section>
     <section class="panel">
       <h2>How this household keeps to its budget</h2>
       <div class="tips">${TIPS.map((tip) => `<article><h3>${escapeHtml(tip.title)}</h3><p>${escapeHtml(tip.body)}</p></article>`).join("")}</div>
     </section>`,
  );
  const canvas = document.getElementById("donut");
  drawDonut(canvas, slices, "spent in Nov");
  liveCharts.push({ canvas, draw: () => drawDonut(canvas, slices, "spent in Nov") });
}

// ---------- Transactions ----------

function transactionRow(t) {
  const cat = categoryById(t.category);
  return (
    `<tr>
       <td>${escapeHtml(t.date)}</td>
       <td>${escapeHtml(t.description)}</td>
       <td>${cat ? escapeHtml(cat.name) : "Income"}</td>
       <td class="amount ${t.kind}">${t.kind === "income" ? "+" : "−"}${money(t.amount)}</td>
       <td class="row-actions">
         <button type="button" data-edit="${t.id}">Edit</button>
         <button type="button" data-delete="${t.id}">Delete</button>
       </td>
     </tr>`
  );
}

function transactionsView() {
  const sorted = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  renderPage(
    "#/transactions",
    `<section class="hero">
       <h1>Transactions</h1>
       <p class="lede">Every dollar in and out in ${escapeHtml(HOUSEHOLD.month)} — ${state.transactions.length} entries. Add, edit or delete any of them and every total on the site updates.</p>
     </section>
     <section class="panel">
       <form id="tx-filter" class="filter-row">
         <label>Category
           <select id="filter-category">
             <option value="">All categories</option>
             <option value="income">Income</option>
             ${state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
           </select>
         </label>
         <label>Search
           <input id="filter-search" type="search" placeholder="e.g. market, fuel, rent" />
         </label>
         <button type="button" id="filter-clear">Clear filters</button>
       </form>
       <div class="table-wrap"><table>
         <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead>
         <tbody id="tx-body">${sorted.map(transactionRow).join("")}</tbody>
       </table></div>
       <p id="tx-count" class="muted">${sorted.length} transactions shown · Income ${money(incomeTotal())} · Outgoings ${money(spendingTotal() + savingsTransferred())}</p>
     </section>
     <section class="panel">
       <h2>Add a transaction</h2>
       <form id="tx-add" class="form-grid">
         <label>Date <input name="date" type="date" value="2026-11-30" required /></label>
         <label>Description <input name="description" type="text" placeholder="What was it for?" maxlength="80" required /></label>
         <label>Category
           <select name="category">
             ${state.categories.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("")}
             <option value="income">Income</option>
           </select>
         </label>
         <label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required /></label>
         <label>Type
           <select name="kind"><option value="expense">Expense</option><option value="income">Income</option></select>
         </label>
         <button type="submit">Add transaction</button>
       </form>
       <p id="tx-message" class="form-message" role="status"></p>
     </section>
     <section class="panel">
       <h2>Start over</h2>
       <p>Restore the household's original November ledger, undoing every edit you made in this browser.</p>
       <button type="button" id="tx-reset">Reset to the November ledger</button>
     </section>`,
  );

  const body = document.getElementById("tx-body");
  const count = document.getElementById("tx-count");
  const categoryFilter = document.getElementById("filter-category");
  const searchFilter = document.getElementById("filter-search");

  function applyFilters() {
    const cat = categoryFilter.value;
    const query = searchFilter.value.trim().toLowerCase();
    const shown = sorted.filter((t) => {
      if (cat && t.category !== cat) return false;
      if (query && !`${t.description} ${t.date}`.toLowerCase().includes(query)) return false;
      return true;
    });
    body.innerHTML = shown.map(transactionRow).join("") || `<tr><td colspan="5">No transactions match those filters.</td></tr>`;
    count.textContent = `${shown.length} of ${sorted.length} transactions shown`;
  }
  categoryFilter.addEventListener("change", applyFilters);
  searchFilter.addEventListener("input", applyFilters);
  document.getElementById("filter-clear").addEventListener("click", () => {
    categoryFilter.value = "";
    searchFilter.value = "";
    applyFilters();
  });

  body.addEventListener("click", (event) => {
    const editId = event.target.getAttribute("data-edit");
    const deleteId = event.target.getAttribute("data-delete");
    if (deleteId) {
      state.transactions = state.transactions.filter((t) => t.id !== deleteId);
      saveState();
      transactionsView();
      return;
    }
    if (editId) {
      const t = state.transactions.find((x) => x.id === editId);
      if (!t) return;
      const amount = window.prompt(`New amount for “${t.description}” (current ${money(t.amount)}):`, t.amount.toFixed(2));
      if (amount === null) return;
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) {
        window.alert("Enter an amount above $0.");
        return;
      }
      t.amount = Math.round(value * 100) / 100;
      saveState();
      transactionsView();
    }
  });

  document.getElementById("tx-add").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);
    const amount = Math.round(Number(data.get("amount")) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      document.getElementById("tx-message").textContent = "Enter an amount above $0.";
      return;
    }
    const category = String(data.get("category"));
    const kind = String(data.get("kind"));
    state.transactions.push({
      id: "t" + Date.now().toString(36),
      date: String(data.get("date")),
      description: String(data.get("description")).trim(),
      category,
      amount,
      kind: category === "income" ? "income" : kind,
    });
    saveState();
    document.getElementById("tx-message").textContent = "Added. Totals across the site now include it.";
    transactionsView();
  });

  document.getElementById("tx-reset").addEventListener("click", () => {
    if (!window.confirm("Reset to the original November ledger? Your edits will be lost.")) return;
    state = { transactions: clone(TRANSACTIONS), categories: clone(CATEGORIES), goals: clone(GOALS) };
    saveState();
    transactionsView();
  });
}

// ---------- Budgets ----------

function budgetsView() {
  const actuals = spentByCategory();
  const rows = state.categories.map((c) => {
    const actual = actuals[c.id];
    const left = c.budget - actual;
    const pct = c.budget > 0 ? Math.round((actual / c.budget) * 100) : 0;
    return { ...c, actual, left, pct, over: actual > c.budget };
  });
  renderPage(
    "#/budgets",
    `<section class="hero">
       <h1>Budgets</h1>
       <p class="lede">Planned vs actual for ${escapeHtml(HOUSEHOLD.month)}. Budgeted ${money(budgetTotal())} of ${money(incomeTotal())} income; actual outgoings ${money(spendingTotal() + savingsTransferred())}.</p>
     </section>
     <section class="panel">
       <div class="budget-list">
       ${rows.map((c) => `
         <article class="budget-row${c.over ? " over" : ""}">
           <div class="budget-head">
             <h2><span class="swatch" style="background:${c.color}"></span>${escapeHtml(c.name)}</h2>
             <span class="budget-figures">${money(c.actual)} <small>of ${money(c.budget)}</small></span>
           </div>
           <div class="meter" role="img" aria-label="${escapeHtml(c.name)}: ${money(c.actual)} spent of ${money(c.budget)} budgeted"><span style="width:${Math.min(c.pct, 100)}%; background:${c.over ? "#b8546a" : c.color}"></span></div>
           <p class="budget-note">${escapeHtml(c.note)} · ${c.pct}% used · ${c.over ? `<strong class="over-text">Over by ${money(-c.left)}</strong>` : `${money(c.left)} left`}</p>
           <button type="button" data-budget="${c.id}">Change budget</button>
         </article>`).join("")}
       </div>
     </section>
     <section class="panel">
       <h2>What the numbers say</h2>
       <p>Eleven of twelve lines stayed within budget. The one exception is dining out, ${money(actuals.dining - 180)} over its $180 line — four meals out instead of the planned three. Housing, childcare and insurance are fixed bills, so the household's real wiggle room lives in groceries, transport and dining.</p>
       <p><a class="button" href="#/reports">See the six-month picture →</a></p>
     </section>`,
  );
  document.querySelector(".budget-list").addEventListener("click", (event) => {
    const id = event.target.getAttribute("data-budget");
    if (!id) return;
    const cat = categoryById(id);
    const value = window.prompt(`New monthly budget for ${cat.name} (current ${money(cat.budget)}):`, cat.budget.toFixed(2));
    if (value === null) return;
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount < 0) {
      window.alert("Enter a budget of $0 or more.");
      return;
    }
    cat.budget = Math.round(amount * 100) / 100;
    saveState();
    budgetsView();
  });
}

// ---------- Goals ----------

function goalsView() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  renderPage(
    "#/goals",
    `<section class="hero">
       <h1>Savings goals</h1>
       <p class="lede">${money(totalSaved)} saved toward ${money(totalTarget)} of goals. The ${money(savingsTransferred())} November transfer went to the emergency fund, as it does every month.</p>
     </section>
     <section class="panel">
       <div class="goal-list">
       ${state.goals.map((g) => {
         const pct = Math.round((g.saved / g.target) * 100);
         const remaining = g.target - g.saved;
         const monthsLeft = Math.max(1, Math.ceil(remaining / 900));
         return `
         <article class="goal-card">
           <h2>${escapeHtml(g.name)}</h2>
           <p class="goal-figures"><strong>${money(g.saved)}</strong> of ${money(g.target)} · ${pct}%</p>
           <div class="meter tall" role="img" aria-label="${escapeHtml(g.name)}: ${pct}% funded"><span style="width:${Math.min(pct, 100)}%"></span></div>
           <p>${escapeHtml(g.note)}</p>
           <p class="muted">Target date: ${escapeHtml(g.deadline)} · ${money(Math.max(0, remaining))} to go · about ${monthsLeft} month${monthsLeft === 1 ? "" : "s"} at $900 a month</p>
           <form class="contribute" data-goal="${g.id}">
             <label>Add to this goal ($)
               <input name="amount" type="number" min="1" step="0.01" placeholder="100.00" required />
             </label>
             <button type="submit">Add savings</button>
           </form>
         </article>`;
       }).join("")}
       </div>
     </section>
     <section class="panel">
       <h2>Start a new goal</h2>
       <form id="goal-add" class="form-grid">
         <label>Goal name <input name="name" type="text" placeholder="e.g. June's bike" maxlength="60" required /></label>
         <label>Target ($) <input name="target" type="number" min="1" step="0.01" placeholder="500.00" required /></label>
         <label>Already saved ($) <input name="saved" type="number" min="0" step="0.01" value="0" required /></label>
         <label>Target date <input name="deadline" type="text" placeholder="e.g. March 2027" maxlength="40" required /></label>
         <button type="submit">Create goal</button>
       </form>
       <p id="goal-message" class="form-message" role="status"></p>
     </section>`,
  );
  document.querySelectorAll(".contribute").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const goal = state.goals.find((g) => g.id === form.getAttribute("data-goal"));
      if (!goal) return;
      const amount = Math.round(Number(new FormData(form).get("amount")) * 100) / 100;
      if (!Number.isFinite(amount) || amount <= 0) return;
      goal.saved = Math.round((goal.saved + amount) * 100) / 100;
      saveState();
      goalsView();
    });
  });
  document.getElementById("goal-add").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    const target = Number(data.get("target"));
    const saved = Number(data.get("saved"));
    if (!Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0) {
      document.getElementById("goal-message").textContent = "Check the amounts: target above $0, saved $0 or more.";
      return;
    }
    state.goals.push({
      id: "goal-" + Date.now().toString(36),
      name: String(data.get("name")).trim(),
      target: Math.round(target * 100) / 100,
      saved: Math.round(saved * 100) / 100,
      deadline: String(data.get("deadline")).trim(),
      note: "Added by the household.",
    });
    saveState();
    goalsView();
  });
}

// ---------- Reports ----------

function reportsView() {
  const actuals = spentByCategory();
  const rows = state.categories
    .filter((c) => c.id !== "savings")
    .map((c) => ({ label: c.name, budget: c.budget, actual: actuals[c.id], color: c.color, over: actuals[c.id] > c.budget }));
  const savingsRate = (savingsTransferred() / incomeTotal()) * 100;
  const avgSpent = HISTORY.reduce((s, h) => s + h.spent, 0) / HISTORY.length;
  const bestMonth = [...HISTORY].sort((a, b) => a.spent - b.spent)[0];
  renderPage(
    "#/reports",
    `<section class="hero">
       <h1>Reports</h1>
       <p class="lede">Six months of the Marlowe household, June to November 2026. November is the cheapest month so far — ${money(avgSpent - HISTORY[5].spent)} below the six-month average spend of ${money(avgSpent)}.</p>
     </section>
     <section class="panel">
       <h2>Income, spending and savings by month</h2>
       <canvas id="month-bars" class="chart bars" width="900" height="320" role="img" aria-label="Bar chart of income, spending and savings, June to November 2026"></canvas>
       <table class="history">
         <thead><tr><th>Month</th><th>Income</th><th>Spent</th><th>Saved</th><th>Savings rate</th></tr></thead>
         <tbody>${HISTORY.map((h) => `<tr><td>${h.month}</td><td>${money(h.income)}</td><td>${money(h.spent)}</td><td>${money(h.saved)}</td><td>${((h.saved / h.income) * 100).toFixed(1)}%</td></tr>`).join("")}</tbody>
       </table>
     </section>
     <section class="panel">
       <h2>November: budget vs actual</h2>
       <canvas id="budget-bars" class="chart budget-chart" width="900" height="200" role="img" aria-label="Budget against actual spending for each category in November"></canvas>
     </section>
     <section class="two-col">
       <div class="panel">
         <h2>The month in numbers</h2>
         <ul class="stats">
           <li><span>Savings rate</span><strong>${savingsRate.toFixed(1)}%</strong></li>
           <li><span>Cheapest month</span><strong>${bestMonth.month} — ${money(bestMonth.spent)}</strong></li>
           <li><span>Most expensive month</span><strong>Aug 2026 — ${money(6120)}</strong></li>
           <li><span>Average monthly spend</span><strong>${money(avgSpent)}</strong></li>
           <li><span>Budget lines within budget</span><strong>11 of 12</strong></li>
           <li><span>Left over in November</span><strong>${money(incomeTotal() - spendingTotal() - savingsTransferred())}</strong></li>
         </ul>
       </div>
       <div class="panel">
         <h2>Take the numbers with you</h2>
         <p>Download the November ledger as a spreadsheet file (CSV) — every transaction, with its date, description, category and amount.</p>
         <button type="button" id="export-csv">Download November ledger (CSV)</button>
         <p id="export-message" class="form-message" role="status"></p>
         <h2>August, the expensive month</h2>
         <p>August cost $6,120: Tom worked overtime, so income rose to $7,150, but a car repair and a summer holiday deposit pushed spending up by $360 over July. The household still saved its $900.</p>
       </div>
     </section>`,
  );
  const monthCanvas = document.getElementById("month-bars");
  const budgetCanvas = document.getElementById("budget-bars");
  drawMonthBars(monthCanvas, HISTORY);
  drawBudgetBars(budgetCanvas, rows);
  liveCharts.push(
    { canvas: monthCanvas, draw: () => drawMonthBars(monthCanvas, HISTORY) },
    { canvas: budgetCanvas, draw: () => drawBudgetBars(budgetCanvas, rows) },
  );
  document.getElementById("export-csv").addEventListener("click", () => {
    const lines = ["date,description,category,amount,kind"];
    for (const t of [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1))) {
      lines.push([t.date, `"${t.description.replace(/"/g, '""')}"`, t.category, t.amount.toFixed(2), t.kind].join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "marlowe-november-2026-ledger.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    document.getElementById("export-message").textContent = `Downloaded ${state.transactions.length} transactions as CSV.`;
  });
}

// ---------- Router ----------

function route() {
  const hash = window.location.hash || "#/";
  if (hash.startsWith("#/transactions")) transactionsView();
  else if (hash.startsWith("#/budgets")) budgetsView();
  else if (hash.startsWith("#/goals")) goalsView();
  else if (hash.startsWith("#/reports")) reportsView();
  else dashboardView();
}

window.addEventListener("hashchange", route);
window.addEventListener("resize", () => {
  for (const chart of liveCharts) {
    if (chart.canvas.isConnected) chart.draw();
  }
});
route();
