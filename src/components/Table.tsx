import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  useTable,
  useGlobalFilter,
  useSortBy,
  usePagination,
  useFilters,
  Column,
  TableState,
  TableInstance,
  HeaderGroup,
} from 'react-table';

interface Data {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const Table: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then(response => {
        setData(response.data);
        setLoading(false);
      });
  }, []);

  const columns: Column<Data>[] = useMemo(
    () => [
      { Header: 'User ID', accessor: 'userId' },
      { Header: 'ID', accessor: 'id' },
      { Header: 'Title', accessor: 'title' },
      { Header: 'Body', accessor: 'body' },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    setGlobalFilter,
    state,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    pageCount,
    gotoPage,
    setPageSize,
    page,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination
  ) as TableInstance<Data> & {
    state: TableState<Data> & {
      pageIndex: number;
      pageSize: number;
      globalFilter: string;
    };
    setGlobalFilter: (filterValue: string) => void;
    canPreviousPage: boolean;
    canNextPage: boolean;
    nextPage: () => void;
    previousPage: () => void;
    pageCount: number;
    gotoPage: (updater: number) => void;
    setPageSize: (pageSize: number) => void;
    page: Data[];
  };

  const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const page = e.target.value ? Number(e.target.value) - 1 : 0;
    if (page >= 0 && page < pageCount) {
      gotoPage(page);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = Number(e.target.value);
    setPageSize(size);
    if (state.pageIndex >= Math.ceil(data.length / size)) {
      gotoPage(0);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input
        value={state.globalFilter || ''}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="Search..."
      />
      <div className="table-container">
        <table {...getTableProps()}>
          <thead>
            {headerGroups.map((headerGroup: HeaderGroup<Data>) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {column.isSorted ? (column.isSortedDesc ? ' ▽' : ' ▲') : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row: any) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell: any) => (
                    <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={state.pageIndex === 0}>
          {'<<'}
        </button>{' '}
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>{' '}
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>{' '}
        <button onClick={() => gotoPage(pageCount - 1)} disabled={state.pageIndex === pageCount - 1}>
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
            onChange={handlePageChange}
            style={{ width: '100px' }}
          />
        </span>{' '}
        <select value={state.pageSize} onChange={handlePageSizeChange}>
          {[5, 10, 20, 30, 40, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Table;