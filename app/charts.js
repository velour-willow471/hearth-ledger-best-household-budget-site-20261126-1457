// Hearth Ledger — charts drawn with plain canvas code, no library.
// Every chart here is computed from the numbers it is given, so a chart
// always agrees with the tables on the same page.

export function money(amount) {
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Fit a canvas to its displayed size and the device pixel ratio so lines
// stay crisp on phones and on desktop. Returns null when the canvas is too
// small to draw on (hidden, detached, or not laid out yet) — callers skip.
function prepare(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return null;
  const scale = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * scale));
  const height = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  return { ctx, width: rect.width, height: rect.height };
}

// Donut: one slice per category, sized by its share of spending.
// `slices` is [{ label, value, color }]. The centre shows the total.
export function drawDonut(canvas, slices, totalLabel) {
  const sized = prepare(canvas);
  if (!sized) return;
  const { ctx, width, height } = sized;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) {
    ctx.fillStyle = "#6b7280";
    ctx.font = "14px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("No spending to show yet.", width / 2, height / 2);
    return;
  }
  const cx = width / 2;
  const cy = height / 2;
  const outer = Math.min(width, height) / 2 - 8;
  const inner = outer * 0.62;
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    angle += sweep;
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "#1f2937";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(money(total), cx, cy - 10);
  ctx.fillStyle = "#6b7280";
  ctx.font = "13px system-ui, sans-serif";
  ctx.fillText(totalLabel, cx, cy + 14);
}

// Grouped bars: income vs spending vs savings across months.
// `rows` is [{ label, income, spent, saved }].
export function drawMonthBars(canvas, rows) {
  const sized = prepare(canvas);
  if (!sized) return;
  const { ctx, width, height } = sized;
  const padLeft = 56;
  const padRight = 12;
  const padTop = 14;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const max = Math.max(...rows.map((r) => Math.max(r.income, r.spent, r.saved)), 1);
  const niceMax = Math.ceil(max / 1000) * 1000;
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "#6b7280";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let step = 0; step <= 4; step++) {
    const value = (niceMax / 4) * step;
    const y = padTop + plotH - (value / niceMax) * plotH;
    ctx.strokeStyle = "#e5e7eb";
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - padRight, y);
    ctx.stroke();
    ctx.fillText("$" + (value / 1000).toFixed(0) + "k", padLeft - 8, y);
  }
  const groupW = plotW / rows.length;
  const barW = Math.min(18, groupW / 4);
  const series = [
    { key: "income", color: "#2f6f5e" },
    { key: "spent", color: "#b8546a" },
    { key: "saved", color: "#d9a441" },
  ];
  rows.forEach((row, i) => {
    const groupX = padLeft + i * groupW;
    series.forEach((s, j) => {
      const barH = (row[s.key] / niceMax) * plotH;
      const x = groupX + groupW / 2 - (barW * 3) / 2 + j * barW;
      ctx.fillStyle = s.color;
      ctx.fillRect(x, padTop + plotH - barH, barW - 2, barH);
    });
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(row.label, groupX + groupW / 2, height - padBottom + 8);
  });
  // Legend, drawn above the plot on the right.
  const legend = [
    ["Income", "#2f6f5e"],
    ["Spent", "#b8546a"],
    ["Saved", "#d9a441"],
  ];
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  let lx = padLeft;
  for (const [label, color] of legend) {
    ctx.fillStyle = color;
    ctx.fillRect(lx, 2, 10, 10);
    ctx.fillStyle = "#374151";
    ctx.fillText(label, lx + 14, 7);
    lx += 14 + ctx.measureText(label).width + 18;
  }
}

// Horizontal progress bars for budget vs actual, drawn on canvas so the
// Reports page can show the same numbers as the Budgets page in one glance.
// `rows` is [{ label, budget, actual, color, over }].
export function drawBudgetBars(canvas, rows) {
  const rowH = 34;
  // Size the canvas to fit every row before measuring it.
  canvas.style.height = rows.length * rowH + 8 + "px";
  const sized = prepare(canvas);
  if (!sized) return;
  const { ctx, width } = sized;
  const labelW = 110;
  const valueW = 74;
  const barX = labelW;
  const barW = width - labelW - valueW;
  const max = Math.max(...rows.map((r) => Math.max(r.budget, r.actual)), 1);
  ctx.font = "12px system-ui, sans-serif";
  rows.forEach((row, i) => {
    const y = i * rowH + 6;
    ctx.fillStyle = "#1f2937";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(row.label, 0, y + 9);
    const budgetW = (row.budget / max) * barW;
    const actualW = (row.actual / max) * barW;
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(barX, y, barW, 10);
    ctx.fillStyle = "#d1d5db";
    ctx.fillRect(barX, y + 12, budgetW, 4);
    ctx.fillStyle = row.over ? "#b8546a" : row.color;
    ctx.fillRect(barX, y, actualW, 10);
    ctx.fillStyle = "#374151";
    ctx.textAlign = "right";
    ctx.fillText(money(row.actual) + " / " + money(row.budget), width, y + 9);
  });
}
