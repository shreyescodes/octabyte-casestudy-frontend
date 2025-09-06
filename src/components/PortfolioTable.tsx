'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { Stock } from '../types/Stock';
import { TrendingUp, TrendingDown, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface PortfolioTableProps {
  stocks: Stock[];
  onEdit?: (stock: Stock) => void;
  onDelete?: (stockId: string) => void;
}

const columnHelper = createColumnHelper<Stock>();

export default function PortfolioTable({ stocks, onEdit, onDelete }: PortfolioTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('stockName', {
        header: 'Particulars',
        cell: (info) => (
          <div className="font-medium text-gray-900">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('purchasePrice', {
        header: 'Purchase Price',
        cell: (info) => (
          <div className="text-right">
            ₹{info.getValue().toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor('quantity', {
        header: 'Qty',
        cell: (info) => (
          <div className="text-right">
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor('investment', {
        header: 'Investment',
        cell: (info) => (
          <div className="text-right font-medium">
            ₹{info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('portfolioPercentage', {
        header: 'Portfolio (%)',
        cell: (info) => (
          <div className="text-right">
            {info.getValue().toFixed(2)}%
          </div>
        ),
      }),
      columnHelper.accessor('stockExchangeCode', {
        header: 'NSE/BSE',
        cell: (info) => (
          <div className="text-center">
            <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor('currentMarketPrice', {
        header: 'CMP',
        cell: (info) => (
          <div className="text-right font-medium">
            ₹{info.getValue().toFixed(2)}
          </div>
        ),
      }),
      columnHelper.accessor('presentValue', {
        header: 'Present Value',
        cell: (info) => (
          <div className="text-right font-medium">
            ₹{info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('gainLoss', {
        header: 'Gain/Loss',
        cell: (info) => {
          const value = info.getValue();
          const isPositive = value >= 0;
          return (
            <div className={`text-right font-medium flex items-center justify-end ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              ₹{Math.abs(value).toLocaleString()}
            </div>
          );
        },
      }),
      columnHelper.accessor('peRatio', {
        header: 'P/E Ratio',
        cell: (info) => (
          <div className="text-right">
            {info.getValue().toFixed(1)}
          </div>
        ),
      }),
      columnHelper.accessor('latestEarnings', {
        header: 'Latest Earnings',
        cell: (info) => (
          <div className="text-right">
            ₹{info.getValue().toLocaleString()}
          </div>
        ),
      }),
      columnHelper.accessor('sector', {
        header: 'Sector',
        cell: (info) => (
          <div className="text-center">
            <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      // Actions column - Always show if onEdit or onDelete is provided
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          console.log('Stock data:', info.row.original); // Debug log
          return (
            <div className="flex items-center justify-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(info.row.original)}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                  title="Edit stock"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    console.log('Remove clicked for stock:', info.row.original);
                    onDelete(info.row.original.id || '');
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors p-1"
                  title="Remove stock from portfolio"
                  disabled={!info.row.original.id}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {!onEdit && !onDelete && (
                <span className="text-gray-400 text-sm">No actions</span>
              )}
            </div>
          );
        },
      })
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: stocks,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header.isPlaceholder ? null : (
                    <div
                      className={`flex items-center gap-1 ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-700' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <span className="ml-1">
                          {{
                            asc: <ChevronUp className="w-3 h-3" />,
                            desc: <ChevronDown className="w-3 h-3" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <div className="w-3 h-3 opacity-30">
                              <ChevronUp className="w-3 h-3 absolute" />
                              <ChevronDown className="w-3 h-3" />
                            </div>
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
