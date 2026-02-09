import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedNumber, BarChart, YearTable, CumulativeLineChart } from './index';
import { fmt, fmtL } from '../utils/formatters';

export function ResultsDashboard({ results, inputs, onEdit }) {
    const [activeTab, setActiveTab] = useState("overview");
    const saving = results.buyTotal7yr - results.leaseTotal7yr;
    const leaseWins = saving > 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            {/* Back Button */}
            <div className="flex justify-between items-center">
                <button
                    onClick={onEdit}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition-colors"
                >
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Edit Inputs
                </button>
                <span className="text-xs text-neutral-400 uppercase tracking-widest">Analysis Results</span>
            </div>

            {/* Hero Verdict */}
            <motion.div layout className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 sm:p-8">
                    <div className="grid sm:grid-cols-3 gap-6 items-center">
                        {/* Lease */}
                        <div className="text-center sm:text-left">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                                Lease · {results.leaseTenureYrs}yr total cost
                            </p>
                            <AnimatedNumber value={results.leaseTotal7yr} className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums" />
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
                                <AnimatedNumber value={Math.abs(saving)} className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums" />
                                <p className="text-[9px] uppercase tracking-[0.2em] opacity-50 mt-0.5">
                                    over {results.maxYears} years
                                </p>
                            </motion.div>
                        </div>

                        {/* Buy */}
                        <div className="text-center sm:text-right">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1">
                                Buy · {results.loanTenureYrs}yr net cost
                            </p>
                            <AnimatedNumber value={results.buyTotal7yr} className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums" />
                        </div>
                    </div>

                    {/* Proportional bar */}
                    <div className="mt-6 flex gap-1 h-3 rounded-full overflow-hidden bg-neutral-100">
                        <motion.div
                            className="bg-neutral-800 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(results.leaseTotal7yr / (results.leaseTotal7yr + results.buyTotal7yr)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                        <motion.div
                            className="bg-neutral-300 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(results.buyTotal7yr / (results.leaseTotal7yr + results.buyTotal7yr)) * 100}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
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
                            ? `You save ₹${fmtL(saving)} over ${results.maxYears} years. Tax saving of ₹${fmtL(results.annualTaxSaving)}/year. Resale value of ₹${fmtL(results.resaleValue)} already deducted from buy cost.`
                            : `Buying saves you ₹${fmtL(Math.abs(saving))} over ${results.maxYears} years after accounting for ₹${fmtL(results.resaleValue)} resale value.`}
                    </p>
                </div>
            </motion.div>

            {/* Quick Stats */}
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

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-neutral-100 rounded-xl w-fit">
                {[
                    { id: "overview", label: "Overview" },
                    { id: "yearwise", label: "Year-by-Year" },
                    { id: "tax", label: "Tax Breakdown" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-[10px] uppercase tracking-[0.15em] px-4 py-2 rounded-lg transition-all ${activeTab === tab.id ? "bg-black text-white shadow-sm" : "text-neutral-500 hover:text-black"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
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
                                maxVal={results.buyTotalGross}
                                data={[
                                    { label: "Down Payment", value: results.downPayment, color: "#1F2937" },
                                    { label: "Total EMI", value: results.emi * inputs.loanTenure, color: "#374151" },
                                    { label: "Interest to Bank", value: results.totalInterest, color: "#6B7280" },
                                    { label: `Running Costs (${results.loanTenureYrs} yrs)`, value: results.annualRunning * results.loanTenureYrs, color: "#9CA3AF" },
                                    { label: `(-) Resale Value`, value: results.resaleValue, color: "#22C55E" },
                                ]}
                            />
                        </div>

                        {/* How tax saving works */}
                        <div className="sm:col-span-2 bg-white border border-neutral-100 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4">How The Tax Saving Works</h3>
                            <div className="grid sm:grid-cols-4 gap-4">
                                {[
                                    { step: "01", title: "Your CTC", desc: `₹${fmtL(inputs.ctc)}`, sub: "Starting salary" },
                                    { step: "02", title: "Deducted Pre-Tax", desc: `₹${fmtL(inputs.leaseRental * 12 + inputs.fuelAllowance * 12)}/yr`, sub: "Lease + Fuel from CTC" },
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
                                        {i < 3 && <div className="hidden sm:block absolute top-1/2 -right-3 text-neutral-300 text-lg">→</div>}
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
                        {/* Line Chart */}
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
                                    {results.buyTaxResult.breakdown.map((item, i) => {
                                        const wb_ = results.buyTaxResult.breakdown[i];
                                        const wl = results.leaseTaxResult.breakdown[i];

                                        // Calculate range label dynamically
                                        let rangeLabel = "";
                                        let prevLimit = 0;
                                        for (let j = 0; j < i; j++) {
                                            if (results.buyTaxResult.breakdown[j].width !== Infinity) {
                                                prevLimit += results.buyTaxResult.breakdown[j].width;
                                            }
                                        }
                                        const start = prevLimit / 100000;
                                        const end = item.width === Infinity ? "+" : (prevLimit + item.width) / 100000;
                                        rangeLabel = `₹${start}–${end}L @${Math.round(item.rate * 100)}%`;

                                        return (
                                            <div key={i} className="flex justify-between text-xs border-b border-neutral-50 pb-1.5">
                                                <span className="text-neutral-500">{rangeLabel}</span>
                                                <div className="flex gap-6 tabular-nums">
                                                    <span className="w-24 text-right text-neutral-400">{wb_ && wb_.tax > 0 ? fmt(wb_.tax) : "—"}</span>
                                                    <span className="w-24 text-right">{wl && wl.tax > 0 ? fmt(wl.tax) : "—"}</span>
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
        </motion.div>
    );
}
