# Portfolio Dashboard Frontend

A modern, responsive React/Next.js frontend for the Portfolio Dashboard application. Built with TypeScript, Tailwind CSS, and featuring real-time portfolio tracking, analytics, and comprehensive stock management.

## Features

- **📊 Real-time Portfolio Tracking**: Live updates of stock prices and portfolio performance
- **📈 Advanced Analytics**: Portfolio metrics, performance analysis, and sector insights
- **🎯 Stock Management**: Add, edit, and delete stocks with intuitive forms
- **🏢 Sector Analysis**: Visual breakdown of investments by sector
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **⚡ Fast & Modern**: Built with Next.js 15 and React 19
- **🎨 Beautiful UI**: Clean, professional interface with Tailwind CSS
- **🔄 Auto-refresh**: Automatic data updates every 15 seconds

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Custom components with Lucide React icons
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Hooks

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on port 3001 (see backend README)

## Installation & Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend/portfolio-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.local.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   NODE_ENV=development
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── PortfolioSummary.tsx
│   ├── PortfolioTable.tsx
│   ├── PortfolioMetrics.tsx
│   ├── SectorSummary.tsx
│   └── StockModal.tsx
├── hooks/                 # Custom React hooks
│   └── usePortfolio.ts
├── services/              # API services
│   └── api.ts
├── types/                 # TypeScript types
│   ├── Stock.ts
│   └── Portfolio.ts
└── data/                  # Sample data (for fallback)
    └── sampleData.ts
```

## Core Components

### 📊 PortfolioSummary
Displays key portfolio metrics including total investment, current value, and overall gain/loss with visual indicators.

### 📈 PortfolioMetrics  
Advanced analytics component showing:
- Best and worst performing stocks
- Sector distribution
- Performance trends
- Key statistics

### 🏢 SectorSummary
Visual breakdown of portfolio by sectors with investment allocation and performance metrics.

### 📋 PortfolioTable
Interactive data table with:
- Sortable columns
- Stock management actions (edit/delete)
- Responsive design
- Real-time data updates

### ➕ StockModal
Comprehensive form for adding/editing stocks with:
- Form validation
- Real-time calculations
- Sector and exchange selection
- Loading states

## API Integration

The frontend integrates with the backend API through:

- **Stock API**: CRUD operations for individual stocks
- **Portfolio API**: Portfolio summaries and analytics
- **Real-time Updates**: Automatic refresh of market data
- **Error Handling**: Comprehensive error management

### API Configuration

```typescript
// Default configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';
```

## Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Build for production
npm start           # Start production server

# Code Quality
npm run lint        # Run ESLint
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3001/api` |
| `NODE_ENV` | Environment mode | `development` |

## Key Features Explained

### Real-time Updates
The application automatically refreshes portfolio data every 15 seconds using custom hooks and React's useEffect.

### Stock Management
- **Add Stock**: Complete form with validation and real-time calculations
- **Edit Stock**: Inline editing with pre-populated data
- **Delete Stock**: Confirmation dialog for safe deletion

### Responsive Design
The interface adapts seamlessly to different screen sizes:
- **Desktop**: Full feature set with multi-column layouts
- **Tablet**: Optimized layouts for medium screens
- **Mobile**: Compact design with touch-friendly interactions

### Performance Optimization
- **Code Splitting**: Automatic by Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Efficient API response caching

## Customization

### Adding New Components
1. Create component in `src/components/`
2. Export from the component file
3. Import and use in pages or other components

### Modifying Styles
The project uses Tailwind CSS for styling:
- Utility-first approach
- Custom color palette
- Responsive design utilities
- Dark mode support (configurable)

### API Endpoints
To add new API endpoints:
1. Update `src/services/api.ts`
2. Add TypeScript types in `src/types/`
3. Update components to use new endpoints

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Setup
1. Set production API URL in environment variables
2. Configure CDN for static assets
3. Set up SSL/TLS certificates
4. Configure monitoring and analytics

### Deployment Platforms
- **Vercel** (Recommended): Automatic deployments with Git integration
- **Netlify**: Simple static site deployment
- **AWS Amplify**: Full-stack deployment with backend integration
- **Docker**: Containerized deployment

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure backend is running on port 3001
   - Check CORS configuration
   - Verify environment variables

2. **Build Errors**
   - Clear `.next` directory: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`

3. **Performance Issues**
   - Check Network tab for slow API calls
   - Verify auto-refresh intervals
   - Monitor React DevTools for unnecessary renders

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section above
- Review the API documentation in the backend README
- Create an issue in the repository
