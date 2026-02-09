import { DEFAULT_TAX_SLABS } from '../constants/defaults';

/**
 * Calculate tax under New Tax Regime
 * @param {number} taxableIncome - Taxable income amount
 * @param {number} cess - Cess rate (default 4%)
 * @param {Array|null} customSlabs - Custom tax slabs or null for defaults
 * @returns {Object} Tax breakdown with total, cess, and slab-wise details
 */
export function calcNewRegimeTax(taxableIncome, cess = 0.04, customSlabs = null) {
    const slabs = customSlabs || DEFAULT_TAX_SLABS;
    let remaining = Math.max(taxableIncome, 0);
    let tax = 0;
    const breakdown = [];

    for (const { limit, rate } of slabs) {
        const width = limit === Infinity ? remaining : limit;
        const chunk = Math.min(remaining, width);
        const t = chunk * rate;
        breakdown.push({ width: limit, rate, chunk, tax: t });
        tax += t;
        remaining -= chunk;
        if (remaining <= 0) break;
    }

    const cessAmt = tax * cess;
    return { tax, cess: cessAmt, total: tax + cessAmt, breakdown };
}

/**
 * Calculate EMI for a loan
 * @param {number} principal - Loan principal amount
 * @param {number} annualRate - Annual interest rate (as decimal)
 * @param {number} months - Loan tenure in months
 * @returns {number} Monthly EMI amount
 */
export function calcEMI(principal, annualRate, months) {
    if (principal <= 0 || months <= 0) return 0;
    const r = annualRate / 12;
    if (r === 0) return principal / months;
    return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}
