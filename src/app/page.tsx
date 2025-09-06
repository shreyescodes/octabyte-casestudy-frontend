'use client';

import React, { useState } from 'react';
import PortfolioTable from '../components/PortfolioTable';
import PortfolioSummary from '../components/PortfolioSummary';
import SectorSummary from '../components/SectorSummary';
import PortfolioMetrics from '../components/PortfolioMetrics';
import StockModal from '../components/StockModal';
import { usePortfolio } from '../hooks/usePortfolio';
import { Stock, StockCreateRequest, StockUpdateRequest } from '../types/Stock';
import { RefreshCw, AlertCircle, Plus, TrendingUp } from 'lucide-react';

export default function Home() {
  const { stocks, sectorSummary, metrics, loading, error, refreshData, addStock, updateStock, removeStock } = usePortfolio(15000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | undefined>(undefined);
  const [modalLoading, setModalLoading] = useState(false);

  const handleAddStock = () => {
    setEditingStock(undefined);
    setIsModalOpen(true);
  };

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setIsModalOpen(true);
  };

  const handleDeleteStock = async (stockId: string) => {
    const stock = stocks.find(s => s.id === stockId);
    if (!stock) return;

    const confirmMessage = `Are you sure you want to remove "${stock.stockName}" from your portfolio?\n\n` +
      `This will remove:\n` +
      `• ${stock.quantity} shares\n` +
      `• Investment of ₹${stock.investment.toLocaleString()}\n` +
      `• Current value of ₹${stock.presentValue.toLocaleString()}\n\n` +
      `This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        await removeStock(stockId);
        // Show success message (could be replaced with toast notification)
        alert(`Successfully removed ${stock.stockName} from your portfolio.`);
      } catch (error) {
        console.error('Failed to delete stock:', error);
        alert(`Failed to remove ${stock.stockName}. Please try again.`);
      }
    }
  };

  const handleSaveStock = async (stockData: StockCreateRequest | StockUpdateRequest, isEdit: boolean, stockId?: string) => {
    setModalLoading(true);
    try {
      if (isEdit && stockId) {
        await updateStock(stockId, stockData as StockUpdateRequest);
      } else {
        await addStock(stockData as StockCreateRequest);
      }
      // Close modal and show success message on successful save
      setIsModalOpen(false);
      setEditingStock(undefined);
      alert(`Stock ${isEdit ? 'updated' : 'added'} successfully!`);
    } catch (error) {
      console.error('Failed to save stock:', error);
      alert(`Failed to ${isEdit ? 'update' : 'add'} stock. Please try again.`);
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Portfolio</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-8 h-8 text-blue-500" />
                Portfolio Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Real-time portfolio tracking and analytics
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddStock}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Stock
              </button>
              <button
                onClick={refreshData}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary stocks={stocks} />

        {/* Portfolio Metrics */}
        <div className="mb-8">
          <PortfolioMetrics metrics={metrics} loading={loading} />
        </div>

        {/* Sector Summary */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Sector Overview</h2>
          <SectorSummary sectorData={sectorSummary} />
        </div>

        {/* Portfolio Table */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Holdings</h2>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Auto-refreshing every 15 seconds
              </div>
              <button
                onClick={handleAddStock}
                className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Quick Add
              </button>
            </div>
          </div>
          <PortfolioTable 
            stocks={stocks} 
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
          />
          
          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <strong>Debug Info:</strong>
            <br />Stocks count: {stocks.length}
            <br />onDelete function: {typeof handleDeleteStock === 'function' ? 'Available' : 'Not available'}
            <br />Sample stock IDs: {stocks.slice(0, 2).map(s => s.id || 'NO ID').join(', ')}
          </div>
        </div>
      </div>

      {/* Stock Modal */}
      <StockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStock}
        stock={editingStock}
        loading={modalLoading}
      />
    </div>
  );
}