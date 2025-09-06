'use client';

import React from 'react';
import { Stock } from '../types/Stock';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';

interface PortfolioSummaryProps {
  stocks: Stock[];
}

export default function PortfolioSummary({ stocks }: PortfolioSummaryProps) {
  const summary = React.useMemo(() => {
    const totalInvestment = stocks.reduce((sum, stock) => sum + stock.investment, 0);
    const totalPresentValue = stocks.reduce((sum, stock) => sum + stock.presentValue, 0);
    const totalGainLoss = totalPresentValue - totalInvestment;
    const gainLossPercentage = ((totalGainLoss / totalInvestment) * 100);
    
    return {
      totalInvestment,
      totalPresentValue,
      totalGainLoss,
      gainLossPercentage,
      totalStocks: stocks.length,
    };
  }, [stocks]);

  const isPositive = summary.totalGainLoss >= 0;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Portfolio Overview</h2>
          <PieChart className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Total Investment</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{summary.totalInvestment.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Present Value</p>
            <p className="text-xl font-bold text-gray-900">
              ₹{summary.totalPresentValue.toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className={`w-8 h-8 mx-auto mb-2 flex items-center justify-center ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-8 h-8" />
              ) : (
                <TrendingDown className="w-8 h-8" />
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Gain/Loss</p>
            <p className={`text-xl font-bold ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? '+' : ''}₹{summary.totalGainLoss.toLocaleString()}
            </p>
            <p className={`text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              ({summary.gainLossPercentage > 0 ? '+' : ''}{summary.gainLossPercentage.toFixed(2)}%)
            </p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <PieChart className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Total Holdings</p>
            <p className="text-xl font-bold text-gray-900">
              {summary.totalStocks}
            </p>
            <p className="text-sm text-gray-500">stocks</p>
          </div>
        </div>
      </div>
    </div>
  );
}
