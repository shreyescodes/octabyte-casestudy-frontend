'use client';

import React from 'react';
import { Stock } from '../types/Stock';
import { SectorSummary as SectorSummaryType } from '../types/Portfolio';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface SectorSummaryProps {
  sectorData?: SectorSummaryType[];
  stocks?: Stock[]; // Fallback for backward compatibility
}

export default function SectorSummary({ sectorData, stocks }: SectorSummaryProps) {
  const sectorSummaries = React.useMemo(() => {
    // If we have sector data from API, use it
    if (sectorData && sectorData.length > 0) {
      return sectorData;
    }
    
    // Fallback: calculate from stocks if no sector data provided
    if (stocks && stocks.length > 0) {
      const sectors = stocks.reduce((acc, stock) => {
        if (!acc[stock.sector]) {
          acc[stock.sector] = {
            sector: stock.sector,
            totalInvestment: 0,
            totalPresentValue: 0,
            totalGainLoss: 0,
            stocks: [],
            stockCount: 0,
            gainLossPercentage: 0,
          };
        }
        
        acc[stock.sector].totalInvestment += stock.investment;
        acc[stock.sector].totalPresentValue += stock.presentValue;
        acc[stock.sector].totalGainLoss += stock.gainLoss;
        acc[stock.sector].stocks.push(stock);
        acc[stock.sector].stockCount += 1;
        
        return acc;
      }, {} as Record<string, SectorSummaryType>);
      
      // Calculate gain/loss percentages
      Object.values(sectors).forEach(sector => {
        if (sector.totalInvestment > 0) {
          sector.gainLossPercentage = (sector.totalGainLoss / sector.totalInvestment) * 100;
        }
      });
      
      return Object.values(sectors);
    }
    
    return [];
  }, [sectorData, stocks]);

  if (sectorSummaries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sector Data</h3>
        <p className="text-gray-500">Add some stocks to see sector analysis</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {sectorSummaries.map((sector) => {
        const isPositive = sector.totalGainLoss >= 0;
        const gainLossPercentage = ((sector.totalGainLoss / sector.totalInvestment) * 100);
        
        return (
          <div
            key={sector.sector}
            className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {sector.sector}
                </h3>
                <div className="flex items-center">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Investment</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{sector.totalInvestment.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Present Value</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{sector.totalPresentValue.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Gain/Loss</span>
                  <div className={`flex items-center text-sm font-medium ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    ₹{Math.abs(sector.totalGainLoss).toLocaleString()}
                    <span className="ml-1 text-xs">
                      ({gainLossPercentage > 0 ? '+' : ''}{gainLossPercentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Stocks</span>
                  <span className="text-sm font-medium text-gray-900">
                    {sector.stocks.length} holdings
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
