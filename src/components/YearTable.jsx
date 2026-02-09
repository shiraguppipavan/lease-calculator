import { motion } from 'framer-motion';
import { fmt, fmtL } from '../utils/formatters';

/**
 * Year-by-year comparison table for lease vs buy costs
 */
export function YearTable({ leaseYears, buyYears, leaseTotal, buyTotal, leaseTenureYrs }) {
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
