import React, { useRef } from 'react';
import * as XLSX from 'xlsx';

const BulkUpload = ({ onBulkUpload }) => {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const formattedData = formatData(json);
        onBulkUpload(formattedData);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
    };

    reader.readAsArrayBuffer(file);
  };

  const formatData = (json) => {
    const headers = json[0];
    const data = json.slice(1);

    const pages_data = [];

    data.forEach((row) => {
      const intern = {
        fullName: row[headers.indexOf('FULLNAME')],
        email: row[headers.indexOf('EMAIL')],
        mobileNo: row[headers.indexOf('MOBILE')],
        altMobileNo: row[headers.indexOf('ALTMOBILE')],
        address: row[headers.indexOf('ADDRESS')],
        batchNo: row[headers.indexOf('BATCH')],
        modeOfInternship: row[headers.indexOf('MODE')],
        program: row[headers.indexOf('PROGRAM')],
        domain: row[headers.indexOf('DOMAIN')],
        megadrivestatus : row[headers.indexOf('MEGADRIVE')],
        belongedToVasaviFoundation: row[headers.indexOf('VASAVI')],
      };
      console.log(intern);
      pages_data.push(intern);
    });
    console.log(pages_data);
    return {
      pages_data
    };
  };

  return (
    <div>
      <button onClick={handleButtonClick}>Import</button>
      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileUpload}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default BulkUpload;

