import { motion } from 'framer-motion';
import { Field, Section } from './index';
import { fmt, fmtL } from '../utils/formatters';

export function InputForm({ inputs, set, onCalculate, results }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-6xl mx-auto space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2 tracking-tight">Enter Details</h2>
                <p className="text-neutral-500 text-sm">Fill in your salary, car, and loan details to compare.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Section title="Salary & Tax" delay={0}>
                    <Field label="Annual CTC (₹)" value={inputs.ctc} onChange={set("ctc")} hint="Your total yearly salary" />
                    <Field label="Standard Deduction" value={inputs.stdDeduction} onChange={set("stdDeduction")} hint="₹75K for new regime" />
                    <Field label="Investment Return Rate" value={inputs.investReturn} onChange={set("investReturn")} isPercentage={true} hint="For opportunity cost calc" />
                    <Field label="Cess Rate" value={inputs.cess} onChange={set("cess")} isPercentage={true} />
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
                    <Field label="Down Payment %" value={inputs.downPaymentPct} onChange={set("downPaymentPct")} isPercentage={true} hint={`= ₹${fmt(inputs.onRoadPrice * inputs.downPaymentPct)}`} />
                    <Field label="Interest Rate" value={inputs.loanRate} onChange={set("loanRate")} isPercentage={true} />
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
                    <Field label="Inflation Rate" value={inputs.inflationRate} onChange={set("inflationRate")} isPercentage={true} hint="Annual increase in fuel/maintenance costs" />
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

            <div className="flex justify-center pt-6 pb-12">
                <motion.button
                    onClick={onCalculate}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-black text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
                >
                    Calculate & Compare
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </motion.button>
            </div>
        </motion.div>
    );
}
