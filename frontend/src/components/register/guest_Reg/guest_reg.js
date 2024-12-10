import React, { useState, useEffect } from 'react';
import {
  Modal,
  Button,
  TextField,
  MenuItem,
  Select,
  Box,
  Typography,
  InputLabel,
  FormControl,
  FormLabel,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  useTheme,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FaFileSignature } from "react-icons/fa";

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import apiService from '../../../apiService';
import './guest_reg.css';
import { fontSize } from '@mui/system';

const GuestRegistration = ({ setSelectedView }) => {
  const navigate = useNavigate();
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (registrationSuccess) {
      setOpenModal(true);
      const timer = setTimeout(() => {
        setSelectedView("home")
        navigate('/');
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .required('Full Name is required *')
      .min(5)
      .max(30)
      .matches(
        /^[A-Za-z]{5,30} [A-Za-z]{5,30}$/,
        `Full Name must consist of a first name and a last name each containing 5 to 30 characters, separated by a space, and should only contain letters`
      ),
    email: Yup.string()
      .matches(emailRegex, 'Invalid email format')
      .min(5)
      .max(50)
      .required('Email is required *'),
    // mobileno: Yup.string().required('Mobile number is required').matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number'),
    // altmobileno: Yup.string().required('Alternative mobile number is required').matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number'),

      mobileno: Yup.string()
        .required('Mobile number is required')
        .matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number')
        .notOneOf([Yup.ref('altmobileno')], 'Mobile number must be different from Alternative mobile number'),
    
      altmobileno: Yup.string()
        .required('Alternative mobile number is required')
        .matches(/^[6-9][0-9]{9}$/, 'Must be a valid 10-digit number')
        .notOneOf([Yup.ref('mobileno')], 'Alternative mobile number must be different from mobile number'),
    
    address: Yup.string()
    .required('Address is required')
    .min(5, 'Address must be at least 5 characters long')
    .max(30, 'Address must be less than or equal to 30 characters')
    .matches(/[a-zA-Z]/, 'Address must contain at least one letter')
    .matches(/[0-9]/, 'Address must contain at least one number')
    .matches(/[\W_]/, 'Address must contain at least one special character'),
    
    batchno: 
    Yup.string()
    .required('Batch number is required')
    .min(1)
    .max(15)
    .notOneOf(['0'], 'Batch number cannot be 0'),

    modeOfTraining: Yup.string().required('Please select your mode of Training'),
    BelongedToVasaviFoundation: Yup.string().required('This field is required'),
    domain: Yup.string().required('Please select your domain'),
    program: Yup.string().required('Please select your program'),
  });


  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      console.log("values :", values);

      const response = await apiService.post('/api/register/guest', values);

      toast.success('Registered successfully!', { autoClose: 5000 });
      setRegistrationDetails(values);
      setRegistrationSuccess(true);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.warning(`${error.response.data.message}. ${error.response.data.suggestion}`);
      } else if (error.response && error.response.status === 401) {
        setSelectedView("home")
        toast.warning(`${error.response.data.message}.`);
      } else {
        console.error('Registration failed:', error);
        toast.error('Failed to register. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessModal = ({ open, onClose, registrationDetails }) => {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
      if (open && countdown > 0) {
        const timer = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
      } else if (countdown === 0) {
        onClose();
      }
    }, [open, countdown, onClose]);

    return (
      <Modal
        open={open}
        onClose={() => setSelectedView('home')}
        aria-labelledby="registration-success"
        aria-describedby="registration-success-details"
      >
        <Box
          sx={{
            position: 'relative',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: theme.palette.background.paper,
            border: '2px solid #000',
            borderRadius: 2, // rounded corners
            boxShadow: theme.shadows[5], // soft shadow
            p: 4,
            transition: 'all 0.3s ease-in-out', // smooth transition
            animation: 'fadeIn 0.5s', // fade-in animation
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setSelectedView('home')}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
                transition: 'color 0.3s',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          {registrationDetails ? (
            <>
              <Typography
                sx={{
                  mt: 2,
                  fontFamily: theme.typography.fontFamily,
                  color: theme.palette.text.primary,
                }}
              >
                You have been successfully registered! <br />
                We will send your registration details to the admin, <br />
                you will receive a mail to <strong>{registrationDetails.email}</strong> once admin approves your registration.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                }}
              >
                Registered Details:
              </Typography>
              <Typography>
                <strong>Full Name:</strong> {registrationDetails.fullName}
              </Typography>
              <Typography>
                <strong>Email:</strong> {registrationDetails.email}
              </Typography>
              <Typography>
                <strong>Mobile No:</strong> {registrationDetails.mobileno}
              </Typography>
              <Typography>
                <strong>Alternative Mobile No:</strong> {registrationDetails.altmobileno}
              </Typography>
              <Typography>
                <strong>Address:</strong> {registrationDetails.address}
              </Typography>
              <Typography>
                <strong>Mode of Training:</strong> {registrationDetails.modeOfTraining}
              </Typography>
              <Typography>
                <strong>Program:</strong> {registrationDetails.program}
              </Typography>
              <Typography>
                <strong>Domain:</strong> {registrationDetails.domain}
              </Typography>
              <Typography>
                <strong>Batch No:</strong> {registrationDetails.batchno}
              </Typography>
              <Typography>
                <strong>Belonged To Vasavi Foundation:</strong> {registrationDetails.BelongedToVasaviFoundation}
              </Typography>
              <Typography>
                <strong>Mega Drive Status:</strong> {registrationDetails.megadriveStatus}
              </Typography>

            </>
          ) : (
            <Typography>
              No registration details available.
            </Typography>
          )}
          <Typography
            sx={{
              mt: 2,
              fontFamily: theme.typography.fontFamily,
              color: theme.palette.text.secondary,
            }}
          >
            Redirecting to the home page in {countdown} seconds...
          </Typography>
        </Box>
      </Modal>
    );
  };


  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <div className="intern_reg_container">
      <Formik
        initialValues={{
          fullName: '',
          email: '',
          mobileno: '',
          altmobileno: '',
          address: '',
          modeOfTraining: '',
          program:'',
          domain: '',
          batchno: '',
          megadriveStatus: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-100 intern_reg_section" autoComplete="off">
            <div style={{display:"flex", gap:"10px"}}>
            <h2 className="intern_reg_section_title" style={{color:"white"}} > 
              Guest Registration Form 
            </h2>
            <i style={{fontSize:"17px"}}> <FaFileSignature /> </i>
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Full Name"
                variant="outlined"
                className="intern_reg_input"
                name="fullName"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: '#ffffff' } // Label color
                }}
                InputProps={{
                  style: {
                    color: '#ffffff',          // Text color
                    borderColor: '#ffffff'     // Outline color
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
              />
              <ErrorMessage name="fullName" component="div" className="error-message" style={{fontSize:"11px"}} />
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Email"
                variant="outlined"
                className="intern_reg_input"
                name="email"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: '#ffffff' } // Label color
                }}
                InputProps={{
                  style: {
                    color: '#ffffff',          // Text color
                    borderColor: '#ffffff'     // Outline color
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
              />
              <ErrorMessage name="email" component="div" className="error-message" />
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Mobile No"
                variant="outlined"
                className="intern_reg_input"
                name="mobileno"
                fullWidth
                required
                inputProps={{
                  style: {
                    color: '#ffffff',          // Text color
                    borderColor: '#ffffff'     // Outline color
                  },
                  maxLength: 10,
                  inputMode: 'numeric', // Ensures numeric keyboard on mobile devices
                  pattern: '[0-9]*' // Ensures only numbers are allowed
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="bg-secondary-subtle rounded p-2">+91</span>
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  style: { color: '#ffffff' } // Label color
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
                onKeyPress={(e) => {
                  // Allow only digits (0-9)
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <ErrorMessage name="mobileno" component="div" className="error-message" />
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Guardian/Parent Mobile No"
                variant="outlined"
                className="intern_reg_input"
                name="altmobileno"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: '#ffffff' }
                }}
                InputProps={{
                  maxLength: 10,
                  style: {
                    color: '#ffffff',
                    borderColor: '#ffffff'
                  },
                  
                  startAdornment: (
                    <InputAdornment position="start">
                      <span className="bg-secondary-subtle rounded p-2">+91</span>
                    </InputAdornment>
                  )
                }}
                onKeyPress={(e) => {
                  // Allow only digits (0-9)
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
                inputProps={{ maxLength: 10 }}
              />
              <ErrorMessage name="altmobileno" component="div" className="error-message" />
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Address"
                variant="outlined"
                className="intern_reg_input"
                name="address"
                fullWidth
                required
                InputLabelProps={{
                  style: { color: '#ffffff' } // Label color
                }}
                InputProps={{
                  style: {
                    color: '#ffffff',          // Text color
                    borderColor: '#ffffff'     // Outline color
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
              />
              <ErrorMessage name="address" component="div" className="error-message" />
            </div>

            <div className="intern_reg_form_group">
              <FormControl fullWidth>
              <InputLabel required style={{ color: '#ffffff' }}>Domain</InputLabel>
              <Field
                  as={Select}
                  label="Domain"
                  name="domain"
                  fullWidth
                  required
                  sx={{
                    color: '#ffffff', // Text color
                    '.MuiInputBase-input': {
                      color: '#ffffff', // Select text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Focused border color
                    },
                    '.MuiSvgIcon-root': {
                      color: '#ffffff', // Dropdown arrow color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#333333', // Dropdown menu background
                        color: '#ffffff', // Dropdown menu text color
                      },
                    },
                  }}
                >
                  <MenuItem value="Cloud Data Engineer">Cloud Data Engineer</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="DevOps & Cloud Computing">DevOps & Clooud Computing</MenuItem>
                  <MenuItem value="Testing Tools">Testing Tools</MenuItem>
                  <MenuItem value="Project Management & Agile">Project Management & Agile</MenuItem>
                  <MenuItem value="Business Analyst">Business Analyst</MenuItem>
                  <MenuItem value="Cyber Security">Cyber Security</MenuItem>
                  <MenuItem value="Dot Net">Dot Net</MenuItem>
                  <MenuItem value="Python Full Stack">Python Full Stack</MenuItem>
                  <MenuItem value="Java Full Stack">Java Full Stack</MenuItem>
                  <MenuItem value="MERN Full Stack">Mern Full Stack</MenuItem>
                  <MenuItem value="SalesForce">Salesforce</MenuItem>
                  <MenuItem value="Scrum Master">Scrum Master</MenuItem>
                  <MenuItem value="Digital Marketing">Digital Marketing</MenuItem>
                  <MenuItem value="Medical Coding">Medical Coding</MenuItem>
                  <MenuItem value="Investment Banking">Investment Banking</MenuItem>
                  <MenuItem value="BI Reporting Tools">BI Reporting Tools</MenuItem>
                  <MenuItem value="Microsoft Dynamics">Microsoft Dynamics</MenuItem>
                  <MenuItem value="Service Now">Service Now</MenuItem>
                </Field>
                <ErrorMessage name="domain" component="div" className="error-message" />
              </FormControl>
            </div>

            <div className="intern_reg_form_group">
              <FormControl fullWidth>
                <InputLabel required style={{color:"#ffffff"}}>Program</InputLabel>
                <Field
                  as={Select}
                  label="Program"
                  name="program"
                  fullWidth
                  required
                  sx={{
                    color: '#ffffff', // Text color
                    '.MuiInputBase-input': {
                      color: '#ffffff', // Select text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Focused border color
                    },
                    '.MuiSvgIcon-root': {
                      color: '#ffffff', // Dropdown arrow color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#333333', // Dropdown menu background
                        color: '#ffffff', // Dropdown menu text color
                      },
                    },
                  }}
                >
                  <MenuItem value="Training">Training</MenuItem>
                  <MenuItem value="JOIP">JOIP</MenuItem>
                  <MenuItem value="Placement">Placement</MenuItem>

                </Field>
                <ErrorMessage name="program" component="div" className="error-message" />
              </FormControl>
            </div>


            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Batch No"
                variant="outlined"
                className="intern_reg_input"
                name="batchno"
                fullWidth
                required
                
                InputLabelProps={{
                  style: { color: '#ffffff' } // Label color
                }}
                InputProps={{
                  style: {
                    color: '#ffffff',          // Text color
                    borderColor: '#ffffff'     // Outline color
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover fieldset': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ffffff', // Focused border color
                    },
                  },
                }}
              />
              <ErrorMessage name="batchno" component="div" className="error-message" />
            </div>




            <div className="intern_reg_form_group">
              <FormControl fullWidth>
                <InputLabel required style={{color:"white"}}>Mode of Training</InputLabel>
                <Field
                  as={Select}
                  label="Mode of Internship"
                  name="modeOfTraining"
                  fullWidth
                  required
                  sx={{
                    color: '#ffffff', // Text color
                    '.MuiInputBase-input': {
                      color: '#ffffff', // Select text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Focused border color
                    },
                    '.MuiSvgIcon-root': {
                      color: '#ffffff', // Dropdown arrow color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#333333', // Dropdown menu background
                        color: '#ffffff', // Dropdown menu text color
                      },
                    },
                  }}
                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Field>
                <ErrorMessage name="modeOfTraining" component="div" className="error-message" />
              </FormControl>
            </div>


            <div className="intern_reg_form_group">
              <FormControl component="fieldset">
                <FormLabel component="legend" required style={{color:"white"}}>Belonged To Vasavi Foundation</FormLabel>
                <Field
                  as={RadioGroup}
                  name="BelongedToVasaviFoundation"
                  row
                  required
                  sx={{
                    color: '#ffffff', // Text color
                    '.MuiInputBase-input': {
                      color: '#ffffff', // Select text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Focused border color
                    },
                    '.MuiSvgIcon-root': {
                      color: '#ffffff', // Dropdown arrow color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#333333', // Dropdown menu background
                        color: '#ffffff', // Dropdown menu text color
                      },
                    },
                  }}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </Field>
                <ErrorMessage name="megadriveStatus" component="div" className="error-message" />
              </FormControl>
            </div>
 


            <div className="intern_reg_form_group">
              <FormControl component="fieldset">
                <FormLabel component="legend" required style={{color:"white"}}>Mega Drive Status</FormLabel>
                <Field
                  as={RadioGroup}
                  name="megadriveStatus"
                  row
                  required
                  sx={{
                    color: '#ffffff', // Text color
                    '.MuiInputBase-input': {
                      color: '#ffffff', // Select text color
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Default border color
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Hover border color
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#ffffff', // Focused border color
                    },
                    '.MuiSvgIcon-root': {
                      color: '#ffffff', // Dropdown arrow color
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: '#333333', // Dropdown menu background
                        color: '#ffffff', // Dropdown menu text color
                      },
                    },
                  }}
                >
                  <FormControlLabel value="yes" control={<Radio />} label="Qualified" />
                  <FormControlLabel value="No" control={<Radio />} label="Not Qualified" />
                </Field>
                <ErrorMessage name="megadriveStatus" component="div" className="error-message" />
              </FormControl>
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              className="intern_reg_submit_button"
            >
              {isSubmitting ? 'Submitting...' : 'Register'}
            </Button>
          </Form>
        )}
      </Formik>

      <SuccessModal
        open={openModal}
        onClose={handleCloseModal}
        registrationDetails={registrationDetails}
      />
    </div>
  );
};

export default GuestRegistration;



