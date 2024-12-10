import React, { useEffect, useState } from 'react';
import { Container, Modal, Form, Alert } from 'react-bootstrap';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { FaFilePdf } from 'react-icons/fa';
import apiService from '../../../apiService';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: '#1b74a8',
  color: 'white',
  fontWeight: 'bold',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette,
  },
}));

const SAStudentDetails = ({ candidateID }) => {
  const [studentData, setStudentData] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const isIntern = candidateID.startsWith('RS');
  console.log(isIntern);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    mobileNo: '',
    altMobileNo: '',
    domain: '',
    belongedToVasaviFoundation: '',
    batchNo: '',
    modeOfInternship: ''
  });

  useEffect(() => {
    fetchStudentData();
    fetchAppliedJobs();
  }, [candidateID]);

  const fetchStudentData = async () => {
    try {
      const response = await apiService.get(`/api/applicant-history/?candidateID=${candidateID}`);
      setStudentData(response.data);
      setEditFormData(response.data); // Initialize form with current data
      console.log("Stud", response.data);
    } catch (error) {
      console.error('Error fetching student data', error);
      setErrorMsg('No data found for the student.');
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await apiService.get(`/api/intern-job-applicant-history/?candidateId=${candidateID}`);
      setAppliedJobs(response.data);
      if (response.data.length > 0) {
        setErrorMsg('');
      } else {
        setErrorMsg('No job applications found for the student.');
      }
    } catch (error) {
      console.error('Error fetching applied jobs', error);
      setErrorMsg('No applied jobs found for the student.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleResumeDownload = async (applicationId) => {
    try {
      const url = `/api/download-resume/${applicationId.applicationID}`;
      const response = await apiService.getWithResponseType(url, 'blob');
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let extension = 'pdf';
      if (contentType.includes('application/pdf')) {
        extension = 'pdf';
      } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        extension = 'docx';
      } else if (contentType.includes('application/msword')) {
        extension = 'doc';
      }
      const blob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `resume-${applicationId.fullName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.put(`/api/intern_data/${candidateID}`, editFormData);
      setShowEditModal(false);
      fetchStudentData();
    } catch (error) {
      console.error('Error updating student data', error);
      setErrorMsg('Failed to update student data.');
    }
  };

  return (
    <div>
      {isIntern ? (      <Link to='/SA_dash/allInterns' className='text-decoration-none'>
        <Button variant="contained" color="primary" style={{ display: "flex", gap: "5px" }}>
          <i className="fa-solid fa-left-long"></i> Back
        </Button>
      </Link>) : (
              <Link to='/SA_dash/allGuests' className='text-decoration-none'>
              <Button variant="contained" color="primary" style={{ display: "flex", gap: "5px" }}>
                <i className="fa-solid fa-left-long"></i> Back
              </Button>
            </Link>
      )}

      <Container className='mt-4'>
        <span style={{display:'inline', marginTop: '10px' }}>
          <h2>Student data</h2>
        </span>
        {studentData ? (
          <TableContainer component={Paper} style={{ marginTop: '10px' ,width:"78vw" }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>CandidateID</StyledTableCell>
                  <StyledTableCell>Name</StyledTableCell>
                  <StyledTableCell>Email</StyledTableCell>
                  <StyledTableCell>Phone</StyledTableCell>
                  <StyledTableCell>Parent/Guardian Mobile</StyledTableCell>
                  <StyledTableCell>Domain</StyledTableCell>
                  <StyledTableCell>Vasavi Foundation</StyledTableCell>
                  <StyledTableCell>Batch No</StyledTableCell>
                  <StyledTableCell>Mode of Internship</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>{studentData.candidateID || studentData.guestID}</TableCell>
                  <TableCell>{studentData.fullName}</TableCell>
                  <TableCell>{studentData.email}</TableCell>
                  <TableCell>{studentData.mobileNo || studentData.mobileno}</TableCell>
                  <TableCell>{studentData.altmobileno || studentData.altMobileNo}</TableCell>
                  <TableCell>{studentData.domain}</TableCell>
                  <TableCell>{studentData.belongedToVasaviFoundation || studentData.BelongedToVasaviFoundation}</TableCell>
                  <TableCell>{studentData.batchNo || studentData.batchno}</TableCell>
                  <TableCell>{studentData.modeOfInternship || studentData.modeOfTraining}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          errorMsg && <Alert variant="danger">{errorMsg}</Alert>
        )}
        <h3>Job Applications</h3>
        {appliedJobs.length > 0 ? (
          <TableContainer component={Paper} style={{ marginTop: '10px' }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell>Job ID</StyledTableCell>
                  <StyledTableCell>Job Title</StyledTableCell>
                  <StyledTableCell>Company</StyledTableCell>
                  <StyledTableCell>Application Date</StyledTableCell>
                  <StyledTableCell>Status</StyledTableCell>
                  <StyledTableCell>Resume</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {appliedJobs.map(job => (
                  <StyledTableRow key={job.jobID}>
                    <TableCell>{job.jobID}</TableCell>
                    <TableCell><Link to={`/sa_dash/job_desc/${job.jobID}`}>{job.jobRole}</Link></TableCell>
                    <TableCell>{job.companyName}</TableCell>
                    <TableCell>{formatDate(job.applied_on)}</TableCell>
                    <TableCell>{job.status}</TableCell>
                    <TableCell
                      style={{ cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => handleResumeDownload(job)}
                    >
                      <FaFilePdf color='#2a97eb' />
                    </TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          errorMsg && <Alert variant="danger">{errorMsg}</Alert>
        )}
      </Container>
    </div>
  );
};

export default SAStudentDetails;
// import React, { useEffect, useState } from 'react';
// import { Container, Modal, Form, Alert } from 'react-bootstrap';
// import { Button } from '@mui/material';
// import { Link } from 'react-router-dom';
// import { FaFilePdf } from 'react-icons/fa';
// import apiService from '../../../apiService';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
// import { styled } from '@mui/system';

// const StyledTableCell = styled(TableCell)(({ theme }) => ({
//   backgroundColor: '#1b74a8',
//   color: 'white',
//   fontWeight: 'bold',
// }));

// const StyledTableRow = styled(TableRow)(({ theme }) => ({
//   '&:nth-of-type(odd)': {
//     backgroundColor: theme.palette,
//   },
// }));



// const InternEditModal = ({ show, onClose, onSubmit, formData, onChange }) => (
//   <Modal show={show} onHide={onClose}>
//     <Modal.Header closeButton>
//       <Modal.Title>Edit Intern Data</Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//       <Form onSubmit={onSubmit}>
//         <Form.Group controlId="formFullName">
//           <Form.Label>Full Name</Form.Label>
//           <Form.Control
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formEmail">
//           <Form.Label>Email</Form.Label>
//           <Form.Control
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formMobileNo">
//           <Form.Label>Mobile No</Form.Label>
//           <Form.Control
//             type="text"
//             name="mobileNo"
//             value={formData.mobileNo}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formAltMobileNo">
//           <Form.Label>Alternate Mobile No</Form.Label>
//           <Form.Control
//             type="text"
//             name="altMobileNo"
//             value={formData.altMobileNo}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formDomain">
//           <Form.Label>Domain</Form.Label>
//           <Form.Control
//             type="text"
//             name="domain"
//             value={formData.domain}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formBatchNo">
//           <Form.Label>Batch No</Form.Label>
//           <Form.Control
//             type="text"
//             name="batchNo"
//             value={formData.batchNo}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formModeOfInternship">
//           <Form.Label>Mode of Internship</Form.Label>
//           <Form.Control
//             type="text"
//             name="modeOfInternship"
//             value={formData.modeOfInternship}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
//           Save Changes
//         </Button>
//       </Form>
//     </Modal.Body>
//   </Modal>
// );

// const GuestEditModal = ({ show, onClose, onSubmit, formData, onChange }) => (
//   <Modal show={show} onHide={onClose}>
//     <Modal.Header closeButton>
//       <Modal.Title>Edit Guest Data</Modal.Title>
//     </Modal.Header>
//     <Modal.Body>
//       <Form onSubmit={onSubmit}>
//         <Form.Group controlId="formFullName">
//           <Form.Label>Full Name</Form.Label>
//           <Form.Control
//             type="text"
//             name="fullname"
//             value={formData.fullname}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formEmail">
//           <Form.Label>Email</Form.Label>
//           <Form.Control
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formMobileNo">
//           <Form.Label>Mobile No</Form.Label>
//           <Form.Control
//             type="text"
//             name="mobileno"
//             value={formData.mobileNo}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Form.Group controlId="formModeOfTraining">
//           <Form.Label>Mode of Training</Form.Label>
//           <Form.Control
//             type="text"
//             name="modeOfTraining"
//             value={formData.modeOfTraining}
//             onChange={onChange}
//           />
//         </Form.Group>
//         <Button type="submit" variant="contained" color="primary" style={{ marginTop: '10px' }}>
//           Save Changes
//         </Button>
//       </Form>
//     </Modal.Body>
//   </Modal>
// );



// const SAStudentDetails = ({ candidateID }) => {
//   const [studentData, setStudentData] = useState(null);
//   const [appliedJobs, setAppliedJobs] = useState([]);
//   const [errorMsg, setErrorMsg] = useState('');
//   const [showInternEditModal, setShowInternEditModal] = useState(false);
//   const [showGuestEditModal, setShowGuestEditModal] = useState(false);
//   const isIntern = candidateID.startsWith('RS');
//   console.log(isIntern)
//   console.log(candidateID);
//   const [internFormData, setInternFormData] = useState({
//     fullName: '',
//     email: '',
//     mobileNo: '',
//     altMobileNo: '',
//     domain: '',
//     batchNo: '',
//     modeOfInternship: ''
//   });

//   const [guestFormData, setGuestFormData] = useState({
//     fullname: '',
//     email: '',
//     mobileno: '',
//     modeOfTraining: ''
//   });

//   useEffect(() => {
//     // Fetch student data for both interns and guests
//     fetchStudentData();
  
//     // Fetch applied jobs for both interns and guests
//     fetchAppliedJobs();
//   }, [candidateID]);  // Trigger effect when either candidateID or guestID changes
  

//   // const fetchStudentData = async () => {
//   //   try {
//   //     const response = await apiService.get(`/api/applicant-history/?candidateID=${candidateID}`);
//   //     setStudentData(response.data);
//   //     setEditFormData(response.data); // Initialize form with current data
//   //     console.log("Stud", response.data);
//   //   } catch (error) {
//   //     console.error('Error fetching student data', error);
//   //     setErrorMsg('No data found for the student.');
//   //   }
//   // };

//   const fetchStudentData = async () => {
//     try {
//       let endpoint;
//       if (candidateID) {
//         endpoint = `/api/applicant-history/?candidateID=${candidateID}`; // For interns
//       } else if (candidateID) {
//         endpoint = `/api/applicant-history/?candidateID=${candidateID}`; // For guests
//       } else {
//         throw new Error('Invalid user type');
//       }

//       const response = await apiService.get(endpoint);
//       setStudentData(response.data);

//       // Initialize form data based on user type
//       if (candidateID) {
//         setInternFormData(response.data);
//         console.log(internFormData, guestFormData);
//       } else {
//         setGuestFormData(response.data);
//         console.log(internFormData, guestFormData);
//       }

//       console.log('Fetched data:', response.data);
//     } catch (error) {
//       console.error('Error fetching student data:', error);
//       setErrorMsg('No data found for the user.');
//     }
//   };

//   const fetchAppliedJobs = async () => {
//     if (!candidateID) {
//       setAppliedJobs([]);
//       setErrorMsg('Job applications are not available for guests.');
//       return;
//     }

//     try {
//       let endpoint;
//       if (candidateID) {
//         endpoint = `/api/intern-job-applicant-history/?candidateID=${candidateID}`; // For interns
//       } else if (candidateID) {
//         endpoint = `/api/intern-job-applicant-history/?candidateId=${candidateID}`; // For guests
//       } else {
//         throw new Error('Invalid user type');
//       }
//       const response = await apiService.get(endpoint);
//       console.log(response.data);
//       setAppliedJobs(response.data);

//       if (response.data.length > 0) {
//         setErrorMsg('');
//       } else {
//         setErrorMsg('No job applications found for the intern.');
//       }
//     } catch (error) {
//       console.error('Error fetching applied jobs:', error);
//       setErrorMsg('No applied jobs found for the intern.');
//     }
//   };


//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const day = String(date.getDate()).padStart(2, '0');
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const year = date.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   const handleResumeDownload = async (applicationId) => {
//     try {
//       const url = `/api/download-resume/${applicationId.applicationID}`;
//       const response = await apiService.getWithResponseType(url, 'blob');
//       const contentType = response.headers['content-type'] || 'application/octet-stream';
//       let extension = 'pdf';
//       if (contentType.includes('application/pdf')) {
//         extension = 'pdf';
//       } else if (contentType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
//         extension = 'docx';
//       } else if (contentType.includes('application/msword')) {
//         extension = 'doc';
//       }
//       const blob = new Blob([response.data], { type: contentType });
//       const blobUrl = window.URL.createObjectURL(blob);

//       const link = document.createElement('a');
//       link.href = blobUrl;
//       link.download = `resume-${applicationId.fullname}.${extension}`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(blobUrl); // Clean up
//     } catch (error) {
//       console.error('Error downloading the file:', error);
//     }
//   };

//   const handleEditChange = (e) => {
//     const { name, value } = e.target;

//     if (isIntern) {
//       setInternFormData((prevData) => ({
//         ...prevData,
//         [name]: value
//       }));
//     } else {
//       setGuestFormData((prevData) => ({
//         ...prevData,
//         [name]: value
//       }));
//     }
//   };

//   const handleInternEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await apiService.put(`/api/intern_data/${candidateID}`, internFormData);
//       setShowInternEditModal(false); // Close the intern modal
//       // Refresh data after successful submission
//       fetchStudentData(); // Assuming you have a method to refresh data
//     } catch (error) {
//       console.error('Error updating intern data:', error);
//     }
//   };
  
//   const handleGuestEditSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       await apiService.put(`/api/guest_data/${candidateID}`, guestFormData);
//       setShowGuestEditModal(false); // Close the guest modal
//       // Refresh data after successful submission
//       fetchStudentData(); // Assuming you have a method to refresh data
//     } catch (error) {
//       console.error('Error updating guest data:', error);
//     }
//   };
  

//   console.log(isIntern);

//   return (
//     <div>
//       <Link to='/SA_dash/viewJobs' className='text-decoration-none'>
//         <Button variant="contained" color="primary" style={{ display: "flex", gap: "5px" }}>
//           <i className="fa-solid fa-left-long"></i> Back
//         </Button>
//       </Link>
//       <Container className='mt-4'>
//         <span style={{ display: 'inline', marginTop: '10px' }}>
//           <h2>Student data</h2>
//           <div>
//             {isIntern ? (
//               <>
//                 <Button onClick={() => setShowInternEditModal(true)}>Edit Intern</Button>
//                 <InternEditModal
//                   show={showInternEditModal}
//                   onClose={() => setShowInternEditModal(false)}
//                   onSubmit={handleInternEditSubmit}
//                   formData={internFormData}
//                   onChange={handleEditChange}
//                 />
//               </>
//             ) : (
//               <>
//                 <Button onClick={() => setShowGuestEditModal(true)}>Edit Guest</Button>
//                 <GuestEditModal
//                   show={showGuestEditModal}
//                   onClose={() => setShowGuestEditModal(false)}
//                   onSubmit={handleGuestEditSubmit}
//                   formData={for}
//                   onChange={handleEditChange}
//                 />
//               </>
//             )}
//           </div>
//         </span>
        
//         {studentData ? (
//           <TableContainer component={Paper} style={{ marginTop: '10px' }}>
//             <Table>
//               <TableHead>
//                 <StyledTableRow>
//                   <StyledTableCell>CandidateID</StyledTableCell>
//                   <StyledTableCell>Name</StyledTableCell>
//                   <StyledTableCell>Email</StyledTableCell>
//                   <StyledTableCell>Phone</StyledTableCell>
//                   <StyledTableCell>Parent/Guardian Mobile</StyledTableCell>
//                   <StyledTableCell>Domain</StyledTableCell>
//                   <StyledTableCell>Vasavi Foundation</StyledTableCell>
//                   <StyledTableCell>Batch No</StyledTableCell>
//                   <StyledTableCell>Mode of Internship</StyledTableCell>
//                 </StyledTableRow>
//               </TableHead>
//               <TableBody>
//                 <TableRow>
//                   <TableCell>{studentData.candidateID || studentData.guestID}</TableCell>
//                   <TableCell>{studentData.fullName}</TableCell>
//                   <TableCell>{studentData.email}</TableCell>
//                   <TableCell>{studentData.mobileNo || studentData.mobileno}</TableCell>
//                   <TableCell>{studentData.altmobileno || studentData.altMobileNo}</TableCell>
//                   <TableCell>{studentData.domain}</TableCell>
//                   <TableCell>{studentData.belongedToVasaviFoundation || studentData.BelongedToVasaviFoundation}</TableCell>
//                   <TableCell>{studentData.batchNo || studentData.batchno}</TableCell>
//                   <TableCell>{studentData.modeOfInternship || studentData.modeOfTraining}</TableCell>
//                 </TableRow>
//               </TableBody>
//             </Table>
//           </TableContainer>
//         ) : (
//           errorMsg && <Alert variant="danger">{errorMsg}</Alert>
//         )}
//         <h3>Job Applications</h3>
        
//         {appliedJobs.length > 0 ? (
//           <TableContainer component={Paper} style={{ marginTop: '10px' }}>
//             <Table>
//               <TableHead>
//                 <StyledTableRow>
//                   <StyledTableCell>Job ID</StyledTableCell>
//                   <StyledTableCell>Job Title</StyledTableCell>
//                   <StyledTableCell>Company</StyledTableCell>
//                   <StyledTableCell>Application Date</StyledTableCell>
//                   <StyledTableCell>Status</StyledTableCell>
//                   <StyledTableCell>Resume</StyledTableCell>
//                 </StyledTableRow>
//               </TableHead>
//               <TableBody>
//                 {appliedJobs.map(job => (
//                   <StyledTableRow key={job.jobID}>
//                     <TableCell>{job.jobID}</TableCell>
//                     <TableCell><Link to={`/sa_dash/job_desc/${job.jobID}`}>{job.jobRole}</Link></TableCell>
//                     <TableCell>{job.companyName}</TableCell>
//                     <TableCell>{formatDate(job.applied_on)}</TableCell>
//                     <TableCell>{job.status}</TableCell>
//                     <TableCell
//                       style={{ cursor: 'pointer', textAlign: 'center' }}
//                       onClick={() => handleResumeDownload(job)}
//                     >
//                       <FaFilePdf color='#2a97eb' />
//                     </TableCell>
//                   </StyledTableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         ) : (
//           errorMsg && <Alert variant="danger">{errorMsg}</Alert>
//         )}
//       </Container>
//       {isIntern ? (
//         <InternEditModal
//           show={showInternEditModal}
//           onClose={() => setShowInternEditModal(false)}
//           onSubmit={handleInternEditSubmit}
//           formData={internFormData}
//           onChange={handleEditChange}
//         />
//       ) : (
//         <GuestEditModal
//           show={showGuestEditModal}
//           onClose={() => setShowGuestEditModal(false)}
//           onSubmit={handleGuestEditSubmit}
//           formData={guestFormData}
//           onChange={handleEditChange}
//         />
//       )}    </div>
//   );
// };

// export default SAStudentDetails;

