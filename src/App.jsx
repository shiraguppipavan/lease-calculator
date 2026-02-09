import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useCalculations, useUrlParams } from './hooks';

// Components
import {
    SettingsModal,
    InputForm,
    ResultsDashboard,
} from './components';

// Utils & Constants
import { generateExcel } from './utils/excelExport';
import { DEFAULT_TAX_SLABS } from './constants/defaults';

export default function App() {
    // State
    const { inputs, set, copyShareLink } = useUrlParams();
    const [taxSlabs, setTaxSlabs] = useState(DEFAULT_TAX_SLABS);
    const [darkMode, setDarkMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [view, setView] = useState("input"); // Always default to "input"

    // Calculations
    const results = useCalculations(inputs, taxSlabs);

    const handleCalculate = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setView("results");
    };

    const handleEdit = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setView("input");
    };

    return (
        <div
            className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-neutral-900 text-white' : 'bg-neutral-50 text-black'}`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                taxSlabs={taxSlabs}
                setTaxSlabs={setTaxSlabs}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />

            {/* Header */}
            <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/80 border-neutral-100'}`}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <div
                                onClick={() => setView("input")}
                                className={`w-7 h-7 rounded-md flex items-center justify-center cursor-pointer ${darkMode ? 'bg-white' : 'bg-black'}`}
                            >
                                <span className={`text-xs font-bold ${darkMode ? 'text-black' : 'text-white'}`}>CL</span>
                            </div>
                            <div onClick={() => setView("input")} className="cursor-pointer">
                                <h1 className="text-sm font-semibold tracking-tight leading-none">Car Lease Calculator</h1>
                                <p className={`text-[10px] tracking-wide ${darkMode ? 'text-neutral-500' : 'text-neutral-400'}`}>
                                    India · New Tax Regime
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Settings */}
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

                            {/* Share */}
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

                            {/* Export */}
                            <motion.button
                                onClick={() => generateExcel(inputs, results)}
                                className={`relative text-[10px] uppercase tracking-wider px-4 py-1.5 rounded-lg overflow-hidden group ${darkMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                <span className="relative z-10 flex items-center gap-1.5">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    Export .xlsx
                                </span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <AnimatePresence mode="wait">
                    {view === "input" ? (
                        <InputForm
                            key="input"
                            inputs={inputs}
                            set={set}
                            onCalculate={handleCalculate}
                            results={results}
                        />
                    ) : (
                        <ResultsDashboard
                            key="results"
                            results={results}
                            inputs={inputs}
                            onEdit={handleEdit}
                        />
                    )}
                </AnimatePresence>

                {/* Footer */}
                <footer className="text-center py-6 border-t border-neutral-100 mt-12">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        Indicative analysis · Consult a CA for exact figures · New Tax Regime FY 2025-26
                    </p>
                </footer>
            </main>
        </div>
    );
}
