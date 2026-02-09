import { useMemo } from 'react';
import { calcNewRegimeTax, calcEMI } from '../utils/calculations';

/**
 * Custom hook for all lease vs buy calculations
 * @param {Object} inputs - User inputs
 * @param {Array} taxSlabs - Custom tax slabs
 * @returns {Object} Computed results
 */
export function useCalculations(inputs, taxSlabs) {
    return useMemo(() => {
        const {
            ctc, stdDeduction, cess, investReturn, onRoadPrice, engineCC,
            leaseRental, fuelAllowance, leaseTenure, buybackPrice,
            downPaymentPct, loanRate, loanTenure, insurance, maintenance, fuel,
            inflationRate, resaleValue,
        } = inputs;

        const perquisiteMonthly = engineCC === "below" ? 1800 : 2400;
        const perquisiteAnnual = perquisiteMonthly * 12;
        const annualLeaseRental = leaseRental * 12;
        const annualFuelAllow = fuelAllowance * 12;
        const leaseTenureYrs = Math.round(leaseTenure / 12);
        const loanTenureYrs = Math.round(loanTenure / 12);
        const maxYears = Math.max(leaseTenureYrs, loanTenureYrs);
        const baseAnnualRunning = insurance + maintenance + fuel;

        // Taxable income with custom slabs
        const grossWithout = ctc;
        const grossWith = ctc - annualLeaseRental - annualFuelAllow + perquisiteAnnual;
        const netTaxableWithout = Math.max(grossWithout - stdDeduction, 0);
        const netTaxableWith = Math.max(grossWith - stdDeduction, 0);
        const taxableReduction = netTaxableWithout - netTaxableWith;

        const buyTaxResult = calcNewRegimeTax(netTaxableWithout, cess, taxSlabs);
        const leaseTaxResult = calcNewRegimeTax(netTaxableWith, cess, taxSlabs);
        const annualTaxSaving = buyTaxResult.total - leaseTaxResult.total;
        const monthlyTaxSaving = annualTaxSaving / 12;

        // EMI
        const downPayment = onRoadPrice * downPaymentPct;
        const loanAmount = onRoadPrice - downPayment;
        const emi = calcEMI(loanAmount, loanRate, loanTenure);
        const totalInterest = emi * loanTenure - loanAmount;

        // Opportunity cost of down payment
        const dpFutureValue = downPayment * Math.pow(1 + investReturn, maxYears);
        const opportunityCost = dpFutureValue - downPayment;

        // Year-by-year with inflation
        const leaseYears = [];
        const buyYears = [];
        const leaseCumulative = [];
        const buyCumulative = [];
        let leaseTotal = 0;
        let buyTotal = 0;
        let breakEvenYear = null;

        // Monthly savings investment (SIP calculation for lease savings)
        const effectiveMonthlyLease = leaseRental + fuelAllowance - monthlyTaxSaving;
        const effectiveMonthlyBuy = emi + baseAnnualRunning / 12;
        const monthlySaving = Math.max(effectiveMonthlyBuy - effectiveMonthlyLease, 0);
        const monthlyRate = investReturn / 12;
        const sipMonths = maxYears * 12;
        const sipFutureValue = monthlySaving > 0
            ? monthlySaving * ((Math.pow(1 + monthlyRate, sipMonths) - 1) / monthlyRate)
            : 0;

        for (let yr = 1; yr <= maxYears; yr++) {
            // Apply inflation to running costs
            const inflationMultiplier = Math.pow(1 + inflationRate, yr - 1);
            const yearFuel = fuel * inflationMultiplier;
            const yearMaintenance = maintenance * inflationMultiplier;
            const yearInsurance = insurance * inflationMultiplier;
            const yearRunning = yearInsurance + yearMaintenance + yearFuel;

            let lCost = 0;
            if (yr <= leaseTenureYrs) {
                lCost = annualLeaseRental + annualFuelAllow - annualTaxSaving;
                const fuelNet = Math.max(yearFuel - annualFuelAllow, 0);
                lCost += fuelNet;
                if (yr === leaseTenureYrs) lCost += buybackPrice;
            } else {
                lCost = yearRunning;
            }
            leaseYears.push(Math.round(lCost));
            leaseTotal += lCost;
            leaseCumulative.push(Math.round(leaseTotal));

            let bCost = 0;
            if (yr === 1) bCost += downPayment;
            if (yr <= loanTenureYrs) bCost += emi * 12;
            bCost += yearRunning;
            buyYears.push(Math.round(bCost));
            buyTotal += bCost;
            buyCumulative.push(Math.round(buyTotal));

            // Check break-even point
            if (breakEvenYear === null && leaseTotal > buyTotal - resaleValue) {
                breakEvenYear = yr;
            }
        }

        // Final totals
        const leaseTotal7yr = Math.round(leaseTotal);
        const buyTotalGross = Math.round(buyTotal);
        const buyTotal7yr = Math.round(buyTotal - resaleValue);

        return {
            perquisiteMonthly, perquisiteAnnual, annualLeaseRental, annualFuelAllow,
            leaseTenureYrs, loanTenureYrs, maxYears, annualRunning: baseAnnualRunning,
            netTaxableWithout, netTaxableWith, taxableReduction,
            buyTaxResult, leaseTaxResult, annualTaxSaving, monthlyTaxSaving,
            downPayment, loanAmount, emi, totalInterest,
            dpFutureValue, opportunityCost,
            leaseYears, buyYears, leaseTotal7yr, buyTotal7yr, buyTotalGross,
            leaseCumulative, buyCumulative, breakEvenYear,
            effectiveMonthlyLease, effectiveMonthlyBuy,
            monthlySaving, sipFutureValue, resaleValue,
        };
    }, [inputs, taxSlabs]);
}
