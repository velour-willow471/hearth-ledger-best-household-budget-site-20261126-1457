# Hearth Ledger

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![make.fun bounty](https://img.shields.io/badge/make.fun-bounty-blue.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457)
[![Offline](https://img.shields.io/badge/network-none-brightgreen.svg)](#run-it)

A working household budget site for one real-feeling family — the Marlowe
household, Maya, Tom and six-year-old June — built for the
[make.fun household budget bounty](https://make.fun/bounty/best-household-budget-site-20261126-1457).
It runs entirely from static files: no build step, no network requests, no
libraries, no fonts fetched from anywhere. Open `app/index.html` on a desktop
or a phone and it just works.

## The household, in numbers

November 2026, all figures reconciled across every page:

- **Income:** $7,000 take-home pay (Maya $3,850 + Tom $3,150)
- **Spending:** $4,760.40 across eleven categories, plus a $900 savings transfer
- **Left over:** $1,339.60 unspent at 30 November
- **Savings rate:** 12.9% — the $900 goes out on payday, before anything else
- **Budgets:** 11 of 12 lines stayed within budget; only dining out ran over,
  by $34.60

Every category total on the Budgets page is the exact sum of the transactions
listed for that category, and the six-month history on the Reports page runs
June to November 2026.

## What it does

Five sections, each reached by a link in the header:

- **Dashboard** — income, spending, savings and what's left, a donut chart
  of where the money went, the biggest spending lines, the latest
  transactions, and four budgeting tips the household actually follows.
- **Transactions** — all 34 November entries, filterable by category and
  searchable. Add a transaction, edit its amount, or delete it, and every
  total on the site updates. A reset button restores the original ledger.
- **Budgets** — twelve budget lines against actual spending, with progress
  meters, over-budget warnings, and a working "change budget" control.
- **Goals** — three savings goals (emergency fund $8,450 of $12,000, summer
  holiday $1,120 of $1,500, replacement car $2,300 of $6,000) with progress,
  months-to-go at $900 a month, working add-savings forms, and a new-goal form.
- **Reports** — income vs spending vs savings for six months, a budget-vs-actual
  chart, a month-by-month table, and a one-click CSV download of the ledger.

Edits are saved in the browser's local storage, so they survive a reload;
nothing is sent anywhere.

## Run it

```sh
# any static server with app/ at its root, for example:
python3 -m http.server 8080 --directory app
# then open http://localhost:8080
```

Or open `app/index.html` directly in a browser (served over HTTP is best,
since the page loads its scripts as modules).

## Layout

```
app/
  index.html   page shell, navigation, loads app.js as a module
  style.css    the whole design, system fonts only
  data.js      the Marlowe household: income, budgets, 34 transactions,
               savings goals, six-month history, tips
  charts.js    donut, grouped bar and budget-bar charts on plain canvas
  app.js       hash router, five views, every control and its state
main.ts        entry program: copies app/ + screenshots/ to /output and
               writes dossier.json with vendor/makefun-frontend.ts
vendor/
  makefun-frontend.ts   the kit's dossier library, copied unchanged
screenshots/   real renders of the running site (desktop + phone)
```

## License

MIT — see [LICENSE](LICENSE).
