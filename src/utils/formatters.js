/**
 * Number formatting utilities for Indian locale
 */

/**
 * Format number with Indian locale (commas for thousands)
 */
export const fmt = (n) =>
    new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
        Math.round(n)
    );

/**
 * Format large numbers with abbreviations (L for Lakh, Cr for Crore, K for Thousand)
 */
export const fmtL = (n) => {
    const abs = Math.abs(n);
    if (abs >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${(n / 100000).toFixed(2)}L`;
    if (abs >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return fmt(n);
};
