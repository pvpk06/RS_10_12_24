import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem } from '@mui/material';
import { Formik, Field, Form as FormikForm, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import apiService from '../../../apiService'
import { Domain } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import { CheckBoxOutlineBlank, CheckBox } from '@mui/icons-material';


const validationSchema = Yup.object().shape({
  jobId: Yup.string().required('Job ID is required'),
  jobTitle: Yup.string().required('Job Title is required'),
  companyName: Yup.string().required('Company Name is required'),
  jobCategory: Yup.string().required('Job Category is required'),
  domains: Yup.array().min(1, 'At least one domain must be selected').required('Domains are required'),
  jobDescription: Yup.string().required('Job Description is required'),
  jobExperience: Yup.string().required('Job Experience is required'),
  jobQualification: Yup.string().required('Job Qualification is required'),
  jobType: Yup.string().required('Job Type is required'),
  salary: Yup.string().required('Salary is required'),
  requiredSkills: Yup.string().required('Required Skills are required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  Location: Yup.string().required('Location is required'),
  applicationUrl: Yup.string().url('Invalid URL').required('Application URL is required'),
  postedOn: Yup.date().required('Posted On date is required'),
  lastDate: Yup.date()
    .required('Last Date is required')
    .min(
      Yup.ref('postedOn'),
      'Last Date cannot be earlier than Posted On date'
    ),});



    const domainOptions = [
      { key: "Python Full Stack", value: "Python Full Stack" },
      { key: "Java Full Stack", value: "Java Full Stack" },
      { key: "Mern Full Stack", value: "Mern Full Stack" },
      { key: "Testing Tools", value: "Testing Tools" },
      { key: "Scrum Master", value: "Scrum Master" },
      { key: "Business Analyst", value: "Business Analyst" },
      { key: "Data Science", value: "Data Science" },
      { key: "Cyber Security", value: "Cyber Security" },
      { key: "Cloud Data Engineer", value: "Cloud Data Engineer" },
      { key: "Dot Net", value: "Dot Net" },
      { key: "DevOps & Cloud Computing", value: "DevOps & Cloud Computing" },
      { key: "Project Management & Agile", value: "Project Management & Agile" },
      { key: "SalesForce", value: "SalesForce" },
      { key: "Medical Coding", value: "Medical Coding" },
      { key: "Investment Banking", value: "Investment Banking" },
      { key: "Digital Marketing", value: "Digital Marketing" },
      { key: "BI Reporting Tools", value: "BI Reporting Tools" },
      { key: "Microsoft Dynamics", value: "Microsoft Dynamics" },
      { key: "Service Now", value: "Service Now" },
    ];

    
    const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const EditJobModal = ({ show, handleClose, job, handleSave }) => {
  const [companyNames, setCompanyNames] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});
  const today = new Date().toISOString().split('T')[0];
  const [initialValues, setInitialValues] = useState({
    jobId: '',
    jobTitle: '',
    companyName: '',
    jobCategory: '',
    domains : [],
    jobDescription: '',
    jobExperience: '',
    jobQualification: '',
    jobType: '',
    salary: '',
    phone: '',
    email: '',
    Location: '',
    applicationUrl: '',
    postedOn: '',
    lastDate: '',
  });

  useEffect(() => {
    if (job) {
      setInitialValues({
        jobId: job.jobId || '',
        jobTitle: job.jobTitle || '',
        companyName: job.companyName || '',
        jobCategory: job.jobCategory || '',
        domains: job.domains || '',
        jobDescription: job.jobDescription || '',
        jobExperience: job.jobExperience || '',
        jobQualification: job.jobQualification || '',
        jobType: job.jobType || '',
        salary: job.salary || '',
        requiredSkills: job?.requiredSkills || '',
        phone: job.phone || '',
        email: job.email || '',
        Location: job.Location || '',
        applicationUrl: job.applicationUrl || '',
        postedOn: job.postedOn ? formatDate(job.postedOn) : '',
        lastDate: job.lastDate ? formatDate(job.lastDate) : '',
      });
    }
  }, [job]);

  const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
  };

  const handleFormSubmit = (values, { setSubmitting }) => {
    const changedValues = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== initialValues[key]) {
        changedValues[key] = values[key];
      }
    });

    const updatedValues = {
      ...changedValues,
      postedOn: changedValues.postedOn ? new Date(changedValues.postedOn).toISOString() : undefined,
      lastDate: changedValues.lastDate ? new Date(changedValues.lastDate).toISOString() : undefined,
    };

    console.log("Submitting values:", updatedValues);
    handleSave({ ...updatedValues, jobId: values.jobId });
    setSubmitting(false);
  };

  const fetchCompanyNames = async () => {
    try {
      const response = await apiService.get('/api/registered-companies');
      setCompanyNames(response.data);
      const details = response.data.reduce((acc, company) => {
        acc[company.companyName] = {
          email: company.email,
          phone: company.mobileNo,
          companyId: company.companyID,
          website: company.website
        };
        return acc;
      }, {});
      setCompanyDetails(details);
    } catch (error) {
      console.error('Error fetching company names', error);
    }
  };

  useEffect(() => {
    fetchCompanyNames();
  }, []);

  return (
    <Dialog open={show} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Edit Job</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
          <FormikForm>
            <DialogContent dividers>
              <Field type="hidden" name="jobId" />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    name="jobTitle"
                    value={values.jobTitle}
                    onChange={handleChange}
                    error={touched.jobTitle && Boolean(errors.jobTitle)}
                    helperText={touched.jobTitle && errors.jobTitle}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Company Name"
                    name="companyName"
                    value={values.companyName}
                    onChange={(e) => {
                      const selectedCompany = e.target.value;
                      handleChange(e);  // Call Formik's handleChange
                      if (selectedCompany !== 'Select Company Name' && companyDetails[selectedCompany]) {
                        setFieldValue('email', companyDetails[selectedCompany].email);
                        setFieldValue('phone', companyDetails[selectedCompany].phone);
                        setFieldValue('applicationUrl', companyDetails[selectedCompany].website);
                      } else {
                        setFieldValue('email', '');
                        setFieldValue('phone', '');
                        setFieldValue('applicationUrl', '');
                      }
                    }}
                    error={touched.companyName && Boolean(errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                  >
                    <MenuItem value="">Select Company Name</MenuItem>
                    {companyNames.map(company => (
                      <MenuItem key={company.companyID} value={company.companyName}>
                        {company.companyName}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Job Type"
                    name="jobType"
                    value={values.jobType}
                    onChange={handleChange}
                    error={touched.jobType && Boolean(errors.jobType)}
                    helperText={touched.jobType && errors.jobType}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Full Time">Full Time</MenuItem>
                    <MenuItem value="Part Time">Part Time</MenuItem>
                    <MenuItem value="Contract">Contract</MenuItem>
                    <MenuItem value="Internship">Internship</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Job Category"
                    name="jobCategory"
                    value={values.jobCategory}
                    onChange={handleChange}
                    error={touched.jobCategory && Boolean(errors.jobCategory)}
                    helperText={touched.jobCategory && errors.jobCategory}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Technical">Technical</MenuItem>
                    <MenuItem value="Non-Technical">Non-Technical</MenuItem>
                  </TextField>
                </Grid>
                  
                
                <Grid item xs={12} sm={6}>
  <Autocomplete
    multiple
    options={domainOptions}
    getOptionLabel={(option) => option.value}
    disableCloseOnSelect
    value={domainOptions.filter(option => values.domains.includes(option.key))}
    onChange={(event, newValue) => {
      const selectedKeys = newValue.map((option) => option.key);
      setFieldValue("domains", selectedKeys);
    }}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderOption={(props, option, { selected }) => (
      <li {...props}>
        <Checkbox
          icon={icon}
          checkedIcon={checkedIcon}
          style={{ marginRight: 8 }}
          checked={selected}
        />
        {option.value}
      </li>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Domains"
        placeholder="Select Domains"
        error={touched.domains && !!errors.domains}
        helperText={touched.domains && errors.domains}
      />
    )}
  />
</Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="Location"
                    value={values.Location}
                    onChange={handleChange}
                    error={touched.Location && Boolean(errors.Location)}
                    helperText={touched.Location && errors.Location}
                  />
                </Grid>



                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="Job Experience"
                    name="jobExperience"
                    value={values.jobExperience}
                    onChange={handleChange}
                    error={touched.jobExperience && Boolean(errors.jobExperience)}
                    helperText={touched.jobExperience && errors.jobExperience}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="0-1">0-1</MenuItem>
                    <MenuItem value="1-3">1-3</MenuItem>
                    <MenuItem value="3-5">3-5</MenuItem>
                    <MenuItem value="5+">5+</MenuItem>
                  </TextField>
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Required Skills"
                    name="requiredSkills"
                    value={values.requiredSkills}
                    onChange={handleChange}
                    error={touched.requiredSkills && Boolean(errors.requiredSkills)}
                    helperText={touched.requiredSkills && errors.requiredSkills}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Qualification"
                    name="jobQualification"
                    value={values.jobQualification}
                    onChange={handleChange}
                    error={touched.jobQualification && Boolean(errors.jobQualification)}
                    helperText={touched.jobQualification && errors.jobQualification}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>



                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Last Date"
                    name="lastDate"
                    min={today}
                    value={values.lastDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      min: values.postedOn, // This will disable dates before the `postedOn` date
                    }}                    error={touched.lastDate && Boolean(errors.lastDate)}
                    helperText={touched.lastDate && errors.lastDate}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Salary Range"
                    name="salary"
                    value={values.salary}
                    onChange={handleChange}
                    error={touched.salary && Boolean(errors.salary)}
                    helperText={touched.salary && errors.salary}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Application URL"
                    name="applicationUrl"
                    value={values.applicationUrl}
                    onChange={handleChange}
                    error={touched.applicationUrl && Boolean(errors.applicationUrl)}
                    helperText={touched.applicationUrl && errors.applicationUrl}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={4}
                    label="Job Description"
                    name="jobDescription"
                    value={values.jobDescription}
                    onChange={handleChange}
                    error={touched.jobDescription && Boolean(errors.jobDescription)}
                    helperText={touched.jobDescription && errors.jobDescription}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Posted On"
                    name="postedOn"
                    disabled
                    value={values.postedOn}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    error={touched.postedOn && Boolean(errors.postedOn)}
                    helperText={touched.postedOn && errors.postedOn}
                  />
                </Grid>


              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">Cancel</Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>Save</Button>
            </DialogActions>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  );
};

export default EditJobModal;


// import React from 'react';
// import { Modal, Form, Button, Row, Col } from '@/components/ui/modal';
// import { Formik, Field, ErrorMessage } from 'formik';
// import * as Yup from 'yup';

// const validationSchema = Yup.object().shape({
//   jobTitle: Yup.string()
//     .matches(/^[A-Za-z0-9 ]+$/, 'Job Title can only contain uppercase, lowercase letters, and numerics')
//     .required('Job Title is required'),
//   jobType: Yup.string().required('Job Type is required'),
//   jobCategory: Yup.string().required('Job Category is required'),
//   jobExperience: Yup.string().required('Job Experience is required'),
//   jobQualification: Yup.string()
//     .matches(/^[A-Za-z0-9@#\$%\^&\*\(\)_\+\-=\[\]\{\};':"\\|,.<>\/? ]+$/, 'Job Qualification can contain alphanumerics and special characters')
//     .required('Job Qualification is required'),
  // requiredSkills: Yup.string().required('Required Skills are required'),
//   jobCity: Yup.string()
//     .matches(/^[A-Za-z ]+$/, 'Job City can only contain alphabetic characters')
//     .required('Job City is required'),
//   lastDate: Yup.date()
//     .min(new Date().toISOString().split('T')[0], 'Last Date must be today or later')
//     .required('Last Date is required'),
//   jobDescription: Yup.string().required('Job Description is required'),
//   salary: Yup.string().required('Salary is required'),
//   applicationUrl: Yup.string().url('Invalid URL').required('Application URL is required'),
//   openings: Yup.number().typeError('Must be a number'),
//   bond: Yup.string().required('Bond is required')
// });

// const EditJobModal = ({ show, handleClose, job, handleSave }) => {
//   const today = new Date().toISOString().split('T')[0];

//   return (
//     <Modal 
//       show={show} 
//       onHide={handleClose}
//       className="max-w-4xl"
//     >
//       <div className="p-6">
//         <h2 className="text-2xl font-bold mb-4">Edit Job Post</h2>
        
//         <Formik
//           initialValues={{
//             jobTitle: job?.jobTitle || '',
//             jobType: job?.jobType || '',
//             jobCategory: job?.jobCategory || '',
//             jobExperience: job?.jobExperience || '',
//             jobQualification: job?.jobQualification || '',
            // requiredSkills: job?.requiredSkills || '',
//             jobCity: job?.Location || '',
//             lastDate: job?.lastDate ? job.lastDate.split('T')[0] : '',
//             jobDescription: job?.jobDescription || '',
//             salary: job?.salary || '',
//             applicationUrl: job?.applicationUrl || '',
//             openings: job?.openings || '',
//             bond: job?.bond || 'No',
//             isBondChecked: job?.bond !== 'No'
//           }}
//           validationSchema={validationSchema}
//           onSubmit={(values) => {
//             handleSave({ ...values, jobId: job.jobId });
//           }}
//         >
//           {({ values, errors, touched, handleSubmit, setFieldValue }) => (
//             <form onSubmit={handleSubmit}>
//               <div className="space-y-4">
//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Job Title *</label>
//                     <Field
//                       name="jobTitle"
//                       type="text"
//                       className={`w-full p-2 border rounded ${touched.jobTitle && errors.jobTitle ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="jobTitle" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Job Type *</label>
//                     <Field
//                       name="jobType"
//                       as="select"
//                       className={`w-full p-2 border rounded ${touched.jobType && errors.jobType ? 'border-red-500' : ''}`}
//                     >
//                       <option value="">Select</option>
//                       <option value="Full Time">Full Time</option>
//                       <option value="Part Time">Part Time</option>
//                       <option value="Internship">Internship</option>
//                       <option value="Contract">Contract</option>
//                     </Field>
//                     <ErrorMessage name="jobType" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                   <Col>
//                     <label className="text-gray-600">Job Category *</label>
//                     <Field
//                       name="jobCategory"
//                       as="select"
//                       className={`w-full p-2 border rounded ${touched.jobCategory && errors.jobCategory ? 'border-red-500' : ''}`}
//                     >
//                       <option value="">Select</option>
//                       <option value="Technical">Technical</option>
//                       <option value="Non-Technical">Non-Technical</option>
//                     </Field>
//                     <ErrorMessage name="jobCategory" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Job City *</label>
//                     <Field
//                       name="jobCity"
//                       type="text"
//                       className={`w-full p-2 border rounded ${touched.jobCity && errors.jobCity ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="jobCity" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                   <Col>
//                     <label className="text-gray-600">Job Experience *</label>
//                     <Field
//                       name="jobExperience"
//                       as="select"
//                       className={`w-full p-2 border rounded ${touched.jobExperience && errors.jobExperience ? 'border-red-500' : ''}`}
//                     >
//                       <option value="">Select</option>
//                       <option value="0-1">0-1</option>
//                       <option value="1-3">1-3</option>
//                       <option value="3-5">3-5</option>
//                       <option value="5+">5+</option>
//                     </Field>
//                     <ErrorMessage name="jobExperience" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

                // <Row className="mb-3">
                //   <Col>
                //     <label className="text-gray-600">Job Qualification *</label>
                //     <Field
                //       name="jobQualification"
                //       type="text"
                //       className={`w-full p-2 border rounded ${touched.jobQualification && errors.jobQualification ? 'border-red-500' : ''}`}
                //     />
                //     <ErrorMessage name="jobQualification" component="div" className="text-red-500 text-sm" />
                //   </Col>
                //   <Col>
                //     <label className="text-gray-600">Required Skills *</label>
                //     <Field
                //       name="requiredSkills"
                //       type="text"
                //       className={`w-full p-2 border rounded ${touched.requiredSkills && errors.requiredSkills ? 'border-red-500' : ''}`}
                //     />
                //     <ErrorMessage name="requiredSkills" component="div" className="text-red-500 text-sm" />
                //   </Col>
                // </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Last Date *</label>
//                     <Field
//                       name="lastDate"
//                       type="date"
//                       min={today}
//                       className={`w-full p-2 border rounded ${touched.lastDate && errors.lastDate ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="lastDate" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                   <Col>
//                     <label className="text-gray-600">Salary Range *</label>
//                     <Field
//                       name="salary"
//                       type="text"
//                       className={`w-full p-2 border rounded ${touched.salary && errors.salary ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="salary" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Application URL *</label>
//                     <Field
//                       name="applicationUrl"
//                       type="url"
//                       className={`w-full p-2 border rounded ${touched.applicationUrl && errors.applicationUrl ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="applicationUrl" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                   <Col>
//                     <label className="text-gray-600">Number of Openings</label>
//                     <Field
//                       name="openings"
//                       type="number"
//                       className={`w-full p-2 border rounded ${touched.openings && errors.openings ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="openings" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <label className="text-gray-600">Job Description *</label>
//                     <Field
//                       name="jobDescription"
//                       as="textarea"
//                       className={`w-full p-2 border rounded ${touched.jobDescription && errors.jobDescription ? 'border-red-500' : ''}`}
//                     />
//                     <ErrorMessage name="jobDescription" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <Row className="mb-3">
//                   <Col>
//                     <div className="flex items-center mt-4">
//                       <label className="text-gray-600 mr-2">Bond</label>
//                       <Field
//                         name="isBondChecked"
//                         type="checkbox"
//                         checked={values.isBondChecked}
//                         onChange={(e) => {
//                           const checked = e.target.checked;
//                           setFieldValue('isBondChecked', checked);
//                           setFieldValue('bond', checked ? '' : 'No');
//                         }}
//                       />
//                     </div>
//                     {values.isBondChecked && (
//                       <Field
//                         name="bond"
//                         as="select"
//                         className="w-3/4 p-2 border rounded mt-2"
//                       >
//                         <option value="">Select Bond Years</option>
//                         <option value="1 year">1 Year</option>
//                         <option value="2 years">2 Years</option>
//                         <option value="3 years">3 Years</option>
//                       </Field>
//                     )}
//                     <ErrorMessage name="bond" component="div" className="text-red-500 text-sm" />
//                   </Col>
//                 </Row>

//                 <div className="flex justify-end space-x-2 mt-4">
//                   <Button variant="secondary" onClick={handleClose}>
//                     Cancel
//                   </Button>
//                   <Button type="submit" variant="primary">
//                     Save Changes
//                   </Button>
//                 </div>
//               </div>
//             </form>
//           )}
//         </Formik>
//       </div>
//     </Modal>
//   );
// };

// export default EditJobModal;
