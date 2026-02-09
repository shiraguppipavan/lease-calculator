import { motion } from 'framer-motion';

/**
 * Section wrapper with title and animation
 */
export function Section({ title, children, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm"
        >
            <h3
                className="text-[11px] uppercase tracking-[0.2em] text-neutral-400 mb-4 pb-2 border-b border-neutral-100"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                {title}
            </h3>
            <div className="grid grid-cols-2 gap-4">{children}</div>
        </motion.div>
    );
}
