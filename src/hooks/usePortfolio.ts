'use client';

import { useState, useEffect, useCallback } from 'react';
import { Stock, StockCreateRequest, StockUpdateRequest } from '../types/Stock';
import { Portfolio, SectorSummary, PortfolioMetrics } from '../types/Portfolio';
import { portfolioApi, stockApi, isApiError } from '../services/api';

interface UsePortfolioReturn {
  portfolio: Portfolio | null;
  stocks: Stock[];
  sectorSummary: SectorSummary[];
  metrics: PortfolioMetrics | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  addStock: (stock: StockCreateRequest) => Promise<void>;
  updateStock: (id: string, updates: StockUpdateRequest) => Promise<void>;
  removeStock: (id: string) => Promise<void>;
}

export const usePortfolio = (autoRefreshInterval: number = 15000): UsePortfolioReturn => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [sectorSummary, setSectorSummary] = useState<SectorSummary[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all portfolio data
  const fetchPortfolioData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch portfolio summary, sector summary, and metrics in parallel
      const [portfolioData, sectorData, metricsData] = await Promise.all([
        portfolioApi.getPortfolioSummary(),
        portfolioApi.getSectorSummary(),
        portfolioApi.getPortfolioMetrics()
      ]);
      
      setPortfolio(portfolioData);
      setStocks(portfolioData.stocks);
      setSectorSummary(sectorData);
      setMetrics(metricsData);
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : 'Failed to fetch portfolio data';
      setError(errorMessage);
      console.error('Portfolio fetch error:', err);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await fetchPortfolioData();
    } finally {
      setLoading(false);
    }
  }, [fetchPortfolioData]);

  // Add new stock
  const addStock = useCallback(async (newStock: StockCreateRequest) => {
    try {
      setError(null);
      await stockApi.createStock(newStock);
      await refreshData();
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : 'Failed to add stock';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Update existing stock
  const updateStock = useCallback(async (id: string, updates: StockUpdateRequest) => {
    try {
      setError(null);
      await stockApi.updateStock(id, updates);
      await refreshData();
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : 'Failed to update stock';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Remove stock
  const removeStock = useCallback(async (id: string) => {
    try {
      setError(null);
      await stockApi.deleteStock(id);
      await refreshData();
    } catch (err) {
      const errorMessage = isApiError(err) ? err.message : 'Failed to remove stock';
      setError(errorMessage);
      throw err;
    }
  }, [refreshData]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const interval = setInterval(() => {
      fetchPortfolioData();
    }, autoRefreshInterval);

    return () => clearInterval(interval);
  }, [fetchPortfolioData, autoRefreshInterval]);

  return {
    portfolio,
    stocks,
    sectorSummary,
    metrics,
    loading,
    error,
    refreshData,
    addStock,
    updateStock,
    removeStock,
  };
};
