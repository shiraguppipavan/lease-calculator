import * as XLSX from "xlsx";
import { fmtL } from './formatters';

/**
 * Generate and download Excel file with complete analysis
 */
export function generateExcel(inputs, results) {
    const wb = XLSX.utils.book_new();
    const {
        leaseTaxResult, buyTaxResult, leaseYears, buyYears,
        annualTaxSaving, leaseTotal7yr, buyTotal7yr,
        leaseTenureYrs, loanTenureYrs, emi, downPayment,
        netTaxableWithout, netTaxableWith, perquisiteAnnual
    } = results;

    // Sheet 1: Verdict
    const verdictData = [
        ["FINAL VERDICT: LEASE vs BUY"],
        [""],
        ["", "LEASE", "BUY"],
        ["Total Cost (7 Years)", leaseTotal7yr, buyTotal7yr],
        [""],
        ["YOU SAVE WITH LEASE →", buyTotal7yr - leaseTotal7yr],
        [""],
        ["Annual Tax Saving", annualTaxSaving],
        ["Monthly Tax Saving", annualTaxSaving / 12],
        ["Total Tax Saving (Lease Period)", annualTaxSaving * leaseTenureYrs],
        [""],
        ["RECOMMENDATION"],
        [buyTotal7yr > leaseTotal7yr ? "✅ LEASE is the better option" : "✅ BUY is the better option"],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(verdictData);
    ws1["!cols"] = [{ wch: 35 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws1, "Verdict");

    // Sheet 2: The Big Picture
    const maxYears = Math.max(leaseTenureYrs, loanTenureYrs);
    const bigPic = [
        ["THE BIG PICTURE: Year-by-Year Cash Flow"],
        [""],
        ["", ...Array.from({ length: maxYears }, (_, i) => `Year ${i + 1}`), "TOTAL"],
        ["LEASE COST", ...leaseYears, leaseTotal7yr],
        ["BUY COST", ...buyYears, buyTotal7yr],
        ["SAVING (Buy - Lease)", ...leaseYears.map((l, i) => (buyYears[i] || 0) - l), buyTotal7yr - leaseTotal7yr],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(bigPic);
    ws2["!cols"] = [{ wch: 25 }, ...Array(maxYears + 1).fill({ wch: 14 })];
    XLSX.utils.book_append_sheet(wb, ws2, "The Big Picture");

    // Sheet 3: Assumptions
    const assumpData = [
        ["ALL ASSUMPTIONS"],
        [""],
        ["SALARY DETAILS"],
        ["Annual CTC", inputs.ctc],
        ["Standard Deduction", inputs.stdDeduction],
        ["Tax Regime", "New Regime FY 2025-26"],
        [""],
        ["CAR DETAILS"],
        ["On-Road Price", inputs.onRoadPrice],
        ["Engine Capacity", inputs.engineCC === "below" ? "Below 1600cc" : "Above 1600cc"],
        [""],
        ["LEASE PARAMETERS"],
        ["Monthly Lease Rental", inputs.leaseRental],
        ["Fuel/Maint Allowance (monthly)", inputs.fuelAllowance],
        ["Lease Tenure (months)", inputs.leaseTenure],
        ["Buyback Price", inputs.buybackPrice],
        [""],
        ["LOAN PARAMETERS"],
        ["Down Payment %", inputs.downPaymentPct * 100 + "%"],
        ["Down Payment Amount", downPayment],
        ["Loan Interest Rate", inputs.loanRate * 100 + "%"],
        ["Loan Tenure (months)", inputs.loanTenure],
        ["Monthly EMI", emi],
        [""],
        ["RUNNING COSTS (Annual)"],
        ["Insurance", inputs.insurance],
        ["Maintenance", inputs.maintenance],
        ["Fuel", inputs.fuel],
        ["Inflation Rate", inputs.inflationRate * 100 + "%"],
        [""],
        ["RESALE"],
        ["Resale Value", inputs.resaleValue],
        [""],
        ["PERQUISITE"],
        ["Monthly Perquisite", inputs.engineCC === "below" ? 1800 : 2400],
        ["Annual Perquisite", perquisiteAnnual],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(assumpData);
    ws3["!cols"] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Assumptions");

    // Sheet 4: Tax Calc
    const slabLabels = ["₹0-4L @0%", "₹4-8L @5%", "₹8-12L @10%", "₹12-16L @15%", "₹16-20L @20%", "₹20-24L @25%", "Above ₹24L @30%"];
    const taxData = [
        ["DETAILED TAX CALCULATION"],
        [""],
        ["", "WITHOUT Lease", "WITH Lease", "Notes"],
        ["Gross Salary (CTC)", inputs.ctc, inputs.ctc, "Same CTC"],
        ["(-) Lease Rental", 0, inputs.leaseRental * 12, "Deducted pre-tax"],
        ["(-) Fuel Allowance", 0, inputs.fuelAllowance * 12, "Deducted pre-tax"],
        ["(+) Perquisite", 0, perquisiteAnnual, "Added back by govt"],
        ["Gross Taxable", inputs.ctc, inputs.ctc - inputs.leaseRental * 12 - inputs.fuelAllowance * 12 + perquisiteAnnual, ""],
        ["(-) Standard Deduction", inputs.stdDeduction, inputs.stdDeduction, "₹75K new regime"],
        ["Net Taxable Income", netTaxableWithout, netTaxableWith, ""],
        [""],
        ["TAX SLAB BREAKDOWN"],
        ["Slab", "Without Lease", "With Lease"],
        ...buyTaxResult.breakdown.map((b, i) => [
            slabLabels[i] || "", b.tax, leaseTaxResult.breakdown[i]?.tax || 0
        ]),
        [""],
        ["Total Tax (before cess)", buyTaxResult.tax, leaseTaxResult.tax],
        ["Cess @4%", buyTaxResult.cess, leaseTaxResult.cess],
        ["TOTAL TAX", buyTaxResult.total, leaseTaxResult.total],
        [""],
        ["ANNUAL TAX SAVING", "", annualTaxSaving],
        ["MONTHLY TAX SAVING", "", annualTaxSaving / 12],
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(taxData);
    ws4["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws4, "Tax Calc");

    XLSX.writeFile(wb, "Car_Lease_vs_Buy_Analysis.xlsx");
}
