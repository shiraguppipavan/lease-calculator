/**
 * Default input values for the calculator
 */
export const DEFAULT_INPUTS = {
    ctc: 3000000,
    stdDeduction: 75000,
    cess: 0.04,
    investReturn: 0.12,
    onRoadPrice: 2500000,
    engineCC: "below",
    leaseRental: 55000,
    fuelAllowance: 10000,
    leaseTenure: 48,
    buybackPrice: 100000,
    downPaymentPct: 0.2,
    loanRate: 0.08,
    loanTenure: 84,
    insurance: 45000,
    maintenance: 12000,
    fuel: 105000,
    inflationRate: 0.06,
    resaleValue: 800000,
};

/**
 * Default tax slabs for New Tax Regime FY 2025-26
 */
export const DEFAULT_TAX_SLABS = [
    { limit: 400000, rate: 0 },
    { limit: 400000, rate: 0.05 },
    { limit: 400000, rate: 0.10 },
    { limit: 400000, rate: 0.15 },
    { limit: 400000, rate: 0.20 },
    { limit: 400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
];
