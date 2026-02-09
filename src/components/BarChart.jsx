import { motion } from 'framer-motion';
import { fmtL } from '../utils/formatters';

/**
 * Mini horizontal bar chart for cost breakdowns
 */
export function BarChart({ data, maxVal }) {
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
