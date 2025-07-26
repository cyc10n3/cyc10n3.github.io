// Accessible data table component with proper headers and navigation
import React, { useState } from 'react';
import { AccessibleButton } from './AccessibleButton';

interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface AccessibleTableProps {
  columns: TableColumn[];
  data: any[];
  caption?: string;
  sortable?: boolean;
  className?: string;
  emptyMessage?: string;
  ariaLabel?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export const AccessibleTable: React.FC<AccessibleTableProps> = ({
  columns,
  data,
  caption,
  sortable = false,
  className = '',
  emptyMessage = 'No data available',
  ariaLabel
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    let newDirection: SortDirection = 'asc';
    
    if (sortColumn === columnKey) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      }
    }

    setSortColumn(newDirection ? columnKey : null);
    setSortDirection(newDirection);
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  const getSortAriaLabel = (column: TableColumn) => {
    if (!sortable || !column.sortable) return undefined;

    if (sortColumn === column.key) {
      if (sortDirection === 'asc') {
        return `${column.header}, sorted ascending. Click to sort descending.`;
      } else if (sortDirection === 'desc') {
        return `${column.header}, sorted descending. Click to remove sorting.`;
      }
    }
    
    return `${column.header}, not sorted. Click to sort ascending.`;
  };

  const getSortIcon = (column: TableColumn) => {
    if (!sortable || !column.sortable || sortColumn !== column.key) {
      return (
        <svg className="w-4 h-4 opacity-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (sortDirection === 'asc') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else if (sortDirection === 'desc') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }

    return null;
  };

  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className="min-w-full divide-y divide-gray-200"
        aria-label={ariaLabel}
      >
        {caption && (
          <caption className="sr-only">
            {caption}
          </caption>
        )}
        
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`
                  px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${alignmentClasses[column.align || 'left']}
                  ${sortable && column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}
                `}
                style={{ width: column.width }}
                onClick={() => sortable && column.sortable && handleSort(column.key)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && sortable && column.sortable) {
                    e.preventDefault();
                    handleSort(column.key);
                  }
                }}
                tabIndex={sortable && column.sortable ? 0 : undefined}
                role={sortable && column.sortable ? 'button' : undefined}
                aria-label={getSortAriaLabel(column)}
                aria-sort={
                  sortColumn === column.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : sortDirection === 'desc'
                      ? 'descending'
                      : 'none'
                    : 'none'
                }
              >
                <div className="flex items-center justify-between">
                  <span>{column.header}</span>
                  {sortable && column.sortable && (
                    <span className="ml-2">
                      {getSortIcon(column)}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-50"
            >
              {columns.map((column, colIndex) => {
                const cellValue = row[column.key];
                const isFirstColumn = colIndex === 0;
                
                return (
                  <td
                    key={column.key}
                    className={`
                      px-6 py-4 whitespace-nowrap text-sm
                      ${alignmentClasses[column.align || 'left']}
                      ${isFirstColumn ? 'font-medium text-gray-900' : 'text-gray-500'}
                    `}
                    role={isFirstColumn ? 'rowheader' : 'cell'}
                  >
                    {column.render ? column.render(cellValue, row) : cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Accessible table with pagination
interface PaginatedTableProps extends AccessibleTableProps {
  pageSize?: number;
  showPagination?: boolean;
}

export const AccessiblePaginatedTable: React.FC<PaginatedTableProps> = ({
  pageSize = 10,
  showPagination = true,
  ...tableProps
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(tableProps.data.length / pageSize);
  
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return tableProps.data.slice(startIndex, startIndex + pageSize);
  }, [tableProps.data, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Announce page change for screen readers
    const announcement = `Page ${page} of ${totalPages}`;
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.textContent = announcement;
    document.body.appendChild(liveRegion);
    setTimeout(() => document.body.removeChild(liveRegion), 1000);
  };

  return (
    <div>
      <AccessibleTable {...tableProps} data={paginatedData} />
      
      {showPagination && totalPages > 1 && (
        <nav
          className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4"
          aria-label="Table pagination"
        >
          <div className="flex flex-1 justify-between sm:hidden">
            <AccessibleButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              variant="secondary"
              size="small"
            >
              Previous
            </AccessibleButton>
            <AccessibleButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="secondary"
              size="small"
            >
              Next
            </AccessibleButton>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, tableProps.data.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{tableProps.data.length}</span>
                {' '}results
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <AccessibleButton
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="ghost"
                  size="small"
                  ariaLabel="Go to previous page"
                  className="rounded-l-md"
                >
                  Previous
                </AccessibleButton>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <AccessibleButton
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={currentPage === page ? 'primary' : 'ghost'}
                    size="small"
                    ariaLabel={`Go to page ${page}`}
                    ariaCurrent={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </AccessibleButton>
                ))}
                
                <AccessibleButton
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="ghost"
                  size="small"
                  ariaLabel="Go to next page"
                  className="rounded-r-md"
                >
                  Next
                </AccessibleButton>
              </nav>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};