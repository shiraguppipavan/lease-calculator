import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_INPUTS } from '../constants/defaults';

/**
 * Parse URL parameters on initial load
 * @returns {Object} Merged inputs from URL params and defaults
 */
function getInitialInputs() {
    const defaults = { ...DEFAULT_INPUTS };

    if (typeof window !== 'undefined' && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        for (const [key, value] of params.entries()) {
            if (key in defaults) {
                try {
                    defaults[key] = JSON.parse(value);
                } catch {
                    defaults[key] = parseFloat(value) || defaults[key];
                }
            }
        }
    }
    return defaults;
}

/**
 * Custom hook for URL parameter encoding/decoding
 * @returns {Object} inputs state, setter, and copy function
 */
export function useUrlParams() {
    const [inputs, setInputs] = useState(getInitialInputs);

    // Update URL when inputs change
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(inputs).forEach(([k, v]) => {
            if (typeof v === 'number') params.set(k, String(v));
            else params.set(k, JSON.stringify(v));
        });
        window.history.replaceState({}, '', `?${params}`);
    }, [inputs]);

    const copyShareLink = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
    }, []);

    const set = useCallback(
        (key) => (val) => setInputs((p) => ({ ...p, [key]: val })),
        []
    );

    return { inputs, setInputs, set, copyShareLink };
}
