import React, { useState, useEffect, useMemo } from 'react';
import { Table, Box, Pagination, TextField, Paper } from '@mui/material';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import apiService from '../../../apiService';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaStopCircle, FaEdit, FaTrash, FaBan } from 'react-icons/fa';
import { Formik, Field, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from "yup";


const InternsTable = ({ currentInterns, handleDelete, handleToggleBlock, handleEditClick }) => {
  const [gridApi, setGridApi] = useState(null);


  const columnDefs = [
    { headerName: 'Intern ID', field: 'candidateID', sortable: true, filter: true },
    {
      headerName: 'Full Name',
      field: 'fullName',
      sortable: true,
      filter: true,
      cellRenderer: params => (
        <Link
          to={`/sa_dash/student/${params.data.candidateID}`}
          style={{ textDecoration: 'none', fontWeight: 'bold' }}
        >
          {params.value}
        </Link>
      )
    },
    { headerName: 'Email', field: 'email', sortable: true, filter: true },
    { headerName: 'Mobile No', field: 'mobileNo', sortable: true, filter: true },
    { headerName: 'Domain', field: 'domain', sortable: true, filter: true },
    { headerName: 'Batch No', field: 'batchNo', sortable: true, filter: true },
    { headerName: 'Vasavi Foundation', field: 'belongedToVasaviFoundation', sortable: true, filter: true },
    { headerName: 'Mode of Internship', field: 'modeOfInternship', sortable: true, filter: true },
    {
      headerName: 'Action',
      field: 'action',
      cellRenderer: params => (
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
            onClick={() => handleEditClick(params.data)}
            style={{ border: "none", background: "none", cursor: "pointer" }}
          >
            <FaEdit style={{ width: "16px", color: "#1f2c39" }} />
          </button>
          <button
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: params.data.blockProfile ? "red" : "black",
            }}
            onClick={() => handleDelete(params.data.candidateID)}
          >
            <FaTrash style={{ width: "16px", color: "#1f2c39" }} />

          </button>
        </>
      )
    }
  ];

  const defaultColDef = {
    resizable: true,
    flex: 1,
    sortable: true,
    filter: true,
  };

  const onGridReady = params => {
    setGridApi(params.api);
  };

  const gridStyle = {
    height: "100%",
    width: "100%",
  };

  const rowClassRules = {
    "row-highlight": (params) => params.node.rowIndex % 2 === 0, // Alternate row styling
  };

  const customColumnDefs = columnDefs.map((col) => ({
    ...col,
    headerClass: "custom-header", // Custom header styling
    cellClass: "custom-cell", // Custom cell styling
  }));

  return (
    <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
      <AgGridReact
        rowData={currentInterns}
        columnDefs={customColumnDefs}
        defaultColDef={defaultColDef}
        onGridReady={onGridReady}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
        rowClassRules={rowClassRules} // Apply row class rules
      />

      <style jsx>{`
      /* Custom header styling */
.custom-header {
  background-color: #4caf50;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  border-bottom: 2px solid #388e3c;
}

/* Custom cell styling */
.custom-cell {
  text-align: center;
  font-size: 0.9rem;
  color: #333;
  border-right: 1px solid #ddd;
}

/* Alternate row styling */
.row-highlight {
  background-color: #f5f5f5;
}

/* Pagination button styling */
.ag-paging-button {
  background-color: #4caf50 !important;
  color: white !important;
  border: none !important;
  border-radius: 4px;
  padding: 5px 10px;
  margin: 0 5px;
}

/* Hover effect for rows */
.ag-row:hover {
  background-color: #e0f7fa !important;
  cursor: pointer;
}

/* Grid header hover effect */
.ag-header-cell:hover {
  background-color: #66bb6a !important;
  color: white !important;
}

        @media (max-width: 768px) {
          .ag-theme-alpine {
            font-size: 12px;
          }
        }

        @media (max-width: 480px) {
          .ag-theme-alpine {
            font-size: 10px;
          }
        }

        @media (max-width: 360px) {
          .ag-theme-alpine {
            font-size: 8px;
          }
        }
      `}</style>
    </div>
  );
};



const EditModal = ({ show, onHide, intern, onSave }) => {

  const validationSchema = Yup.object({
    candidateID: Yup.string().required("Candidate ID is required"),
    fullName: Yup.string().required("Full Name is required"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    mobileNo: Yup.string().required('Mobile number is required').matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number'),

    altMobileNo: Yup.string().required('Alternate Mobile number is required').matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number'),

    domain: Yup.string().required("Domain is required"),
    belongedToVasaviFoundation: Yup.string()
      .oneOf(["Yes", "No"], "Select Yes or No")
      .required("This field is required"),
    address: Yup.string().required("Address is required"),
    modeOfInternship: Yup.string()
      .oneOf(["Online", "Offline"], "Select a valid mode")
      .required("Mode of Internship is required"),
    batchNo: Yup.string().required("Batch No is required"),
    dateAccepted: Yup.date()
    .required("Start Date is required")
    .nullable()
    .max(Yup.ref('endDate'), "Start Date cannot be later than End Date"),
  endDate: Yup.date()
    .required("End Date is required")
    .nullable()
    .min(Yup.ref('dateAccepted'), "End Date cannot be earlier than Start Date"),

  });

  const [formData, setFormData] = useState(intern || {});

  useEffect(() => {
    setFormData(intern || {});
  }, [intern]);


    // Function to format the date to YYYY-MM-DD
    const formatDate = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // Converts to 'YYYY-MM-DD' format
    };

  return (
    <Modal size="lg" show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Intern</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Formik
          initialValues={{
            candidateID: intern?.candidateID || "",
            fullName: intern?.fullName || "",
            email: intern?.email || "",
            mobileNo: intern?.mobileNo || "",
            altMobileNo: intern?.altMobileNo || "",
            domain: intern?.domain || "",
            belongedToVasaviFoundation: intern?.belongedToVasaviFoundation || "",
            address: intern?.address || "",
            dateAccepted: formatDate(intern?.dateAccepted) || "",
            endDate: formatDate(intern?.endDate) || "",
            modeOfInternship: intern?.modeOfInternship || "",
            batchNo: intern?.batchNo || "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => onSave(values)}
        >
          {({ handleSubmit }) => (
            <FormikForm>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">ID</Form.Label>
                    <Field
                      type="text"
                      name="candidateID"
                      disabled
                      className="form-control"
                    />
                    <ErrorMessage
                      name="candidateID"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Full Name</Form.Label>
                    <Field
                      type="text"
                      name="fullName"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="fullName"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Email</Form.Label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Mobile No</Form.Label>
                    <Field
                      type="text"
                      name="mobileNo"
                      className="form-control"
                      fullWidth
                      inputProps={{ maxLength: 10 }}

                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <ErrorMessage
                      name="mobileNo"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Alt Mobile No</Form.Label>
                    <Field
                      type="text"
                      name="altMobileNo"
                      fullWidth
                      inputProps={{ maxLength: 10 }}
                      className="form-control"
                      onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <ErrorMessage
                      name="altMobileNo"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Domain</Form.Label>
                    <Field
                      type="text"
                      name="domain"
                      disabled
                      className="form-control"
                    />
                    <ErrorMessage
                      name="domain"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">
                      Belonged To Vasavi Foundation
                    </Form.Label>
                    <Field
                      as="select"
                      name="belongedToVasaviFoundation"
                      className="form-control"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </Field>
                    <ErrorMessage
                      name="belongedToVasaviFoundation"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Address</Form.Label>
                    <Field
                      type="text"
                      name="address"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>

                
                <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Start Date</Form.Label>
                    <Field
                      type="date"
                      name="dateAccepted"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="dateAccepted"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>

                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">End Date</Form.Label>
                    <Field
                      type="date"
                      name="endDate"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="endDate"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
              </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">
                      Mode of Internship
                    </Form.Label>
                    <Field
                      as="select"
                      name="modeOfInternship"
                      className="form-control"
                    >
                      <option value="">Select Mode</option>
                      <option value="Online">Online</option>
                      <option value="Offline">Offline</option>
                    </Field>
                    <ErrorMessage
                      name="modeOfInternship"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6 mb-4">
                  <Form.Group>
                    <Form.Label className="font-weight-bold text-primary">Batch No</Form.Label>
                    <Field
                      type="text"
                      name="batchNo"
                      className="form-control"
                    />
                    <ErrorMessage
                      name="batchNo"
                      component="div"
                      className="text-danger"
                    />
                  </Form.Group>
                </div>
              </div>

              <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};



const InternTable = () => {
  const [interns, setInterns] = useState([]);
  const [editingIntern, setEditingIntern] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.get('/api/intern_data');
        console.log(response.data)
        setInterns(response.data);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (candidateID) => {
    try {
      await apiService.delete(`/api/intern_data/${candidateID}`);
      setInterns((prevInterns) => prevInterns.filter(intern => intern.candidateID !== candidateID));
      toast.success("Intern deleted successfully.", { autoClose: 3000 });
    } catch (error) {
      toast.error("Error deleting intern. Please try again.", { autoClose: 3000 });
      console.error("Error deleting intern:", error);
    }
  };

  const handleEditClick = (intern) => {
    setEditingIntern(intern);
    setShowEditModal(true);
  };

  const handleSave = async (updatedIntern) => {
    try {
      await apiService.put(`/api/intern_data/${updatedIntern.candidateID}`, updatedIntern);
      setInterns((prev) =>
        prev.map((intern) =>
          intern.candidateID === updatedIntern.candidateID ? updatedIntern : intern
        )
      );
      setShowEditModal(false);
      toast.success("Intern details updated successfully.");
    } catch (error) {
      toast.error("Error updating intern.");
    }
  };


  const handleToggleBlock = async (intern) => {
    try {
      const updatedStatus = !intern.blockProfile; // Toggle blockProfile
      await apiService.post(`/api/toggle_block_intern/${intern.candidateID}`, { blockProfile: updatedStatus });

      // Update the UI
      setInterns(prevInterns =>
        prevInterns.map(i =>
          i.candidateID === intern.candidateID ? { ...i, blockProfile: updatedStatus } : i
        )
      );

      // Show success toast
      toast.success(`${updatedStatus ? "Blocked" : "Unblocked"} Intern ID: ${intern.candidateID} successfully!`);
      console.log(`${updatedStatus ? "Blocked" : "Unblocked"} Intern ID: ${intern.candidateID}`);
    } catch (error) {
      // Show error toast
      toast.error('Error Updating block status. Please try again.');
      console.error('Error toggling block status:', error);
    }
  };


  return (
    <Container>
      <InternsTable currentInterns={interns} handleDelete={handleDelete} handleToggleBlock={handleToggleBlock} handleEditClick={handleEditClick} />
      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        intern={editingIntern}
        onSave={handleSave}
      />
      <ToastContainer />
    </Container>
  );
};

export default InternTable;

