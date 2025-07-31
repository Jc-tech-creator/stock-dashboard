# Components Structure

This folder contains all React components organized by functionality:

## 📁 Search/
Contains search-related components
- `SearchBar.js` - Main search input component
- `SearchBar.css` - Search component styles
- `index.js` - Export file

## 📁 Stocks/
Contains stock display components
- `StockList.js` - Component for displaying lists of stocks
- `StockList.css` - Stock list component styles  
- `index.js` - Export file

## 📁 Portfolio/
Contains portfolio management components
- `Portfolio.js` - Main portfolio container with tabs
- `Portfolio.css` - Portfolio container styles
- `Holdings.js` - Holdings view component
- `Holdings.css` - Holdings component styles
- `Treemap.js` - Treemap visualization component
- `Treemap.css` - Treemap component styles
- `index.js` - Export file

## 📁 Charts/
Contains charting and analytics components
- `Charts.js` - Portfolio performance charts (Net Wealth & Return Rate)
- `Charts.css` - Chart component styles
- `index.js` - Export file

## 📁 Modals/
Contains modal and popup components
- `StockModal.js` - Trading modal with stock details and buy/sell functionality
- `StockModal.css` - Modal component styles
- `index.js` - Export file

##  index.js
Central export file for all components, allowing clean imports like:
```javascript
import { SearchBar, StockList, Portfolio } from './components';
```

## Component Relationships

```
App.js
├── SearchBar (Search/)
├── StockList (Stocks/) - Used multiple times for different stock lists
├── Charts (Charts/) - Portfolio performance visualization
├── Portfolio (Portfolio/)
│   ├── Holdings (Portfolio/)
│   └── Treemap (Portfolio/)
└── StockModal (Modals/) - Overlay for stock transactions
```

## Usage

Components can be imported individually:
```javascript
import SearchBar from './components/Search';
import StockList from './components/Stocks';
```

Or as a group from the main index:
```javascript
import { SearchBar, StockList, Portfolio, Charts, StockModal } from './components';
```
