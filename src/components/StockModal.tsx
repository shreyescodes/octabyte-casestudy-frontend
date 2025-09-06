'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stock, StockCreateRequest, StockUpdateRequest } from '../types/Stock';
import { X, Save, Loader, ChevronDown } from 'lucide-react';
import { stockApi } from '../services/api';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockData: StockCreateRequest | StockUpdateRequest, isEdit: boolean, stockId?: string) => Promise<void>;
  stock?: Stock;
  loading: boolean;
}

const sectors = [
  'Technology',
  'Financials',
  'Healthcare',
  'Energy',
  'Consumer Goods',
  'Industrials',
  'Materials',
  'Utilities',
  'Real Estate',
  'Telecommunications',
  'Consumer Services',
  'Auto',
];

const exchanges = ['NSE', 'BSE'];

export default function StockModal({ isOpen, onClose, onSave, stock, loading }: StockModalProps) {
  const [formData, setFormData] = useState({
    stockName: '',
    symbol: '',
    purchasePrice: '',
    quantity: '',
    stockExchangeCode: 'NSE',
    sector: 'Technology',
    purchaseDate: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stockSuggestions, setStockSuggestions] = useState<{name: string, symbol: string, exchange: string, sector: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const isEdit = !!stock;

  useEffect(() => {
    if (isOpen) {
      if (stock) {
        setFormData({
          stockName: stock.stockName,
          symbol: stock.symbol,
          purchasePrice: stock.purchasePrice.toString(),
          quantity: stock.quantity.toString(),
          stockExchangeCode: stock.stockExchangeCode,
          sector: stock.sector,
          purchaseDate: stock.purchaseDate,
        });
      } else {
        setFormData({
          stockName: '',
          symbol: '',
          purchasePrice: '',
          quantity: '',
          stockExchangeCode: 'NSE',
          sector: 'Technology',
          purchaseDate: new Date().toISOString().split('T')[0],
        });
      }
      setErrors({});
    }
  }, [isOpen, stock]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.stockName.trim()) {
      newErrors.stockName = 'Stock name is required';
    }

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    const price = parseFloat(formData.purchasePrice);
    if (!formData.purchasePrice || isNaN(price) || price <= 0) {
      newErrors.purchasePrice = 'Valid purchase price is required';
    }

    const qty = parseInt(formData.quantity);
    if (!formData.quantity || isNaN(qty) || qty <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const stockData = {
        stockName: formData.stockName.trim(),
        symbol: formData.symbol.trim().toUpperCase(),
        purchasePrice: parseFloat(formData.purchasePrice),
        quantity: parseInt(formData.quantity),
        stockExchangeCode: formData.stockExchangeCode,
        sector: formData.sector,
        ...(isEdit ? {} : { purchaseDate: formData.purchaseDate }),
      };

      await onSave(stockData, isEdit, stock?.id);
      onClose();
    } catch (error) {
      console.error('Failed to save stock:', error);
    }
  };

  // Search for stock suggestions
  const searchStocks = async (query: string) => {
    if (query.length < 2) {
      setStockSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const suggestions = await stockApi.searchStocks(query);
      setStockSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to search stocks:', error);
      setStockSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle stock name autocomplete
    if (field === 'stockName') {
      // Clear existing timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Set new timeout for search
      const timeout = setTimeout(() => {
        searchStocks(value);
      }, 300); // Wait 300ms after user stops typing

      setSearchTimeout(timeout);
    }
  };

  // Handle stock selection from dropdown
  const handleStockSelect = (selectedStock: {name: string, symbol: string, exchange: string, sector: string}) => {
    setFormData(prev => ({
      ...prev,
      stockName: selectedStock.name,
      symbol: selectedStock.symbol.replace('.NS', '').replace('.BO', ''), // Remove exchange suffix for symbol field
      stockExchangeCode: selectedStock.exchange,
      sector: selectedStock.sector
    }));
    setShowSuggestions(false);
    setStockSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Stock' : 'Add New Stock'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Stock Name with Autocomplete */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Name *
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.stockName}
                onChange={(e) => handleInputChange('stockName', e.target.value)}
                onFocus={() => {
                  if (stockSuggestions.length > 0) setShowSuggestions(true);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.stockName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Start typing stock name (e.g., Reliance, TCS, HDFC)"
                autoComplete="off"
              />
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            
            {/* Autocomplete Dropdown */}
            {showSuggestions && stockSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {stockSuggestions.map((stock, index) => (
                  <div
                    key={index}
                    onClick={() => handleStockSelect(stock)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{stock.name}</div>
                        <div className="text-sm text-gray-500">
                          {stock.symbol} • {stock.exchange} • {stock.sector}
                        </div>
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        {stock.exchange}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {errors.stockName && (
              <p className="text-red-500 text-xs mt-1">{errors.stockName}</p>
            )}
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                errors.symbol ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., RELIANCE"
            />
            {errors.symbol && (
              <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>
            )}
          </div>

          {/* Purchase Price and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchasePrice}
                onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.purchasePrice ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.purchasePrice && (
                <p className="text-red-500 text-xs mt-1">{errors.purchasePrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
              )}
            </div>
          </div>

          {/* Exchange and Sector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exchange
              </label>
              <select
                value={formData.stockExchangeCode}
                onChange={(e) => handleInputChange('stockExchangeCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {exchanges.map((exchange) => (
                  <option key={exchange} value={exchange}>
                    {exchange}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Purchase Date (only for new stocks) */}
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white ${
                  errors.purchaseDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.purchaseDate && (
                <p className="text-red-500 text-xs mt-1">{errors.purchaseDate}</p>
              )}
            </div>
          )}

          {/* Investment Preview */}
          {formData.purchasePrice && formData.quantity && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Investment Amount:</div>
              <div className="text-lg font-semibold text-gray-900">
                ₹{(parseFloat(formData.purchasePrice) * parseInt(formData.quantity)).toLocaleString()}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? 'Update Stock' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}