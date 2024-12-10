
import React, { useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { saveAs } from 'file-saver';

const columns = [
  { headerName: 'S NO', field: 'sales' },
  { headerName: 'Name', field: 'sales' },
  { headerName: 'No of drives', field: 'date' },
  { headerName: 'Sent Profiles', field: 'sales' },
  { headerName: 'Selected', field: 'sales' },
  { headerName: 'Not Attended', field: 'sales' },
  { headerName: 'Rejected', field: 'sales' },
  { headerName: 'In Progress', field: 'sales' },
  { headerName: 'Drives Pending', field: 'sales' },
  { headerName: 'Total', field: 'sales' },
];

const rowData = [
  { date: '2024-11-01', sales: 500 },
  { date: '2024-11-02', sales: 300 },
  { date: '2024-11-03', sales: 700 },
  { date: '2024-11-04', sales: 400 },
  { date: '2024-11-05', sales: 600 },
];

export default function Reports() {
  const gridRef = useRef(null);

  const downloadCurrentPage = () => {
    const gridApi = gridRef.current.api;

    // Get current page rows
    const currentPageData = [];
    gridApi.forEachNodeAfterFilterAndSort((node) => {
      if (node.rowIndex >= gridApi.paginationGetPageSize() * gridApi.paginationGetCurrentPage() &&
          node.rowIndex < gridApi.paginationGetPageSize() * (gridApi.paginationGetCurrentPage() + 1)) {
        currentPageData.push(node.data);
      }
    });

    // Convert data to CSV
    const csvContent = [
      ['Date', 'Sales'],
      ...currentPageData.map((row) => [row.date, row.sales]),
    ]
      .map((e) => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'current_page_data.csv');
  };

  return (
    <div>
      <button onClick={downloadCurrentPage} style={{ marginBottom: '10px' }}>
        Download Current Page
      </button>
      <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columns}
          rowData={rowData}
          pagination={true}
          paginationPageSize={2} // Set page size to test pagination
        />
      </div>
    </div>
  );
}
