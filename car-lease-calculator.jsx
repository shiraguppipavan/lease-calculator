import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import * as XLSX from "xlsx";

/* ─────────────────────────── FONTS (Google) ─────────────────────────── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap";
document.head.appendChild(fontLink);

/* ─────────────────────────── HELPERS ─────────────────────────── */
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Math.round(n)
  );
const fmtL = (n) => {
  const abs = Math.abs(n);
  if (abs >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (abs >= 100000) return `${(n / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return fmt(n);
};

/* ─────────────────── NEW REGIME TAX CALC ─────────────────── */
function calcNewRegimeTax(taxableIncome, cess = 0.04, customSlabs = null) {
  const defaultSlabs = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 },
    { limit: 400000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 400000, rate: 0.20 },
    { limit: 400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];
  const slabs = customSlabs || defaultSlabs;
  let remaining = Math.max(taxableIncome, 0);
  let tax = 0;
  const breakdown = [];
  for (const { limit, rate } of slabs) {
    const width = limit === Infinity ? remaining : limit;
    const chunk = Math.min(remaining, width);
    const t = chunk * rate;
    breakdown.push({ width: limit, rate, chunk, tax: t });
    tax += t;
    remaining -= chunk;
    if (remaining <= 0) break;
  }
  const cessAmt = tax * cess;
  return { tax, cess: cessAmt, total: tax + cessAmt, breakdown };
}

/* ─────────────────── EMI CALCULATOR ─────────────────── */
function calcEMI(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

/* ─────────────────── ANIMATED NUMBER ─────────────────── */
function AnimatedNumber({ value, prefix = "₹", className = "" }) {
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${fmt(v)}`);
  const ref = useRef(null);
  useEffect(() => { spring.set(value); }, [value, spring]);
  useEffect(() => {
    const unsub = display.on("change", (v) => { if (ref.current) ref.current.textContent = v; });
    return unsub;
  }, [display]);
  return <motion.span ref={ref} className={className} />;
}

/* ─────────────────── INPUT FIELD ─────────────────── */
function Field({ label, value, onChange, suffix, type = "number", options, hint }) {
  if (options) {
    return (
      <div className="group relative">
        <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-medium">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-black appearance-none focus:outline-none focus:border-black transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {hint && <p className="text-[10px] text-neutral-400 mt-1">{hint}</p>}
      </div>
    );
  }
  return (
    <div className="group relative">
      <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1.5 font-medium">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
          className="w-full bg-transparent border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-black focus:outline-none focus:border-black transition-colors tabular-nums"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 uppercase tracking-wider">{suffix}</span>
        )}
      </div>
      {hint && <p className="text-[10px] text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ─────────────────── SECTION ─────────────────── */
function Section({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm"
    >
      <h3
        className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-5 pb-3 border-b border-neutral-100"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </motion.div>
  );
}

/* ─────────────────── MINI BAR CHART ─────────────────── */
function BarChart({ data, maxVal }) {
  return (
    <div className="space-y-3 mt-4">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
            <span>{d.label}</span>
            <span className="tabular-nums">₹{fmtL(d.value)}</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: d.color || "#000" }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((d.value / maxVal) * 100, 100)}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── YEAR TABLE ─────────────────── */
function YearTable({ leaseYears, buyYears, leaseTotal, buyTotal, leaseTenureYrs }) {
  const years = Math.max(leaseYears.length, buyYears.length);
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="text-left py-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Year</th>
            <th className="text-right py-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Lease</th>
            <th className="text-right py-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Buy</th>
            <th className="text-right py-2 text-[10px] uppercase tracking-wider text-neutral-400 font-medium">Saving</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: years }).map((_, i) => {
            const l = leaseYears[i] || 0;
            const b = buyYears[i] || 0;
            const s = b - l;
            const isPostLease = i >= leaseTenureYrs;
            return (
              <motion.tr
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-neutral-50 ${isPostLease ? "bg-neutral-50/50" : ""}`}
              >
                <td className="py-2.5 text-neutral-600">
                  Yr {i + 1}
                  {i === leaseTenureYrs - 1 && <span className="ml-1 text-[9px] text-neutral-400">lease ends</span>}
                </td>
                <td className="py-2.5 text-right tabular-nums">{fmt(l)}</td>
                <td className="py-2.5 text-right tabular-nums">{fmt(b)}</td>
                <td className={`py-2.5 text-right tabular-nums font-medium ${s > 0 ? "text-black" : "text-neutral-400"}`}>
                  {s > 0 ? "+" : ""}{fmt(s)}
                </td>
              </motion.tr>
            );
          })}
          <tr className="border-t-2 border-black">
            <td className="py-3 font-semibold text-sm">Total</td>
            <td className="py-3 text-right font-semibold tabular-nums text-sm">₹{fmtL(leaseTotal)}</td>
            <td className="py-3 text-right font-semibold tabular-nums text-sm">₹{fmtL(buyTotal)}</td>
            <td className="py-3 text-right font-bold tabular-nums text-sm">
              {buyTotal - leaseTotal > 0 ? "+" : ""}₹{fmtL(buyTotal - leaseTotal)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────────── SETTINGS MODAL ─────────────────── */
function SettingsModal({ isOpen, onClose, taxSlabs, setTaxSlabs, darkMode, setDarkMode }) {
  if (!isOpen) return null;

  const slabLabels = ["0-4L", "4-8L", "8-12L", "12-16L", "16-20L", "20-24L", "24L+"];

  const updateSlab = (index, field, value) => {
    const newSlabs = [...taxSlabs];
    newSlabs[index] = { ...newSlabs[index], [field]: parseFloat(value) || 0 };
    setTaxSlabs(newSlabs);
  };

  const resetToDefaults = () => {
    setTaxSlabs([
      { limit: 400000, rate: 0 },
      { limit: 400000, rate: 0.05 },
      { limit: 400000, rate: 0.10 },
      { limit: 400000, rate: 0.15 },
      { limit: 400000, rate: 0.20 },
      { limit: 400000, rate: 0.25 },
      { limit: Infinity, rate: 0.30 },
    ]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`w-full max-w-md mx-4 rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-neutral-800' : 'bg-white'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button onClick={onClose} className="p-1 hover:bg-neutral-100 rounded-lg transition-colors">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-100">
            <div>
              <p className="font-medium text-sm">Dark Mode</p>
              <p className="text-xs text-neutral-400">Toggle dark theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-black' : 'bg-neutral-200'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Tax Slabs */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-medium text-sm">Tax Slabs (New Regime)</p>
              <button
                onClick={resetToDefaults}
                className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-black"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2">
              {taxSlabs.map((slab, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-14 text-neutral-400">{slabLabels[i]}</span>
                  <input
                    type="number"
                    value={slab.rate * 100}
                    onChange={(e) => updateSlab(i, 'rate', parseFloat(e.target.value) / 100)}
                    className={`w-16 px-2 py-1.5 border rounded-lg text-center ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'border-neutral-200'}`}
                    step="1"
                  />
                  <span className="text-neutral-400">%</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 mt-4">
            Changes apply immediately. Tax slabs affect annual tax saving calculation.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─────────────────── CUMULATIVE LINE CHART ─────────────────── */
function CumulativeLineChart({ leaseCumulative, buyCumulative, breakEvenYear, maxYears, resaleValue }) {
  const padding = { top: 30, right: 20, bottom: 40, left: 60 };
  const width = 600;
  const height = 300;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Adjust buy cumulative for resale value visualization
  const buyAdjusted = buyCumulative.map((v, i) =>
    i === buyCumulative.length - 1 ? v - resaleValue : v
  );

  const maxValue = Math.max(...leaseCumulative, ...buyAdjusted);
  const minValue = 0;

  const getX = (i) => padding.left + (i / (maxYears - 1)) * chartWidth;
  const getY = (value) => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;

  const leasePath = leaseCumulative.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`
  ).join(' ');

  const buyPath = buyAdjusted.map((v, i) =>
    `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`
  ).join(' ');

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const value = minValue + (maxValue - minValue) * (1 - pct);
    return { y: padding.top + chartHeight * pct, value };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" style={{ minWidth: 400, maxWidth: 700 }}>
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line x1={padding.left} y1={line.y} x2={width - padding.right} y2={line.y} stroke="#e5e5e5" strokeDasharray="4" />
            <text x={padding.left - 10} y={line.y + 4} textAnchor="end" className="text-[10px] fill-neutral-400">
              {fmtL(line.value)}
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {Array.from({ length: maxYears }).map((_, i) => (
          <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" className="text-[10px] fill-neutral-400">
            Yr {i + 1}
          </text>
        ))}

        {/* Buy line */}
        <motion.path
          d={buyPath}
          fill="none"
          stroke="#9CA3AF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />

        {/* Lease line */}
        <motion.path
          d={leasePath}
          fill="none"
          stroke="#1F2937"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        />

        {/* Break-even indicator */}
        {breakEvenYear && breakEvenYear <= maxYears && (
          <g>
            <line
              x1={getX(breakEvenYear - 1)}
              y1={padding.top}
              x2={getX(breakEvenYear - 1)}
              y2={height - padding.bottom}
              stroke="#EF4444"
              strokeWidth="1.5"
              strokeDasharray="4"
            />
            <text x={getX(breakEvenYear - 1)} y={padding.top - 10} textAnchor="middle" className="text-[9px] fill-red-500 font-medium">
              Break-even
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform={`translate(${padding.left + 10}, ${padding.top + 10})`}>
          <rect x="0" y="0" width="10" height="3" fill="#1F2937" rx="1" />
          <text x="15" y="4" className="text-[9px] fill-neutral-600">Lease (cumulative)</text>
          <rect x="0" y="14" width="10" height="3" fill="#9CA3AF" rx="1" />
          <text x="15" y="18" className="text-[9px] fill-neutral-600">Buy (net of resale)</text>
        </g>

        {/* Data points */}
        {leaseCumulative.map((v, i) => (
          <motion.circle
            key={`lease-${i}`}
            cx={getX(i)}
            cy={getY(v)}
            r="4"
            fill="#1F2937"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
        {buyAdjusted.map((v, i) => (
          <motion.circle
            key={`buy-${i}`}
            cx={getX(i)}
            cy={getY(v)}
            r="4"
            fill="#9CA3AF"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
}

/* ─────────────────── EXCEL EXPORT ─────────────────── */
function generateExcel(inputs, results) {
  const wb = XLSX.utils.book_new();
  const { leaseTaxResult, buyTaxResult, leaseYears, buyYears, annualTaxSaving, leaseTotal7yr, buyTotal7yr, leaseTenureYrs, loanTenureYrs, emi, downPayment, netTaxableWithout, netTaxableWith } = results;

  // Sheet 1: Verdict
  const verdictData = [
    ["FINAL VERDICT: LEASE vs BUY"],
    [""],
    ["", "LEASE", "BUY"],
    ["Total Cost (7 Years)", leaseTotal7yr, buyTotal7yr],
    [""],
    ["YOU SAVE WITH LEASE →", buyTotal7yr - leaseTotal7yr],
    [""],
    ["Annual Tax Saving", annualTaxSaving],
    ["Monthly Tax Saving", annualTaxSaving / 12],
    ["Total Tax Saving (Lease Period)", annualTaxSaving * leaseTenureYrs],
    [""],
    ["RECOMMENDATION"],
    [buyTotal7yr > leaseTotal7yr ? "✅ LEASE is the better option" : "✅ BUY is the better option"],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(verdictData);
  ws1["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Verdict");

  // Sheet 2: The Big Picture
  const maxYears = Math.max(leaseTenureYrs, loanTenureYrs);
  const bigPic = [
    ["THE BIG PICTURE: Year-by-Year Cash Flow"],
    [""],
    ["", ...Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`), "TOTAL"],
    ["LEASE COST", ...leaseYears, leaseTotal7yr],
    ["BUY COST", ...buyYears, buyTotal7yr],
    ["SAVING (Buy - Lease)", ...leaseYears.map((l, i) => (buyYears[i] || 0) - l), buyTotal7yr - leaseTotal7yr],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(bigPic);
  ws2["!cols"] = [{ wch: 25 }, ...Array(maxYears + 1).fill({ wch: 14 })];
  XLSX.utils.book_append_sheet(wb, ws2, "The Big Picture");

  // Sheet 3: Assumptions
  const assumpData = [
    ["ALL ASSUMPTIONS"],
    [""],
    ["SALARY DETAILS"],
    ["Annual CTC", inputs.ctc],
    ["Standard Deduction", inputs.stdDeduction],
    ["Tax Regime", "New Regime FY 2025-26"],
    [""],
    ["CAR DETAILS"],
    ["On-Road Price", inputs.onRoadPrice],
    ["Engine Capacity", inputs.engineCC === "below" ? "Below 1600cc" : "Above 1600cc"],
    [""],
    ["LEASE PARAMETERS"],
    ["Monthly Lease Rental", inputs.leaseRental],
    ["Fuel/Maint Allowance (monthly)", inputs.fuelAllowance],
    ["Lease Tenure (months)", inputs.leaseTenure],
    ["Buyback Price", inputs.buybackPrice],
    [""],
    ["LOAN PARAMETERS"],
    ["Down Payment %", inputs.downPaymentPct * 100 + "%"],
    ["Down Payment Amount", downPayment],
    ["Loan Interest Rate", inputs.loanRate * 100 + "%"],
    ["Loan Tenure (months)", inputs.loanTenure],
    ["Monthly EMI", emi],
    [""],
    ["RUNNING COSTS (Annual)"],
    ["Insurance", inputs.insurance],
    ["Maintenance", inputs.maintenance],
    ["Fuel", inputs.fuel],
    [""],
    ["PERQUISITE"],
    ["Monthly Perquisite", inputs.engineCC === "below" ? 1800 : 2400],
    ["Annual Perquisite", (inputs.engineCC === "below" ? 1800 : 2400) * 12],
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(assumpData);
  ws3["!cols"] = [{ wch: 35 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Assumptions");

  // Sheet 4: Tax Calc
  const slabLabels = ["₹0-4L @0%", "₹4-8L @5%", "₹8-12L @10%", "₹12-16L @15%", "₹16-20L @20%", "₹20-24L @25%", "Above ₹24L @30%"];
  const taxData = [
    ["DETAILED TAX CALCULATION"],
    [""],
    ["", "WITHOUT Lease", "WITH Lease", "Notes"],
    ["Gross Salary (CTC)", inputs.ctc, inputs.ctc, "Same CTC"],
    ["(-) Lease Rental", 0, inputs.leaseRental * 12, "Deducted pre-tax"],
    ["(-) Fuel Allowance", 0, inputs.fuelAllowance * 12, "Deducted pre-tax"],
    ["(+) Perquisite", 0, (inputs.engineCC === "below" ? 1800 : 2400) * 12, "Added back by govt"],
    ["Gross Taxable", inputs.ctc, inputs.ctc - inputs.leaseRental * 12 - inputs.fuelAllowance * 12 + (inputs.engineCC === "below" ? 1800 : 2400) * 12, ""],
    ["(-) Standard Deduction", inputs.stdDeduction, inputs.stdDeduction, "₹75K new regime"],
    ["Net Taxable Income", netTaxableWithout, netTaxableWith, ""],
    [""],
    ["TAX SLAB BREAKDOWN"],
    ["Slab", "Without Lease", "With Lease"],
    ...buyTaxResult.breakdown.map((b, i) => [
      slabLabels[i] || "", b.tax, leaseTaxResult.breakdown[i]?.tax || 0
    ]),
    [""],
    ["Total Tax (before cess)", buyTaxResult.tax, leaseTaxResult.tax],
    ["Cess @4%", buyTaxResult.cess, leaseTaxResult.cess],
    ["TOTAL TAX", buyTaxResult.total, leaseTaxResult.total],
    [""],
    ["ANNUAL TAX SAVING", "", annualTaxSaving],
    ["MONTHLY TAX SAVING", "", annualTaxSaving / 12],
  ];
  const ws4 = XLSX.utils.aoa_to_sheet(taxData);
  ws4["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Tax Calc");

  XLSX.writeFile(wb, "Car_Lease_vs_Buy_Analysis.xlsx");
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
   ══════════════════════════════════════════════════════════════ */
export default function App() {
  const defaultTaxSlabs = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 },
    { limit: 400000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 400000, rate: 0.20 },
    { limit: 400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  const getInitialInputs = () => {
    const defaults = {
      ctc: 3000000,
      stdDeduction: 75000,
      cess: 0.04,
      investReturn: 0.12,
      onRoadPrice: 2500000,
      engineCC: "below",
      leaseRental: 55000,
      fuelAllowance: 10000,
      leaseTenure: 48,
      buybackPrice: 100000,
      downPaymentPct: 0.2,
      loanRate: 0.08,
      loanTenure: 84,
      insurance: 45000,
      maintenance: 12000,
      fuel: 105000,
      inflationRate: 0.06,
      resaleValue: 800000,
    };

    // Parse URL params on load
    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of params.entries()) {
        if (key in defaults) {
          try {
            defaults[key] = JSON.parse(value);
          } catch {
            defaults[key] = parseFloat(value) || defaults[key];
          }
        }
      }
    }
    return defaults;
  };

  const [inputs, setInputs] = useState(getInitialInputs);
  const [taxSlabs, setTaxSlabs] = useState(defaultTaxSlabs);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showInputs, setShowInputs] = useState(true);

  // Update URL when inputs change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(inputs).forEach(([k, v]) => {
      if (typeof v === 'number') params.set(k, String(v));
      else params.set(k, JSON.stringify(v));
    });
    window.history.replaceState({}, '', `?${params}`);
  }, [inputs]);

  const copyShareLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
  }, []);

  const set = useCallback((key) => (val) => setInputs((p) => ({ ...p, [key]: val })), []);

  /* ─── CALCULATIONS ─── */
  const results = useMemo(() => {
    const {
      ctc, stdDeduction, cess, investReturn, onRoadPrice, engineCC,
      leaseRental, fuelAllowance, leaseTenure, buybackPrice,
      downPaymentPct, loanRate, loanTenure, insurance, maintenance, fuel,
      inflationRate, resaleValue,
    } = inputs;

    const perquisiteMonthly = engineCC === "below" ? 1800 : 2400;
    const perquisiteAnnual = perquisiteMonthly * 12;
    const annualLeaseRental = leaseRental * 12;
    const annualFuelAllow = fuelAllowance * 12;
    const leaseTenureYrs = Math.round(leaseTenure / 12);
    const loanTenureYrs = Math.round(loanTenure / 12);
    const maxYears = Math.max(leaseTenureYrs, loanTenureYrs);
    const baseAnnualRunning = insurance + maintenance + fuel;

    // Taxable income with custom slabs
    const grossWithout = ctc;
    const grossWith = ctc - annualLeaseRental - annualFuelAllow + perquisiteAnnual;
    const netTaxableWithout = Math.max(grossWithout - stdDeduction, 0);
    const netTaxableWith = Math.max(grossWith - stdDeduction, 0);
    const taxableReduction = netTaxableWithout - netTaxableWith;

    const buyTaxResult = calcNewRegimeTax(netTaxableWithout, cess, taxSlabs);
    const leaseTaxResult = calcNewRegimeTax(netTaxableWith, cess, taxSlabs);
    const annualTaxSaving = buyTaxResult.total - leaseTaxResult.total;
    const monthlyTaxSaving = annualTaxSaving / 12;

    // EMI
    const downPayment = onRoadPrice * downPaymentPct;
    const loanAmount = onRoadPrice - downPayment;
    const emi = calcEMI(loanAmount, loanRate, loanTenure);
    const totalInterest = emi * loanTenure - loanAmount;

    // Opportunity cost of down payment
    const dpFutureValue = downPayment * Math.pow(1 + investReturn, maxYears);
    const opportunityCost = dpFutureValue - downPayment;

    // Year-by-year with inflation
    const leaseYears = [];
    const buyYears = [];
    const leaseCumulative = [];
    const buyCumulative = [];
    let leaseTotal = 0;
    let buyTotal = 0;
    let breakEvenYear = null;

    // Monthly savings investment (SIP calculation for lease savings)
    const effectiveMonthlyLease = leaseRental + fuelAllowance - monthlyTaxSaving;
    const effectiveMonthlyBuy = emi + baseAnnualRunning / 12;
    const monthlySaving = Math.max(effectiveMonthlyBuy - effectiveMonthlyLease, 0);
    const monthlyRate = investReturn / 12;
    const sipMonths = maxYears * 12;
    const sipFutureValue = monthlySaving > 0
      ? monthlySaving * ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate)
      : 0;

    for (let yr = 1; yr <= maxYears; yr++) {
      // Apply inflation to running costs
      const inflationMultiplier = Math.pow(1 + inflationRate, yr - 1);
      const yearFuel = fuel * inflationMultiplier;
      const yearMaintenance = maintenance * inflationMultiplier;
      const yearInsurance = insurance * inflationMultiplier;
      const yearRunning = yearInsurance + yearMaintenance + yearFuel;

      let lCost = 0;
      if (yr <= leaseTenureYrs) {
        lCost = annualLeaseRental + annualFuelAllow - annualTaxSaving;
        const fuelNet = Math.max(yearFuel - annualFuelAllow, 0);
        lCost += fuelNet;
        if (yr === leaseTenureYrs) lCost += buybackPrice;
      } else {
        lCost = yearRunning;
      }
      leaseYears.push(Math.round(lCost));
      leaseTotal += lCost;
      leaseCumulative.push(Math.round(leaseTotal));

      let bCost = 0;
      if (yr === 1) bCost += downPayment;
      if (yr <= loanTenureYrs) bCost += emi * 12;
      bCost += yearRunning;
      buyYears.push(Math.round(bCost));
      buyTotal += bCost;
      buyCumulative.push(Math.round(buyTotal));

      // Check break-even point
      if (breakEvenYear === null && leaseTotal > buyTotal - resaleValue) {
        breakEvenYear = yr;
      }
    }

    // Final totals
    const leaseTotal7yr = Math.round(leaseTotal);
    // Buy net cost = total outflows - resale value (asset value at end)
    const buyTotalGross = Math.round(buyTotal);
    const buyTotal7yr = Math.round(buyTotal - resaleValue);

    return {
      perquisiteMonthly, perquisiteAnnual, annualLeaseRental, annualFuelAllow,
      leaseTenureYrs, loanTenureYrs, maxYears, annualRunning: baseAnnualRunning,
      netTaxableWithout, netTaxableWith, taxableReduction,
      buyTaxResult, leaseTaxResult, annualTaxSaving, monthlyTaxSaving,
      downPayment, loanAmount, emi, totalInterest,
      dpFutureValue, opportunityCost,
      leaseYears, buyYears, leaseTotal7yr, buyTotal7yr, buyTotalGross,
      leaseCumulative, buyCumulative, breakEvenYear,
      effectiveMonthlyLease, effectiveMonthlyBuy,
      monthlySaving, sipFutureValue, resaleValue,
    };
  }, [inputs, taxSlabs]);

  const saving = results.buyTotal7yr - results.leaseTotal7yr;
  const leaseWins = saving > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-black'}`}
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ─── SETTINGS MODAL ─── */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        taxSlabs={taxSlabs}
        setTaxSlabs={setTaxSlabs}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* ─── HEADER ─── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/80 border-neutral-100'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${darkMode ? 'bg-white' : 'bg-black'}`}>
                <span className={`text-xs font-bold ${darkMode ? 'text-black' : 'text-white'}`}>CL</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold tracking-tight leading-none">Car Lease Calculator</h1>
                <p className={`text-[10px] tracking-wide ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>India · New Tax Regime · FY 2025-26</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <motion.button
                onClick={() => setShowSettings(true)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                whileTap={{ scale: 0.95 }}
                title="Settings"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.button>

              {/* Share Button */}
              <motion.button
                onClick={copyShareLink}
                className={`text-[10px] uppercase tracking-wider px-3 py-1.5 border rounded-lg transition-colors ${darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-50'}`}
                whileTap={{ scale: 0.97 }}
                title="Copy shareable link"
              >
                <span className="flex items-center gap-1.5">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684zm0-9.316a3 3 0 105.366-2.683 3 3 0 00-5.366 2.683z" />
                  </svg>
                  Share
                </span>
              </motion.button>

              <motion.button
                onClick={() => setShowInputs(!showInputs)}
                className={`text-[10px] uppercase tracking-wider px-3 py-1.5 border rounded-lg transition-colors ${darkMode ? 'border-neutral-700 hover:bg-neutral-800' : 'border-neutral-200 hover:bg-neutral-50'}`}
                whileTap={{ scale: 0.97 }}
              >
                {showInputs ? "Hide Inputs" : "Edit Inputs"}
              </motion.button>
              <motion.button
                onClick={() => generateExcel(inputs, results)}
                className={`relative text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-lg overflow-hidden group ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                  Export .xlsx
                </span>
                <motion.div
                  className={`absolute inset-0 ${darkMode ? 'bg-neutral-200' : 'bg-neutral-700'}`}
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ─── HERO VERDICT ─── */}
        <motion.div
          layout
          className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-3 gap-6 items-center">
              {/* Lease */}
              <div className="text-center sm:text-left">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Lease · {results.leaseTenureYrs}yr total cost</p>
                <AnimatedNumber
                  value={results.leaseTotal7yr}
                  className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums"
                />
              </div>

              {/* Saving */}
              <div className="text-center">
                <motion.div
                  className={`inline-flex flex-col items-center px-6 py-4 rounded-xl ${leaseWins ? "bg-neutral-900 text-white" : "bg-neutral-100"}`}
                  layout
                >
                  <p className="text-[9px] uppercase tracking-[0.25em] opacity-60 mb-1">
                    {leaseWins ? "Lease Saves" : "Buy Saves"}
                  </p>
                  <AnimatedNumber
                    value={Math.abs(saving)}
                    className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums"
                  />
                  <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-0.5">
                    over {results.maxYears} years
                  </p>
                </motion.div>
              </div>

              {/* Buy */}
              <div className="text-center sm:text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">Buy · {results.loanTenureYrs}yr total cost</p>
                <AnimatedNumber
                  value={results.buyTotal7yr}
                  className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums"
                />
              </div>
            </div>

            {/* Proportional bar */}
            <div className="mt-6 flex gap-1 h-3 rounded-full overflow-hidden bg-neutral-100">
              <motion.div
                className="bg-neutral-800 rounded-full"
                animate={{
                  width: `${(results.leaseTotal7yr / (results.leaseTotal7yr + results.buyTotal7yr)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
              />
              <motion.div
                className="bg-neutral-300 rounded-full"
                animate={{
                  width: `${(results.buyTotal7yr / (results.leaseTotal7yr + results.buyTotal7yr)) * 100}%`,
                }}
                transition={{ duration: 0.6 }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-neutral-400 uppercase tracking-wider">
              <span>Lease</span>
              <span>Buy</span>
            </div>
          </div>

          {/* Verdict Text */}
          <div className="border-t border-neutral-100 px-6 sm:px-8 py-4 bg-neutral-50/50">
            <p className="text-sm text-neutral-600">
              <span className="font-semibold text-black">
                {leaseWins ? "→ Lease is the better option. " : "→ Buying is the better option. "}
              </span>
              {leaseWins
                ? `You save ₹${fmtL(saving)} over ${results.maxYears} years. Tax saving of ₹${fmtL(results.annualTaxSaving)}/year + no down payment + EMI ends ${results.loanTenureYrs - results.leaseTenureYrs} years earlier.`
                : `Buying saves you ₹${fmtL(Math.abs(saving))} over ${results.maxYears} years.`}
            </p>
          </div>
        </motion.div>

        {/* ─── QUICK STATS ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Annual Tax Saving", value: results.annualTaxSaving },
            { label: "Monthly Tax Saving", value: results.monthlyTaxSaving },
            { label: "Effective Lease/mo", value: results.effectiveMonthlyLease },
            { label: "EMI + Running/mo", value: results.effectiveMonthlyBuy },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-white border border-neutral-100 rounded-xl p-4 shadow-sm"
            >
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mb-1">{s.label}</p>
              <AnimatedNumber value={s.value} className="text-lg font-semibold tabular-nums" />
            </motion.div>
          ))}
        </div>

        {/* ─── TABS ─── */}
        <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
          {[
            { id: "overview", label: "Overview" },
            { id: "yearwise", label: "Year-by-Year" },
            { id: "tax", label: "Tax Breakdown" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                ? "bg-black text-white shadow-sm"
                : "text-neutral-500 hover:text-black"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ─── */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid sm:grid-cols-2 gap-4"
            >
              {/* Lease Breakdown */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">Lease Cost Breakdown</h3>
                <BarChart
                  maxVal={results.leaseTotal7yr}
                  data={[
                    { label: "Lease Rental (total)", value: inputs.leaseRental * 12 * results.leaseTenureYrs, color: "#1F2937" },
                    { label: "Fuel Allowance (CTC)", value: inputs.fuelAllowance * 12 * results.leaseTenureYrs, color: "#374151" },
                    { label: "Tax Saving (back to you)", value: results.annualTaxSaving * results.leaseTenureYrs, color: "#9CA3AF" },
                    { label: "Buyback", value: inputs.buybackPrice, color: "#6B7280" },
                    { label: `Running Costs (Yr ${results.leaseTenureYrs + 1}-${results.maxYears})`, value: results.annualRunning * (results.maxYears - results.leaseTenureYrs), color: "#D1D5DB" },
                  ]}
                />
              </div>

              {/* Buy Breakdown */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">Buy Cost Breakdown</h3>
                <BarChart
                  maxVal={results.buyTotal7yr}
                  data={[
                    { label: "Down Payment", value: results.downPayment, color: "#1F2937" },
                    { label: "Total EMI", value: results.emi * inputs.loanTenure, color: "#374151" },
                    { label: "Interest to Bank", value: results.totalInterest, color: "#6B7280" },
                    { label: `Running Costs (${results.loanTenureYrs} yrs)`, value: results.annualRunning * results.loanTenureYrs, color: "#9CA3AF" },
                    { label: `Opportunity Cost (₹${fmtL(results.downPayment)} not invested)`, value: results.opportunityCost, color: "#D1D5DB" },
                  ]}
                />
              </div>

              {/* How lease tax saving works */}
              <div className="sm:col-span-2 bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">How The Tax Saving Works</h3>
                <div className="grid sm:grid-cols-4 gap-4">
                  {[
                    { step: "01", title: "Your CTC", desc: `₹${fmtL(inputs.ctc)}`, sub: "Starting salary" },
                    { step: "02", title: "IBM Deducts Pre-Tax", desc: `₹${fmtL(inputs.leaseRental * 12 + inputs.fuelAllowance * 12)}/yr`, sub: "Lease + Fuel from CTC" },
                    { step: "03", title: "Govt Adds Back", desc: `₹${fmtL(results.perquisiteAnnual)}/yr`, sub: "Only small perquisite" },
                    { step: "04", title: "You Save", desc: `₹${fmtL(results.annualTaxSaving)}/yr`, sub: `₹${fmt(Math.round(results.monthlyTaxSaving))}/month` },
                  ].map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="relative"
                    >
                      <span className="text-[10px] text-neutral-300 font-bold">{s.step}</span>
                      <p className="text-xs font-semibold mt-1">{s.title}</p>
                      <p className="text-lg font-bold mt-1 tabular-nums">{s.desc}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
                      {i < 3 && (
                        <div className="hidden sm:block absolute top-1/2 -right-3 text-neutral-300 text-lg">→</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "yearwise" && (
            <motion.div
              key="yearwise"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Cumulative Line Chart */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  Cumulative Cost Over Time {results.breakEvenYear && `· Break-even at Year ${results.breakEvenYear}`}
                </h3>
                <CumulativeLineChart
                  leaseCumulative={results.leaseCumulative}
                  buyCumulative={results.buyCumulative}
                  breakEvenYear={results.breakEvenYear}
                  maxYears={results.maxYears}
                  resaleValue={results.resaleValue}
                />
                <div className="mt-4 flex gap-6 text-[10px] text-neutral-400">
                  <span>📈 Lines show cumulative out-of-pocket costs</span>
                  <span>🏷️ Buy total accounts for ₹{fmtL(results.resaleValue)} resale value</span>
                </div>
              </div>

              {/* Year Table */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">
                  Year-by-Year Cash Outflow · Lease ends at Year {results.leaseTenureYrs} · EMI ends at Year {results.loanTenureYrs}
                </h3>
                <YearTable
                  leaseYears={results.leaseYears}
                  buyYears={results.buyYears}
                  leaseTotal={results.leaseTotal7yr}
                  buyTotal={results.buyTotal7yr}
                  leaseTenureYrs={results.leaseTenureYrs}
                />
                <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">
                    <span className="font-semibold text-black">Note:</span> After Year {results.leaseTenureYrs}, lease payments stop — you only pay running costs (with {(inputs.inflationRate * 100).toFixed(0)}% inflation).
                    Buy total is net of ₹{fmtL(results.resaleValue)} resale value.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "tax" && (
            <motion.div
              key="tax"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-5">
                Slab-wise Tax · New Regime FY 2025-26
              </h3>
              <div className="grid sm:grid-cols-2 gap-8">
                {/* Income comparison */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-3">Taxable Income</p>
                  <div className="space-y-2">
                    {[
                      { label: "Gross Salary", without: inputs.ctc, with_: inputs.ctc },
                      { label: "(−) Lease Rental", without: 0, with_: inputs.leaseRental * 12 },
                      { label: "(−) Fuel Allowance", without: 0, with_: inputs.fuelAllowance * 12 },
                      { label: "(+) Perquisite", without: 0, with_: results.perquisiteAnnual },
                      { label: "(−) Std Deduction", without: inputs.stdDeduction, with_: inputs.stdDeduction },
                    ].map((r, i) => (
                      <div key={i} className="flex justify-between text-xs border-b border-neutral-50 pb-1.5">
                        <span className="text-neutral-500">{r.label}</span>
                        <div className="flex gap-6 tabular-nums">
                          <span className="w-24 text-right text-neutral-400">{r.without ? fmt(r.without) : "—"}</span>
                          <span className="w-24 text-right">{r.with_ ? fmt(r.with_) : "—"}</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs font-semibold pt-1">
                      <span>Net Taxable</span>
                      <div className="flex gap-6 tabular-nums">
                        <span className="w-24 text-right text-neutral-400">{fmt(results.netTaxableWithout)}</span>
                        <span className="w-24 text-right">{fmt(results.netTaxableWith)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold bg-neutral-50 p-2 rounded-lg mt-1">
                      <span>Reduction</span>
                      <span className="tabular-nums">₹{fmt(results.taxableReduction)}</span>
                    </div>
                  </div>
                </div>

                {/* Slab breakdown */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-neutral-400 mb-3">Tax by Slab</p>
                  <div className="space-y-2">
                    {["₹0–4L @0%", "₹4–8L @5%", "₹8–12L @10%", "₹12–16L @15%", "₹16–20L @20%", "₹20–24L @25%", "Above ₹24L @30%"].map((label, i) => {
                      const wb_ = results.buyTaxResult.breakdown[i];
                      const wl = results.leaseTaxResult.breakdown[i];
                      if (!wb_ && !wl) return null;
                      return (
                        <div key={i} className="flex justify-between text-xs border-b border-neutral-50 pb-1.5">
                          <span className="text-neutral-500">{label}</span>
                          <div className="flex gap-6 tabular-nums">
                            <span className="w-24 text-right text-neutral-400">{wb_ ? fmt(wb_.tax) : "—"}</span>
                            <span className="w-24 text-right">{wl ? fmt(wl.tax) : "—"}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex justify-between text-xs pt-1 border-b border-neutral-100 pb-1.5">
                      <span className="text-neutral-500">+ Cess @4%</span>
                      <div className="flex gap-6 tabular-nums">
                        <span className="w-24 text-right text-neutral-400">{fmt(results.buyTaxResult.cess)}</span>
                        <span className="w-24 text-right">{fmt(results.leaseTaxResult.cess)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-1">
                      <span>Total Tax</span>
                      <div className="flex gap-6 tabular-nums">
                        <span className="w-24 text-right text-neutral-400">{fmt(results.buyTaxResult.total)}</span>
                        <span className="w-24 text-right">{fmt(results.leaseTaxResult.total)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm font-bold bg-neutral-900 text-white p-3 rounded-lg mt-2">
                      <span>Annual Tax Saving</span>
                      <span className="tabular-nums">₹{fmt(Math.round(results.annualTaxSaving))}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-12 mt-4 text-[10px] text-neutral-400">
                <span>Left column = Without Lease</span>
                <span>Right column = With Lease</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── INPUTS ─── */}
        <AnimatePresence>
          {showInputs && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Section title="Salary & Tax" delay={0}>
                  <Field label="Annual CTC (₹)" value={inputs.ctc} onChange={set("ctc")} hint="Your total yearly salary" />
                  <Field label="Standard Deduction" value={inputs.stdDeduction} onChange={set("stdDeduction")} hint="₹75K for new regime" />
                  <Field label="Investment Return Rate" value={inputs.investReturn} onChange={set("investReturn")} suffix="rate" hint="For opportunity cost calc" />
                  <Field label="Cess Rate" value={inputs.cess} onChange={set("cess")} suffix="rate" />
                </Section>

                <Section title="Car Details" delay={0.05}>
                  <Field label="On-Road Price (₹)" value={inputs.onRoadPrice} onChange={set("onRoadPrice")} hint="Total price at showroom" />
                  <Field
                    label="Engine Capacity"
                    value={inputs.engineCC}
                    onChange={set("engineCC")}
                    options={[
                      { value: "below", label: "≤ 1600cc" },
                      { value: "above", label: "> 1600cc" },
                    ]}
                    hint="Affects perquisite: ≤1600cc → ₹1800/mo"
                  />
                  <Field label="Annual Insurance (₹)" value={inputs.insurance} onChange={set("insurance")} />
                  <Field label="Annual Maintenance (₹)" value={inputs.maintenance} onChange={set("maintenance")} />
                  <Field label="Annual Fuel (₹)" value={inputs.fuel} onChange={set("fuel")} hint="~1000 km/mo at 12 kmpl" />
                </Section>

                <Section title="Lease Parameters" delay={0.1}>
                  <Field label="Monthly Lease Rental (₹)" value={inputs.leaseRental} onChange={set("leaseRental")} hint="Deducted pre-tax from CTC" />
                  <Field label="Fuel/Maint Allowance (₹/mo)" value={inputs.fuelAllowance} onChange={set("fuelAllowance")} hint="Reimbursed pre-tax" />
                  <Field label="Lease Tenure" value={inputs.leaseTenure} onChange={set("leaseTenure")} suffix="months" />
                  <Field label="Buyback Price (₹)" value={inputs.buybackPrice} onChange={set("buybackPrice")} hint="Pay at end to own car" />
                </Section>

                <Section title="Loan Parameters" delay={0.15}>
                  <Field label="Down Payment %" value={inputs.downPaymentPct} onChange={set("downPaymentPct")} suffix="ratio" hint={`= ₹${fmt(inputs.onRoadPrice * inputs.downPaymentPct)}`} />
                  <Field label="Interest Rate" value={inputs.loanRate} onChange={set("loanRate")} suffix="rate" />
                  <Field label="Loan Tenure" value={inputs.loanTenure} onChange={set("loanTenure")} suffix="months" />
                  <div className="col-span-2 bg-neutral-50 rounded-lg p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Monthly EMI</span>
                      <span className="font-semibold tabular-nums">₹{fmt(Math.round(results.emi))}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-neutral-500">Total Interest</span>
                      <span className="font-semibold tabular-nums">₹{fmtL(results.totalInterest)}</span>
                    </div>
                  </div>
                </Section>

                <Section title="Advanced" delay={0.2}>
                  <Field label="Inflation Rate" value={inputs.inflationRate} onChange={set("inflationRate")} suffix="rate" hint="Annual increase in fuel/maintenance costs" />
                  <Field label="Resale Value (₹)" value={inputs.resaleValue} onChange={set("resaleValue")} hint={`After ${Math.round(inputs.loanTenure / 12)} years (${((inputs.resaleValue / inputs.onRoadPrice) * 100).toFixed(0)}% of on-road)`} />
                  <div className="col-span-2 bg-neutral-50 rounded-lg p-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Monthly Savings (Lease)</span>
                      <span className="font-semibold tabular-nums">₹{fmt(Math.round(results.monthlySaving))}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-neutral-500">Invested Savings FV</span>
                      <span className="font-semibold tabular-nums">₹{fmtL(results.sipFutureValue)}</span>
                    </div>
                  </div>
                </Section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── FOOTER ─── */}
        <footer className="text-center py-6 border-t border-neutral-100">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
            Indicative analysis · Consult a CA for exact figures · New Tax Regime FY 2025-26
          </p>
        </footer>
      </main>
    </div>
  );
}
