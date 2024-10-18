import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
  Column
} from 'react-table';
import { FaThList, FaTh } from 'react-icons/fa';

interface Data {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const Table: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState<'table' | 'tiles'>('table');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then(response => {
        setData(response.data);
        setLoading(false);
      });
  }, []);

  const columns: Column<Data>[] = useMemo(() => [
    { Header: 'User ID', accessor: 'userId' },
    { Header: 'ID', accessor: 'id' },
    { Header: 'Title', accessor: 'title' },
    { Header: 'Body', accessor: 'body' },
  ], []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    setGlobalFilter,
    state,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageCount,
    gotoPage,
    setPageSize: setTablePageSize
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalTiles = data.length;
  const totalPages = Math.ceil(totalTiles / pageSize);
  
  const paginatedTiles = data.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handleTilePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = e.target.value ? Number(e.target.value) - 1 : 0;
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  const handleTilePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleTablePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setTablePageSize(size);
    gotoPage(0);
  };

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <input
          value={state.globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
        />
        {/* View toggle buttons */}
        <button onClick={() => setViewType('table')}><FaThList /></button>
        <button onClick={() => setViewType('tiles')}><FaTh /></button>
      </div>

      {viewType === 'table' ? (
        <div className="table-container">
          <table {...getTableProps()}>
            <thead>
              {headerGroups.map(headerGroup => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map(column => (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      {column.isSorted ? (column.isSortedDesc ? ' ▽' : ' ▲') : ''}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {page.map(row => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="tile-container" style={{ maxHeight: '60vh', overflowY: 'auto', overflowX: 'hidden' }}>
          {paginatedTiles.map(item => (
            <div key={item.id} className="tile">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small><b>User ID:</b> {item.userId}</small>
              <small> | </small>
              <small><b>ID:</b> {item.id}</small>
            </div>
          ))}
          {/* Scrollbar styling */}
          <style>{`
            .tile-container::-webkit-scrollbar {
              width: 0;
            }
          `}</style>
        </div>
      )}

      {/* Pagination Controls for Tiles */}
      {viewType === 'tiles' && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
            {'<<'}
          </button>{' '}
          <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 0}>
            {'<'}
          </button>{' '}
          <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}>
            {'>'}
          </button>{' '}
          <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1}>
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {currentPage + 1} of {totalPages}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              min="1"
              max={totalPages}
              defaultValue={currentPage + 1}
              onChange={handleTilePageChange}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select value={pageSize} onChange={handleTilePageSizeChange}>
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Pagination Controls for Table */}
      {viewType === 'table' && (
        <div className="pagination">
          <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
            {'<<'}
          </button>{' '}
          <button onClick={() => previousPage()} disabled={!canPreviousPage}>
            {'<'}
          </button>{' '}
          <button onClick={() => nextPage()} disabled={!canNextPage}>
            {'>'}
          </button>{' '}
          <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
            {'>>'}
          </button>{' '}
          <span>
            Page{' '}
            <strong>
              {state.pageIndex + 1} of {pageCount}
            </strong>{' '}
          </span>
          <span>
            | Go to page:{' '}
            <input
              type="number"
              min="1"
              max={pageCount}
              defaultValue={state.pageIndex + 1}
              onChange={(e) => gotoPage(Number(e.target.value) - 1)}
              style={{ width: '100px' }}
            />
          </span>{' '}
          <select value={state.pageSize} onChange={handleTablePageSizeChange}>
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}
      
    </div>
  );
};

export default Table;
