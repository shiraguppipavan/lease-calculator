# 🚗 Car Lease Calculator · India

> **Make smarter car financing decisions** — A beautiful, interactive tool to compare leasing vs buying a car under India's New Tax Regime (FY 2025-26).

[![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react&logoColor=white)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

![Car Lease Calculator Preview](https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=Car+Lease+Calculator+·+India)

---

## ✨ Features

### 📊 Comprehensive Financial Analysis
- **Side-by-side comparison** of lease vs buy scenarios
- **Tax savings calculation** under India's New Tax Regime (FY 2025-26)
- **Year-by-year cost breakdown** with cumulative tracking
- **Break-even analysis** to find the optimal ownership point

### 🧮 Smart Calculations
- **Perquisite computation** based on engine capacity (below/above 1600cc)
- **EMI calculator** with customizable loan parameters
- **Opportunity cost analysis** — what your down payment could earn if invested
- **SIP future value** — potential returns from monthly savings via leasing
- **Inflation-adjusted running costs** for realistic projections

### 🎨 Modern User Experience
- **Beautiful dark/light mode** with smooth transitions
- **Animated visualizations** powered by Framer Motion
- **Interactive charts** — cumulative cost line chart & bar comparisons
- **Responsive design** — works perfectly on desktop, tablet, and mobile

### 📤 Export & Share
- **Export to Excel (.xlsx)** — detailed breakdown with all calculations
- **Shareable links** — URL parameters preserve all your inputs
- **Customizable tax slabs** — adjust to match your tax situation

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lease-calculator.git
cd lease-calculator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with hooks |
| **Vite 5** | Lightning-fast build tool |
| **TailwindCSS 3** | Utility-first styling |
| **Framer Motion** | Smooth animations & transitions |
| **SheetJS (xlsx)** | Excel export functionality |

---

## 📁 Project Structure

```
lease-calculator/
├── src/
│   ├── components/          # UI components
│   │   ├── InputForm.jsx        # Main input form
│   │   ├── ResultsDashboard.jsx # Results display
│   │   ├── SettingsModal.jsx    # Settings & tax slab editor
│   │   ├── CumulativeLineChart.jsx # Cost comparison chart
│   │   ├── BarChart.jsx         # Bar chart visualization
│   │   ├── YearTable.jsx        # Year-by-year breakdown
│   │   ├── Field.jsx            # Reusable input field
│   │   ├── Section.jsx          # Section wrapper
│   │   └── AnimatedNumber.jsx   # Animated number display
│   ├── hooks/               # Custom React hooks
│   │   ├── useCalculations.js   # All financial calculations
│   │   └── useUrlParams.js      # URL state management
│   ├── utils/               # Utility functions
│   │   ├── calculations.js      # Tax & EMI formulas
│   │   ├── excelExport.js       # Excel generation
│   │   └── formatters.js        # Number formatting
│   ├── constants/           # Default values
│   │   └── defaults.js          # Default inputs & tax slabs
│   ├── App.jsx              # Main application
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── package.json
```

---

## 🔧 Configuration

### Default Values

All default values can be customized in `src/constants/defaults.js`:

```javascript
export const DEFAULT_INPUTS = {
    ctc: 3000000,           // Annual CTC in ₹
    onRoadPrice: 2500000,   // Car on-road price
    leaseRental: 55000,     // Monthly lease rental
    leaseTenure: 48,        // Lease tenure in months
    // ... more options
};
```

### Tax Slabs (New Regime FY 2025-26)

```javascript
export const DEFAULT_TAX_SLABS = [
    { limit: 400000, rate: 0 },      // 0-4L: 0%
    { limit: 400000, rate: 0.05 },   // 4-8L: 5%
    { limit: 400000, rate: 0.10 },   // 8-12L: 10%
    { limit: 400000, rate: 0.15 },   // 12-16L: 15%
    { limit: 400000, rate: 0.20 },   // 16-20L: 20%
    { limit: 400000, rate: 0.25 },   // 20-24L: 25%
    { limit: Infinity, rate: 0.30 }, // >24L: 30%
];
```

---

## 📊 How It Works

### Lease Scenario
1. **Salary restructuring** — lease rental & fuel allowance reduce taxable income
2. **Perquisite addition** — ₹1,800/month (below 1600cc) or ₹2,400/month (above)
3. **Tax benefit** — lower taxable income = lower tax liability
4. **Buyback** — optional car purchase at end of lease tenure

### Buy Scenario
1. **Down payment** — upfront payment (typically 20% of car price)
2. **EMI payments** — monthly loan installments
3. **Running costs** — insurance, maintenance, fuel (inflation-adjusted)
4. **Asset value** — car remains an asset with resale value

### Key Metrics Compared
- **Total Cost of Ownership** over 7 years
- **Annual & monthly tax savings**
- **Break-even year** (when leasing becomes costlier than buying)
- **Opportunity cost** of down payment

---

## 📱 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Input Form
![Input Form](https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Input+Form)

### Results Dashboard
![Results](https://via.placeholder.com/800x600/1a1a2e/ffffff?text=Results+Dashboard)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x600/0a0a0e/ffffff?text=Dark+Mode)

</details>

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

This calculator is for **indicative purposes only**. The calculations are based on simplified assumptions and may not account for all tax implications, charges, or individual circumstances.

**Always consult a qualified Chartered Accountant (CA) for exact tax calculations and financial advice.**

---

## 🙏 Acknowledgments

- Tax slabs based on [India's New Tax Regime (FY 2025-26)](https://incometaxindia.gov.in/)
- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [TailwindCSS](https://tailwindcss.com/)
- Charts powered by custom SVG implementations with [Framer Motion](https://www.framer.com/motion/)

---

<p align="center">
  Made with ❤️ for smarter car financing decisions
</p>
