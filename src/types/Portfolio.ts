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