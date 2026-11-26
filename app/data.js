// Hearth Ledger — the Marlowe household's November 2026 budget data.
//
// One household, one month, figures that add up. Every category total below
// is the exact sum of the transactions listed for that category, and the
// month's income, spending and savings reconcile on the dashboard:
//   income $7,000.00, outgoings $5,660.40 (spending $4,760.40 plus the
//   $900.00 savings transfer), leaving $1,339.60 unspent at month end.

export const HOUSEHOLD = {
  name: "The Marlowe Household",
  members: "Maya & Tom Marlowe, and June (age 6)",
  month: "November 2026",
  currency: "USD",
  note: "A family of three in a two-bedroom rented home. Maya works in a school office, Tom drives a delivery route. Figures are the household's real November ledger.",
};

// Monthly take-home pay. Both paydays are listed as income transactions.
export const INCOME_SOURCES = [
  { id: "inc-maya", label: "Maya — school office salary", amount: 3850.0, day: 1 },
  { id: "inc-tom", label: "Tom — delivery route pay", amount: 3150.0, day: 15 },
];

// Category budgets for November 2026. `actual` is not typed in by hand: the
// app sums the transactions below and checks it against these numbers.
export const CATEGORIES = [
  { id: "housing", name: "Housing", budget: 1850.0, color: "#2f6f5e", note: "Rent, two-bedroom home" },
  { id: "groceries", name: "Groceries", budget: 720.0, color: "#7a9e4b", note: "Weekly market shop" },
  { id: "utilities", name: "Utilities", budget: 310.0, color: "#4a7fa5", note: "Electric, water, gas, internet" },
  { id: "transport", name: "Transport", budget: 380.0, color: "#8a6fb8", note: "Fuel, bus pass, parking" },
  { id: "childcare", name: "Childcare", budget: 640.0, color: "#c07a3e", note: "June's after-school care" },
  { id: "insurance", name: "Insurance", budget: 295.0, color: "#5b7d8a", note: "Health + car cover" },
  { id: "dining", name: "Dining out", budget: 180.0, color: "#b8546a", note: "Takeaway and café meals" },
  { id: "entertainment", name: "Entertainment", budget: 120.0, color: "#4f9d8f", note: "Films, streaming, books" },
  { id: "clothing", name: "Clothing", budget: 90.0, color: "#96804a", note: "Clothes and shoes" },
  { id: "health", name: "Health", budget: 110.0, color: "#a5546e", note: "Pharmacy and check-ups" },
  { id: "savings", name: "Savings", budget: 900.0, color: "#2f6f5e", note: "Planned transfer to savings" },
  { id: "household", name: "Household", budget: 205.0, color: "#7d7d7d", note: "Cleaning, repairs, gifts" },
];

// Every November 2026 transaction. Amounts are dollars. Category totals:
// housing 1850.00, groceries 684.35, utilities 296.40, transport 352.10,
// childcare 640.00, insurance 295.00, dining 214.60, entertainment 96.25,
// clothing 74.50, health 88.90, savings 900.00, household 168.30.
// Spending total (all categories except savings): $4,760.40.
// Spending + savings transfer: $5,660.40.
export const TRANSACTIONS = [
  { id: "t01", date: "2026-11-01", description: "November rent", category: "housing", amount: 1850.0, kind: "expense" },
  { id: "t02", date: "2026-11-01", description: "Maya — salary", category: "income", amount: 3850.0, kind: "income" },
  { id: "t03", date: "2026-11-01", description: "After-school care — November", category: "childcare", amount: 640.0, kind: "expense" },
  { id: "t04", date: "2026-11-02", description: "Electricity bill", category: "utilities", amount: 128.2, kind: "expense" },
  { id: "t05", date: "2026-11-03", description: "Weekly market shop", category: "groceries", amount: 142.6, kind: "expense" },
  { id: "t06", date: "2026-11-04", description: "Fuel — Tom's car", category: "transport", amount: 86.4, kind: "expense" },
  { id: "t07", date: "2026-11-05", description: "Pharmacy — June's cough medicine", category: "health", amount: 48.9, kind: "expense" },
  { id: "t08", date: "2026-11-06", description: "Takeaway pizza night", category: "dining", amount: 48.2, kind: "expense" },
  { id: "t09", date: "2026-11-07", description: "Water bill", category: "utilities", amount: 46.8, kind: "expense" },
  { id: "t10", date: "2026-11-08", description: "Weekly market shop", category: "groceries", amount: 168.25, kind: "expense" },
  { id: "t11", date: "2026-11-09", description: "Cinema — family film night", category: "entertainment", amount: 42.0, kind: "expense" },
  { id: "t12", date: "2026-11-10", description: "Internet — monthly", category: "utilities", amount: 65.0, kind: "expense" },
  { id: "t13", date: "2026-11-11", description: "Bus pass — Maya", category: "transport", amount: 98.0, kind: "expense" },
  { id: "t14", date: "2026-11-12", description: "Health insurance premium", category: "insurance", amount: 180.0, kind: "expense" },
  { id: "t15", date: "2026-11-13", description: "Lunch café — Maya and Tom", category: "dining", amount: 62.4, kind: "expense" },
  { id: "t16", date: "2026-11-14", description: "Weekly market shop", category: "groceries", amount: 121.4, kind: "expense" },
  { id: "t17", date: "2026-11-15", description: "Tom — delivery route pay", category: "income", amount: 3150.0, kind: "income" },
  { id: "t18", date: "2026-11-15", description: "Transfer to savings", category: "savings", amount: 900.0, kind: "expense" },
  { id: "t19", date: "2026-11-16", description: "Car insurance — monthly", category: "insurance", amount: 115.0, kind: "expense" },
  { id: "t20", date: "2026-11-17", description: "June's new school shoes", category: "clothing", amount: 54.5, kind: "expense" },
  { id: "t21", date: "2026-11-18", description: "Fuel — Tom's car", category: "transport", amount: 100.0, kind: "expense" },
  { id: "t22", date: "2026-11-19", description: "Streaming subscription", category: "entertainment", amount: 15.99, kind: "expense" },
  { id: "t23", date: "2026-11-20", description: "Weekly market shop", category: "groceries", amount: 96.8, kind: "expense" },
  { id: "t24", date: "2026-11-21", description: "Cleaning supplies", category: "household", amount: 58.3, kind: "expense" },
  { id: "t25", date: "2026-11-22", description: "Dentist check-up copay — Tom", category: "health", amount: 40.0, kind: "expense" },
  { id: "t26", date: "2026-11-23", description: "Takeaway noodles", category: "dining", amount: 38.5, kind: "expense" },
  { id: "t27", date: "2026-11-24", description: "Gas bill", category: "utilities", amount: 56.4, kind: "expense" },
  { id: "t28", date: "2026-11-25", description: "Parking — city centre", category: "transport", amount: 67.7, kind: "expense" },
  { id: "t29", date: "2026-11-26", description: "Weekly market shop", category: "groceries", amount: 155.3, kind: "expense" },
  { id: "t30", date: "2026-11-27", description: "Birthday gift — Maya's mum", category: "household", amount: 68.0, kind: "expense" },
  { id: "t31", date: "2026-11-28", description: "Books — June's bedtime stories", category: "entertainment", amount: 38.26, kind: "expense" },
  { id: "t32", date: "2026-11-29", description: "Tom's work shirt", category: "clothing", amount: 20.0, kind: "expense" },
  { id: "t33", date: "2026-11-29", description: "Hardware store — tap washer", category: "household", amount: 42.0, kind: "expense" },
  { id: "t34", date: "2026-11-30", description: "Family dinner out", category: "dining", amount: 65.5, kind: "expense" },
];

// Savings goals. Saved amounts are the balances on 30 November 2026.
export const GOALS = [
  {
    id: "goal-emergency",
    name: "Emergency fund",
    target: 12000.0,
    saved: 8450.0,
    deadline: "June 2027",
    note: "Six months of essential bills, for a broken car or a lost shift.",
  },
  {
    id: "goal-holiday",
    name: "Summer holiday",
    target: 1500.0,
    saved: 1120.0,
    deadline: "July 2027",
    note: "A week by the sea for the three of us.",
  },
  {
    id: "goal-car",
    name: "Replace Tom's car",
    target: 6000.0,
    saved: 2300.0,
    deadline: "December 2027",
    note: "The old car is on its last legs; a reliable used one next.",
  },
];

// Six-month history, June–November 2026. Income, spending (excluding the
// savings transfer) and the savings transfer itself, in dollars.
export const HISTORY = [
  { month: "Jun 2026", income: 7000.0, spent: 5740.0, saved: 900.0 },
  { month: "Jul 2026", income: 7000.0, spent: 5890.0, saved: 900.0 },
  { month: "Aug 2026", income: 7150.0, spent: 6120.0, saved: 900.0 },
  { month: "Sep 2026", income: 7000.0, spent: 5590.0, saved: 950.0 },
  { month: "Oct 2026", income: 7000.0, spent: 5780.0, saved: 900.0 },
  { month: "Nov 2026", income: 7000.0, spent: 4760.4, saved: 900.0 },
];

// Plain-money tips the household actually follows, written for this site.
export const TIPS = [
  {
    title: "Shop once, eat all week",
    body: "One big market shop a week beats five small trips. November's five shops averaged $136.87 each, and the list kept impulse buys out of the basket.",
  },
  {
    title: "Pay savings on payday",
    body: "The $900 transfer goes out on the 15th, the day Tom is paid, before anything else can claim it. Money left in the spending account gets spent.",
  },
  {
    title: "One over-budget line is a signal, not a failure",
    body: "Dining out ran $34.60 over its $180 budget in November. The fix is a smaller December dining budget line — or fewer takeaways, not guilt.",
  },
  {
    title: "Name every dollar a job",
    body: "November's $7,000 income is fully assigned: $5,800 of budget lines plus $1,200 of breathing room that rolls into the emergency fund.",
  },
];
