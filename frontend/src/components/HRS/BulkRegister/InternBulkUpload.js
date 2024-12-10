import React, { useState } from 'react';
import BulkUpload from './InternImport';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, TextField, IconButton } from '@mui/material';
import { FaEdit, FaTrashAlt, FaSave } from 'react-icons/fa';
import apiService from '../../../apiService'; // Assuming you have an API service
import { ToastContainer, toast } from 'react-toastify'; // Importing Toastify components
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

const InternBulkRegister = () => {
  const [bulkData, setBulkData] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // Track which row is being edited
  const [editRowData, setEditRowData] = useState({}); // Hold data for the row being edited

  const handleBulkUpload = (data) => {
    setBulkData(data.pages_data); // Assuming `pages_data` is the array of data you want to display
    toast.success('Data imported successfully!'); // Show success toast
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditRowData(bulkData[index]);
  };

  const handleDeleteClick = (index) => {
    setBulkData(bulkData.filter((_, i) => i !== index));
  };

  const handleInputChange = (e, field) => {
    setEditRowData({ ...editRowData, [field]: e.target.value });
  };

  const handleSaveClick = () => {
    const updatedData = [...bulkData];
    updatedData[editIndex] = editRowData;
    setBulkData(updatedData);
    setEditIndex(null);
  };

  const handleSaveToDatabase = async () => {
    try {
      const response = await apiService.post('/api/intern-bulk-register', { bulkData });
      toast.success('Data saved to database successfully!'); // Show success toast after saving
      console.log('Data saved successfully:', response.data);
    } catch (error) {
      console.error('Error saving data:', error);
  
      // Check if there's a response and handle specific cases
      if (error.response) {
        const { status, data } = error.response;
  
        if (status === 400 && data.duplicates) {
          // Duplicate entries found
          // const duplicateEntries = data.duplicates.map(item => `${item.email || ''} ${item.mobileNo || ''}`).join(', ');
          const duplicateEntries = data.duplicates.map(item => `${item.candidateID || ''} ${item.email || ''} ${item.mobileNo || ''}`).join(', ');

          toast.error(`Duplicate entries found for: ${duplicateEntries}`);
        } else if (status === 500) {
          // Internal server error
          toast.error('Server error. Please try again later.');
        } else {
          // Other errors
          toast.error(data.message || 'An error occurred. Please try again.');
        }
      } else {
        // Network error or request error
        toast.error('Network error. Please check your connection and try again.');
      }
    }
  };
  

  return (
    <div className="Create_container">
      <Typography variant="h4" component="h2" gutterBottom>
        Intern Bulk Register
      </Typography>
      
      {/* Upload Button */}
      <BulkUpload onBulkUpload={handleBulkUpload} />
      
      {/* Display Table if data exists */}
      {bulkData.length > 0 && (
        <>
          <TableContainer component={Paper} style={{ marginTop: 20 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Mobile No</TableCell>
                  <TableCell>Alt Mobile No</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell>Belonged to Vasavi Foundation</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Batch No</TableCell>
                  <TableCell>Mode of Internship</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody style={{border:"none"}}>
                {bulkData.map((row, index) => (
                  <TableRow key={index}>
                    {editIndex === index ? (
                      <>
                        <TableCell><TextField value={editRowData.fullName} onChange={(e) => handleInputChange(e, 'fullName')} /></TableCell>
                        <TableCell><TextField value={editRowData.email} onChange={(e) => handleInputChange(e, 'email')} /></TableCell>
                        <TableCell><TextField value={editRowData.mobileNo} onChange={(e) => handleInputChange(e, 'mobileNo')} /></TableCell>
                        <TableCell><TextField value={editRowData.altMobileNo} onChange={(e) => handleInputChange(e, 'altMobileNo')} /></TableCell>
                        <TableCell><TextField value={editRowData.domain} onChange={(e) => handleInputChange(e, 'domain')} /></TableCell>
                        <TableCell><TextField value={editRowData.belongedToVasaviFoundation} onChange={(e) => handleInputChange(e, 'belongedToVasaviFoundation')} /></TableCell>
                        <TableCell><TextField value={editRowData.address} onChange={(e) => handleInputChange(e, 'address')} /></TableCell>
                        <TableCell><TextField value={editRowData.batchNo} onChange={(e) => handleInputChange(e, 'batchNo')} /></TableCell>
                        <TableCell><TextField value={editRowData.modeOfInternship} onChange={(e) => handleInputChange(e, 'modeOfInternship')} /></TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.mobileNo}</TableCell>
                        <TableCell>{row.altMobileNo}</TableCell>
                        <TableCell>{row.domain}</TableCell>
                        <TableCell>{row.belongedToVasaviFoundation}</TableCell>
                        <TableCell>{row.address}</TableCell>
                        <TableCell>{row.batchNo}</TableCell>
                        <TableCell>{row.modeOfInternship}</TableCell>
                      </>
                    )}
                    <TableCell style={{display:"flex", border:"none"}}>
                      {editIndex === index ? (
                        <IconButton color="primary" onClick={handleSaveClick}>
                          <FaSave />
                        </IconButton>
                      ) : (
                        <IconButton color="primary" onClick={() => handleEditClick(index)}>
                          <FaEdit />
                        </IconButton>
                      )}
                      <IconButton color="secondary" onClick={() => handleDeleteClick(index)}>
                        <FaTrashAlt />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="primary" onClick={handleSaveToDatabase} style={{ marginTop: 20 }}>
            Save All to Database
          </Button>
        </>
      )}
      
      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default InternBulkRegister;

