  import { useNavigate } from 'react-router-dom';
  import React, { useState, useEffect } from 'react';
  import { Container, Row, Col, Modal, Button, Form } from 'react-bootstrap';
  import { Box, Pagination } from '@mui/material';
  import { Formik, Field, ErrorMessage } from 'formik';
  import * as Yup from 'yup';
  import apiService from '../../apiService';
  import Cookies from 'js-cookie';
  import { toast } from 'react-toastify';
  import { FaChevronRight } from 'react-icons/fa';
  import Spinner from '../../Spinner';
  import { color } from '@mui/system';

  const degreeBranchMap = {
    "Bachelor of Arts (BA)": [
      "Literature", "History", "Psychology", "Sociology", "Philosophy",
      "Political Science", "Economics", "Anthropology", "Archaeology", "Linguistics"
    ],
    "Bachelor of Science (BS)": [
      "Biology", "Computer Science", "Environmental Science", "Chemistry",
      "Physics", "Mathematics", "Statistics", "Biotechnology", "Geology",
      "Agriculture"
    ],
    "Bachelor of Business Administration (BBA)": [
      "Business Management", "Marketing", "Finance", "Human Resources",
      "International Business", "Operations Management", "Supply Chain Management"
    ],
    "Bachelor of Fine Arts (BFA)": [
      "Graphic Design", "Theater", "Music", "Dance", "Film", "Photography",
      "Sculpture", "Painting", "Ceramics", "Digital Arts"
    ],
    "Bachelor of Engineering (BEng)": [
      "Civil Engineering", "Mechanical Engineering", "Computer Science Engineering", "Electrical Engineering",
      "Electronics Engineering", "Chemical Engineering", "Aerospace Engineering",
      "Industrial Engineering", "Biomedical Engineering", "Agricultural Engineering"
    ],
    "Bachelor of Technology (BTech)": [
      "Software Engineering", "Information Technology", "Computer Science Engineering",
      "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
      "Electronics and Communication Engineering", "Biotechnology Engineering"
    ],
    "Master of Arts (MA)": [
      "Education", "History", "Fine Arts", "Psychology", "Sociology",
      "Philosophy", "Political Science", "Economics", "Anthropology", "English"
    ],
    "Master of Science (MS)": [
      "Computer Science", "Environmental Science", "Psychology", "Physics",
      "Chemistry", "Biology", "Data Science", "Biotechnology", "Mathematics",
      "Statistics"
    ],
    "Master of Business Administration (MBA)": [
      "Business Management", "Finance", "Marketing", "Human Resources",
      "Operations Management", "International Business", "Entrepreneurship",
      "Strategy", "Supply Chain Management", "Information Technology Management"
    ],
    "Master of Fine Arts (MFA)": [
      "Creative Writing", "Visual Arts", "Performing Arts", "Theater Arts",
      "Dance", "Film Production", "Photography", "Sculpture", "Painting"
    ],
    "Master of Engineering (MEng)": [
      "Civil Engineering", "Mechanical Engineering", "Electrical Engineering",
      "Electronics Engineering", "Chemical Engineering", "Aerospace Engineering",
      "Biomedical Engineering", "Industrial Engineering"
    ],
    "Master of Architecture (MArch)": [
      "Architecture", "Urban Design", "Landscape Architecture",
      "Interior Architecture", "Sustainable Architecture"
    ],
    "Postgraduate Diploma": [
      "Project Management", "Business Analytics", "Computer Applications",
      "Human Resource Management", "Marketing", "Financial Management",
      "Health Administration", "Supply Chain Management", "Digital Marketing"
    ],
    "Other": ["N/A"]
  };

  const experienceOptions = [
    'Less than 6 months',
    '6 months to 1 year',
    '1 to 2 years',
    '2 to 3 years',
    '3 to 5 years',
    '5 years or more'
  ];

  const initialValues = {
    jobId: '',
    companyName: '',
    jobRole: '',
    candidateId: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    // qualification: '',
    yearOfPassedOut: '',
    degree: '',
    branch: '',
    gender: '',
    dateOfBirth: '',
    experience: '',
    location: '',
    technology: '',
    megaDrive: '',
    resume: null,
  };


  const validationSchema = Yup.object({
    degree: Yup.string()
    .required('Degree is required')
    .min(5, 'Degree must be at least 5 characters')
    .max(50, 'Degree must be less than 50 characters')
    .test('degree-not-empty', 'Please select or enter a degree', (value) => {
      return !!value && !(value === 'Other' && !value.trim());
    }),


    branch: Yup.string()
    .required('Branch is required')
    .min(5, 'Branch must be at least 5 characters')
    .max(50, 'Branch must be less than 50 characters'),

    mobileNumber: Yup.string()
    .required('Mobile Number is required')
    .matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number'),
      
    yearOfPassedOut: Yup.number()
      .required('Year of Passed Out is required')
      .min(new Date().getFullYear() - 18, `Year must not be earlier than ${new Date().getFullYear() - 18}`)
      .max(new Date().getFullYear(), `Year must not be later than ${new Date().getFullYear()}`),
    gender: Yup.string().required('Gender is required'),

    dateOfBirth: Yup.date()
      .required('Date of Birth is required')
      .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)), 'You must be at least 18 years old')
      .min(new Date('1980-01-01'), 'Date of Birth must not be earlier than January 1, 1980'),

    // dateOfBirth: Yup.date()
    //   .max(new Date(), "Date cannot be in the future")
    //   .required("Date of Birth is required")
    //   .test("is-valid-year", "Year must be four digits", (value) => {
    //     if (value) {
    //       const year = new Date(value).getFullYear();
    //       return year >= 1900 && year <= 2100; // Adjust these limits as needed
    //     }
    //     return true; // Skip validation if no value
    //   }),

    experience: Yup.string().required('Experience is required'),
    location: Yup.string().required('Location is required'),
    technology: Yup.string().required('Technology is required'),
    megaDrive: Yup.string().required('Mega Drive is required'),
    resume: Yup.mixed()
      .required('Resume is required')
      .test('fileType', 'Only PDF files are allowed', value =>
        value && value.type === 'application/pdf'
      )
      .test('fileSize', 'File size should not exceed 3 MB', value =>
        value && value.size <= 3 * 1024 * 1024 // 3 MB in bytes
      ),

  });

  const JobPortal = ({ setSelectedView }) => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [jobsPerPage] = useState(6);
    const candidateID = Cookies.get("internID");
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedJobRole, setSelectedJobRole] = useState('');
    const [jobRoles, setJobRoles] = useState([]);
    const [isApplying, setIsApplying] = useState(false);
    const [internData, setInternData] = useState({});
    const Nav = useNavigate();
    const [selectedDegree, setSelectedDegree] = useState('');
    const [availableBranches, setAvailableBranches] = useState([]);
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [loading, setLoading] = useState(false);

    const [customDegree, setCustomDegree] = useState('');
    const [customBranch, setCustomBranch] = useState('');

    useEffect(() => {
      fetchJobs();
      if (candidateID) {
        fetchInternDetails();
      }
    }, [candidateID]);

    const fetchJobs = async () => {
      try {
        const response = await apiService.get(`/api/intern-view-jobs/${candidateID}`);
        setJobs(response.data);
        const uniqueRoles = [...new Set(response.data.map(job => job.jobTitle))];
        setJobRoles(uniqueRoles);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error(`${error.response?.data?.error || 'An error occurred'}`, {
          autoClose: 5000
        });
      }
    };

    const fetchInternDetails = async () => {
      try {
        const response = await apiService.get(`/api/intern_data/${candidateID}`);
        setInternData(response.data[0]);
      } catch (error) {
        console.error('Error fetching intern details:', error);
        toast.error(`${error.response?.data?.error || 'An error occurred'}`, {
          autoClose: 5000
        });
      }
    };

    const filterJobs = () => {
      const filtered = jobs.filter(job => {
        const jobDate = new Date(job.postedOn);
        const jobYear = jobDate.getFullYear().toString();
        const jobMonth = String(jobDate.getMonth() + 1).padStart(2, '0');

        const yearMatch = selectedYear ? jobYear === selectedYear : true;
        const monthMatch = selectedMonth ? jobMonth === selectedMonth : true;
        const jobRoleMatch = selectedJobRole ? job.jobTitle === selectedJobRole : true;
        return yearMatch && monthMatch && jobRoleMatch;
      });
      setFilteredJobs(filtered);
    };

    useEffect(() => {
      filterJobs();
    }, [jobs, selectedYear, selectedMonth, selectedJobRole]);

    const handleCardClick = (job) => {
      setSelectedJob(job);
      setShowModal(true);
    };

    const handleApplyNow = () => {
      setShowModal(false);
      setIsApplying(true);
    };

    const handleCloseModal = () => {
      setShowModal(false);
      setSelectedJob(null);
      setIsApplying(false);
    };

    const handleBackToJobs = () => {
      setIsApplying(false);
      setSelectedJob(null);
    };

    const handleDegreeChange = (event) => {
      const degree = event.target.value;
      setSelectedDegree(degree);
      setAvailableBranches(degreeBranchMap[degree] || []);
    };

    const formatDate = (isoString) => {
      const date = new Date(isoString);
      return date.toISOString().split('T')[0];
    };


    const handleYearInput = (e) => {
      const value = e.target.value;
      const newValue = value.replace(/[^0-9-]/g, ''); // Allow only numbers and hyphens

      // Prevent exceeding four digits for the year (YYYY-MM-DD)
      const parts = newValue.split('-');
      if (parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4); // Trim to four digits if needed
      }

      setDateOfBirth(parts.join('-'));
    };


    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
    const paginate = (event, value) => setCurrentPage(value);
    const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    // const handleSubmit = async (values) => {
    //   setLoading(true);
    //   try {
    //     await new Promise((resolve) => setTimeout(resolve, 2000));
    //     const formDataToSend = new FormData();
    //     Object.keys(values).forEach(key => {
    //       if (key === 'resume') {
    //         formDataToSend.append(key, values[key]);
    //       } else {
    //         formDataToSend.append(key, values[key]);
    //       }
    //     });
    //     formDataToSend.append("applied_on", new Date().toISOString());
    //     const response = await apiService.post('/api/apply-job', formDataToSend);
    //     console.log("Data Submitted", formDataToSend);
    //     console.log('Application submitted successfully:', response.data);
    //     toast.success('Applied successfully!', { autoClose: 5000 });
    //     setSelectedView("Applied");
    //   } catch (error) {
    //     console.error('Error applying for job:', error);
    //     toast.error(`${error.response?.data?.error || 'An error occurred while submitting the application'}`, {
    //       autoClose: 5000
    //     });
    //   }
    // };

    const handleSubmit = async (values) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const formDataToSend = new FormData();
        Object.keys(values).forEach((key) => {
          if (key === 'resume') {
            formDataToSend.append(key, values[key]);
          } else {
            formDataToSend.append(key, values[key]);
          }
        });

        formDataToSend.append("applied_on", new Date().toISOString());
        const response = await apiService.post('/api/apply-job', formDataToSend);
        console.log("Data Submitted", formDataToSend);
        console.log('Application submitted successfully:', response.data);
        toast.success('Applied successfully!', { autoClose: 5000 });
        setSelectedView("Applied");
      } catch (error) {
        console.error('Error applying for job:', error);
        toast.error(`${error.response?.data?.error || 'An error occurred while submitting the application'}`, {
          autoClose: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div>
        <Container className="px-0 ml-auto mr-auto mb-5" style={{ overflow: "auto" }}>
          {isApplying ? (
            <div className="container mt-5">
              <h2 className="mb-4" style={{ color: "white" }}>Job Application Form</h2>
              <Formik

                initialValues={{
                  ...initialValues,
                  jobId: selectedJob.jobId,
                  companyName: selectedJob.companyName,
                  jobRole: selectedJob.jobTitle,
                  candidateId: candidateID,
                  fullName: internData.fullName || '',
                  email: internData.email || '',
                  mobileNumber: internData.mobileNo || '',
                  yearOfPassedOut: internData.yearOfPassedOut || '',
                  gender: internData.gender || '',
                  dateOfBirth: internData.dateOfBirth ? formatDate(internData.dateOfBirth) : '',
                  experience: internData.experience || '',
                  location: selectedJob.Location || '',
                  technology: internData.domain || '',
                  megaDrive: internData.megaDrive || '',
                  // Fix: Correctly initialize degree and branch
                  degree: internData.degree || '',
                  branch: internData.branch || '',
                }}

                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >

                {({ handleSubmit, setFieldValue }) => (

                  <Form onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}>

                    <Field name="jobRole">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Job Role *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="jobRole" component="div" className="text-danger" />

                    <Field name="companyName">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Company Name *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="companyName" component="div" className="text-danger" />

                    <Field name="jobId">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Job ID *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="jobId" component="div" className="text-danger" />

                    <Field name="location">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Job Location</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="location" component="div" className="text-danger" />


                    <Field name="candidateId">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Candidate ID *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="candidateId" component="div" className="text-danger" />

                    <Field name="fullName">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Full Name *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />

                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="fullName" component="div" className="text-danger" />

                    <Field name="email">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Email *</Form.Label>
                          <Form.Control {...field} type="email" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="email" component="div" className="text-danger" />

                    <Field name="mobileNumber">
    {({ field }) => (
      <Form.Group className="mb-3">
        <Form.Label style={{ color: "white" }}>Mobile Number *</Form.Label>
        <Form.Control
          {...field}
          type="tel"
          pattern="\d{10}"
          maxLength="10"
          placeholder="Enter 10-digit mobile number"
          onKeyPress={(e) => {
            // Allow only digits (0-9)
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
      </Form.Group>
    )}
  </Field>
  <ErrorMessage name="mobileNumber" component="div" className="text-danger" />


                    <Field name="technology">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Domain *</Form.Label>
                          <Form.Control {...field} type="text" readOnly />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="technology" component="div" className="text-danger" />


  <Field name="degree">
    {({ field, form }) => (
      <Form.Group className="mb-3">
        <Form.Label style={{ color: 'white' }}>Degree *</Form.Label>
        <Form.Select
          {...field}
          onChange={(e) => {
            const selectedDegree = e.target.value;
            setFieldValue('degree', selectedDegree);
            setFieldValue('branch', ''); // Reset branch when degree changes
            setSelectedDegree(selectedDegree);
            setAvailableBranches(degreeBranchMap[selectedDegree] || []);
          }}
        >
          <option value="">Select degree</option>
          {Object.keys(degreeBranchMap).map((degree, index) => (
            <option key={index} value={degree}>
              {degree}
            </option>
          ))}
        </Form.Select>

        {/* Conditionally render input field when "Other" is selected */}
        {selectedDegree === 'Other' && (
          <Form.Control
            type="text"
            placeholder="Enter your degree"
            className="mt-3"

            value={customDegree}
            onKeyPress={(e) => {
              if (!/[a-z A-Z /S]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const value = e.target.value;

              if (/^[a-zA-Z\s]*$/.test(value)) {
                setFieldValue('degree', value);
                setCustomDegree(value);
              }
            }}
          />
        )}
      </Form.Group>
    )}
  </Field>
  <ErrorMessage name="degree" component="div" className="text-danger" />

<Field name="branch">
  {({ field, form }) => (
    <Form.Group className="mb-3">
      <Form.Label style={{ color: "white" }}>Branch *</Form.Label>
      {selectedDegree === "Other" ? (
        <Form.Control
          type="text"
          placeholder="Enter your branch"
          value={customBranch}
          required
          onKeyPress={(e) => {
            if (!/[a-zA-Z\s]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const value = e.target.value;
            setCustomBranch(value); // Update customBranch state
            form.setFieldValue('branch', value); // Sync Formik's field value
            form.setFieldTouched('branch', true); // Mark field as touched for validation
          }}
        />
      ) : (
        <Form.Select
          {...field}
          onChange={(e) => {
            const selectedBranch = e.target.value;
            form.setFieldValue('branch', selectedBranch);
            form.setFieldTouched('branch', true); // Mark field as touched for validation
          }}
        >
          <option value="">Select branch</option>
          {availableBranches.map((branch, index) => (
            <option key={index} value={branch}>
              {branch}
            </option>
          ))}
        </Form.Select>
      )}
    </Form.Group>
  )}
</Field>
<ErrorMessage name="branch" component="div" className="text-danger" />



                    <Field name="yearOfPassedOut">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Year of Passed Out *</Form.Label>
                          <Form.Control {...field} type="number" />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="yearOfPassedOut" component="div" className="text-danger" />

                    <Field name="gender">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Gender *</Form.Label>
                          <Form.Select {...field}>
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="gender" component="div" className="text-danger" />

                    <Field name="dateOfBirth">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Date of Birth *</Form.Label>
                          <Form.Control
                            {...field}
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => {
                              setDateOfBirth(e.target.value);
                              field.onChange(e); // Ensure Formik updates its state
                            }}
                            onKeyDown={handleYearInput} // Attach the keydown handler
                          />
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="dateOfBirth" component="div" className="text-danger" />

                    <Field name="experience">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Experience *</Form.Label>
                          <Form.Select {...field}>
                            <option value="">Select experience</option>
                            {experienceOptions.map((exp, index) => (
                              <option key={index} value={exp}>{exp}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="experience" component="div" className="text-danger" />


                    <Field name="megaDrive">
                      {({ field }) => (
                        <Form.Group className="mb-3">
                          <Form.Label style={{ color: "white" }}>Mega Drive *</Form.Label>
                          <Form.Select {...field}>
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </Form.Select>
                        </Form.Group>
                      )}
                    </Field>
                    <ErrorMessage name="megaDrive" component="div" className="text-danger" />

                    <Form.Group className="mb-3">
                      <Form.Label style={{ color: "white" }}>Resume *</Form.Label>
                      <Field name="resume">
                        {({ field, form }) => (
                          <div>
                            <input
                              type="file"

                              onChange={(event) => {
                                const file = event.currentTarget.files[0];
                                console.log("Selected file:", file);
                                form.setFieldValue("resume", file);
                              }}
                              onBlur={() => form.setFieldTouched("resume", true)}
                              style={{
                                display: 'block',
                                color: "white",
                                marginBottom: '10px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                padding: '6px 12px',
                                fontSize: '16px',
                              }}
                            />

                            <ErrorMessage name="resume" component="div" className="text-danger" style={{ marginTop: '5px' }} />
                          </div>
                        )}
                      </Field>

                    </Form.Group>

                    <Button type="submit" style={{ background: "#1e1f21", border: "none" }}>
                      {loading ? "Applying..." : "Apply"}
                    </Button>
                    <Button type="button" onClick={handleBackToJobs} style={{ margin: "10px", background: "#1e1f21", border: "none" }}>
                      Back
                    </Button>
                  </Form>
                )}
              </Formik>
            </div>
          ) : (
            <>
              <Container className="my-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h1 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '25px' }}>Available Jobs</h1>
                </div>
              </Container>

              <Container>
                <Row>
                  {currentJobs.length > 0 ? (
                    currentJobs.map((job) => (
                      <Col key={job._id} sm={12} md={6} lg={4} className="mb-4">
                        <div
                          style={{
                            borderRadius: '10px',
                            border: '1px solid #ddd',
                            background: "#1e1f21",
                            height: '350px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            padding: '16px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          <div style={{ color: "white" }}>
                            <h5
                              style={{
                                fontWeight: 'bold',
                                fontSize: '1.25rem',
                                marginBottom: '8px',
                              }}
                            >
                              {job.jobTitle}
                            </h5>
                            <p
                              style={{
                                color: '#ffffff',
                                marginBottom: '15px',
                              }}
                            >
                              {job.companyName}
                            </p>
                          </div>
                          <p style={{ marginBottom: '10px', color: "white" }}>
                            <strong><i className="fa-solid fa-id-badge"></i> Job ID :</strong> {job.jobId}
                          </p>
                          <p style={{ marginBottom: '10px', color: "white" }}>
                            <strong><i className="fa-solid fa-calendar-alt"></i> Posted On :</strong> {formatDate(job.postedOn)}
                          </p>
                          <p style={{ marginBottom: '10px', color: "white" }}>
                            <strong><i className="fa-solid fa-chalkboard"></i> Skills Required :</strong> {job.requiredSkills}
                          </p>
                          <p style={{ marginBottom: '10px', color: "white" }}>
                            <strong><i className="fa-solid fa-money-check-alt"></i> Salary :</strong> {job.salary}
                          </p>
                          <span style={{
                            cursor: "pointer",
                            textAlign: "right",
                            textDecoration: 'none',
                            color: '#ffffff',
                            fontWeight: '500',
                            marginRight: "30px",
                            marginTop: '20px',
                            marginBottom: "20px"
                          }}>
                            <a href onClick={() => handleCardClick(job)}> View Details
                              <FaChevronRight style={{ marginLeft: '8px', marginBottom: "2px" }} size={15} />
                            </a>
                          </span>
                        </div>
                      </Col>
                    ))
                  ) : (
                    <p style={{ color: "white" }}>No jobs found</p>
                  )}
                </Row>
              </Container>

              {filteredJobs.length > jobsPerPage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={paginate}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Container>

        <Modal show={showModal} onHide={handleCloseModal} >
          <Modal.Header closeButton>
            <Modal.Title>Job Details</Modal.Title>
          </Modal.Header>
          <Modal.Body >
            {selectedJob ? (
              <>
                <p><strong></strong> {selectedJob.jobTitle}</p>
                <p><strong>JobID:</strong> {selectedJob.jobId}</p>
                <p><strong>Company Name:</strong> {selectedJob.companyName}</p>
                <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
                <p><strong>Experience :</strong> {selectedJob.jobExperience}</p>
                <p><strong>Qualification :</strong> {selectedJob.jobQualification}</p>
                {selectedJob.bond && 
                <p><strong>Bond :</strong> {selectedJob.bond}</p> }
                <p><strong>Skills Required:</strong> {selectedJob.requiredSkills}</p>
                <p><strong>Location:</strong> {selectedJob.Location}</p>
                <p><strong>Salary:</strong> {selectedJob.salary}</p>
                <p><strong>Posted Date:</strong> {formatDate(selectedJob.postedOn)}</p>
                <p><strong>Last Date:</strong> {formatDate(selectedJob.lastDate)}</p>
              </>
            ) : (
              <p>Loading job details...</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            {selectedJob && (
              <Button
                style={{ background: "#1e1f21", border: "none" }}
                onClick={handleApplyNow}
              >
                Apply Now
              </Button>
            )}
          </Modal.Footer>
        </Modal>

      </div>
    );
  };

  export default JobPortal;

