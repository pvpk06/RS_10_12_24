import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Table, Box, Pagination, TextField } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiService from '../../../apiService';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toast styles
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaStopCircle, FaEdit, FaTrash, FaBan } from 'react-icons/fa';
import { Button, Modal } from "@mui/material";
import { MenuItem, Select, FormControl, InputLabel, Grid } from '@mui/material';
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

const EditModal = ({ open, handleClose, editingGuest, handleSave }) => {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // Validation schema using Yup
  const validationSchema = Yup.object({
    fullName: Yup.string().required("Full Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    mobileno: Yup.string()
      .matches(/^\d{10}$/, "Mobile No must be exactly 10 digits")
      .required("Mobile No is required"),
    altmobileno: Yup.string().matches(/^\d{10}$/, "Alt Mobile No must be exactly 10 digits").nullable(),
    batchno: Yup.string().required("Batch No is required"),
    BelongedToVasaviFoundation: Yup.string().required("This field is required"),
    modeOfTraining: Yup.string().required("Mode of Training is required"),
  });

  const initialValues = {
    fullName: editingGuest?.fullName || "",
    email: editingGuest?.email || "",
    mobileno: editingGuest?.mobileno || "",
    altmobileno: editingGuest?.altmobileno || "",
    domain: editingGuest?.domain || "",
    BelongedToVasaviFoundation: editingGuest?.BelongedToVasaviFoundation || "",
    batchno: editingGuest?.batchno || "",
    modeOfTraining: editingGuest?.modeOfTraining || "",
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="edit-modal-title">
      <Box sx={style}>
        <h3>Edit Guest Details</h3>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            handleSave(values);
          }}
        >
          {({ errors, touched, handleChange, values }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    error={touched.fullName && !!errors.fullName}
                    helperText={touched.fullName && errors.fullName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile No"
                    name="mobileno"
                    value={values.mobileno}
                    onChange={handleChange}
                    error={touched.mobileno && !!errors.mobileno}
                    helperText={touched.mobileno && errors.mobileno}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Alt Mobile No"
                    name="altmobileno"
                    value={values.altmobileno}
                    onChange={handleChange}
                    error={touched.altmobileno && !!errors.altmobileno}
                    helperText={touched.altmobileno && errors.altmobileno}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Domain"
                    name="domain"
                    value={values.domain}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.BelongedToVasaviFoundation && !!errors.BelongedToVasaviFoundation}>
                    <InputLabel>Belonged To Vasavi Foundation</InputLabel>
                    <Select
                      name="BelongedToVasaviFoundation"
                      value={values.BelongedToVasaviFoundation}
                      onChange={handleChange}
                    >
                      <MenuItem value="Yes">Yes</MenuItem>
                      <MenuItem value="No">No</MenuItem>
                    </Select>
                    {touched.BelongedToVasaviFoundation && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.BelongedToVasaviFoundation}</p>}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Batch No"
                    name="batchno"
                    value={values.batchno}
                    onChange={handleChange}
                    error={touched.batchno && !!errors.batchno}
                    helperText={touched.batchno && errors.batchno}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={touched.modeOfTraining && !!errors.modeOfTraining}>
                    <InputLabel>Mode of Training</InputLabel>
                    <Select
                      name="modeOfTraining"
                      value={values.modeOfTraining}
                      onChange={handleChange}
                    >
                      <MenuItem value="Offline">Offline</MenuItem>
                      <MenuItem value="Online">Online</MenuItem>
                    </Select>
                    {touched.modeOfTraining && <p style={{ color: "red", fontSize: "0.8rem" }}>{errors.modeOfTraining}</p>}
                  </FormControl>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" marginTop={2}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  style={{ marginRight: "8px" }}
                >
                  Save
                </Button>
                <Button variant="outlined" onClick={handleClose}>
                  Cancel
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};


const GuestsTable = ({ currentInterns, handleDelete, handleToggleBlock, handleEdit }) => {
  const [gridApi, setGridApi] = useState(null);
  const [open, setOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);

  const handleOpen = (guest) => {
    setEditingGuest(guest);
    setOpen(true);
  };

  const handleClose = () => {
    setEditingGuest(null);
    setOpen(false);
  };

  const handleSave = (updatedGuest) => {
    console.log("updatedGuest", updatedGuest);
    handleEdit({ ...editingGuest, ...updatedGuest }); 
    handleClose();
  };
  

  const columnDefs = [
    { headerName: "Intern ID", field: "guestID", sortable: true, filter: true },
    {
      headerName: 'Full Name',
      field: 'fullName',
      sortable: true,
      filter: true,
      cellRenderer: params => (
        <Link
          to={`/sa_dash/student/${params.data.guestID}`}
          style={{ textDecoration: 'none', fontWeight: 'bold' }}
        >
          {params.value}
        </Link>
      )
    }, { headerName: "Email", field: "email", sortable: true, filter: true },
    { headerName: "Mobile No", field: "mobileno", sortable: true, filter: true },
    { headerName: "Domain", field: "domain", sortable: true, filter: true },
    { headerName: "Batch No", field: "batchno", sortable: true, filter: true },
    { headerName: "Mode of Internship", field: "modeOfTraining", sortable: true, filter: true },
    {
      headerName: "Action",
      field: "action",
      cellRenderer: (params) => (
        <>

          <button
            onClick={() => handleToggleBlock(params.data)}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: params.data.blockProfile ? "red" : "black",
            }}
          >
            {params.data.blockProfile ? (
              <FaStopCircle style={{ width: "16px", color: "green" }} title="Unblock" />
            ) : (
              <FaBan style={{ width: "16px", color: "red" }} title="Block" />
            )}
          </button>
          <button
            onClick={() => handleOpen(params.data)}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <FaEdit style={{ width: "16px", color: "#1f2c39" }} title="Edit" />
          </button>
          <button
            onClick={() => handleDelete(params.data.guestID)}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <FaTrash style={{ width: "16px", color: "#1f2c39" }} title="Delete" />
          </button>
        </>
      ),
    },
  ];

  const defaultColDef = {
    resizable: true,
    flex: 1,
    sortable: true,
    filter: true,
  };

  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  return (
    <>
      <div style={{ width: "100%", height: "600px" }} className="ag-theme-alpine">
        <AgGridReact
          rowData={currentInterns}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
        />
      </div>
      <EditModal open={open} handleClose={handleClose} editingGuest={editingGuest} handleSave={handleSave} />
    </>
  );
};

const GuestData = () => {
  const [guests, setGuests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [guestsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/api/guest_data');
        console.log(response.data);
        setGuests(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (guestID) => {
    console.log("Deleting intern with ID: ", guestID);
    try {
      await apiService.delete(`/api/guest_data/${guestID}`);
      toast.success("Guest deleted successfully.", { autoClose: 3000 });
      setGuests((prevguests) => prevguests.filter(intern => intern.guestID !== guestID));
    } catch (error) {
      toast.error("Error deleting intern. Please try again.", { autoClose: 3000 });
      console.error("Error deleting data: ", error);
    }
  };

  const handleEdit = async (updatedGuest) => {
    try {
      const response = await apiService.put(`/api/guest_data/${updatedGuest.guestID}`, updatedGuest);
      console.log(response);
      setGuests((prevGuests) =>
        prevGuests.map((guest) =>
          guest.guestID === updatedGuest.guestID ? updatedGuest : guest
        )
      );
      toast.success("Guest updated successfully.", { autoClose: 3000 });
    } catch (error) {
      toast.error("Error updating guest. Please try again.", { autoClose: 3000 });
      console.error("Error updating data: ", error);
    }
  };

  const handleToggleBlock = async (intern) => {
    try {
      const updatedStatus = !intern.blockProfile; // Toggle blockProfile
      await apiService.post(`/api/toggle_block_guest/${intern.guestID}`, { blockProfile: updatedStatus });

      // Update the UI
      setGuests(prevInterns =>
        prevInterns.map(i =>
          i.guestID === intern.guestID ? { ...i, blockProfile: updatedStatus } : i
        )
      );

      // Show success toast
      toast.success(`${updatedStatus ? "Blocked" : "Unblocked"} Intern ID: ${intern.guestID} successfully!`);
      console.log(`${updatedStatus ? "Blocked" : "Unblocked"} Intern ID: ${intern.guestID}`);
    } catch (error) {
      // Show error toast
      toast.error('Error Updating block status. Please try again.');
      console.error('Error toggling block status:', error);
    }
  };

  return (
    <Container className="intern-table-container" style={{ overflow: 'auto', width: "100%" }}>
      <GuestsTable currentInterns={guests} handleDelete={handleDelete} handleToggleBlock={handleToggleBlock} handleEdit={handleEdit} />
      <ToastContainer />
    </Container>
  );
};

export default GuestData;

