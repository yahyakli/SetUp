import { useState } from 'react';

const DataTable = ({ columns, data, title, pagination = true, itemsPerPage = 10, loading = false }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search term
  const filteredData = data.filter(item => {
    return Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Paginate data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Skeleton loader component
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <div className="table-container">
        <table className="table w-full">
          <thead className="table-header">
            <tr>
              {columns.map((column, index) => (
                <th key={`skeleton-header-${index}`} className="table-header-cell">
                  <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mx-auto"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {Array.from({ length: itemsPerPage }).map((_, rowIndex) => (
              <tr key={`skeleton-row-${rowIndex}`} className="table-row">
                {columns.map((_, colIndex) => (
                  <td key={`skeleton-cell-${rowIndex}-${colIndex}`} className="table-cell">
                    <div className="h-5 bg-gray-200 dark:bg-dark-600 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{title}</h2>
        <div>
          <input
            type="text"
            placeholder="Search..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
          />
        </div>
      </div>
      
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead className="table-header">
                <tr>
                  {columns.map((column, index) => (
                    <th key={column.key || `column-${index}`} className="table-header-cell">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="table-body">
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr key={index} className="table-row">
                      {columns.map((column, colIndex) => (
                        <td key={column.key || `cell-${index}-${colIndex}`} className="table-cell">
                          {column.render ? column.render(item) : item[column.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="table-cell text-center py-8">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {pagination && totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 dark:bg-dark-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DataTable; 