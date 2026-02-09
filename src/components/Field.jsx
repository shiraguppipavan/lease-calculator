/**
 * Input field component with label, hints, and dropdown support
 */
export function Field({ label, value, onChange, suffix, type = "number", options, hint, isPercentage }) {
    const displayValue = isPercentage ? (value * 100) : value;

    if (options) {
        return (
            <div className="group relative">
                <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1 font-medium min-h-[2.5rem] flex items-end">
                    {label}
                </label>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-transparent border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black appearance-none focus:outline-none focus:border-black transition-colors"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                    {options.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
                {hint && <p className="text-[10px] text-neutral-400 mt-1 leading-tight">{hint}</p>}
            </div>
        );
    }

    return (
        <div className="group relative">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-neutral-400 mb-1 font-medium min-h-[2.5rem] flex items-end">
                {label}
            </label>
            <div className="relative">
                <input
                    type={type}
                    value={displayValue}
                    onChange={(e) => {
                        const val = type === "number" ? Number(e.target.value) : e.target.value;
                        onChange(isPercentage ? val / 100 : val);
                    }}
                    className="w-full bg-transparent border border-neutral-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black transition-colors tabular-nums"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                {(suffix || isPercentage) && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400 uppercase tracking-wider">
                        {isPercentage ? "%" : suffix}
                    </span>
                )}
            </div>
            {hint && <p className="text-[10px] text-neutral-400 mt-1 leading-tight">{hint}</p>}
        </div>
    );
}
