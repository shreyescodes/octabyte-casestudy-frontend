'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioMetrics as PortfolioMetricsType } from '../types/Portfolio';
import { TrendingUp, TrendingDown, Award, AlertTriangle, PieChart, Target } from 'lucide-react';

interface PortfolioMetricsProps {
  metrics: PortfolioMetricsType | null;
  loading: boolean;
}

export default function PortfolioMetrics({ metrics, loading }: PortfolioMetricsProps) {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Update timestamp whenever metrics change
  useEffect(() => {
    if (metrics) {
      setLastUpdated(new Date());
    }
  }, [metrics]);
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Portfolio Analytics</h2>
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-sm">Fetching live data...</span>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Analytics</h2>
        <div className="text-center text-gray-500 py-8">
          No portfolio data available. Add some stocks to see analytics.
        </div>
      </div>
    );
  }

  const getDiversificationColor = (concentration: string) => {
    switch (concentration) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          Portfolio Analytics
        </h2>
        <div className="flex items-center gap-2 text-green-600">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
          <span className="text-sm">Live Data • {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Return */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Total Return</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-blue-900">
            ₹{(metrics.totalReturn || 0).toLocaleString()}
          </div>
          <div className={`text-sm ${(metrics.totalReturnPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(metrics.totalReturnPercentage || 0) >= 0 ? '+' : ''}{(metrics.totalReturnPercentage || 0).toFixed(2)}%
          </div>
        </div>

        {/* Day Gain */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">Day Gain</span>
            {(metrics.dayGain || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div className={`text-lg font-bold ${(metrics.dayGain || 0) >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            ₹{Math.abs(metrics.dayGain || 0).toLocaleString()}
          </div>
          <div className={`text-sm ${(metrics.dayGainPercentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(metrics.dayGainPercentage || 0) >= 0 ? '+' : ''}{(metrics.dayGainPercentage || 0).toFixed(2)}%
          </div>
        </div>

        {/* Best Performer */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-700">Best Performer</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          {metrics.bestPerformer ? (
            <>
              <div className="text-sm font-semibold text-emerald-900 truncate">
                {metrics.bestPerformer.stock?.stockName || 'N/A'}
              </div>
              <div className="text-sm text-emerald-600">
                +{(metrics.bestPerformer.gainPercentage || 0).toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No gains</div>
          )}
        </div>

        {/* Worst Performer */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700">Worst Performer</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          {metrics.worstPerformer ? (
            <>
              <div className="text-sm font-semibold text-red-900 truncate">
                {metrics.worstPerformer.stock?.stockName || 'N/A'}
              </div>
              <div className="text-sm text-red-600">
                {(metrics.worstPerformer.lossPercentage || 0).toFixed(2)}%
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">No losses</div>
          )}
        </div>

        {/* Diversification */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Diversification</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-lg font-bold text-purple-900">
            {metrics.diversification?.sectorCount || 0} sectors
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${getDiversificationColor(metrics.diversification?.concentration || 'Low')}`}>
            {metrics.diversification?.concentration || 'Low'} risk
          </div>
        </div>

        {/* Average P/E */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700">Avg P/E Ratio</span>
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-lg font-bold text-orange-900">
            {(metrics.averagePE || 0).toFixed(1)}
          </div>
          <div className="text-sm text-orange-600">
            {(metrics.averagePE || 0) < 15 ? 'Undervalued' : (metrics.averagePE || 0) > 25 ? 'Overvalued' : 'Fair'}
          </div>
        </div>
      </div>
    </div>
  );
}