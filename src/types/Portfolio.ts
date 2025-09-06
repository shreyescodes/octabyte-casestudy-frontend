import { Stock } from './Stock';

export interface Portfolio {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stocks: Stock[];
}

export interface SectorSummary {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stocks: Stock[];
  stockCount: number;
  gainLossPercentage: number;
}

export interface PortfolioMetrics {
  totalReturn: number;
  totalReturnPercentage: number;
  dayGain: number;
  dayGainPercentage: number;
  bestPerformer: {
    stock: Stock;
    gainPercentage: number;
  } | null;
  worstPerformer: {
    stock: Stock;
    lossPercentage: number;
  } | null;
  diversification: {
    sectorCount: number;
    largestSectorWeight: number;
    concentration: 'Low' | 'Medium' | 'High';
  };
  averagePE: number;
  totalDividendYield: number;
}

export interface SectorData {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
  stockCount: number;
  gainLossPercentage: number;
}

export interface PortfolioOverview {
  totalStocks: number;
  totalSectors: number;
  bestPerformingStock: Stock | null;
  worstPerformingStock: Stock | null;
  topSectorByValue: SectorData | null;
}