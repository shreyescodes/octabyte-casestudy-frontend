import axios from 'axios';
import { Stock } from '../types/Stock';
import { Portfolio, SectorSummary } from '../types/Portfolio';

// Configure axios with base URL for backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Response wrapper interface matching backend
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Add request/response interceptors for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from our API response wrapper
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const apiResponse = response.data as ApiResponse;
      if (apiResponse.success && apiResponse.data) {
        // Replace response.data with the actual data
        response.data = apiResponse.data;
      } else if (!apiResponse.success) {
        throw new Error(apiResponse.error || 'API request failed');
      }
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
);

// Stock API functions
export const stockApi = {
  // Fetch all stocks
  getAllStocks: async (): Promise<Stock[]> => {
    try {
      const response = await apiClient.get<Stock[]>('/stocks');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      throw new Error('Failed to fetch stocks');
    }
  },

  // Fetch specific stock by ID
  getStock: async (id: string): Promise<Stock> => {
    try {
      const response = await apiClient.get<Stock>(`/stocks/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stock ${id}:`, error);
      throw new Error(`Failed to fetch stock data`);
    }
  },

  // Add a new stock
  createStock: async (stock: {
    stockName: string;
    purchasePrice: number;
    quantity: number;
    stockExchangeCode: string;
    currentMarketPrice: number;
    peRatio?: number;
    latestEarnings?: number;
    sector: string;
  }): Promise<Stock> => {
    try {
      const response = await apiClient.post<Stock>('/stocks', stock);
      return response.data;
    } catch (error) {
      console.error('Failed to create stock:', error);
      throw new Error('Failed to add stock');
    }
  },

  // Update stock
  updateStock: async (id: string, updates: {
    stockName?: string;
    purchasePrice?: number;
    quantity?: number;
    stockExchangeCode?: string;
    currentMarketPrice?: number;
    peRatio?: number;
    latestEarnings?: number;
    sector?: string;
  }): Promise<Stock> => {
    try {
      const response = await apiClient.put<Stock>(`/stocks/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update stock:', error);
      throw new Error('Failed to update stock');
    }
  },

  // Delete stock
  deleteStock: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/stocks/${id}`);
    } catch (error) {
      console.error('Failed to delete stock:', error);
      throw new Error('Failed to delete stock');
    }
  },

  // Get stocks by sector
  getStocksBySector: async (sector: string): Promise<Stock[]> => {
    try {
      const response = await apiClient.get<Stock[]>(`/stocks/sector/${sector}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch stocks for sector ${sector}:`, error);
      throw new Error(`Failed to fetch stocks for sector ${sector}`);
    }
  },

  // Search stocks for autocomplete (legacy endpoint)
  searchStocks: async (query: string): Promise<{name: string, symbol: string, exchange: string, sector: string}[]> => {
    try {
      if (query.length < 2) return [];
      const response = await apiClient.get(`/stocks/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to search stocks for "${query}":`, error);
      return [];
    }
  },
};

// Market API functions for comprehensive stock search
export interface MarketStock {
  symbol: string;
  name: string;
  sector: string;
  exchange: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  available: boolean;
  hasLiveData?: boolean;
}

export interface MarketInfo {
  totalStocks: number;
  exchanges: Array<{
    code: string;
    name: string;
    stockCount: number;
  }>;
  sectors: Array<{
    name: string;
    stockCount: number;
  }>;
}

export const marketApi = {
  // Search stocks across all exchanges
  searchStocks: async (query: string, limit: number = 20): Promise<{
    data: MarketStock[];
    totalResults: number;
    message: string;
  }> => {
    try {
      if (query.length < 2) return { data: [], totalResults: 0, message: 'Query too short' };
      
      const response = await apiClient.get(`/market/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      return {
        data: response.data.data || [],
        totalResults: response.data.totalResults || 0,
        message: response.data.message || ''
      };
    } catch (error) {
      console.error(`Failed to search stocks for "${query}":`, error);
      return { data: [], totalResults: 0, message: 'Search failed' };
    }
  },

  // Get stock suggestions with filters
  getStockSuggestions: async (options: {
    sector?: string;
    exchange?: string;
    limit?: number;
    minMarketCap?: number;
    maxMarketCap?: number;
  } = {}): Promise<MarketStock[]> => {
    try {
      const params = new URLSearchParams();
      if (options.sector) params.append('sector', options.sector);
      if (options.exchange) params.append('exchange', options.exchange);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.minMarketCap) params.append('minMarketCap', options.minMarketCap.toString());
      if (options.maxMarketCap) params.append('maxMarketCap', options.maxMarketCap.toString());

      const response = await apiClient.get(`/market/suggestions?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch stock suggestions:', error);
      return [];
    }
  },

  // Browse stocks with pagination
  browseStocks: async (options: {
    sector?: string;
    exchange?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    data: MarketStock[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    message: string;
  }> => {
    try {
      const params = new URLSearchParams();
      if (options.sector) params.append('sector', options.sector);
      if (options.exchange) params.append('exchange', options.exchange);
      if (options.page) params.append('page', options.page.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.sortBy) params.append('sortBy', options.sortBy);
      if (options.sortOrder) params.append('sortOrder', options.sortOrder);

      const response = await apiClient.get(`/market/browse?${params.toString()}`);
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
        message: response.data.message || ''
      };
    } catch (error) {
      console.error('Failed to browse stocks:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 50, total: 0, pages: 0 },
        message: 'Browse failed'
      };
    }
  },

  // Get market information (exchanges, sectors, stats)
  getMarketInfo: async (): Promise<MarketInfo> => {
    try {
      const response = await apiClient.get('/market/info');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch market info:', error);
      return {
        totalStocks: 0,
        exchanges: [],
        sectors: []
      };
    }
  },

  // Get current price for a symbol
  getCurrentPrice: async (symbol: string, exchange?: string): Promise<{
    symbol: string;
    currentPrice: number;
    timestamp: string;
  } | null> => {
    try {
      const url = exchange 
        ? `/market/price/${symbol}?exchange=${exchange}`
        : `/market/price/${symbol}`;
      
      const response = await apiClient.get(url);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  },

  // Get detailed market data for a symbol
  getMarketData: async (symbol: string, exchange?: string, refresh?: boolean): Promise<any> => {
    try {
      const params = new URLSearchParams();
      if (exchange) params.append('exchange', exchange);
      if (refresh) params.append('refresh', 'true');

      const response = await apiClient.get(`/market/data/${symbol}?${params.toString()}`);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch market data for ${symbol}:`, error);
      return null;
    }
  },

  // Force update all stock prices
  updateAllPrices: async (): Promise<{ message: string }> => {
    try {
      const response = await apiClient.post('/market/update');
      return { message: response.data.message };
    } catch (error) {
      console.error('Failed to update all prices:', error);
      throw new Error('Failed to update prices');
    }
  },

  // Get market service status
  getServiceStatus: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/market/status');
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch market status:', error);
      return null;
    }
  }
};

// Portfolio API functions
export const portfolioApi = {
  // Get complete portfolio summary
  getPortfolioSummary: async (): Promise<Portfolio> => {
    try {
      const response = await apiClient.get<Portfolio>('/portfolio');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio summary:', error);
      throw new Error('Failed to fetch portfolio summary');
    }
  },

  // Get sector analysis
  getSectorSummary: async (): Promise<SectorSummary[]> => {
    try {
      const response = await apiClient.get<SectorSummary[]>('/portfolio/sectors');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch sector summary:', error);
      throw new Error('Failed to fetch sector summary');
    }
  },

  // Get portfolio metrics
  getPortfolioMetrics: async (): Promise<{
    totalStocks: number;
    totalSectors: number;
    bestPerformingStock: any;
    worstPerformingStock: any;
    topSectorByValue: any;
  }> => {
    try {
      const response = await apiClient.get('/portfolio/metrics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio metrics:', error);
      throw new Error('Failed to fetch portfolio metrics');
    }
  },

  // Create portfolio snapshot
  createSnapshot: async (): Promise<any> => {
    try {
      const response = await apiClient.post('/portfolio/snapshots');
      return response.data;
    } catch (error) {
      console.error('Failed to create portfolio snapshot:', error);
      throw new Error('Failed to create portfolio snapshot');
    }
  },

  // Get portfolio snapshots
  getSnapshots: async (limit: number = 10): Promise<any[]> => {
    try {
      const response = await apiClient.get(`/portfolio/snapshots?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch portfolio snapshots:', error);
      throw new Error('Failed to fetch portfolio snapshots');
    }
  },

  // Update stock prices in bulk
  updateStockPrices: async (priceUpdates: { stockName: string; currentMarketPrice: number }[]): Promise<void> => {
    try {
      await apiClient.put('/portfolio/prices', { priceUpdates });
    } catch (error) {
      console.error('Failed to update stock prices:', error);
      throw new Error('Failed to update stock prices');
    }
  },
};

// Health check API
export const healthApi = {
  // Check backend health
  checkHealth: async (): Promise<{
    success: boolean;
    message: string;
    timestamp: string;
    database: string;
  }> => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend health check failed');
    }
  },
};

// Error types for better error handling
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === 'string';
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};
