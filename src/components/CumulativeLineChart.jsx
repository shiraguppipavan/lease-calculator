import { motion } from 'framer-motion';
import { fmtL } from '../utils/formatters';

/**
 * Cumulative cost line chart with break-even visualization
 */
export function CumulativeLineChart({ leaseCumulative, buyCumulative, breakEvenYear, maxYears, resaleValue }) {
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
