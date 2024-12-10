import React, { useState, useEffect } from 'react';
import {
  Modal,
  TextField,
  MenuItem,
  Button,
  Select,
  Box,
  Typography,
  InputLabel,
  FormControl,
  Divider,
  FormLabel,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid,
  Paper,
  CircularProgress,
  Stack, useTheme,
  InputAdornment,
  colors,
} from '@mui/material';


import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { FaFileSignature } from "react-icons/fa";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import apiService from '../../../apiService';
import { toast } from 'react-toastify';
import { fontSize } from '@mui/system';

const InternRegistration = ({ setSelectedView }) => {
  const navigate = useNavigate();
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [countdown, setCountdown] = useState(10);

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

    modeOfInternship: Yup.string().required('This field is required'),
    belongedToVasaviFoundation: Yup.string().required('This field is required'),
    domain: Yup.string().required('Please select your domain'),
  });

  const handleFormSubmit = (values, { setSubmitting }) => {
    setRegistrationDetails(values);
    setOpenConfirmModal(true);
    setSubmitting(false);
  };


  const handleConfirmSubmit = async () => {
    try {
      const response = await apiService.post('/api/register/intern', registrationDetails);
      toast.success('Registered successfully!', { autoClose: 5000 });
      setOpenConfirmModal(false);
      setOpenSuccessModal(true);
      setCountdown(10);
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
    }
  };

  useEffect(() => {
    if (openSuccessModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (countdown === 0) {
      setOpenSuccessModal(false);
      setSelectedView("home");
      navigate('/');
    }
  }, [openSuccessModal, countdown, navigate, setSelectedView]);


  const ConfirmationModal = ({ open, onClose, onConfirm, registrationDetails }) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="confirmation-modal-title"
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '600px' },
            maxHeight: '80vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box
            sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Typography
              id="confirmation-modal-title"
              variant="h6"
              component="h2"
              style={{ color: "#013356" }}
              sx={{
                fontWeight: 600,
                color: 'primary.main'
              }}
            >
              Confirm Registration Details
            </Typography>
          </Box>

          {/* Content */}
          <Box
            sx={{
              p: 3,
              overflowY: 'auto',
              flexGrow: 1
            }}
          >
            {registrationDetails ? (
              <Stack spacing={2}>
                <DetailRow label="Full Name" style={{ color: "#013356" }} value={registrationDetails.fullName} />
                <DetailRow label="Email" style={{ color: "#013356" }} value={registrationDetails.email} />
                <DetailRow label="Mobile No" style={{ color: "#013356" }} value={registrationDetails.mobileno} />
                <DetailRow label="Alternative Mobile No" style={{ color: "#013356" }} value={registrationDetails.altmobileno} />
                <DetailRow label="Address" style={{ color: "#013356" }} value={registrationDetails.address} />
                <DetailRow label="Batch No" style={{ color: "#013356" }} value={registrationDetails.batchno} />
                <DetailRow label="Domain" style={{ color: "#013356" }} value={registrationDetails.domain} />
              </Stack>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
                <Typography sx={{ ml: 2, color: 'text.secondary' }}>
                  Loading details...
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2
            }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Edit
            </Button>
            <Button
              onClick={onConfirm}
              style={{ backgroundColor: "#013356" }}
              variant="contained"
              sx={{
                px: 3,
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Confirm & Submit
            </Button>
          </Box>
        </Paper>
      </Modal>
    );
  };


  const DetailRow = ({ label, value }) => (
    <Box sx={{
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={4}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              whiteSpace: 'nowrap'
            }}
          >
            {label}:
          </Typography>
        </Grid>
        <Grid item xs={8}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.primary',
              fontWeight: 500
            }}
          >
            {value || "—"}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <div className="intern_reg_container">
      <Formik
        initialValues={{
          fullName: '',
          email: '',
          mobileno: '',
          altmobileno: '',
          address: '',
          batchno: '',
          modeOfInternship: '',
          belongedToVasaviFoundation: '',
          domain: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="w-100 intern_reg_section" autoComplete="off">
            <div style={{ display: "flex", gap: "10px", color: "white" }}>
              <h2 className="intern_reg_section_title" >
                Intern Registration Form
              </h2>
              <i style={{ fontSize: "17px" }}> <FaFileSignature /> </i>
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

              <ErrorMessage name="fullName" component="div" className="error-message" style={{fontSize:"11px"}}/>
            </div>
            <div className="intern_reg_form_group">
              <Field
                as={TextField}
                label="Email"
                type='email'
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

              <FormControl fullWidth required variant="outlined">
                <InputLabel style={{ color: '#ffffff' }}>Domain</InputLabel>
                <Field
                  as={Select}
                  name="domain"
                  label="Domain"
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
                  <MenuItem value="Python Full Stack">Full Stack Python</MenuItem>
                  <MenuItem value="Java Full Stack">Full Stack Java</MenuItem>
                  <MenuItem value="Mern Full Stack">Mern Full Stack</MenuItem>
                  <MenuItem value="Testing Tools">Testing Tools</MenuItem>
                  <MenuItem value="Scrum Master">Scrum Master</MenuItem>
                  <MenuItem value="Businesses Analyst">Businesses Analyst</MenuItem>
                  <MenuItem value="Data Science">Data Science</MenuItem>
                  <MenuItem value="Cyber Security">Cyber Security</MenuItem>
                </Field>
                <ErrorMessage name="domain" component="div" className="error-message" />
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
                  style: { color: '#ffffff' }
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
                // inputProps={{
                //   inputMode: 'numeric',
                //   pattern: '[0-9]*'
                // }}
              />
              <ErrorMessage name="batchno" component="div" className="error-message" />
            </div>
            <div className="intern_reg_form_group">
              {/* <FormControl fullWidth>
                <InputLabel required>Mode of Internship</InputLabel>
                <Field
                  as={Select}
                  label="Mode of Internship"
                  name="modeOfInternship"
                  fullWidth
                  required

                >
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Offline">Offline</MenuItem>
                </Field>
                <ErrorMessage name="modeOfInternship" component="div" className="error-message" />
              </FormControl> */}
              <FormControl fullWidth required>
                <InputLabel
                  style={{ color: '#ffffff' }} // Label color
                >
                  Mode of Internship
                </InputLabel>
                <Field
                  as={Select}
                  name="modeOfInternship"
                  label="Mode of Internship"
                  fullWidth
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
                <ErrorMessage name="modeOfInternship" component="div" className="error-message" />
              </FormControl>

            </div>
            {/* <div className="intern_reg_form_group">
              <FormControl component="fieldset">
                <FormLabel component="legend" required>Belonged to Vasavi Foundation</FormLabel>
                <Field
                  as={RadioGroup}
                  name="belongedToVasaviFoundation"
                  row
                  required
                >
                  <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
                  <FormControlLabel value="No" control={<Radio />} label="No" />
                </Field>
                <ErrorMessage name="belongedToVasaviFoundation" component="div" className="error-message" />
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
            </Button> */}
            <div className="intern_reg_form_group">
              <FormControl component="fieldset">
                <FormLabel
                  component="legend"
                  required
                  style={{ color: '#ffffff' }} // Label color
                >
                  Belonged to Vasavi Foundation
                </FormLabel>
                <Field
                  as={RadioGroup}
                  name="belongedToVasaviFoundation"
                  row
                  required
                >
                  <FormControlLabel
                    value="Yes"
                    control={<Radio sx={{ color: '#ffffff', '&.Mui-checked': { color: '#ffffff' } }} />}
                    label="Yes"
                    sx={{ color: '#ffffff' }} // Label color
                  />
                  <FormControlLabel
                    value="No"
                    control={<Radio sx={{ color: '#ffffff', '&.Mui-checked': { color: '#ffffff' } }} />}
                    label="No"
                    sx={{ color: '#ffffff' }} // Label color
                  />
                </Field>
                <ErrorMessage name="belongedToVasaviFoundation" component="div" className="error-message" />
              </FormControl>
            </div>

            {/* <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginRight:"8%" }}> */}
            <div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                className="intern_reg_submit_button"
                sx={{
                  backgroundColor: '#333333',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: '#555555',
                  },
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Register'}
              </Button>
            </div>

          </Form>
        )}
      </Formik>

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        registrationDetails={registrationDetails}
      />


      {/* Success Modal */}
      {/* <SuccessModal
        open={openSuccessModal}
        onClose={handleCloseModal}
        registrationDetails={registrationDetails}
      /> */}

    </div>
  );
};

export default InternRegistration;


