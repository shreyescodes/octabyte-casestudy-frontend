export interface Stock {
  id: string;
  stockName: string; // Particulars
  symbol: string; // Stock symbol for API calls
  purchasePrice: number;
  quantity: number; // Qty
  investment: number; // Purchase Price × Qty
  portfolioPercentage: number; // Proportional weight in the portfolio
  stockExchangeCode: string; // NSE/BSE
  currentMarketPrice: number; // CMP
  presentValue: number; // CMP × Qty
  gainLoss: number; // Present Value – Investment
  peRatio: number; // P/E Ratio
  latestEarnings: number; // Latest Earnings
  sector: string; // Sector for grouping
  purchaseDate: string; // When the stock was purchased
  lastUpdated: string; // When market data was last updated
}

export interface StockCreateRequest {
  stockName: string;
  symbol: string;
  purchasePrice: number;
  quantity: number;
  stockExchangeCode: string;
  sector: string;
  purchaseDate: string;
}

export interface StockUpdateRequest {
  stockName?: string;
  symbol?: string;
  purchasePrice?: number;
  quantity?: number;
  stockExchangeCode?: string;
  sector?: string;
}