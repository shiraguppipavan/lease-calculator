import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_TAX_SLABS } from '../constants/defaults';

/**
 * Settings modal for dark mode and tax slab configuration
 */
export function SettingsModal({ isOpen, onClose, taxSlabs, setTaxSlabs, darkMode, setDarkMode }) {
    if (!isOpen) return null;

    const updateSlab = (index, field, value) => {
        const newSlabs = [...taxSlabs];
        let val = parseFloat(value);
        if (isNaN(val)) val = 0;

        if (field === 'rate') {
            val = val / 100;
        } else if (field === 'limit') {
            val = val * 100000; // Convert Lakhs to absolute
        }

        newSlabs[index] = { ...newSlabs[index], [field]: val };
        setTaxSlabs(newSlabs);
    };

    const resetToDefaults = () => {
        setTaxSlabs([...DEFAULT_TAX_SLABS.map(s => ({ ...s }))]);
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
                    className={`w-full max-w-lg mx-4 rounded-2xl p-6 shadow-xl ${darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold tracking-tight">Settings</h2>
                        <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${darkMode ? 'hover:bg-neutral-700' : 'hover:bg-neutral-100'}`}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div className={`flex justify-between items-center mb-6 pb-4 border-b ${darkMode ? 'border-neutral-700' : 'border-neutral-100'}`}>
                        <div>
                            <p className="font-medium text-sm">Dark Mode</p>
                            <p className="text-xs text-neutral-400">Toggle dark theme</p>
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-black border border-neutral-700' : 'bg-neutral-200'}`}
                        >
                            <div className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                        </button>
                    </div>

                    {/* Tax Slabs */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="font-medium text-sm">Tax Slabs (New Regime)</p>
                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">Edit limit (Lakhs) & Rate (%)</p>
                            </div>
                            <button
                                onClick={resetToDefaults}
                                className="text-[10px] uppercase tracking-wider text-neutral-500 hover:text-black font-semibold"
                            >
                                Reset to Default
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-12 gap-3 text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">
                                <div className="col-span-2 text-center">Slab</div>
                                <div className="col-span-5">Limit (Lakhs)</div>
                                <div className="col-span-5">Rate (%)</div>
                            </div>
                            {taxSlabs.map((slab, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-2 text-[10px] font-bold text-neutral-400 text-center">#{i + 1}</div>
                                    <div className="col-span-5 relative">
                                        <input
                                            type={slab.limit === Infinity ? "text" : "number"}
                                            value={slab.limit === Infinity ? "∞" : slab.limit / 100000}
                                            disabled={slab.limit === Infinity}
                                            onChange={(e) => updateSlab(i, 'limit', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-black transition-all ${darkMode
                                                ? 'bg-neutral-700 border-neutral-600 disabled:opacity-50'
                                                : 'bg-neutral-50 border-neutral-200 disabled:bg-neutral-100'
                                                }`}
                                            placeholder="Limit"
                                        />
                                        {slab.limit !== Infinity && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">L</span>}
                                    </div>
                                    <div className="col-span-5 relative">
                                        <input
                                            type="number"
                                            value={Math.round(slab.rate * 100)}
                                            onChange={(e) => updateSlab(i, 'rate', e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-black transition-all ${darkMode ? 'bg-neutral-700 border-neutral-600' : 'bg-neutral-50 border-neutral-200'
                                                }`}
                                            step="1"
                                        />
                                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`mt-6 p-3 rounded-xl flex gap-3 ${darkMode ? 'bg-neutral-700/50' : 'bg-neutral-50'}`}>
                        <svg width="16" height="16" className="text-neutral-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-[10px] text-neutral-500 leading-relaxed">
                            <span className="font-bold text-neutral-400 block uppercase mb-0.5 tracking-wider">Example</span>
                            Setting Slab #1 Limit to 5L means first 5 Lakhs of income is taxed at that slab's rate. Total tax is calculated progressively.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
