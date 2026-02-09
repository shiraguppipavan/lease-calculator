import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { fmt } from '../utils/formatters';

/**
 * Animated number display with spring animation
 */
export function AnimatedNumber({ value, prefix = "₹", className = "" }) {
    const spring = useSpring(0, { stiffness: 40, damping: 20 });
    const display = useTransform(spring, (v) => `${prefix}${fmt(v)}`);
    const ref = useRef(null);

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    useEffect(() => {
        const unsub = display.on("change", (v) => {
            if (ref.current) ref.current.textContent = v;
        });
        return unsub;
    }, [display]);

    return <motion.span ref={ref} className={className} />;
}
