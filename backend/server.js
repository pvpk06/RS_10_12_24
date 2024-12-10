// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const env = require('dotenv');
// const multer = require('multer');
// const util = require('util');
// const session = require('express-session');
// const nodemailer = require('nodemailer');
// const pool = require('./db');
// const db2 = require('./db2');

// const { check, validationResult } = require('express-validator');
// const app = express();
// const crypto = require('crypto');
// const secret = crypto.randomBytes(64).toString('hex');
// const https = require('https');
// const path = require('path');
// const fs = require('fs');
// const WebSocket = require('ws');

// env.config();

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/backend.ramanasoft.com/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/backend.ramanasoft.com/fullchain.pem')
// };



// const PORT = process.env.PORT || 5000;



// const uploadsDir = path.join(__dirname, 'uploads');
// const profilesDir = path.join(uploadsDir, 'profiles');

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }

// if (!fs.existsSync(profilesDir)) {
//   fs.mkdirSync(profilesDir);
// }

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadsDir);
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   }
// });

// // Profile image storage configuration
// const profileStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, profilesDir);
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
//   }
// });

// const uploadProfile = multer({
//   storage: profileStorage,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png/;
//     const mimetype = filetypes.test(file.mimetype);
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
//   }
// });

// const upload = multer({ storage: storage });
// const uploadResume = multer({ storage: multer.memoryStorage() });

// app.use('/uploads', express.static('uploads'));
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());

// // Promisified query
// const query = util.promisify(pool.query).bind(pool);

// app.get('/', (req, res) => {
//   res.send('Hello from Express!');
// });

// https.createServer(options, app).listen(PORT, () => {
//   console.log(`Server running on https://backend.ramanasoft.com:${PORT}`);
// });

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');
const multer = require('multer');
const util = require('util');
const session = require('express-session');

const nodemailer = require('nodemailer');
const pool = require('./db');
const { check, validationResult } = require('express-validator');
const app = express();
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
const https = require('https');

env.config();
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const PORT = process.env.PORT || 5001;

const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

// Create directories if they don't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Profile image storage configuration
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profilesDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});




const upload = multer({ storage: storage });

const uploadResume = multer({ storage: multer.memoryStorage() });

const uploadProfile = multer({
  storage: profileStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});


app.use('/uploads', express.static('uploads'));

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

var server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


var io = require('socket.io')(server, { cors: { origin: '*' } });

const query = util.promisify(pool.query).bind(pool);


const sendEmail = async (email, mailOptions) => {
  const transport = nodemailer.createTransport({
    host: "smtp.zeptomail.in",
    port: 587,
    auth: {
      user: "emailapikey",
      pass: "PHtE6r1eROHrjG968hhW7fbuF8LwZoMqru1nfgRG4YxKAqAFSU1QotAjxGfj/hl+VaQWE/aby91ouOmbu+PXJWq+MTlPCGqyqK3sx/VYSPOZsbq6x00cuFgZckHYUYbnc9Bq3CDVud3YNA=="
    }
  });

  const options = {
    to: email,
    from: '"Ramanasoft Team" <noreply@ramanasoft.in>',
    ...mailOptions
  };

  try {
    await transport.sendMail(options);
    console.log("Email sent successfully");
    return { status: 200, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { status: 500, message: 'Error sending email' };
  }
};


app.post('/api/sendEmail', async (req, res) => {
  const { email, mailOptions } = req.body;
  console.log(req.body)
  if (!email || !mailOptions || !mailOptions.subject) {
    return res.status(400).json({ status: 400, message: 'Email and mail options are required, including subject and text' });
  }
  
  const result = await sendEmail(email, mailOptions);

  if (result.status === 200) {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
});


// const sendEmail = async (email, templatekey, mailOptions) => {

//   const transport = nodemailer.createTransport({
//     host: "smtp.zeptomail.in",
//     port: 587,
//     auth: {
//       user: "emailapikey",
// pass: "PHtE6r1eROHrjG968hhW7fbuF8LwZoMqru1nfgRG4YxKAqAFSU1QotAjxGfj/hl+VaQWE/aby91ouOmbu+PXJWq+MTlPCGqyqK3sx/VYSPOZsbq6x00cuFgZckHYUYbnc9Bq3CDVud3YNA=="
//     }
//   });

//   const options = {
//     to: email,
//     from: '"Team RamanaSoft" < noreply@ramanasoft.in>',
//     ...mailOptions
//   };
//   console.log("email", options)

//   try {
//     await transport.sendMail(options);
//     console.log("Email sent successfully");
//     return { status: 200, message: 'Email sent successfully' };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return { status: 500, message: 'Error sending email' };
//   }
// };

//HR api to get jobs in a company posted by same HR



// const sendEmail = async (email, templatekey, variables) => {
//   const transport = nodemailer.createTransport({
//     host: "smtp.zeptomail.in",
//     port: 587,
//     auth: {
//       user: "emailapikey",
//       pass: "PHtE6r1eROHrjG968hhW7fbuF8LwZoMqru1nfgRG4YxKAqAFSU1QotAjxGfj/hl+VaQWE/aby91ouOmbu+PXJWq+MTlPCGqyqK3sx/VYSPOZsbq6x00cuFgZckHYUYbnc9Bq3CDVud3YNA=="
//     }
//   });

//   const options = {
//     to: email,
//     from: '"Team RamanaSoft" <noreply@ramanasoft.in>',
//     subject: 'Registration Success',
//     zeptoTemplateKey: templatekey, // Template key for ZeptoMail
//     zeptoTemplateData: variables // Dynamic data for the template
//   };

//   try {
//     await transport.sendMail(options);
//     console.log("Email sent successfully");
//     return { status: 200, message: 'Email sent successfully' };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return { status: 500, message: 'Error sending email' };
//   }
// };

app.get('/api/hr-job-applications', async (req, res) => {
  const { companyName, hrId } = req.query;
  let sql;
  if (companyName == '' || companyName === undefined) {
    sql = `SELECT applied_students.*,
    J.JobId,
    J.postedBy
 FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId WHERE J.postedBy = '${hrId}'`;
  } else {
    sql = `SELECT applied_students.*,
    J.JobId,
    J.postedBy FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId where applied_students.companyName='${companyName}' and J.postedBy='${hrId}'`;
  }
  try {
    const rows = await query(sql);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));

    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.put("/api/applications/:id/status", async (req, res) => {
  const { status } = req.body
  const { id } = req.params
  console.log(status, id)
  try {
    const result = await query('UPDATE applied_students SET status=? WHERE applicationID=?', [status, id])
    res.status(200).json({ message: "Status Changed Successfully" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server Error" })
  }
})

//Intern job apply api
app.post('/api/apply-job', uploadResume.single('resume'), async (req, res) => {
  console.log(req.body);
  const { fullName, jobId, candidateId, jobRole, email, companyName, technology, mobileNumber, gender, yearOfPassedOut, experience, degree, branch } = req.body;
  const resume = req.file ? req.file.buffer : null;
  const status = "applied";
  try {
    const existingApplication = await query(
      'SELECT * FROM applied_students WHERE jobID = ? AND candidateID = ?',
      [jobId, candidateId]
    );
    if (existingApplication.length > 0) {
      return res.status(409).json({ message: 'Application already submitted' });
    }
    await query(
      'INSERT INTO applied_students (jobID, fullName, candidateID, jobRole, email, companyName, technology, mobileNo, gender, passedOut, experience, status, resume, degree, branch, applied_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?, NOW())',
      [jobId, fullName, candidateId, jobRole, email, companyName, technology, mobileNumber, gender, yearOfPassedOut, experience, status, resume, degree, branch]
    );
    console.log("Applied successfully");
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//Intern job apply api
app.post('/api/guest-apply-job', uploadResume.single('resume'), async (req, res) => {
  console.log(req.body);
  const { fullName, jobId, guestID, jobRole, email, companyName, technology, mobileNumber, gender, yearOfPassedOut, experience } = req.body;
  const resume = req.file ? req.file.buffer : null;
  const status = "applied";
  try {
    const existingApplication = await query(
      'SELECT * FROM applied_students WHERE jobID = ? AND candidateID = ?',
      [jobId, guestID]
    );
    if (existingApplication.length > 0) {
      return res.status(409).json({ message: 'Application already submitted' });
    }
    await query(
      'INSERT INTO applied_students (jobID, fullName, candidateID, jobRole, email, companyName, technology, mobileNo, gender, passedOut, experience, status, resume, applied_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [jobId, fullName, guestID, jobRole, email, companyName, technology, mobileNumber, gender, yearOfPassedOut, experience, status, resume]
    );
    console.log("Applied successfully");
    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



//Resume download
app.get('/api/download-resume/:id', async (req, res) => {
  const { id } = req.params;
  console.log(req.params)
  console.log(id)
  try {
    const rows = await query('SELECT resume FROM applied_students WHERE applicationID = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const resume = rows[0].resume;
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(resume);
  } catch (err) {
    console.error('Error fetching resume:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});



//statistics for super admin
app.get('/api/statistics/:status', async (req, res) => {
  const { status } = req.params
  console.log(status);
  try {
    let result;
    if (status === 'applied') {
      [result] = await query('SELECT COUNT(*) as count FROM applied_students;')

    }
    else {
      [result] = await query(`SELECT COUNT(*) as count FROM applied_students WHERE status='${status}'`)
    }

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})


/*
//Job descriptions and job applications for superadmin 
app.get('/applications/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const sql = `SELECT * FROM applied_students where jobId='${jobId}'`;
  try {
    const rows = await query(sql);
    const response = rows.map(row => ({
      ...row,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});*/


app.get('/api/applications/:jobId', async (req, res) => {

  const { jobId } = req.params;
  const sql = `SELECT * FROM applied_students where jobId='${jobId}'`;
  try {
    const rows = await query(sql);

    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));

    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//intern registration
app.post('/api/register/intern', async (req, res) => {
  const { fullName, email, mobileno, altmobileno, address, batchno, modeOfInternship, belongedToVasaviFoundation, domain } = req.body;

  const emailGot = req.body.email;
  try {
    const data1 = await query('SELECT email FROM intern_data WHERE email = ?', [email]);
    if (data1.length > 0) {
      return res.status(400).json({
        message: 'Email already exists',
        suggestion: 'Please use a different email address or contact admin if you believe this is an error.'
      });
    }

    const data2 = await query('SELECT email FROM intern_requests WHERE email = ?', [email]);
    if (data2.length > 0) {
      return res.status(401).json({
        message: 'Already registered, Wait for approval',
      });
    } else {
      const sql = 'INSERT INTO intern_requests (fullName, email, mobileNo, altMobileNo, address, batchno, modeOfInternship, belongedToVasaviFoundation, domain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

      try {
        await query(sql, [fullName, email, mobileno, altmobileno, address, batchno, modeOfInternship, belongedToVasaviFoundation, domain]);

        const mailOptions = {
          name: fullName,
          email: email,
          contact: mobileno,
          domain: domain,
          batch: batchno
        };

        sendEmail(emailGot, '2518b.2c65108963bcb941.k1.822f17a1-947a-11ef-bcda-52540038fbba.192cea77e19', mailOptions).then(response => {
          console.log(response.message);
        });
        console.log("Registered successfully");
        return res.status(200).json({ message: 'Candidate registered successfully' });
      } catch (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ message: 'Failed to register candidate' });
      }
    }
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


// HR registration
app.post('/api/register/hr', async (req, res) => {
  const {
    fullName, email, contactNo, dob, address,
    workEmail, workMobile, emergencyContactName,
    emergencyContactAddress, emergencyContactMobile,
    gender, branch
  } = req.body;

  console.log(req.body);

  function formatDateForDB(dateStr) {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(year, month - 1, day); // month is 0-based
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD" format
  }

  if (!fullName || !email || !contactNo || !dob || !address || !workEmail || !workMobile || !emergencyContactName || !emergencyContactAddress || !emergencyContactMobile || !gender || !branch) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Convert the date of birth to the required format
  const dobFormatted = formatDateForDB(dob);

  try {
    // Check if email already exists in hr_data or hr_requests tables
    const existingHrData = await query('SELECT email FROM hr_data WHERE email = ?', [email]);
    if (existingHrData.length > 0) {
      return res.status(400).json({
        message: 'Email already exists in HR data',
        suggestion: 'Please use a different email address or contact admin if you believe this is an error.'
      });
    }

    const existingHrRequests = await query('SELECT email FROM hr_requests WHERE email = ?', [email]);
    if (existingHrRequests.length > 0) {
      return res.status(401).json({
        message: 'Already registered, wait for approval',
      });
    }

    // Insert new HR request
    const sql = `INSERT INTO hr_requests (
      fullName, email, contactNo, dob, address, workEmail, workMobile,
      emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await query(sql, [
      fullName, email, contactNo, dobFormatted, address, workEmail, workMobile,
      emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch
    ]);

    res.status(200).json({ message: 'HR registration successful' });

  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Guest registration
app.post('/api/register/guest', async (req, res) => {
  const {
    fullName,
    email,
    mobileno,
    altmobileno,
    address,
    modeOfTraining,
    program,
    domain,
    batchno,
    megadriveStatus,
    BelongedToVasaviFoundation // New field added
  } = req.body;

  try {
    // Check if the email already exists in the guest_data table
    const data1 = await query('SELECT email FROM guest_data WHERE email = ?', [email]);
    if (data1.length > 0) {
      return res.status(400).json({
        message: 'Email already exists',
        suggestion: 'Please use a different email address or contact admin if you believe this is an error.'
      });
    }

    // Check if the email is already in the guest_requests table
    const data2 = await query('SELECT email FROM guest_requests WHERE email = ?', [email]);
    if (data2.length > 0) {
      return res.status(401).json({
        message: 'Already registered, wait for approval',
      });
    } else {
      // Insert the new request into the guest_requests table
      const sql = 'INSERT INTO guest_requests (fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

      try {
        await query(sql, [fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation]);

        // Prepare email options
        const mailOptions = {
          subject: 'Registration Success',
          html: `<p style="font-family: Arial, sans-serif; color: #333333;">
                    Successfully registered at <strong>RamanaSoft IT Services</strong>.</p> <br> 
                    <p>Below are the details we got from you:</p> <br> 
                    <strong>Full Name:</strong> ${fullName} <br> 
                    <strong>Email:</strong> ${email} <br> 
                    <strong>Mobile:</strong> ${mobileno} <br> 
                    <strong>Domain:</strong> ${domain} <br> 
                    <strong>Batch:</strong> ${batchno} <br> 
                    <strong>Program:</strong> ${program} <br>
                    <strong>Mode of Training:</strong> ${modeOfTraining} <br>
                    <strong>Megadrive Status:</strong> ${megadriveStatus} <br>                 
                    <strong>Belonged to Vasavi Foundation:</strong> ${BelongedToVasaviFoundation} <br>
                    Registration request sent to Admin. <br> 
                    Waiting for approval. An email will be sent to the registered email once approved.`,
        };

        // Send registration success email
        await sendEmail(email, mailOptions);

        console.log("Registered successfully");
        return res.status(200).json({ message: 'Candidate registered successfully' });
      } catch (err) {
        console.error('Error executing query:', err);
        console.log("Failed to register candidate");
        return res.status(500).json({ message: 'Failed to register candidate' });
      }
    }
  } catch (err) {
    console.error('Error during registration:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});




app.post('/api/update-profile/:id', async (req, res) => {
  const internID = req.params.id;


})

// //Superadmin api to add hr
// app.post('/api/add/hr', async (req, res) => {
//   const {
//     fullName, email, contactNo, dob, address,
//     workEmail, workMobile, emergencyContactName,
//     emergencyContactAddress, emergencyContactMobile,
//     gender, branch, password
//   } = req.body;
//   console.log(req.body);
//   if (!fullName || !email || !contactNo || !dob || !address || !workEmail || !workMobile || !emergencyContactName || !emergencyContactAddress || !emergencyContactMobile || !gender || !branch || !password) {
//     return res.status(400).json({ error: 'All fields are required' });
//   }

//   const lastHRQuery = 'SELECT HRid FROM hr_data ORDER BY HRid DESC LIMIT 1';
//   const lastHRResult = await query(lastHRQuery);

//   if (lastHRResult === undefined) {
//     console.error('Error fetching last HR:', lastHRResult);
//     return res.status(500).json({ error: 'Failed to fetch last HR' });
//   }

//   const lastHR = lastHRResult.length > 0 ? lastHRResult[0] : null;
//   let lastHRIdNumber = lastHR ? parseInt(lastHR.HRid.split('-')[1]) : 0;
//   lastHRIdNumber++;
//   const newHRId = `RSHR-${String(lastHRIdNumber).padStart(2, '0')}`;

//   const sql = `INSERT INTO hr_data (
//     HRid, fullName, email, mobileNo, dob, address, workEmail, workMobile,
//     emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch, password
//   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//   try {
//     await query(sql, [
//       newHRId, fullName, email, contactNo, dob, address, workEmail, workMobile,
//       emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch, password
//     ]);

//     res.status(200).json({ message: 'HR registration successful' });
//   } catch (err) {
//     console.log(err);
//     console.error('Error inserting data:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post('/api/add/hr', async (req, res) => {
  const {
    fullName, email, contactNo, dob, address,
    workEmail, workMobile, emergencyContactName,
    emergencyContactAddress, emergencyContactMobile,
    gender, branch, password
  } = req.body;

  if (!fullName || !email || !contactNo || !dob || !address || !workEmail || !workMobile || !emergencyContactName || !emergencyContactAddress || !emergencyContactMobile || !gender || !branch || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if the HR already exists based on email, workEmail, or contactNo
  const existingHRQuery = `
    SELECT * FROM hr_data 
    WHERE email = ? OR workEmail = ? OR mobileNo = ? OR workMobile = ?`;

  try {
    const existingHR = await query(existingHRQuery, [email, workEmail, contactNo, workMobile]);

    if (existingHR.length > 0) {
      const duplicateField =
        existingHR[0].email === email ? 'email' :
          existingHR[0].workEmail === workEmail ? 'workEmail' :
            existingHR[0].mobileNo === contactNo ? 'contactNo' :
              'workMobile';

      return res.status(409).json({ error: `Duplicate entry found for ${duplicateField}`, field: duplicateField });
    }

    // Fetch the last HR ID and increment it
    const lastHRQuery = 'SELECT HRid FROM hr_data ORDER BY HRid DESC LIMIT 1';
    const lastHRResult = await query(lastHRQuery);

    if (lastHRResult === undefined) {
      return res.status(500).json({ error: 'Failed to fetch last HR' });
    }

    const lastHR = lastHRResult.length > 0 ? lastHRResult[0] : null;
    let lastHRIdNumber = lastHR ? parseInt(lastHR.HRid.split('-')[1]) : 0;
    lastHRIdNumber++;
    const newHRId = `RSHR-${String(lastHRIdNumber).padStart(2, '0')}`;
    const access = ["home", "profile"];
        
    // Ensure the access array is stored as a JSON string
    const accessJson = JSON.stringify(access);
    
    // Insert new HR data
    const sql = `INSERT INTO hr_data (
      HRid, fullName, email, mobileNo, dob, address, workEmail, workMobile,
      emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch, password, access
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    await query(sql, [
      newHRId, fullName, email, contactNo, dob, address, workEmail, workMobile,
      emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch, password, accessJson
    ]);

    res.status(200).json({ message: 'HR registration successful' });
  } catch (err) {
    console.error('Error handling request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



//SA api for hr requests
app.get("/api/hr-requests", async (req, res) => {
  try {
    const hr = await query('SELECT * FROM hr_requests');
    res.status(200).json(hr);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//HR panel statistics API
app.get('/api/hr-statistics/', async (req, res) => {
  const { status, hrId } = req.query
  console.log("Status", status, hrId)
  try {
    let result;
    if (status === 'applied') {
      [result] = await query(`SELECT COUNT(*) as count FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId WHERE J.postedBy = '${hrId}'`)

    }
    else {
      [result] = await query(`SELECT COUNT(*) as count
FROM applied_students
JOIN jobs AS J ON applied_students.JobID = J.JobId
WHERE J.postedBy = '${hrId}' AND applied_students.status = '${status}'`)
    }
    //console.log(result.count)
    console.log("Hr", status, result)
    res.status(200).json(result); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

//HR panel statistics api for HR leads
app.get('/api/hr-job-statistics/', async (req, res) => {
  const { status, hrId } = req.query
  console.log("API called")
  try {
    let result;
    if (status === 'hr-leads') {
      [result] = await query('SELECT COUNT(*) as count FROM companies;')
    }
    else if (status === 'all-jobs') {
      [result] = await query(`SELECT COUNT(*) as count FROM jobs where postedby='${hrId}';`)
    }
    else {
      [result] = await query(`SELECT COUNT(*) as count FROM jobs WHERE status='${status}' AND postedby='${hrId}'`)
    }
    console.log("Status:", status, result.count)

    res.status(200).json(result); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

//Super admin  api to accept hr request
app.post("/api/accept-hrs", async (req, res) => {
  const hrs = req.body;
  console.log('Received HRs:', hrs);
  if (!Array.isArray(hrs)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  const acceptedHRs = [];
  const rejectedHRs = [];
  try {
    const existingHRsQuery = 'SELECT email, mobileNo FROM hr_data WHERE email IN (?) OR mobileNo IN (?)';
    const existingHRsResult = await query(existingHRsQuery, [
      hrs.map(hr => hr.email),
      hrs.map(hr => hr.mobileNo)
    ]);
    if (existingHRsResult === undefined) {
      console.error('Error fetching existing HRs:', existingHRsResult);
      return res.status(500).json({ error: 'Failed to fetch existing HRs' });
    }
    const existingHRs = existingHRsResult || [];
    const existingEmails = new Set(existingHRs.map(hr => hr.email));
    const existingPhones = new Set(existingHRs.map(hr => hr.mobileNo));

    const lastHRQuery = 'SELECT HRid FROM hr_data ORDER BY HRid DESC LIMIT 1';
    const lastHRResult = await query(lastHRQuery);

    if (lastHRResult === undefined) {
      console.error('Error fetching last HR:', lastHRResult);
      return res.status(500).json({ error: 'Failed to fetch last HR' });
    }

    const lastHR = lastHRResult.length > 0 ? lastHRResult[0] : null;
    let lastHRIdNumber = lastHR ? parseInt(lastHR.HRid.split('-')[1]) : 0;

    for (const hr of hrs) {
      if (existingEmails.has(hr.email) || existingPhones.has(hr.mobileNo)) {
        rejectedHRs.push(hr);
      } else {
        lastHRIdNumber++;
        const newHRId = `RSHR-${String(lastHRIdNumber).padStart(2, '0')}`;
        const password = "password123";
        const access = ["home", "profile"];
        
        // Ensure the access array is stored as a JSON string
        const accessJson = JSON.stringify(access);
        console.log(accessJson);
        await query('INSERT INTO hr_data (HRid, fullName, email, mobileNo, dob, address, workEmail, workMobile, emergencyContactName, emergencyContactAddress, emergencyContactMobile, gender, branch, password, access) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          newHRId,
          hr.fullName,
          hr.email,
          hr.contactNo,
          hr.dob,
          hr.address,
          hr.workEmail,
          hr.workMobile,
          hr.emergencyContactName,
          hr.emergencyContactAddress,
          hr.emergencyContactMobile,
          hr.gender,
          hr.branch,
          password,
          accessJson  // Insert the JSON string version of the access array
        ]);
        
        acceptedHRs.push({ ...hr, HRid: newHRId });
              }
    }
    const processedHRs = [...acceptedHRs];
    if (processedHRs.length > 0) {
      await query('DELETE FROM hr_requests WHERE email IN (?)', [
        processedHRs.map(hr => hr.email),
      ]);
    }

    // Send emails to all registered interns
    try {
      const emailPromises = acceptedHRs.map(hr => {
        const mailOptions = {
          subject: 'Welcome to RamanaSoft',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #0a1b3d; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Welcome To RamanaSoft Consultancy Services</h1>
              </div>
              <div style="padding: 20px;">
                <p>Here are your account details,</p>
                <p><strong>Your HRID :</strong> ${hr.HRid}</p>
                <p><strong>Name:</strong> ${hr.fullName}</p>
                <p><strong>Email:</strong> ${hr.email}</p>
                <p><strong>Mobile:</strong> ${hr.contactNo}</p>
                <p><strong>Work Email:</strong> ${hr.workEmail}</p>
                <p><strong>Work Mobile:</strong> ${hr.workMobile}</p> 

                <p> Proceed Login Here, "https://ramanasoft.com/login/hr" </p>
                <p>Below are your credentials, </p>
                <p>Your login email is work email </p>
                <p>Your current password is "password123" </p>
                <p>Consider Updating your password after logging in.</p>
                <p>Best Regards,<br>Team RamanaSoft.</p>
              </div>
              <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px;">
                <p>&copy; 2024 RamanaSoft. All rights reserved.</p>
                <p>Contact us at <a href="mailto:support@ramanasoft.com" style="color: #0a1b3d;">support@ramanasoft.com</a></p>
              </div>
            </div>
          `
        };
        return sendEmail(hr.email, mailOptions);
      });

      await Promise.all(emailPromises);


    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      res.status(207).json({
        emailError
      });
    }

    res.status(200).json({ accepted: acceptedHRs, rejected: rejectedHRs });
  } catch (error) {
    console.error('Error processing HRs:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


//HR login api
app.post("/api/reject-hrs", async (req, res) => {
  const hrs = req.body;
  console.log('Received candidates:', hrs);
  const requestIDs = hrs.map(hr => hr.requestID).filter(id => id != null);
  if (requestIDs.length === 0) {
    return res.status(400).json({ message: 'No valid hrs provided' });
  }

  const placeholders = requestIDs.map(() => '?').join(',');
  const sqlQuery = `DELETE FROM hr_requests WHERE requestID IN (${placeholders})`;

  try {
    const result = await query(sqlQuery, requestIDs);
    console.log("rejected successfully !")
    if (result.affectedRows === requestIDs.length) {
      res.status(200).json({ message: 'All hrs rejected successfully' });
    } else if (result.affectedRows > 0) {
      res.status(200).json({ message: `Rejected ${result.affectedRows} out of ${requestIDs.length} hrs` });
    } else {
      res.status(500).json({ message: 'No documents matched the query' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// app.post('/api/hr-login', [
//   check('email', 'Email is required').isEmail(),
//   check('password', 'Password is required').not().isEmpty()
// ], async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     // Check if the email exists
//     const emailExists = await query('SELECT * FROM hr_data WHERE email = ?', [email]);
//     if (emailExists.length < 1) {
//       return res.status(404).json({ message: 'User Not Found' });
//     }

//     // Check if the email and password match
//     const row = await query('SELECT * FROM hr_data WHERE email = ? AND password = ?', [email, password]);
//     if (row.length > 0) {
//       const user = row[0];

//       // Store HR details in the session
//       req.session.user = {
//         id: user.HRid,
//         role: 'HR',
//         verified: true
//       };

//       return res.status(200).json({
//         message: 'Logged in successfully',
//         user: {
//           id: user.HRid,
//           role: 'HR',
//           name: user.fullName
//         }
//       });
//     } else {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//   } catch (err) {
//     console.error('Server error:', err);
//     return res.status(500).json({ message: 'Server error' });
//   }
// });


// app.post('/api/hr-login', [
//   check('email', 'Email is required').isEmail(),
//   check('password', 'Password is required').not().isEmpty()
// ], async (req, res) => {
//   const { email, password } = req.body;
//   console.log(email, password);

//   // Validate input
//   const errors = validationResult(req);
//   console.log("Errors", errors);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     // Check if the email exists
//     const emailExists = await query('SELECT * FROM hr_data WHERE workEmail = ?', [email]);
//     if (emailExists.length < 1) {
//       return res.status(404).json({ message: 'User Not Found' }); // 404 for not found
//     }

//     // Check if the email and password match
//     const row = await query('SELECT * FROM hr_data WHERE workEmail = ? AND password = ?', [email, password]);
//     if (row.length > 0) {
//       const user = row[0];
//       console.log(user.fullName, "Logged in successfully");
//       return res.status(200).json({ message: 'Logged in successfully', HRid: user.HRid, name: user.fullName }); // 200 for success
//     } else {
//       return res.status(401).json({ message: 'Invalid credentials' }); // 401 for unauthorized
//     }
//   } catch (err) {
//     console.error('Server error:', err);
//     return res.status(500).json({ message: 'Server error' }); // 500 for server error
//   }
// });


app.post('/api/hr-login', [
  check('email', 'Email is required').isEmail(),
  check('password', 'Password is required').not().isEmpty()
], async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  // Validate input
  const errors = validationResult(req);
  console.log("Errors", errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the email exists
    const emailExists = await query('SELECT * FROM hr_data WHERE workEmail = ?', [email]);
    if (emailExists.length < 1) {
      return res.status(404).json({ message: 'User Not Found' }); // 404 for not found
    }

    const user = emailExists[0];

    // Check if the profile is blocked
    if (user.blockProfile) { // Assuming `blockProfile` is stored as a boolean in the database
      return res.status(405).json({ message: 'Your profile is blocked! Contact Admin.' }); // 405 for profile blocked
    }

    // Check if the email and password match
    const row = await query('SELECT * FROM hr_data WHERE workEmail = ? AND password = ?', [email, password]);
    if (row.length > 0) {
      console.log(user.fullName, "Logged in successfully");
      return res.status(200).json({ message: 'Logged in successfully', HRid: user.HRid, name: user.fullName }); // 200 for success
    } else {
      return res.status(401).json({ message: 'Invalid credentials' }); // 401 for unauthorized
    }
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ message: 'Server error' }); // 500 for server error
  }
});


//Super admin api to delete hr
app.delete('/api/delete_hr/:id', async (req, res) => {
  const hrId = req.params.id;
  console.log(hrId);
  try {
    const result = await query('DELETE FROM hr_data WHERE HRid = ?', [hrId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'HR record not found' });
    }

    res.status(200).json({ message: 'HR record deleted successfully' });
  } catch (error) {
    console.error('Error deleting HR record:', error);
    res.status(500).json({ error: 'Failed to delete HR record' });
  }
});

// SuperAdmin Login
app.post('/api/SAlogin', [
  check('username', 'Username is required').not().isEmpty(),
  check('password', 'Password is required').not().isEmpty()
], async (req, res) => {
  const { username, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const rows = await query('SELECT * FROM superadmin WHERE username = ? AND password = ?', [username, password]);
    if (rows.length > 0) {
      const user = rows[0];
      console.log(user.name, "Logged in successfully");
      res.status(200).json({ message: 'Logged in successfully', name: user.name, SAid: user.SAid });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});




// app.post("/api/post-job", async (req, res) => {
//   const { job, hrId, companyId } = req.body;
//   console.log(req.body);
//   try {
//     const lastDate = new Date(job.lastDate).toISOString().slice(0, 10); // This will format the date as YYYY-MM-DD

//     const rows = await query(`
//   SELECT * FROM jobs WHERE companyName = ? AND Location = ? AND jobCategory = ? AND jobExperience = ? AND jobQualification = ? AND email = ? AND phone = ? AND lastDate = ? AND jobDescription = ? AND salary = ? AND applicationUrl = ? AND requiredSkills = ? AND jobType = ? AND jobTitle = ? AND postedBy = ?`,
//       [
//         job.companyName, job.jobCity, job.jobCategory,
//         job.jobExperience, job.jobQualification, job.email, job.phone, lastDate,
//         job.jobDescription, job.salary, job.applicationUrl,
//         job.requiredSkills, job.jobType, job.jobTitle, hrId
//       ]);

//     if (rows.length > 0) {
//       return res.status(400).json({ message: 'Duplicate job entry detected, job not posted.' });
//     }

//     await query(`
//   INSERT INTO jobs (companyName, Location, jobCategory, jobExperience, jobQualification, email, phone, postedOn, lastDate, jobDescription, salary, applicationUrl, requiredSkills, jobType, jobTitle, postedBy,status,companyID, openings, bond)
//   VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?,'jd-received',?, ?, ?)`,
//       [
//         job.companyName, job.jobCity, job.jobCategory,
//         job.jobExperience, job.jobQualification, job.email, job.phone, lastDate,
//         job.jobDescription, job.salary, job.applicationUrl,
//         job.requiredSkills, job.jobType, job.jobTitle, hrId, companyId, job.openings, job.bond
//       ]);

//     res.status(201).json({ message: 'Job posted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

//Updating existing posted job data for SA and HR


app.post("/api/post-job", async (req, res) => {
  const { job, hrId, companyId } = req.body;
  console.log(req.body);
  try {
    const lastDate = new Date(job.lastDate).toISOString().slice(0, 10); // Format the date as YYYY-MM-DD

    // Duplicate check including domains as JSON
    const rows = await query(`
      SELECT * FROM jobs WHERE companyName = ? AND Location = ? AND jobCategory = ? AND jobExperience = ? 
      AND jobQualification = ? AND email = ? AND phone = ? AND lastDate = ? AND jobDescription = ? 
      AND salary = ? AND applicationUrl = ? AND requiredSkills = ? AND jobType = ? AND jobTitle = ? 
      AND postedBy = ? AND domains = ?`,
      [
        job.companyName, job.jobCity, job.jobCategory, job.jobExperience, job.jobQualification,
        job.email, job.phone, lastDate, job.jobDescription, job.salary, job.applicationUrl,
        job.requiredSkills, job.jobType, job.jobTitle, hrId, JSON.stringify(job.selectedDomains)
      ]);

    if (rows.length > 0) {
      return res.status(400).json({ message: 'Duplicate job entry detected, job not posted.' });
    }

    // Insert job with domains as JSON
    await query(`
      INSERT INTO jobs (companyName, Location, jobCategory, jobExperience, jobQualification, email, phone, 
      postedOn, lastDate, jobDescription, salary, applicationUrl, requiredSkills, jobType, jobTitle, 
      postedBy, status, companyID, openings, bond, domains)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, 'jd-received', ?, ?, ?, ?)`,
      [
        job.companyName, job.jobCity, job.jobCategory, job.jobExperience, job.jobQualification,
        job.email, job.phone, lastDate, job.jobDescription, job.salary, job.applicationUrl,
        job.requiredSkills, job.jobType, job.jobTitle, hrId, companyId, job.openings, job.bond,
        JSON.stringify(job.selectedDomains)
      ]);

    res.status(201).json({ message: 'Job posted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});






//intern requests for both SA and HR
app.get("/api/intern-requests", async (req, res) => {
  console.log("api hit occoured")
  try {
    const intern = await query('SELECT * FROM intern_requests');
    // io.emit('internRequestsUpdate', intern);
    console.log(intern);
    res.status(200).json(intern);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

//intern requests for both SA and HR
app.get("/api/guest-requests", async (req, res) => {
  try {
    const guest = await query('SELECT * FROM guest_requests');
    // io.emit('internRequestsUpdate', guest);
    res.status(200).json(guest);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// //View companies for both HR and SA
// app.get("/api/view-companies", async (req, res) => {
//   try {
//     const jobs = await query('SELECT * FROM companies');
//     console.log("Jobs", jobs)
//     res.status(200).json(jobs);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// View companies for both HR and SA
app.get("/api/view-companies", async (req, res) => {
  try {
    const sql = `
      SELECT companies.*, hr_data.fullName 
      FROM companies 
      LEFT JOIN hr_data ON companies.publishedHrID = hr_data.HRid
    `;
    const companies = await query(sql);
    console.log("Companies", companies);
    res.status(200).json(companies);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: "Server error" });
  }
});


//Super admin view jobs
app.get("/api/view-jobs", async (req, res) => {
  console.log("called")
  try {
    const jobs = await query(`
      SELECT jobs.*, hr_data.fullName as name
      FROM jobs 
      INNER JOIN hr_data ON jobs.postedBy = hr_data.HRid
    `);
    console.log(jobs)
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: "Server error" });
  }
});

// app.get("/api/intern-view-jobs/:id", async (req, res) => {
//   const candidateId = req.params.id;
//   console.log("intern id :", candidateId);

//   try {
//     const [internDomainResult] = await query(`SELECT domain FROM intern_data WHERE candidateID = ?`, [candidateId]);

//     if (!internDomainResult) {
//       return res.status(404).json({ message: "Intern not found" });
//     }

//     const internDomain = internDomainResult.domain;
//     console.log("internDomain :", internDomain);

//     const date = new Date();
//     const jobs = await query(`
//       SELECT * FROM jobs 
//       WHERE lastDate > ? AND jobCategory = ?
//       AND jobId NOT IN (
//         SELECT jobID FROM applied_students WHERE candidateID = ?
//       )
//     `, [date, internDomain, candidateId]); // Corrected order of parameters

//     console.log("jobs :", jobs);
//     res.status(200).json(jobs);
//   } catch (err) {
//     console.error(err); // Log the error for debugging
//     res.status(500).json({ message: "Server error" });
//   }
// });


app.get("/api/intern-view-jobs/:id", async (req, res) => {
  const candidateId = req.params.id;
  console.log("intern id :", candidateId);

  try {
    let studentDomainResult = null; // Declare as null to later check for existence
    const internDomainResult = await query(`SELECT domain FROM intern_data WHERE candidateID = ?`, [candidateId]);

    if (internDomainResult && internDomainResult.length > 0 && internDomainResult[0].domain) {
      studentDomainResult = internDomainResult[0]; // Assign the domain if found
    } else {
      // If no domain found, you can handle guestDomainResult differently
      const guestDomainResult = await query(`SELECT domain FROM guest_data WHERE guestID = ?`, [candidateId]);
      studentDomainResult = guestDomainResult.length > 0 ? guestDomainResult[0] : null; // Assign guest domain if available
    }

    if (!studentDomainResult || !studentDomainResult.domain) {
      return res.status(404).json({ message: "Intern not found or no domain available" });
    }

    const internDomain = studentDomainResult.domain;
    console.log("internDomain :", internDomain);

    const date = new Date();
    const jobs = await query(`
      SELECT * FROM jobs 
      WHERE lastDate > ? 
      AND JSON_CONTAINS(domains, JSON_QUOTE(?), '$') 
      AND jobId NOT IN (
        SELECT jobID FROM applied_students WHERE candidateID = ?
      )
    `, [date, internDomain, candidateId]);

    console.log("jobs :", jobs);
    res.status(200).json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// app.get("/api/intern-view-jobs/:id", async (req, res) => {
//   const candidateId = req.params.id;
//   try {
//     const date = new Date();
//     const jobs = await query(`
//   SELECT * FROM jobs
//   WHERE lastDate > ?
//   AND jobId NOT IN (
//   SELECT jobID FROM applied_students WHERE candidateID = ?
//   )
//   `, [date, candidateId]);
//     res.status(200).json(jobs);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });


// //Api for view job applications for Interns
// app.get('/api/applied-jobs/:id', async (req, res) => {
//   try {
//     const candidateID = req.params.id;
//     const data = await query("SELECT * FROM applied_students WHERE candidateID = ?", [candidateID]);
//     res.json(data);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.get('/api/applied-jobs/:id', async (req, res) => {
  try {
    const candidateID = req.params.id;
    const data = await query(`
      SELECT 
        applied_students.*, 
        jobs.postedBy, 
        hr_data.fullName AS hrName, 
        hr_data.mobileNo AS hrContact 
      FROM 
        applied_students 
      INNER JOIN 
        jobs ON applied_students.jobId = jobs.jobId 
      INNER JOIN 
        hr_data ON jobs.postedBy = hr_data.HRid 
      WHERE 
        applied_students.candidateID = ?`,
      [candidateID]
    );
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/guest-applied-jobs/:id', async (req, res) => {
  try {
    const guestID = req.params.id;
    console.log(guestID);
    const data = await query(`
      SELECT 
        applied_students.*, 
        jobs.postedBy, 
        hr_data.fullName AS hrName, 
        hr_data.mobileNo AS hrContact 
      FROM 
        applied_students 
      INNER JOIN 
        jobs ON applied_students.jobId = jobs.jobId 
      INNER JOIN 
        hr_data ON jobs.postedBy = hr_data.HRid 
      WHERE 
        applied_students.candidateID = ?`,
      [guestID]
    );
    console.log(data); // Log the data to ensure it's correct
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// //Intern login api
// app.post("/api/intern_login", [
//   check('mobileNo', 'Mobile number is required').not().isEmpty()
// ], async (req, res) => {
//   const { mobileNo } = req.body;
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     // Check if the intern exists with the provided mobile number
//     const rows = await query('SELECT * FROM intern_data WHERE mobileNo = ?', [mobileNo]);
//     console.log(rows);
//     if (rows.length > 0) {
//       const intern = rows[0];
//       console.log(intern);
//       res.cookie('internID', intern.candidateID, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
//       return res.status(200).json({ message: 'Please Login', intern }); // 200 for success
//     } else {
//       return res.status(404).json({ error: "Intern not found, please register" }); // Updated to 404 for "Intern not found"
//     }

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error' }); // 500 for "Server error"
//   }
// });

// //Guest login api
// app.post("/api/guest_login", [
//   check('mobileNo', 'Mobile number is required').not().isEmpty()
// ], async (req, res) => {
//   const { mobileNo } = req.body;
//   console.log("Mobile No Got :", mobileNo);
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     // Check if the intern exists with the provided mobile number
//     const rows = await query('SELECT * FROM guest_data WHERE mobileNo = ?', [mobileNo]);
//     console.log(rows);
//     if (rows.length > 0) {
//       const guest = rows[0];
//       console.log(guest);
//       res.cookie('guestID', guest.guestID, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
//       return res.status(200).json({ message: 'Please Login', guest }); // 200 for success
//     } else {
//       return res.status(404).json({ error: "Guest not found, please register" }); // Updated to 404 for "Intern not found"
//     }

//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: 'Server error' }); // 500 for "Server error"
//   }
// });

//Common Login API
// app.post("/api/normal-login", [check('mobileNo', 'Mobile number is required').not().isEmpty()], async (request, res) => {
//   const { mobileNo } = request.body;
//   console.log("mobile Num:" + mobileNo)

//   try {
//     const isIntern = await query('SELECT * FROM intern_data WHERE mobileNo = ?', [mobileNo])
//     const isGuest = await query("SELECT * FROM guest_data WHERE mobileNo = ?", [mobileNo])
//     // console.log(isIntern)
//     // console.log(isGuest)

//     if (isIntern.length > 0) {
//       const intern = isIntern[0];
//       console.log(intern);
//       res.cookie('internID', intern.candidateID, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
//       return res.status(200).json({ message: 'Login successful!', intern, type: "intern" }); // 200 for success

//     }
//     else if (isGuest.length > 0) {
//       const intern = isGuest[0];
//       console.log(intern);
//       res.cookie('internID', intern.guestID, { httpOnly: true, secure: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
//       return res.status(200).json({ message: 'Login Successful!', intern, type: "guest" }); // 200 for success

//     }
//     else {
//       console.log("User is not registered")
//       return res.status(400).json({ message: "Please register!" })
//     }

//   }
//   catch (error) {
//     console.log("catch error:" + error)
//     return response.status(500).json({ message: "Internal server error at nomal login" })
//   }
// });
app.post("/api/normal-login",
  [check('mobileNo', 'Mobile number is required').not().isEmpty()],
  async (request, res) => {
    const { mobileNo } = request.body;
    console.log("Mobile Num: " + mobileNo);

    try {
      // Check if the user is an intern or a guest
      const isIntern = await query('SELECT * FROM intern_data WHERE mobileNo = ?', [mobileNo]);
      const isGuest = await query('SELECT * FROM guest_data WHERE mobileNo = ?', [mobileNo]);

      if (isIntern.length > 0) {
        const intern = isIntern[0];
        console.log("Intern data:", intern);

        // Check if the intern is blocked
        if (intern.blockProfile) {
          console.log("Blocked Intern");
          return res.status(403).json({ message: "Your profile is blocked. Please contact support." }); // 403 Forbidden
        }

        res.cookie('internID', intern.candidateID, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
          message: 'Login successful!',
          intern,
          type: "intern"
        }); // 200 for success
      }

      if (isGuest.length > 0) {
        const guest = isGuest[0];
        console.log("Guest data:", guest);

        // Check if the guest is blocked
        if (guest.blockProfile) {
          console.log("Blocked Guest");
          return res.status(403).json({ message: "Your profile is blocked. Please contact support." }); // 403 Forbidden
        }

        res.cookie('internID', guest.guestID, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
          message: 'Login Successful!',
          intern: guest,
          type: "guest"
        }); // 200 for success
      }

      // If no user is found
      console.log("User is not registered");
      return res.status(400).json({ message: "Please register!" });
    } catch (error) {
      console.error("Catch error:", error);
      return res.status(500).json({ message: "Internal server error at normal login" });
    }
  }
);


//Students list in SA 
app.get("/api/intern_data", async (req, res) => {
  try {
    const rows = await query('SELECT * FROM intern_data order by candidateID desc');
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Guests list in SA
app.get("/api/guest_data", async (req, res) => {
  try {
    const rows = await query('SELECT * FROM guest_data order by guestID desc');
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

//Student profile for SA && Intern Profile
app.get("/api/intern_data/:id", async (req, res) => {
  const internID = req.params.id;

  try {
    const rows = await query('SELECT * FROM intern_data WHERE candidateID = ?', [internID]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

//guests profile for SA && Intern Profile
app.get("/api/guest_data/:id", async (req, res) => {
  const internID = req.params.id;

  try {
    const rows = await query('SELECT * FROM guest_data WHERE guestID = ?', [internID]);
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});


app.get("/api/profile_data/:id", async (req, res) => {
  const internID = req.params.id;

  try {
    // Query intern_data first
    const internData = await query('SELECT * FROM intern_data WHERE candidateID = ?', [internID]);

    if (internData.length > 0) {
      // If internData is found, return it
      return res.status(200).json({ type: 'intern', data: internData[0] });
    }

    // If no intern data, query guest_data
    const guestData = await query('SELECT * FROM guest_data WHERE guestID = ?', [internID]);

    if (guestData.length > 0) {
      // If guestData is found, return it
      return res.status(200).json({ type: 'guest', data: guestData[0] });
    }

    // If neither intern nor guest data is found, send a 404
    res.status(404).json({ message: 'No data found for the provided ID' });
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});


// app.put('/api/intern_data/:candidateID', async (req, res) => {
//   const { candidateID } = req.params;
//   const { fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship } = req.body;

//   try {
//     // Check if the provided data already exists for a different candidateID
//     const checkQuery = `
//       SELECT * FROM intern_data 
//       WHERE (email = '${email}' OR mobileNo = '${mobileNo}') AND candidateID != '${candidateID}';
//     `;
//     console.log("checkQuery :", checkQuery);
//     const existingRows = await query(checkQuery);
//     console.log(existingRows);
//     if (existingRows.length > 0) {
//       return res.status(401).json({
//         message: 'Data already exists',
//         suggestion: 'Please use a different email address or mobile number, or contact admin if you believe this is an error.'
//       });
//     }

//     // If no duplicates are found, proceed with the update
//     const updateQuery = `
//       UPDATE intern_data
//       SET
//         fullName = ?,
//         email = ?,
//         mobileNo = ?,
//         altMobileNo = ?,
//         domain = ?,
//         belongedToVasaviFoundation = ?,
//         address = ?,
//         batchNo = ?,
//         modeOfInternship = ?
//       WHERE candidateID = ?;
//     `;

//     await query(updateQuery, [fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship, candidateID]);

//     return res.status(200).json({ message: 'Profile updated successfully' });

//   } catch (error) {
//     console.error('Error updating profile:', error);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// });

// Update your existing profile update endpoint to include profile_img
app.put('/api/intern_data/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  const {
    fullName, email, mobileNo, altMobileNo, domain,
    belongedToVasaviFoundation, address, batchNo,
    modeOfInternship, profile_img, dateAccepted, endDate
  } = req.body;

  try {
    // Query to check if the record exists in the certificates table for the given internID (candidateID)
    const checkCertificateQuery = `
      SELECT * FROM certificates WHERE internID = ?;
    `;

    const certificateExists = await query(checkCertificateQuery, [candidateID]);

    // If the certificate exists, update the certificates table first
    if (certificateExists.length > 0) {
      const certificateUpdateQuery = `
        UPDATE certificates SET 
          studentName = ?, 
          domain = ?, 
          startDate = ?, 
          endDate = ?
        WHERE internID = ?;
      `;

      await query(certificateUpdateQuery, [
        fullName, domain, dateAccepted, endDate, candidateID
      ]);
    }

    const updateQuery = `
          UPDATE intern_data
          SET
              fullName = ?,
              email = ?,
              mobileNo = ?,
              altMobileNo = ?,
              domain = ?,
              belongedToVasaviFoundation = ?,
              address = ?,
              batchNo = ?,
              modeOfInternship = ?,
              profile_img = ?,
              dateAccepted = ?,
              endDate = ?
          WHERE candidateID = ?;
      `;

    await query(updateQuery, [
      fullName, email, mobileNo, altMobileNo, domain,
      belongedToVasaviFoundation, address, batchNo,
      modeOfInternship, profile_img,dateAccepted, endDate, candidateID
    ]);

    return res.status(200).json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});



app.put('/api/guest_data/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  console.log(req.params, req.body);
  const {
    fullName, email, mobileno, altmobileno, domain,
    BelongedToVasaviFoundation, address, batchno,
    modeOfTraining, profile_img
  } = req.body;

  try {
    // Your existing duplicate check code...

    const updateQuery = `
          UPDATE guest_data
          SET
              fullName = ?,
              email = ?,
              mobileno = ?,
              altmobileno = ?,
              domain = ?,
              BelongedToVasaviFoundation = ?,
              address = ?,
              batchno = ?,
              modeOfTraining = ?,
              profile_img = ?
          WHERE guestID = ?;
      `;

    await query(updateQuery, [
      fullName, email, mobileno, altmobileno, domain,
      BelongedToVasaviFoundation, address, batchno,
      modeOfTraining, profile_img, candidateID
    ]);

    return res.status(200).json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete("/api/intern_data/:id", async (req, res) => {
  const internID = req.params.id;
  try {
    const result = await query('DELETE FROM intern_data WHERE candidateID = ?', [internID]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Student data deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Student not found.' });
    }
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a guest by guestID
app.delete("/api/guest_data/:id", async (req, res) => {
  const guestID = req.params.id;
  try {
    const result = await query('DELETE FROM guest_data WHERE guestID = ?', [guestID]);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Student data deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Student not found.' });
    }
  } catch (err) {
    console.error("Database query error: ", err);
    res.status(500).json({ message: "Server error" });
  }
});

// SA_details for Super Admin Dashboard
app.get("/api/SA_details/:id", async (req, res) => {
  const SAid = req.params.id;
  console.log(SAid)
  try {
    const SA = await query('SELECT name, username, email, password FROM superadmin WHERE SAid = ?', [SAid]);
    console.log(SA)
    if (SA.length > 0) {
      res.status(200).json(SA[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// HR Data for Super Admin Dashboard
app.get('/api/hr_data', async (req, res) => {
  try {
    const rows = await query('SELECT * FROM hr_data ORDER BY HRid DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// HR details by HRid for HR Dashboard
app.get("/api/hr-profile/:hrID", async (req, res) => {
  const { hrID } = req.params
  try {
    console.log("fetching ", hrID, " Details")
    const result = await query(`SELECT *  FROM hr_data where hrID='${hrID}'`)
    res.status(200).json(result[0])
  } catch (err) {
    console.log("Failed to fetch details of ", hrID);
    res.status(500).json({ message: "Server Error" })
  }
})

// Update HR Profile from HR Dashboard
app.put("/api/hr-profile/:hrID", async (req, res) => {
  const { hrID } = req.params;
  const {
    fullName, email, mobileNo, dob, address, workEmail, workMobile,
    emergencyContactName, emergencyContactAddress, emergencyContactMobile,
    gender, branch, password
  } = req.body;

  const queryStr = `
    UPDATE hr_data
    SET 
      fullName = '${fullName}',
      email = '${email}',
      mobileNo = '${mobileNo}',
      dob = '${dob}',
      address = '${address}',
      workEmail = '${workEmail}',
      workMobile = '${workMobile}',
      emergencyContactName = '${emergencyContactName}',
      emergencyContactAddress = '${emergencyContactAddress}',
      emergencyContactMobile = '${emergencyContactMobile}',
      gender = '${gender}',
      branch = '${branch}',
      password = '${password}'
    WHERE HRid = '${hrID}'
  `;
  try {
    await query(queryStr);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

//Fetch hr data in SA panel
app.get('/api/hr_data/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rows = await query('SELECT * FROM hr_data WHERE HRid = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'HR not found' });
    }
    console.log(rows);
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update HR data 
app.put('/api/hr_data/:id', async (req, res) => {
  const { id } = req.params;
  const updatedHr = req.body;

  // Ensure that the 'access' field is properly handled if it's in the request body
  if (updatedHr.access) {
    try {
      // Parse the access field as a JSON object if it's not already
      updatedHr.access = JSON.stringify(updatedHr.access);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid JSON for access field' });
    }
  }

  try {
    const result = await query('UPDATE hr_data SET ? WHERE HRid = ?', [updatedHr, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'HR not found' });
    }

    res.status(200).json({ message: 'HR updated successfully' });
    console.log(id, "details updated successfully");
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete HR data
app.delete('/api/hr_data/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await query('DELETE FROM hr_data WHERE HRid = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'HR not found' });
    }

    res.status(200).json({ message: 'HR deleted successfully' });
  } catch (err) {
    console.error('Database query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// jobs details
app.get('/api/hr_jobs/:HRid', async (req, res) => {
  const { HRid } = req.params;
  try {
    const rows = await query('SELECT * FROM jobs WHERE postedBy = ?', HRid);
    res.status(200).json(rows);
  }
  catch (err) {
    console.error('Error fetching job details:', err);
    res.status(500).send('Server error');
    return;
  }
});


//View jobs by jobId for SA and HR
app.get("/api/view-jobs/:jobId", async (req, res) => {
  const { jobId } = req.params
  console.log(jobId)
  try {
    const jobs = await query(`SELECT jobs.*, hr_data.fullName AS name, hr_data.mobileNo as contact FROM jobs INNER JOIN hr_data ON jobs.postedBy = hr_data.HRid WHERE jobs.jobId = ${jobId}`);
    console.log(jobs)
    res.status(200).json(jobs[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// //APPLICANT HISTORY for SA and HR
// app.get("/api/applicant-history/", async (req, res) => {
//   const { candidateID = '', name = '', email = "", mobileNumber = "" } = req.query;
//   console.log(candidateID, email, name, mobileNumber)
//   try {
//     if(candidateID){
//       const intern_result = await query(`select * from intern_data where candidateID = ${candidateID}`);
//       const guest_result = await query(`select * from guest_data where guestID = ${candidateID}`);
//     }
//     else if(email){
//       const intern_result = await query(`select * from intern_data where email = ${email}`);
//       const guest_result = await query(`select * from guest_data where email = ${email}`);
//     }
//     else if(mobileNumber){
//       const intern_result = await query(`select * from intern_data where mobileNo = ${mobileNumber}`);
//       const guest_result = await query(`select * from guest_data where mobileno = ${mobileNumber}`);
//     }
//     const result = 
//     if (result) {
//       res.status(200).json(result[0])
//     }
//     else {
//       res.status(404).json({ message: "No user found" })
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// })


app.get("/api/applicant-history/", async (req, res) => {
  const { candidateID = '', name = '', email = "", mobileNumber = "" } = req.query;
  console.log(candidateID, email, name, mobileNumber);

  try {
    let internResult = [];
    let guestResult = [];

    // Query based on provided parameters
    if (candidateID) {
      internResult = await query("SELECT * FROM intern_data WHERE candidateID = ?", [candidateID]);
      guestResult = await query("SELECT * FROM guest_data WHERE guestID = ?", [candidateID]);
    } else if (email) {
      internResult = await query("SELECT * FROM intern_data WHERE email = ?", [email]);
      guestResult = await query("SELECT * FROM guest_data WHERE email = ?", [email]);
    } else if (mobileNumber) {
      internResult = await query("SELECT * FROM intern_data WHERE mobileNo = ?", [mobileNumber]);
      guestResult = await query("SELECT * FROM guest_data WHERE mobileno = ?", [mobileNumber]);
    }

    // Combine results if data is found in either table
    const result = internResult.length > 0 ? internResult[0] : guestResult[0];

    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "No user found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


//COMPANIES LIST WHICH ARE REGISTERED
app.get("/api/registered-companies", async (req, res) => {
  console.log("companies")
  try {
    const result = await query('SELECT * FROM companies')
    console.log(result)
    res.status(200).json(result)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
})

//UPDATE JOB STATUS for SA and HR
app.put("/api/jobs/status", async (req, res) => {
  const { status, ids } = req.body;
  console.log(status, ids);

  try {
    // Check if ids is an array
    if (Array.isArray(ids)) {
      const placeholders = ids.map(() => '?').join(',');
      const queryStr = `UPDATE jobs SET status=? WHERE jobId IN (${placeholders})`;
      const result = await query(queryStr, [status, ...ids]);
    } else {
      const result = await query('UPDATE jobs SET status=? WHERE jobId=?', [status, ids]);
    }

    res.status(200).json({ message: "Status Changed Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }

});

//UPDATE STATUS OF AN APPLICATION STATUS
app.put("/api/applications/status", async (req, res) => {
  const { status, ids } = req.body;
  console.log(status, ids);

  try {
    // Check if ids is an array
    if (Array.isArray(ids)) {
      const placeholders = ids.map(() => '?').join(',');
      const queryStr = `UPDATE applied_students SET status=? WHERE applicationID IN (${placeholders})`;
      const result = await query(queryStr, [status, ...ids]);
    } else {
      const result = await query('UPDATE applied_students SET status=? WHERE applicationID=?', [status, ids]);
    }

    res.status(200).json({ message: "Status Changed Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


//GETTING APPLICANT DETAILS FOR PARTICULAR JOBID
app.get('/api/applications', async (req, res) => {
  const { companyName } = req.query;
  let sql = 'SELECT * FROM applied_students';
  const params = [];

  if (companyName) {
    sql += ' WHERE companyName = ?';
    params.push(companyName);
  }

  try {
    const rows = await query(sql, params);
    const response = rows.map(row => ({
      ...row,
    }));

    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//APPLICANT HISTORY USING CANIDATE ID
app.get('/api/applicant-history/:candidateId', async (req, res) => {
  const { candidateId } = req.params
  console.log(candidateId)
  const sql_q = `SELECT * FROM applied_students WHERE candidateID='${candidateId}'`;
  console.log(sql_q)
  try {
    const rows = await query(sql_q);
    console.log(rows)
    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response)
    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//COMPANY HISTORY USING COMPANY ID for SA and Hr

// app.get("/api/company-history/", async (req, res) => {
//   const { companyID = '', name = '', email = "", mobileNumber = "" } = req.query;
//   //console.log(candidateID,email,name,mobileNumber)
//   console.log(companyID)
//   try {
//     const result = await query(`SELECT * FROM companies WHERE companyID='${companyID}'`)
//     if (result) {
//       res.status(200).json(result[0])
//     }
//     else {
//       res.status(404).json({ message: "No user found" })
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// })
app.get("/api/company-history/", async (req, res) => {
  const { companyID = '' } = req.query;
  console.log(companyID);

  try {
    const sql_q = `
      SELECT companies.*, hr_data.fullName 
      FROM companies 
      LEFT JOIN hr_data ON companies.publishedHrID = hr_data.HRid 
      WHERE companies.companyID = ?
    `;

    const result = await query(sql_q, [companyID]); // Use parameterized query for security

    if (result.length > 0) {
      res.status(200).json(result[0]);
    } else {
      res.status(404).json({ message: "No company found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

//APi to check jobs posted by a particular Hr from a company
app.get('/api/hr-company-history/', async (req, res) => {
  const { companyID, hrId } = req.query
  console.log("Searching company details")

  const sql_q = `SELECT * FROM jobs WHERE companyID='${companyID}' and postedBy='${hrId}'`;
  console.log(sql_q)
  try {
    const rows = await query(sql_q);
    console.log(rows)
    // Encode binary data to base64

    //console.log(response)
    res.status(200).json(rows); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//APi to check jobs posted by a particular Hr from a company
// app.get('/api/SA-company-history/', async (req, res) => {
//   const { companyID } = req.query
//   console.log("Searching company details")

//   const sql_q = `SELECT * FROM jobs WHERE companyID='${companyID}'`;
//   console.log(sql_q)
//   try {
//     const rows = await query(sql_q);
//     console.log(rows)
//     // Encode binary data to base64

//     //console.log(response)
//     res.status(200).json(rows); // Send back the modified rows
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

app.get('/api/SA-company-history/', async (req, res) => {
  const { companyID } = req.query;
  console.log("Searching company details");

  const sql_q = `
    SELECT jobs.*, hr_data.fullName 
    FROM jobs 
    LEFT JOIN hr_data ON jobs.postedBy = hr_data.HRid 
    WHERE jobs.companyID = ?
  `;

  console.log(sql_q);

  try {
    const rows = await query(sql_q, [companyID]); // Use parameterized query for security
    console.log(rows);
    res.status(200).json(rows); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//SELECT JOBS FROM PARTICULAR Company for SA and Hr
// app.get('/api/company-history/:companyID', async (req, res) => {
//   const { companyID } = req.params
//   console.log("Searching company details")

//   const sql_q = `SELECT * FROM jobs WHERE companyID='${companyID}'`;
//   console.log(sql_q)
//   try {
//     const rows = await query(sql_q);
//     console.log(rows)
//     // Encode binary data to base64

//     //console.log(response)
//     res.status(200).json(rows); // Send back the modified rows
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });

app.get('/api/company-history/:companyID', async (req, res) => {
  const { companyID } = req.params;
  console.log("Searching company details");

  const sql_q = `
    SELECT jobs.*, hr_data.fullName 
    FROM jobs 
    LEFT JOIN hr_data ON jobs.postedBy = hr_data.HRid 
    WHERE jobs.companyID = ?
  `;

  console.log(sql_q);

  try {
    const rows = await query(sql_q, [companyID]); // Use parameterized query for security
    console.log(rows);
    res.status(200).json(rows); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//STATISTICS FOR APPLIED STUDENTS COUNT ON  SUPERADMIN DASHBOARD

app.get('/api/statistics/:status', async (req, res) => {
  const { status } = req.params
  try {
    let result;
    if (status === 'applied') {
      [result] = await query('SELECT COUNT(*) as count FROM applied_students;')

    }
    else {
      [result] = await query(`SELECT COUNT(*) as count FROM applied_students WHERE status='${status}'`)
    }
    //console.log(result.count)

    res.status(200).json(result); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})

//API TO FILTER JOB APPLICANTS USING THE APPLICATION STATUS 
app.get('/api/job-applicants/:status', async (req, res) => {
  const { status } = req.params;
  console.log("Got here, status:", status);

  let sql;
  if (status.trim() === "interns-not-interested") {
    sql = 'SELECT * FROM applied_students WHERE status="not-interested"';
  } else {
    sql = 'SELECT * FROM applied_students WHERE status=?';
  }

  try {
    const rows = await query(sql, [status.trim()]);
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// app.post("/api/update-job", async (req, res) => {
//   const { jobId, changedValues } = req.body;
//   console.log(jobId);
//   console.log(changedValues);
//   console.log("req:", req.body);

//   try {
//     const setPart = Object.keys(changedValues)
//       .map(key => `${key} = ?`)
//       .join(", ");

//     const values = [...Object.values(changedValues), jobId];

//     const result = await query(
//       `UPDATE jobs SET ${setPart} WHERE jobId = ?`,
//       values
//     );

//     if (result.affectedRows === 1) {
//       return res.status(200).json({ message: 'Job updated successfully' });
//     } else {
//       return res.status(400).json({ error: "Job not updated" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
//API TO UPDATE JOBS
// app.post("/api/update-job", async (req, res) => {
//   const { jobId, changedValues } = req.body;
//   console.log("req:", req.body);

//   try {
//     const setPart = Object.keys(changedValues)
//       .map(key => {
//         if (key === "domains") {
//           return `${key} = ?`; // Special handling for domains
//         }
//         return `${key} = ?`;
//       })
//       .join(", ");

//     const values = Object.keys(changedValues).map(key => {
//       if (key === "domains") {
//         // Convert domains array to a JSON string
//         return JSON.stringify(changedValues[key]);
//       }
//       return changedValues[key];
//     });

//     values.push(jobId); // Add jobId to the values array for the WHERE clause

//     const result = await query(
//       `UPDATE jobs SET ${setPart} WHERE jobId = ?`,
//       values
//     );

//     if (result.affectedRows === 1) {
//       return res.status(200).json({ message: "Job updated successfully" });
//     } else {
//       return res.status(400).json({ error: "Job not updated" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

app.post("/api/update-job", async (req, res) => {
  const { jobId, changedValues } = req.body;
  console.log("req:", req.body);

  try {
    // Step 1: Fetch the current job details from the database
    const currentJob = await query("SELECT * FROM jobs WHERE jobId = ?", [jobId]);
    
    // If the job does not exist, return an error
    if (!currentJob.length) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Step 2: Check if there are any changes
    const changesDetected = Object.keys(changedValues).some((key) => {
      if (key === "domains") {
        // Compare the domains array (stored as JSON) with the changed value
        return JSON.stringify(currentJob[0][key]) !== JSON.stringify(changedValues[key]);
      }
      return currentJob[0][key] !== changedValues[key];
    });

    // Step 3: If no changes detected, return a message
    if (!changesDetected) {
      return res.status(200).json({ message: "No changes detected" });
    }

    // Step 4: Proceed with the update
    const setPart = Object.keys(changedValues)
      .map(key => {
        if (key === "domains") {
          return `${key} = ?`; // Special handling for domains
        }
        return `${key} = ?`;
      })
      .join(", ");

    const values = Object.keys(changedValues).map(key => {
      if (key === "domains") {
        // Convert domains array to a JSON string
        return JSON.stringify(changedValues[key]);
      }
      return changedValues[key];
    });

    values.push(jobId); // Add jobId to the values array for the WHERE clause

    const result = await query(
      `UPDATE jobs SET ${setPart} WHERE jobId = ?`,
      values
    );

    if (result.affectedRows === 1) {
      return res.status(200).json({ message: "Job updated successfully" });
    } else {
      return res.status(400).json({ error: "Job not updated" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


//API to get staticstics of jobs 
app.get('/api/job-statistics/:status', async (req, res) => {
  const { status } = req.params
  console.log("status :", status);
  try {
    let result;
    if (status === 'hr-leads') {
      [result] = await query('SELECT COUNT(*) as count FROM companies;')

    }
    else if (status === 'all-jobs') {
      [result] = await query('SELECT COUNT(*) as count FROM jobs;')
    }

    else {
      [result] = await query(`SELECT COUNT(*) as count FROM jobs WHERE status='${status}'`)
    }
    console.log("Status:", status, result.count)

    res.status(200).json(result); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})


// app.post("/api/accept-interns", async (req, res) => {
//   const interns = req.body;
//   console.log("Interns:", interns);

//   const acceptedInterns = [];
//   const rejectedInterns = [];

//   try {
//       // Extract emails and mobile numbers from the interns list
//     const emails = interns.map(intern => intern.email);
//     const mobileNos = interns.map(intern => intern.mobileNo);

//       existingInterns = await query(
//         `SELECT email, mobileNo 
//          FROM intern_data 
//          WHERE email IN (?) OR mobileNo IN (?)
//          UNION 
//          SELECT email, mobileno 
//          FROM intern_data 
//          WHERE email IN (?) OR mobileno IN (?)`,
//         [
//           emails.length > 0 ? emails : [null],
//           mobileNos.length > 0 ? mobileNos : [null],
//           emails.length > 0 ? emails : [null],
//           mobileNos.length > 0 ? mobileNos : [null]
//         ]
//       );
//     console.log(existingInterns);
//     const existingEmails = new Set(existingInterns.map(intern => intern.email));
//     const existingPhones = new Set(existingInterns.map(intern => intern.mobileNo));

//     // Get the highest candidateID number
//     const lastInternQuery = 'SELECT candidateID FROM intern_data ORDER BY candidateID DESC LIMIT 1';
//     const lastInternResult = await query(lastInternQuery);
//     const lastInternID = lastInternResult.length > 0 ? lastInternResult[0].candidateID : null;
//     let lastInternNumber = lastInternID ? parseInt(lastInternID.slice(2)) : 0;

//     for (const intern of interns) {
//       if (!existingEmails.has(intern.email) && !existingPhones.has(intern.mobileNo)) {
//         lastInternNumber++;
//         const newCandidateID = `RS${String(lastInternNumber).padStart(5, '0')}`;
//         console.log(newCandidateID);

//         await query(
//           'INSERT INTO intern_data (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//           [
//             newCandidateID,
//             intern.fullName,
//             intern.email,
//             intern.mobileNo,
//             intern.altMobileNo,
//             intern.domain,
//             intern.belongedToVasaviFoundation,
//             intern.address,
//             intern.batchNo,
//             intern.modeOfInternship
//           ]
//         );
//         acceptedInterns.push({ ...intern, internID: newCandidateID });
//       } else {
//         rejectedInterns.push(intern);
//       }
//     }

//     if (acceptedInterns.length > 0) {
//       await query(
//         'DELETE FROM intern_requests WHERE email IN (?) OR mobileNo IN (?)',
//         [
//           acceptedInterns.map(intern => intern.email),
//           acceptedInterns.map(intern => intern.mobileNo)
//         ]
//       );
//     }

//     // Send confirmation email to accepted interns
//     const mailOptions = {
//       subject: 'Registration Success',
//       text: `Your request is approved`,
//     };
//     const emailPromises = acceptedInterns.map(intern => sendEmail(intern.email, mailOptions));
//     await Promise.all(emailPromises);

//     // Return accepted and rejected interns
//     res.status(200).json({ accepted: acceptedInterns, rejected: rejectedInterns });
//   } catch (error) {
//     console.error('Error processing interns:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post("/api/accept-interns", async (req, res) => {
//   const interns = req.body;
//   console.log("Interns:", interns);

//   const acceptedInterns = [];
//   const rejectedInterns = [];

//   try {
//     // Extract emails and mobile numbers from the interns list
//     const emails = interns.map(intern => intern.email);
//     const mobileNos = interns.map(intern => intern.mobileNo);

//     const existingInterns = await query(
//       `SELECT email, mobileNo 
//          FROM intern_data 
//          WHERE email IN (?) OR mobileNo IN (?) 
//          UNION 
//          SELECT email, mobileno 
//          FROM intern_data 
//          WHERE email IN (?) OR mobileno IN (?)`,
//       [
//         emails.length > 0 ? emails : [null],
//         mobileNos.length > 0 ? mobileNos : [null],
//         emails.length > 0 ? emails : [null],
//         mobileNos.length > 0 ? mobileNos : [null]
//       ]
//     );
//     console.log(existingInterns);
//     const existingEmails = new Set(existingInterns.map(intern => intern.email));
//     const existingPhones = new Set(existingInterns.map(intern => intern.mobileNo));

//     // Get the current year (last two digits)
//     const currentYear = new Date().getFullYear().toString().slice(-2);

//     for (const intern of interns) {
//       // Extract the first letter of the domain (uppercase)
//       const domainFirstLetter = intern.domain.charAt(0).toUpperCase();

//       if (!existingEmails.has(intern.email) && !existingPhones.has(intern.mobileNo)) {
//         // Find the last number for this domain
//         const likePattern = `RS${currentYear}${domainFirstLetter}%`;
//         const lastInternQuery = `
//           SELECT candidateID 
//           FROM intern_data 
//           WHERE candidateID LIKE ? 
//           ORDER BY candidateID DESC 
//           LIMIT 1`;
//         const lastInternResult = await query(lastInternQuery, [likePattern]);

//         let lastInternNumber = 1;  // Default to 1 if no intern exists
//         if (lastInternResult.length > 0) {
//           // Extract the number from the last candidateID (e.g., RS24A001 -> 001)
//           lastInternNumber = parseInt(lastInternResult[0].candidateID.slice(-3)) + 1;
//         }

//         const newCandidateID = `RS${currentYear}${domainFirstLetter}${String(lastInternNumber).padStart(3, '0')}`;
//         console.log(newCandidateID);

//         await query(
//           'INSERT INTO intern_data (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship, dateAccepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
//           [
//             newCandidateID,
//             intern.fullName,
//             intern.email,
//             intern.mobileNo,
//             intern.altMobileNo,
//             intern.domain,
//             intern.belongedToVasaviFoundation,
//             intern.address,
//             intern.batchNo,
//             intern.modeOfInternship
//           ]
//         );
//         acceptedInterns.push({ ...intern, internID: newCandidateID });
//       } else {
//         rejectedInterns.push(intern);
//       }
//     }

//     if (acceptedInterns.length > 0) {
//       await query(
//         'DELETE FROM intern_requests WHERE email IN (?) OR mobileNo IN (?)',
//         [
//           acceptedInterns.map(intern => intern.email),
//           acceptedInterns.map(intern => intern.mobileNo)
//         ]
//       );
//     }

//     // Send confirmation email to accepted interns
//     const mailOptions = {
//       subject: 'Registration Success',
//       text: `Your request is approved`,
//     };
//     const emailPromises = acceptedInterns.map(intern => sendEmail(intern.email, mailOptions));
//     await Promise.all(emailPromises);

//     // Return accepted and rejected interns
//     res.status(200).json({ accepted: acceptedInterns, rejected: rejectedInterns });
//   } catch (error) {
//     console.error('Error processing interns:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

app.post("/api/accept-interns", async (req, res) => {
  const interns = req.body;
  console.log("Interns:", interns);

  const acceptedInterns = [];
  const rejectedInterns = [];

  try {
    // Extract emails and mobile numbers from the interns list
    const emails = interns.map((intern) => intern.email);
    const mobileNos = interns.map((intern) => intern.mobileNo);

    const existingInterns = await query(
      `SELECT email, mobileNo 
         FROM intern_data 
         WHERE email IN (?) OR mobileNo IN (?) 
         UNION 
         SELECT email, mobileno 
         FROM intern_data 
         WHERE email IN (?) OR mobileno IN (?)`,
      [
        emails.length > 0 ? emails : [null],
        mobileNos.length > 0 ? mobileNos : [null],
        emails.length > 0 ? emails : [null],
        mobileNos.length > 0 ? mobileNos : [null],
      ]
    );

    console.log(existingInterns);
    const existingEmails = new Set(existingInterns.map((intern) => intern.email));
    const existingPhones = new Set(existingInterns.map((intern) => intern.mobileNo));

    // Get the current year (last two digits)
    const currentYear = new Date().getFullYear().toString().slice(-2);

    for (const intern of interns) {
      // Extract the first letter of the domain (uppercase)
      const domainFirstLetter = intern.domain.charAt(0).toUpperCase();

      if (!existingEmails.has(intern.email) && !existingPhones.has(intern.mobileNo)) {
        // Find the last number for this domain
        const likePattern = `RS${currentYear}${domainFirstLetter}%`;
        const lastInternQuery = `
          SELECT candidateID 
          FROM intern_data 
          WHERE candidateID LIKE ? 
          ORDER BY candidateID DESC 
          LIMIT 1`;
        const lastInternResult = await query(lastInternQuery, [likePattern]);

        let lastInternNumber = 1; // Default to 1 if no intern exists
        if (lastInternResult.length > 0) {
          // Extract the number from the last candidateID (e.g., RS24A001 -> 001)
          lastInternNumber = parseInt(lastInternResult[0].candidateID.slice(-3)) + 1;
        }

        const newCandidateID = `RS${currentYear}${domainFirstLetter}${String(lastInternNumber).padStart(3, "0")}`;
        console.log(newCandidateID);

        await query(
          `INSERT INTO intern_data 
            (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship, dateAccepted, endDate) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 3 MONTH))`,
          [
            newCandidateID,
            intern.fullName,
            intern.email,
            intern.mobileNo,
            intern.altMobileNo,
            intern.domain,
            intern.belongedToVasaviFoundation,
            intern.address,
            intern.batchNo,
            intern.modeOfInternship,
          ]
        );
        acceptedInterns.push({ ...intern, internID: newCandidateID });
      } else {
        rejectedInterns.push(intern);
      }
    }

    if (acceptedInterns.length > 0) {
      await query(
        `DELETE FROM intern_requests WHERE email IN (?) OR mobileNo IN (?)`,
        [
          acceptedInterns.map((intern) => intern.email),
          acceptedInterns.map((intern) => intern.mobileNo),
        ]
      );
    }

    // Send confirmation email to accepted interns
    const mailOptions = {
      subject: "Registration Success",
      text: `Your request is approved`,
    };
    const emailPromises = acceptedInterns.map((intern) =>
      sendEmail(intern.email, mailOptions)
    );
    await Promise.all(emailPromises);

    // Return accepted and rejected interns
    res.status(200).json({ accepted: acceptedInterns, rejected: rejectedInterns });
  } catch (error) {
    console.error("Error processing interns:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// app.post("/api/accept-guests", async (req, res) => {
//   const guests = req.body;
//   console.log("Guests:", guests);

//   const acceptedGuests = [];
//   const rejectedGuests = [];

//   // Extract emails and mobile numbers
//   const emails = guests.map(guest => guest.email).filter(email => email);
//   const mobileNos = guests.map(guest => guest.mobileno).filter(mobile => mobile);

//   try {
//     // Check for existing entries in guest_data table
//     let existingGuests = [];
//     if (emails.length > 0 || mobileNos.length > 0) {
//       existingGuests = await query(
//         `SELECT email, mobileno 
//          FROM guest_data 
//          WHERE email IN (?) OR mobileno IN (?)
//          UNION 
//          SELECT email, mobileNo 
//          FROM intern_data 
//          WHERE email IN (?) OR mobileNo IN (?)`,
//         [
//           emails.length > 0 ? emails : [null],
//           mobileNos.length > 0 ? mobileNos : [null],
//           emails.length > 0 ? emails : [null],
//           mobileNos.length > 0 ? mobileNos : [null]
//         ]
//       );
//     }
//     console.log(existingGuests);
//     const existingEmails = new Set(existingGuests.map(guest => guest.email));
//     const existingPhones = new Set(existingGuests.map(guest => guest.mobileno));

//     // Get the highest guestID number
//     const lastGuestQuery = 'SELECT guestID FROM guest_data ORDER BY guestID DESC LIMIT 1';
//     const lastGuestResult = await query(lastGuestQuery);
//     const lastGuestID = lastGuestResult.length > 0 ? lastGuestResult[0].guestID : null;
//     let lastGuestNumber = lastGuestID ? parseInt(lastGuestID.slice(3)) : 0;

//     for (const guest of guests) {
//       if (!existingEmails.has(guest.email) && !existingPhones.has(guest.mobileno)) {
//         lastGuestNumber++;
//         const newGuestID = `GST${String(lastGuestNumber).padStart(5, '0')}`;
//         console.log(newGuestID);

//         await query(
//           'INSERT INTO guest_data (guestID, fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?)',
//           [
//             newGuestID,
//             guest.fullName,
//             guest.email,
//             guest.mobileno,
//             guest.altmobileno,
//             guest.address,
//             guest.batchno,
//             guest.modeOfTraining,
//             guest.program,
//             guest.domain,
//             guest.megadriveStatus,
//             guest.BelongedToVasaviFoundation
//           ]
//         );
//         acceptedGuests.push({ ...guest, guestID: newGuestID });
//       } else {
//         rejectedGuests.push(guest);
//       }
//     }

//     if (acceptedGuests.length > 0) {
//       await query(
//         'DELETE FROM guest_requests WHERE email IN (?) OR mobileno IN (?)',
//         [
//           acceptedGuests.map(guest => guest.email),
//           acceptedGuests.map(guest => guest.mobileno)
//         ]
//       );
//     }

//     const mailOptions = {
//       subject: 'Registration Success',
//       text: `Your request is approved`,
//     };
//     const emailPromises = acceptedGuests.map(guest => sendEmail(guest.email, mailOptions));
//     await Promise.all(emailPromises);

//     // Return accepted and rejected guests
//     res.status(200).json({ accepted: acceptedGuests, rejected: rejectedGuests });
//   } catch (error) {
//     console.error('Error processing guests:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


//API to reject interns

app.post("/api/accept-guests", async (req, res) => {
  const guests = req.body;
  console.log("Guests:", guests);

  const acceptedGuests = [];
  const rejectedGuests = [];

  // Extract emails and mobile numbers
  const emails = guests.map(guest => guest.email).filter(email => email);
  const mobileNos = guests.map(guest => guest.mobileno).filter(mobile => mobile);

  try {
    // Check for existing entries in guest_data and intern_data tables
    let existingGuests = [];
    if (emails.length > 0 || mobileNos.length > 0) {
      existingGuests = await query(
        `SELECT email, mobileno 
         FROM guest_data 
         WHERE email IN (?) OR mobileno IN (?)
         UNION 
         SELECT email, mobileNo 
         FROM intern_data 
         WHERE email IN (?) OR mobileNo IN (?)`,
        [
          emails.length > 0 ? emails : [null],
          mobileNos.length > 0 ? mobileNos : [null],
          emails.length > 0 ? emails : [null],
          mobileNos.length > 0 ? mobileNos : [null]
        ]
      );
    }

    const existingEmails = new Set(existingGuests.map(guest => guest.email));
    const existingPhones = new Set(existingGuests.map(guest => guest.mobileno));

    // Get the current year
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const likePattern = `QT${currentYear}%`;

    // Retrieve the last guest ID with the current year prefix
    const lastGuestQuery = `
      SELECT guestID 
      FROM guest_data 
      WHERE guestID LIKE ? 
      ORDER BY guestID DESC 
      LIMIT 1`;
    const lastGuestResult = await query(lastGuestQuery, [likePattern]);

    // Initialize the counter
    let lastNumber = 0;
    if (lastGuestResult.length > 0) {
      // Extract the last number from the guestID (last 5 digits)
      lastNumber = parseInt(lastGuestResult[0].guestID.slice(-5));
    }

    for (const guest of guests) {
      if (!existingEmails.has(guest.email) && !existingPhones.has(guest.mobileno)) {
        // Increment last number and generate new guestID
        lastNumber++;
        const newGuestID = `QT${currentYear}${String(lastNumber).padStart(5, '0')}`;
        console.log(newGuestID);

        await query(
          'INSERT INTO guest_data (guestID, fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation, dateAccepted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, NOW())',
          [
            newGuestID,
            guest.fullName,
            guest.email,
            guest.mobileno,
            guest.altmobileno,
            guest.address,
            guest.batchno,
            guest.modeOfTraining,
            guest.program,
            guest.domain,
            guest.megadriveStatus,
            guest.BelongedToVasaviFoundation
          ]
        );
        acceptedGuests.push({ ...guest, guestID: newGuestID });
      } else {
        rejectedGuests.push(guest);
      }
    }

    if (acceptedGuests.length > 0) {
      await query(
        'DELETE FROM guest_requests WHERE email IN (?) OR mobileno IN (?)',
        [
          acceptedGuests.map(guest => guest.email),
          acceptedGuests.map(guest => guest.mobileno)
        ]
      );
    }

    const mailOptions = {
      subject: 'Registration Success',
      text: `Your request is approved`,
    };
    const emailPromises = acceptedGuests.map(guest => sendEmail(guest.email, mailOptions));
    await Promise.all(emailPromises);

    // Return accepted and rejected guests
    res.status(200).json({ accepted: acceptedGuests, rejected: rejectedGuests });
  } catch (error) {
    console.error('Error processing guests:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post("/api/reject-interns", async (req, res) => {
  const candidates = req.body;
  console.log('Received candidates:', candidates);
  const requestIDs = candidates.map(candidate => candidate.requestID).filter(id => id != null);
  if (requestIDs.length === 0) {
    return res.status(400).json({ message: 'No valid candidates provided' });
  }

  const placeholders = requestIDs.map(() => '?').join(',');
  const sqlQuery = `DELETE FROM intern_requests WHERE requestID IN (${placeholders})`;

  try {
    const result = await query(sqlQuery, requestIDs);
    console.log("rejected successfully !")
    if (result.affectedRows === requestIDs.length) {
      res.status(200).json({ message: 'All interns rejected successfully' });
    } else if (result.affectedRows > 0) {
      res.status(200).json({ message: `Rejected ${result.affectedRows} out of ${requestIDs.length} interns` });
    } else {
      res.status(500).json({ message: 'No documents matched the query' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});


// API to reject guests
app.post("/api/reject-guests", async (req, res) => {
  const guests = req.body;
  console.log('Received guests for rejection:', guests);

  // Extract guest emails and mobile numbers
  const emails = guests.map(guest => guest.email).filter(email => email != null);
  const mobileNos = guests.map(guest => guest.mobileno).filter(mobileNo => mobileNo != null);

  if (emails.length === 0 && mobileNos.length === 0) {
    return res.status(400).json({ message: 'No valid guests provided' });
  }

  // Build query based on available emails and mobile numbers
  let conditions = [];
  let queryParams = [];

  if (emails.length > 0) {
    conditions.push(`email IN (${emails.map(() => '?').join(',')})`);
    queryParams.push(...emails);
  }

  if (mobileNos.length > 0) {
    conditions.push(`mobileno IN (${mobileNos.map(() => '?').join(',')})`);
    queryParams.push(...mobileNos);
  }

  const sqlQuery = `DELETE FROM guest_requests WHERE ${conditions.join(' OR ')}`;

  try {
    const result = await query(sqlQuery, queryParams);
    console.log("Guests rejected successfully!");

    if (result.affectedRows > 0) {
      res.status(200).json({ message: `${result.affectedRows} guests rejected successfully` });
    } else {
      res.status(500).json({ message: 'No matching guest requests found' });
    }
  } catch (err) {
    console.error('Error rejecting guests:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});



//API to delete job for SA
app.delete('/api/delete-job/:jobId', async (req, res) => {
  const { jobId } = req.params
  console.log("ON api")
  console.log(jobId)

  try {
    const result = await query(`DELETE FROM jobs WHERE jobId = ${jobId}`);
    console.log(result)
    if (result.affectedRows === 1) {
      res.status(201).json({ message: 'Job deleted successfully' });
    } else {
      res.status(500).json({ message: "No documents matched the query" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



app.get('/api/quizData/:token', async (req, res) => {
  const token = req.params.token;

  try {
    const [quizData] = await query('SELECT pages_data FROM quiz WHERE token = ?', [token]);
    const [responsesData] = await query('SELECT responses FROM responses WHERE token = ?', [token]);
    const [internData] = await query('SELECT name, email FROM intern_data WHERE id = ?', [req.query.userId]);
    console.log("Quiz Data", quizData);
    if (quizData.length === 0 || responsesData.length === 0 || internData.length === 0) {
      return res.status(404).json({ message: 'Data not found' });
    }

    const pagesData = JSON.parse(quizData[0].pages_data);
    const responses = JSON.parse(responsesData[0].responses);
    const internDetails = internData[0];

    const submissionData = {
      dateSubmitted: responses.dateSubmitted,
      score: responses.score,
      duration: responses.duration,
      quizTitle: responses.quizTitle,
      quizDescription: responses.quizDescription,
      internDetails: internDetails
    };

    res.json({ pagesData, responses: responses.answers, submissionData });
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/api/update-quiz-status', (req, res) => {
  const { quizId, status } = req.body;
  const query = 'UPDATE quiz_data SET status = ? WHERE token = ?';

  pool.query(query, [status, quizId], (error, results) => {
    if (error) {
      console.error('Error updating quiz status', error);
      return res.status(500).json({ success: false, message: 'Failed to update quiz status' });
    }
    res.json({ success: true, message: 'Quiz status updated successfully' });
  });
});

app.post('/api/publish-quiz', (req, res) => {
  const { token, link } = req.body;
  const updateQuery = `
      UPDATE quiz_data
      SET status = 'Published', quiz_link = ?
      WHERE token = ?
    `;

  pool.query(updateQuery, [link, token], (err, result) => {
    if (err) {
      console.log('Error updating quiz status:', err);
      res.status(500).send('Error updating quiz status');
      return;
    }
    res.send('Quiz published and status updated');
  });
});

app.post('/api/assign-quiz-to-domain', (req, res) => {
  const { domain, quizId } = req.body;
  pool.query('SELECT candidateID FROM intern_data WHERE domain = ?', [domain], (err, users) => {

    if (err) throw err;
    const userIds = users.map(user => user.candidateID);
    const values = userIds.map(userId => [userId, quizId]);
    console.log(userIds);
    pool.query('INSERT INTO user_quizzes (internID, quiz_id) VALUES ?', [values], (err, result) => {
      if (err) throw err;
      res.json({ success: true });
    });
  });
});


app.post('/api/assign-quiz-to-guest-domain', (req, res) => {
  const { domain, quizId } = req.body;
  pool.query('SELECT guestID FROM guest_data WHERE domain = ?', [domain], (err, users) => {

    if (err) throw err;
    const userIds = users.map(user => user.guestID);
    const values = userIds.map(userId => [userId, quizId]);
    console.log(userIds);
    pool.query('INSERT INTO user_quizzes (internID, quiz_id) VALUES ?', [values], (err, result) => {
      if (err) throw err;
      res.json({ success: true });
    });
  });
});


app.post('/api/assign-quiz-to-user', (req, res) => {
  const { quizId, userIds } = req.body;
  const values = userIds.map(userId => [userId, quizId]);
  console.log(req.body);
  pool.query('INSERT INTO user_quizzes (internID, quiz_id) VALUES ?', [values], (err, result) => {
    if (err) {
      console.error('Error assigning quiz:', err);
      res.status(500).json({ success: false, message: 'Failed to assign quiz' });
    } else {
      res.json({ success: true, message: 'Quiz assigned successfully' });
    }
  });
});


app.get('/api/user-quizzes/:userId', (req, res) => {
  const { userId } = req.params;
  console.log("userID", userId);
  const quizIdsQuery = `
        SELECT quiz_id, status
        FROM user_quizzes 
        WHERE internID = ?  
    `;
  pool.query(quizIdsQuery, [userId], (err, quizIdResults) => {
    if (err) {
      console.error('Error fetching quiz IDs:', err);
      res.status(500).send('Error fetching quiz IDs');
      return;
    }

    const quizIds = quizIdResults.map(row => row.quiz_id);
    const statuses = quizIdResults.reduce((acc, row) => {
      acc[row.quiz_id] = row.status;
      return acc;
    }, {});

    if (quizIds.length === 0) {
      res.json([]);
      return;
    }
    const quizzesQuery = `
      SELECT q.token, q.quiz_name, s.schedule_quiz_from, s.schedule_quiz_to
      FROM quiz_data q
      LEFT JOIN quiz s ON q.token = s.token
      WHERE q.token IN (?)
    `;
    pool.query(quizzesQuery, [quizIds], (err, quizzesResults) => {
      if (err) {
        console.error('Error fetching quizzes:', err);
        res.status(500).send('Error fetching quizzes');
        return;
      }

      const quizzesWithStatus = quizzesResults.map(quiz => ({
        ...quiz,
        status: statuses[quiz.token] || null // Use the status from the earlier query
      }));

      res.json(quizzesWithStatus);
    });
  });
});

// app.get('/api/quiz_data/:token', (req, res) => {
//   const { token } = req.params;
//   console.log("token", token);
//   const quizQuery = `
//         SELECT 
//             uq.quiz_id, 
//             uq.internID, 
//             uq.status,
//             i.fullName AS user_name, 
//             i.email AS user_email, 
//             i.domain AS user_domain
//         FROM user_quizzes uq
//         JOIN intern_data i ON uq.internID = i.candidateID
//         WHERE uq.quiz_id = ?
//     `;

//   pool.query(quizQuery, [token], (err, quizResults) => {
//     if (err) {
//       console.error('Error fetching quiz data:', err);
//       res.status(500).send('Error fetching quiz data');
//       return;
//     }

//     if (quizResults.length === 0) {
//       res.status(404).send('Quiz not found');
//       return;
//     }
//     console.log(quizResults);
//     res.json(quizResults);

//   });
// });


app.get('/api/quiz_data/:token', (req, res) => {
  const { token } = req.params;
  console.log("token", token);
  const quizQuery = `
        SELECT 
            uq.quiz_id, 
            uq.internID, 
            uq.status,
            i.fullName AS user_name, 
            i.email AS user_email, 
            i.domain AS user_domain,
            g.fullname AS guest_name, 
            g.email AS guest_email,
            g.domain AS guest_domain

        FROM user_quizzes uq
        LEFT JOIN intern_data i ON uq.internID = i.candidateID
        LEFT JOIN guest_data g ON uq.internID = g.guestID  -- Adjust the join condition based on your schema
        WHERE uq.quiz_id = ?
    `;

  pool.query(quizQuery, [token], (err, quizResults) => {
    if (err) {
      console.error('Error fetching quiz data:', err);
      res.status(500).send('Error fetching quiz data');
      return;
    }

    if (quizResults.length === 0) {
      res.status(404).send('Quiz not found');
      return;
    }
    console.log(quizResults);
    res.json(quizResults);
  });
});


app.get('/api/calculate-results/:quizToken/:userId', (req, res) => {
  const { quizToken, userId } = req.params;
  console.log(quizToken, userId);
  const correctAnswersQuery = `
        SELECT pages_data 
        FROM quiz 
        WHERE token = ?
    `;

  const studentResponsesQuery = `
        SELECT responses 
        FROM responses 
        WHERE token = ? AND user_id = ?
    `;

  const existingResultQuery = `
        SELECT * 
        FROM results 
        WHERE user_id = ? AND quiz_token = ?
    `;

  const insertResultQuery = `
        INSERT INTO results (user_id, quiz_token, score, grade)
        VALUES (?, ?, ?, ?)
    `;

  const updateResultQuery = `
        UPDATE results 
        SET score = ?, grade = ?
        WHERE user_id = ? AND quiz_token = ?
    `;

  pool.query(correctAnswersQuery, [quizToken], (err, result) => {
    if (err) throw err;

    const correctAnswers = JSON.parse(result[0].pages_data);
    pool.query(studentResponsesQuery, [quizToken, userId], (err, result) => {
      if (err) throw err;

      const studentResponses = JSON.parse(result[0].responses);
      let score = 0;
      let totalQuestions = 0;

      correctAnswers.forEach(page => {
        page.question_list.forEach(question => {
          totalQuestions += 1;
          const studentResponse = studentResponses.find(response => response.questionText === question.question_text);
          if (studentResponse && studentResponse.answer === question.correct_answer) {
            score += 1;
          }
        });
      });

      const percentage = (score / totalQuestions) * 100;

      let grade;
      if (percentage >= 90) {
        grade = 'A';
      } else if (percentage >= 80) {
        grade = 'B';
      } else if (percentage >= 70) {
        grade = 'C';
      } else if (percentage >= 60) {
        grade = 'D';
      } else {
        grade = 'F';
      }

      // pool.query(existingResultQuery, [userId, quizToken], (err, result) => {
      //   if (err) throw err;

      //   if (result.length > 0) {
      //     // Update existing result
      //     pool.query(updateResultQuery, [score, grade, userId, quizToken], (err) => {
      //       if (err) throw err;
      //       res.json({ score, grade });
      //     });
      //   } else {
      //     // Insert new result
      pool.query(insertResultQuery, [userId, quizToken, score, grade], (err) => {
        if (err) throw err;
        res.json({ score, grade });
      });
      //   }
      // });
    });
  });
});

// Modified API endpoint that combines submission and result calculation
app.post('/api/submit-quiz', async (req, res) => {
  try {
    const { userId, token, responses, startTime, endTime, duration } = req.body;
    console.log("Processing submission for:", userId, token);

    // Get latest attempt number for this user and quiz
    const [lastAttempt] = await query(
      'SELECT attempt_number FROM responses WHERE user_id = ? AND token = ? ORDER BY attempt_number DESC LIMIT 1',
      [userId, token]
    );

    // If no previous attempts found, start with 1, otherwise increment
    const currentAttempt = lastAttempt ? lastAttempt.attempt_number + 1 : 1;

    // Get correct answers
    const [quizData] = await query(
      'SELECT pages_data FROM quiz WHERE token = ?',
      [token]
    );

    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    const correctAnswers = JSON.parse(quizData.pages_data);
    let score = 0;
    let totalQuestions = 0;

    correctAnswers.forEach(page => {
      page.question_list.forEach(question => {
        totalQuestions += 1;
        const studentResponse = responses.find(response =>
          response.questionText === question.question_text
        );
        if (studentResponse && studentResponse.answer === question.correct_answer) {
          score += 1;
        }
      });
    });

    // Calculate grade
    const percentage = (score / totalQuestions) * 100;
    let grade;
    if (percentage >= 90) grade = 'A';
    else if (percentage >= 80) grade = 'B';
    else if (percentage >= 70) grade = 'C';
    else if (percentage >= 60) grade = 'D';
    else grade = 'F';

    // Insert response with attempt number
    await query(
      `INSERT INTO responses (
        user_id, token, responses, start_time, end_time, 
        duration, score, grade, attempt_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, token, JSON.stringify(responses), startTime, endTime,
        duration, score, grade, currentAttempt]
    );

    console.log("Quiz attempt submitted successfully!");

    res.status(200).json({
      message: 'Quiz submitted successfully.',
      results: {
        score,
        grade,
        attemptNumber: currentAttempt
      }
    });
  } catch (error) {
    console.error('Error processing quiz submission:', error);
    res.status(500).json({ message: 'Error processing quiz submission' });
  }
});

// app.post('/api/submit-quiz', async (req, res) => {
//   console.log("submit quiz :", req.body);
//   try {
//     const { userId, token, responses, startTime, endTime, duration } = req.body;
//     console.log(userId, token, responses, startTime, endTime);

//     // const existingSubmission = await query(
//     //   'SELECT * FROM responses WHERE user_id = ? AND token = ?',
//     //   [userId, token]
//     // );

//     // if (existingSubmission.length > 0) {
//     //   return res.status(400).json({ message: 'Quiz already submitted.' });
//     // }

//     await query(
//       'INSERT INTO responses (user_id, token, responses, start_time, end_time, duration) VALUES (?, ?, ?, ?, ?, ?)',
//       [userId, token, JSON.stringify(responses), startTime, endTime, duration]
//     );
//     console.log("Quiz submitted successfully !")
//     res.status(200).json({ message: 'Quiz submitted successfully.' });
//   } catch (error) {
//     console.log("error :", error);
//     console.error('Error submitting quiz:', error);
//     res.status(500).json({ message: 'Error submitting quiz' });
//   }
// });


// Update quiz status in user_quizzes table
app.put('/api/update-user-quiz-status/:userId/:quizId', (req, res) => {
  const { userId, quizId } = req.params;
  const query = 'UPDATE user_quizzes SET status = ? WHERE internID = ? AND quiz_id = ?';

  // Set the status to true (or false if that's the desired behavior)
  const status = true;

  pool.query(query, [status, userId, quizId], (error, results) => {
    if (error) {
      console.error('Error updating quiz status:', error);
      res.status(500).json({ error: 'An error occurred while updating the quiz status' });
    } else {
      res.status(200).json({ message: 'Quiz status updated successfully' });
    }
  });
});



app.get('/api/quiz-responses/:token', async (req, res) => {
  const { token } = req.params;
  console.log("Token:", token);

  const sql = `
    SELECT q.pages_data,
           r.id AS response_id,
           r.token,
           r.user_id,
           r.responses,
           r.start_time,
           r.end_time,
           r.duration,
           r.attempt_number,  -- Added attempt_number here
           i.fullName AS user_name,
           i.email AS user_email,
           i.mobileNo,
           i.domain,
           r.score,   -- Using score, grade from the responses table directly
           r.grade
    FROM responses r
    JOIN intern_data i ON r.user_id = i.candidateID
    JOIN quiz q ON r.token = q.token
    WHERE r.token = ?
    ORDER BY r.attempt_number DESC;  -- Order by attempt_number to get the latest attempt first
  `;

  query(sql, [token], (err, results) => {
    if (err) {
      console.error('Error fetching quiz responses:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      console.log("No responses found for this quiz");
      return res.status(404).json({ error: 'No responses found for this quiz' });
    }

    const formattedResults = results.map(row => ({
      pages_data: JSON.parse(row.pages_data),
      user_name: row.user_name,
      user_email: row.user_email,
      mobileNo: row.mobileNo,
      domain: row.domain,
      start_time: row.start_time,
      end_time: row.end_time,
      duration: row.duration,
      attempt_number: row.attempt_number,  // Added attempt_number here
      score: row.score,
      grade: row.grade,
      responses: JSON.parse(row.responses)
    }));

    res.json({
      token: token,
      responses: formattedResults,
      pages_data: JSON.parse(results[0].pages_data),
    });
  });
});

// app.get('/api/quiz-responses/:token', async (req, res) => {
//   const { token } = req.params;
//   console.log("Token :", token);
//   const sql = `SELECT q.pages_data,
//        r.id AS response_id,
//        r.token,
//        r.user_id,
//        r.responses,
//        r.start_time,
//        r.end_time,
//        r.duration,
//        i.fullName AS user_name,
//        i.email AS user_email,
//        i.mobileNo,
//        i.domain,
//        res.score,
//        res.grade
// FROM responses r
// JOIN intern_data i ON r.user_id = i.candidateID
// LEFT JOIN (
//     SELECT quiz_token,
//            user_id,
//            score,
//            grade,
//            percentage
//     FROM results
//     WHERE (quiz_token, user_id, id) IN (
//         SELECT quiz_token,
//                user_id,
//                MAX(id)
//         FROM results
//         GROUP BY quiz_token,
//                  user_id
//     )
// ) res ON r.token = res.quiz_token AND i.candidateID = res.user_id
// JOIN quiz q ON r.token = q.token
// JOIN user_quizzes uq ON uq.quiz_id = q.token AND uq.internID = r.user_id
// WHERE r.token = ?
// `
//   query(sql, [token], (err, results) => {
//     if (err) {
//       console.log(err);
//       console.error('Error fetching quiz responses:', err);
//       return res.status(500).json({ error: 'Internal server error' });
//     }

//     if (results.length === 0) {
//       console.log("No responses found for this quiz");
//       return res.status(404).json({ error: 'No responses found for this quiz' });
//     }

//     const formattedResults = results.map(row => ({
//       pages_data: JSON.parse(row.pages_data),
//       no_of_pages: row.no_of_pages,
//       user_name: row.user_name,
//       user_email: row.user_email,
//       mobileNo: row.mobileNo,
//       altMobileNo: row.altMobileNo,
//       domain: row.domain,
//       belongedToVasaviFoundation: row.belongedToVasaviFoundation,
//       address: row.address,
//       batchNo: row.batchNo,
//       modeOfInternship: row.modeOfInternship,
//       start_time: row.start_time,
//       end_time: row.end_time,
//       duration: row.duration,
//       score: row.score,
//       grade: row.grade,
//       percentage: row.percentage,
//       responses: JSON.parse(row.responses)
//     }));

//     console.log("formattedResults",formattedResults);
//     res.json({
//       token: token,
//       responses: formattedResults,
//       pages_data: JSON.parse(results[0].pages_data),
//       no_of_pages: results[0].no_of_pages
//     });
//   });
// });



app.post('/api/addFolder', (req, res) => {
  const { folder } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name) VALUES (?)';
  pool.query(query, [folder], (err, result) => {
    if (err) {
      console.error('Error adding folder:', err);
      res.status(500).send('Failed to add folder');
      return;
    }
    res.status(200).send('Folder added successfully');
  });
});

app.post('/api/addSubfolder', (req, res) => {
  const { folder, subfolder } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name, subfolder_name) VALUES (?, ?)';
  pool.query(query, [folder, subfolder], (err, result) => {
    if (err) {
      console.error('Error adding subfolder:', err);
      res.status(500).send('Failed to add subfolder');
      return;
    }
    res.status(200).send('Subfolder added successfully');
  });
});

app.post('/api/addQuiz', (req, res) => {
  const { folder, subfolder, quiz, type, token } = req.body;
  const query = 'INSERT INTO quiz_data (folder_name, subfolder_name, quiz_name, quiz_type, token) VALUES (?, ?, ?, ?, ?)';
  pool.query(query, [folder, subfolder, quiz, type, token], (err, result) => {
    if (err) {
      console.error('Error adding quiz:', err);
      res.status(500).send('Failed to add quiz');
      return;
    }
    res.status(200).send('Quiz added successfully');
  });
});

app.get('/api/getData', (req, res) => {
  const query = 'SELECT * FROM quiz_data';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Failed to fetch data');
      return;
    }
    res.status(200).json(results);
  });
});

app.get('/api/get-quiz/:token', (req, res) => {
  const { token } = req.params;
  const query = 'SELECT * FROM quiz WHERE token = ?';

  pool.query(query, [token], (err, results) => {
    if (err) {
      console.error('Error fetching quiz:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Add additional checks if necessary, for example:
    if (!results[0].pages_data) {
      return res.status(400).json({ message: 'Pages data missing' });
    }

    res.status(200).json(results[0]);
  });
});


app.get('/api/quiz-analysis/:userId/:quizToken', (req, res) => {
  const { userId, quizToken } = req.params;
  console.log(userId, quizToken);

  const analysisQuery = `
    SELECT responses.responses, responses.start_time, responses.end_time, 
           responses.duration, responses.score, responses.grade, 
           responses.attempt_number, quiz.pages_data
    FROM responses
    INNER JOIN quiz ON responses.token = quiz.token
    WHERE responses.user_id = ? AND responses.token = ?
    ORDER BY responses.attempt_number DESC
  `;

  query(analysisQuery, [userId, quizToken], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: 'An error occurred while fetching quiz analysis' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'No analysis found for this quiz attempt' });
    }

    let analysisData = results.map(result => {
      let responses = [];
      try {
        responses = JSON.parse(result.responses);
      } catch (parseError) {
        console.error('Error parsing responses JSON:', parseError);
        return null;
      }

      let pagesData = [];
      try {
        pagesData = result.pages_data ? JSON.parse(result.pages_data) : [];
      } catch (parseError) {
        console.error('Error parsing pages_data JSON:', parseError);
        return null;
      }

      const flattenedQuestions = pagesData.flatMap(page => page.question_list || []);

      responses.forEach(response => {
        const matchingQuestion = flattenedQuestions.find(question =>
          question && question.question_text.trim() === response.questionText.trim()
        );

        if (matchingQuestion) {
          response.correct_answer = matchingQuestion.correct_answer;
          response.is_correct = response.answer === matchingQuestion.correct_answer;
        } else {
          response.correct_answer = 'Not found';
          response.is_correct = false;
        }
      });

      return {
        attempt_number: result.attempt_number,
        start_time: result.start_time,
        end_time: result.end_time,
        duration: result.duration,
        score: result.score,
        grade: result.grade,
        responses
      };
    }).filter(Boolean); // Filter out any null results caused by parsing errors

    res.json(analysisData);
  });
});


// app.get('/api/quiz-analysis/:userId/:quizToken', (req, res) => {
//   const { userId, quizToken } = req.params;
//   console.log(userId, quizToken)
//   const analysisQuery = `
//         SELECT responses.responses, responses.start_time, responses.end_time, responses.duration, results.score, results.grade, quiz.pages_data
//         FROM responses
//         INNER JOIN results ON responses.user_id = results.user_id AND responses.token = results.quiz_token
//         INNER JOIN quiz ON responses.token = quiz.token
//         WHERE responses.user_id = ? AND responses.token = ?
//     `;
//   query(analysisQuery, [userId, quizToken], (err, results) => {
//     if (err) {
//       console.log(err)
//       console.error('Error fetching quiz analysis:', err);
//       return res.status(500).json({ error: 'An error occurred while fetching quiz analysis' });
//     }
//     console.log("RESULTS :", results);
//     if (results.length === 0) {
//       return res.status(404).json({ error: 'Analysis not found' });
//     }

//     const responseData = results[0];
//     let responses, pagesData;
//     try {
//       responses = JSON.parse(responseData.responses);
//       pagesData = responseData.pages_data ? JSON.parse(responseData.pages_data) : [];
//     } catch (parseError) {
//       console.error('Error parsing JSON data:', parseError);
//       return res.status(500).json({ error: 'Error parsing quiz data' });
//     }
//     if (!Array.isArray(pagesData) || pagesData.length === 0) {
//       console.error('pagesData is not in the expected format');
//       return res.status(500).json({ error: 'Invalid quiz data structure' });
//     }

//     const flattenedQuestions = pagesData.flatMap(page => page.question_list || []);

//     responses.forEach(response => {
//       const matchingQuestion = flattenedQuestions.find(question =>
//         question && question.question_text.trim() === response.questionText.trim()
//       );

//       if (matchingQuestion) {
//         response.correct_answer = matchingQuestion.correct_answer;
//         response.is_correct = response.answer === matchingQuestion.correct_answer;
//       } else {
//         console.warn(`No matching question found for: "${response.questionText}"`);
//         response.correct_answer = 'Not found';
//         response.is_correct = false;
//       }
//     });

//     res.json({
//       responses,
//       start_time: responseData.start_time,
//       end_time: responseData.end_time,
//       duration: responseData.duration,
//       score: responseData.score,
//       grade: responseData.grade
//     });
//   });

// });

app.post('/api/save-questions', (req, res) => {
  const { token, no_of_pages, pages_data } = req.body;

  if (!token || !no_of_pages || !pages_data) {
    return res.status(400).send('Missing required fields');
  }

  const checkQuery = 'SELECT COUNT(*) AS count FROM quiz WHERE token = ?';
  pool.query(checkQuery, [token], (err, result) => {
    if (err) {
      console.error('Error checking token existence:', err);
      return res.status(500).send('Error checking token existence');
    }

    const rowExists = result[0].count > 0;

    if (rowExists) {
      const updateQuery = 'UPDATE quiz SET no_of_pages = ?, pages_data = ? WHERE token = ?';
      pool.query(updateQuery, [no_of_pages, pages_data, token], (err, result) => {
        if (err) {
          console.error('Error updating questions:', err);
          return res.status(500).send('Error updating questions');
        }
        res.status(200).send('Questions updated successfully');
      });
    } else {
      const insertQuery = 'INSERT INTO quiz (token, no_of_pages, pages_data) VALUES (?, ?, ?)';
      pool.query(insertQuery, [token, no_of_pages, pages_data], (err, result) => {
        if (err) {
          console.error('Error inserting questions:', err);
          return res.status(500).send('Error inserting questions');
        }
        res.status(200).send('Questions added successfully');
      });
    }
  });
});

app.get('/api/grades', (req, res) => {
  const query = 'SELECT * FROM grades';
  pool.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

app.post('/api/upload-data', (req, res) => {
  const { token, no_of_pages, pages_data } = req.body;

  const query = 'INSERT INTO quiz (token, no_of_pages, pages_data) VALUES (?, ?, ?)';
  const params = { token, no_of_pages, pages_data };

  pool.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Bulk questions uploaded successfully');
  });
});

const validateToken = (token) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT 1 FROM quiz WHERE token = ?';
    pool.query(query, [token], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

app.get('/api/quiz-options/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const query = 'SELECT * FROM quiz WHERE token = ?';
    pool.query(query, [token], (err, results) => {
      if (err) {
        console.error('Error fetching quiz options:', err);
        return res.status(500).json({ error: 'Error fetching quiz options' });
      }
      if (results.length > 0) {
        const quizOptions = {
          timeLimit: results[0].time_limit || '',
          scheduleQuizFrom: results[0].schedule_quiz_from || '',
          scheduleQuizTo: results[0].schedule_quiz_to || '',
          qns_per_page: results[0].no_of_qns_per_page || '',
          randomizeQuestions: results[0].randomize_questions || false,
          confirmBeforeSubmission: results[0].confirm_before_submission || false,
          showResultsAfterSubmission: results[0].show_results_after_submission || false,
          showAnswersAfterSubmission: results[0].show_answers_after_submission || false,
        };
        return res.status(200).json(quizOptions);
      } else {
        return res.status(200).json({});
      }
    });
  } catch (error) {
    console.error('Error fetching quiz options:', error);
    res.status(500).json({ error: 'Error fetching quiz options' });
  }
});


app.post('/api/quiz-options', async (req, res) => {
  const {
    token,
    timeLimit,
    scheduleQuizFrom,
    scheduleQuizTo,
    qns_per_page,
    randomizeQuestions,
    confirmBeforeSubmission,
    showResultsAfterSubmission,
    showAnswersAfterSubmission,
  } = req.body;

  console.log(req.body);
  try {
    const tokenExists = await validateToken(token);

    const query = tokenExists
      ? `UPDATE quiz SET
                time_limit = ?, schedule_quiz_from = ?, schedule_quiz_to = ?, no_of_qns_per_page = ?,
                randomize_questions = ?, confirm_before_submission = ?, show_results_after_submission = ?, show_answers_after_submission = ?
                WHERE token = ?`
      : `INSERT INTO quiz (
                token, time_limit, schedule_quiz_from, schedule_quiz_to, no_of_qns_per_page,
                randomize_questions, confirm_before_submission, show_results_after_submission, show_answers_after_submission
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = tokenExists
      ? [timeLimit, scheduleQuizFrom, scheduleQuizTo, qns_per_page, randomizeQuestions, confirmBeforeSubmission, showResultsAfterSubmission, showAnswersAfterSubmission, token]
      : [token, timeLimit, scheduleQuizFrom, scheduleQuizTo, qns_per_page, randomizeQuestions, confirmBeforeSubmission, showResultsAfterSubmission, showAnswersAfterSubmission];

    pool.query(query, values, (err, results) => {
      if (err) {
        console.error(`Error ${tokenExists ? 'updating' : 'inserting'} quiz options:`, err);
        return res.status(500).json({ error: `Error ${tokenExists ? 'updating' : 'inserting'} quiz options` });
      }
      res.status(200).json({ message: `Quiz options ${tokenExists ? 'updated' : 'saved'} successfully` });
    });
  } catch (error) {
    console.error('Error validating token:', error);
    res.status(500).json({ error: 'Error validating token' });
  }
});

app.get('/api/getAllData', async (req, res) => {
  await query('SELECT * FROM quiz_data', (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Failed to fetch data');
      return;
    }
    res.status(200).json(results);
  });
});

app.put('/api/renameQuiz/:token', async (req, res) => {
  const { token } = req.params;
  const { name: newName } = req.body;
  console.log(token, newName);
  await query("UPDATE quiz_data SET quiz_name = ? WHERE token = ?", [newName, token], (err, result) => {
    if (err) {
      console.log('Error renaming quiz ');
      console.error('Error renaming quiz:', err);
      return res.status(500).send('Failed to rename quiz');
    }
    console.log("renamed successfully")
    res.send('Quiz renamed successfully');
  });
});


app.delete('/api/deleteQuiz/:token', (req, res) => {
  const { token } = req.params;
  const query = 'DELETE FROM quiz_data WHERE token = ?';
  pool.query(query, [token], (err, result) => {
    if (err) {
      console.error('Error deleting quiz:', err);
      res.status(500).send('Failed to delete quiz');
      return;
    }
    res.status(200).send('Quiz deleted successfully');
  });
});

app.delete('/api/deleteFolder/:folder', (req, res) => {
  const { folder } = req.params;
  const query = 'DELETE FROM quiz_data WHERE folder_name = ?';
  pool.query(query, [folder], (err, result) => {
    if (err) {
      console.error('Error deleting folder:', err);
      res.status(500).send('Failed to delete folder');
      return;
    }
    res.status(200).send('folder deleted successfully');
  });
});

app.get('/api/domains', (req, res) => {
  const query = 'SELECT DISTINCT domain FROM intern_data';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching domains:', err);
      res.status(500).send('Error fetching domains');
      return;
    }
    res.status(200).json(results);
  });
});

app.get('/api/guest_domains', (req, res) => {
  const query = 'SELECT DISTINCT domain FROM guest_data';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching domains:', err);
      res.status(500).send('Error fetching domains');
      return;
    }
    res.status(200).json(results);
  });
});


app.get('/api/interns', (req, res) => {
  const query = 'SELECT id, name, mail, domain FROM intern_data';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching interns:', err);
      res.status(500).send('Error fetching interns');
      return;
    }
    res.json(results);
  });
});




app.get('/api/interns/:id', (req, res) => {
  const query = 'SELECT id, name, mail, domain FROM intern_data WHERE id = ?';
  pool.query(query, [req.params.id], (err, results) => {
    if (err) {
      console.error('Error fetching intern:', err);
      res.status(500).send('Error fetching intern data');
      return;
    }
    if (results.length === 0) {
      res.status(404).send('Intern not found');
      return;
    }
    res.json(results[0]);
  });
});

app.get('/api/submissions', (req, res) => {
  const query = 'SELECT * FROM intern_data ORDER BY domain';
  pool.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.status(200).json(results);
  });
})



app.get('/api/sa-job-applicants/', async (req, res) => {
  const { status } = req.query
  console.log("got  here")
  const sql = `SELECT applied_students.*,
      J.JobId,
      J.postedBy
   FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId WHERE applied_students.status='${status}'`;

  try {
    const rows = await query(sql);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response)
    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


//API to search jobs using candidateId, hrid
app.get('/api/hr-job-applicant-history/', async (req, res) => {
  const { candidateId, hrId } = req.query


  const sql_q = `SELECT applied_students.*,
      J.JobId,
      J.postedBy FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId WHERE J.postedBy = '${hrId}' and applied_students.candidateID='${candidateId}'`;
  console.log(sql_q)
  try {
    const rows = await query(sql_q);
    console.log(rows)
    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response)
    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/intern-job-applicant-history/', async (req, res) => {
  const { candidateId } = req.query;

  const sql_q = "SELECT * from applied_students where candidateID = ?";

  try {
    const rows = await query(sql_q, [candidateId]);
    console.log(rows);
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response);

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

//API for hr dashboard statistics
app.get('/api/hr-job-applicants/', async (req, res) => {
  const { status, hrId } = req.query
  const sql = `SELECT applied_students.*,
      J.JobId,
      J.postedBy,
       J.companyID
   FROM applied_students JOIN jobs AS J ON applied_students.JobID = J.JobId WHERE J.postedBy = '${hrId}' and applied_students.status='${status}'`;

  try {
    const rows = await query(sql);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response)
    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get("/api/hr-view-jobs", async (req, res) => {
  const { hrId } = req.query

  try {
    const rows = await query(`SELECT * FROM jobs WHERE postedBy = '${hrId}' ORDER BY postedOn DESC`);

    // Encode binary data to base64
    const response = rows.map(row => ({
      ...row,
      resume: row.resume ? row.resume.toString('base64') : null
    }));
    console.log(response)
    res.status(200).json(response); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});


app.get("/api/hr-view-jobs-status", async (req, res) => {
  const { status, hrId } = req.query
  console.log(status, hrId);
  try {
    let sql = '';
    if (status == "all-jobs") {
      sql = `SELECT * FROM jobs WHERE postedBy = '${hrId}'`;
    }
    else {
      sql = `SELECT * FROM jobs WHERE status='${status}' and postedBy = '${hrId}'`;
    }
    const rows = await query(sql);
    console.log(rows);
    res.status(200).json(rows); // Send back the modified rows
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// app.get("/api/view-jobs-status", async (req, res) => {
//   const { status } = req.query

//   try {
//     let sql = '';
//     if (status == 'all-jobs') {
//       sql = `SELECT * FROM jobs`;
//     }
//     else {
//       sql = `SELECT * FROM jobs WHERE status='${status}'`;
//     }
//     const rows = await query(sql);

//     console.log(rows)
//     res.status(200).json(rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });


app.get("/api/view-jobs-status", async (req, res) => {
  const { status } = req.query;

  try {
    let sql = '';
    if (status === 'all-jobs') {
      sql = `
        SELECT jobs.*, hr_data.fullName 
        FROM jobs 
        LEFT JOIN hr_data ON jobs.postedBy = hr_data.HRid
      `;
    } else {
      sql = `
        SELECT jobs.*, hr_data.fullName 
        FROM jobs 
        LEFT JOIN hr_data ON jobs.postedBy = hr_data.HRid 
        WHERE jobs.status = ?
      `;
    }

    const rows = await query(sql, status === 'all-jobs' ? [] : [status]);

    console.log(rows);
    res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});



app.get("/api/hr-view-leads", async (req, res) => {
  const { hrId } = req.query
  try {
    const jobs = await query(`SELECT * FROM companies WHERE publishedHrID='${hrId}'`);
    console.log("Jobs", jobs)
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/hr-other-leads", async (req, res) => {
  const { hrId } = req.query
  try {
    const jobs = await query(`SELECT * FROM companies WHERE publishedHrID!='${hrId}'`);
    console.log("Jobs", jobs)
    res.status(200).json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/add-hr", async (req, res) => {
  const { address, companyName, email, hrId, hrName, phoneNumber, website } = req.body;
  console.log(req.body);
  try {
    console.log("In")
    const respo = await query(`INSERT INTO companies (companyName,website,mobileNo,email,address,hrName,publishedHrID) VALUES(?,?,?,?,?,?,?)`, [companyName, website, phoneNumber, email, address, hrName, hrId])
    console.log("restp", respo)
    res.status(200).json({ "message": "Company added Successfully" })
  } catch (error) {
    res.status(500).json({ "message": "Server error" })
  }

})



app.get('/session-check', (req, res) => {
  console.log("API hit From session check ")
  console.log("Session Data:", req.session);
  if (req.session.user) {
    console.log(req.session.user);

    res.json({ user: req.session.user });

  } else {
    console.log("Not Logged in")
    res.status(401).json({ message: 'Not logged in' });
  }
});




app.get('/api/generate-certificate-id/:role/:month', async (req, res) => {
  const { role, month } = req.params;
  const year = new Date().getFullYear().toString().slice(-2);
  const roleInitial = role.charAt(0).toUpperCase();

  try {
    // Fetch the last sequence number for the given role and month
    const sql = `SELECT certificationId FROM certificates WHERE certificationId LIKE ? ORDER BY certificationId DESC LIMIT 1;`
    const likePattern = `RS${year}${roleInitial}%`;

    query(sql, [likePattern], (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Error fetching last sequence number' });
      }

      let newSequenceNumber = '01'; // Default sequence number

      if (result.length > 0) {
        const lastId = result[0].certificationId;
        const lastMonth = lastId.slice(5, 7); // Extract the month from the last ID
        console.log(lastMonth);
        if (lastMonth === month) {
          let lastSequenceNumber = parseInt(lastId.slice(-2), 10);
          newSequenceNumber = (lastSequenceNumber + 1).toString().padStart(2, '0');
        }
      }

      const newCertificationId = `RS${year}${roleInitial}${month}${newSequenceNumber}`;

      res.json({ newCertificationId });
    });
  } catch (error) {
    console.error('Error in generating certification ID:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/api/show_all_certificates', (req, res) => {
  const sql = 'SELECT * FROM certificates';
  query(sql, (err, rows) => {
    if (err) {
      console.error('Error fetching certificates:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(rows);
  });
});

app.get('/api/show_certificate/:id', (req, res) => {
  const internID = req.params.id; // Extracting internID from params
  const sql = 'SELECT * FROM certificates WHERE internID = ?';
  
  query(sql, [internID], (err, rows) => {
    console.log(rows);
    if (err) {
      console.error('Error fetching certificates:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.status(200).json({ certificate: rows[0] });
  });
});


app.post('/api/save_certificate_data', async (req, res) => {
  const { internID, studentName, domain, position, certificationId, startDate, endDate } = req.body;

  const sql = 'INSERT INTO certificates (internID, studentName, domain, position, certificationId, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?, ?)';

  query(sql, [internID, studentName, domain, position, certificationId, startDate, endDate], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error saving certificate details');
    }

    res.status(200).send('Certificate details saved successfully');
  });
});


app.get('/api/courses', async (req, res) => {
  try {
    const courses = await query('SELECT * FROM Course');

    const formattedCourses = courses.map(course => {
      let materials = [];
      console.log('Raw Materials from database:', course.Materials); // Log the raw data

      if (course.Materials) {
        // Check if Materials is already an object or a string
        if (typeof course.Materials === 'string') {
          try {
            materials = JSON.parse(course.Materials);
          } catch (error) {
            console.error('Error parsing Materials JSON:', error);
            materials = []; // Fallback to an empty array
          }
        } else if (typeof course.Materials === 'object') {
          materials = course.Materials; // If it's already an object, use it directly
        }
      }

      return {
        ...course,
        Materials: materials,
      };
    });

    res.status(200).json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Error fetching courses' });
  }
});



// // Endpoint to upload files
app.post('/api/upload_files/:courseName', upload.array('files', 100), async (req, res) => {
  console.log(req.body);
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const results = await query('SELECT material FROM Course WHERE course_name = ?', [courseName]);
    const course = results[0];

    let material = [];

    if (course && course.material) {
      console.log('Raw material from database:', course.material);
      // Check if it's a string that needs parsing
      if (typeof course.material === 'string') {
        try {
          material = JSON.parse(course.material) || [];
        } catch (error) {
          console.error('Error parsing material JSON:', error);
          material = [];
        }
      } else {
        // If it's already an object, use it directly
        material = course.material;
      }
    }

    let nextMaterialID = material.length > 0 ? material[material.length - 1].materialID + 1 : 1;

    const newFiles = req.files.map((file, index) => ({
      materialID: nextMaterialID + index,
      name: file.originalname,
      url: `/uploads/${file.originalname}`,
      mimetype: file.mimetype,
    }));

    const updatedMaterial = [...material, ...newFiles];

    await query('UPDATE courses SET material = ? WHERE course_name = ?', [JSON.stringify(updatedMaterial), courseName]);

    res.status(200).json({ message: 'Files uploaded successfully', material: updatedMaterial });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/intern-courses/:internId', async (req, res) => {
  const internID = req.params.internId;

  try {
    const [internData] = await query('SELECT domain FROM intern_data WHERE candidateID = ?', [internID]);
    if (!internData || !internData.domain) {
      return res.status(404).json({ message: 'No domain found for the intern.' });
    }

    const internDomain = internData.domain;
    console.log("internDomain :", internDomain);
    const courses = await query(`
      SELECT id, CourseName, Topic, SubTopic, Materials, Quiz 
      FROM Course 
      WHERE CourseName = ?`, [internDomain]);
    // console.log("courses :", courses);
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching intern courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses for the intern.' });
  }
});

// app.get('/api/intern-progress/:internID', async (req, res) => {
//   const internID = req.params.internID;
//   try {
//     const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);
//     console.log("Result from database:", result);

//     if (result.length > 0) {
//       const progressData = result[0].progress; // Assuming progress is already an object
//       console.log("Progress data:", progressData);

//       // No need to parse if it's already an object
//       res.json({ course_status: progressData });
//     } else {
//       res.json({ course_status: {} });
//     }
//   } catch (error) {
//     console.error('Error fetching course progress:', error);
//     res.status(500).json({ error: 'Failed to fetch course progress' });
//   }
// });


// app.get('/api/intern-progress/:internID', async (req, res) => {
//   const internID = req.params.internID;

//   try {
//     const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);

//     if (result.length > 0) {
//       const progress = result[0].progress;
//       const courseData = [];

//       for (const courseID in progress) {
//         const completedMaterials = Object.values(progress[courseID]).filter(Boolean).length;

//         const courseResult = await query(`
//           SELECT  Materials
//           FROM Course
//           WHERE id = ?
//         `, [courseID]);

//         // console.log("Result :", courseResult)
//         if (courseResult.length > 0) {
//           const { course_name, material } = courseResult[0];

//           // Parse the material field, assuming it is stored as a JSON array
//           const total_materials = Array.isArray(material) ? material.length : 0;

//           courseData.push({
//             course_name,
//             completed_materials: completedMaterials,
//             total_materials,
//           });
//         }
//       }


//       console.log("courseData :", courseData);
//       res.json({ course_status: progress, courseData });
//     } else {
//       res.json({ course_status: {} });
//     }
//   } catch (error) {
//     console.error('Error fetching course progress:', error);
//     res.status(500).json({ error: 'Failed to fetch course progress' });
//   }
// });

// app.post('/api/update-progress', async (req, res) => {
//   const { internID, progress } = req.body; 
//   console.log("body:", req.body);

//   try {
//     const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);

//     // Generate the complete progress object, filling with false where necessary
//     const completeProgress = {};
//     for (const courseId in progress) {
//       completeProgress[courseId] = {};
//       const materials = progress[courseId];

//       for (const materialId in materials) {
//         completeProgress[courseId][materialId] = materials[materialId] === true;
//       }
//     }

//     if (result.length > 0) {
//       // Directly replace the progress with the new value
//       const updateResult = await query(
//         `UPDATE course_status SET progress = ? WHERE internID = ?`,
//         [JSON.stringify(completeProgress), internID]
//       );

//       if (updateResult.affectedRows === 0) {
//         return res.status(404).json({ error: 'Intern progress not found.' });
//       }

//       res.status(200).json({ message: 'Progress updated successfully' });
//     } else {
//       // Insert new progress if no existing record
//       await query(
//         `INSERT INTO course_status (internID, progress) VALUES (?, ?)`,
//         [internID, JSON.stringify(completeProgress)]
//       );
//       res.status(201).json({ message: 'Progress saved successfully' });
//     }
//   } catch (error) {
//     console.error('Error updating progress:', error);
//     res.status(500).json({ error: 'Failed to update progress. Internal server error.' });
//   }
// });

app.post('/api/update-progress', async (req, res) => {
  const { internID, progress } = req.body;
  console.log("Received progress update:", JSON.stringify(progress, null, 2));

  try {
    const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);

    // Traverse the received progress and ensure the structure is complete
    const completeProgress = {};
    for (const courseID in progress) {
      completeProgress[courseID] = {
        status: progress[courseID].status,
        topics: {},
      };

      const topics = progress[courseID].topics;
      for (const topicID in topics) {
        completeProgress[courseID].topics[topicID] = {
          status: topics[topicID].status,
          subTopics: {},
        };

        const subTopics = topics[topicID].subTopics;
        for (const subTopicID in subTopics) {
          completeProgress[courseID].topics[topicID].subTopics[subTopicID] = {
            status: subTopics[subTopicID].status,
            materials: {},
            quizCompleted: subTopics[subTopicID].quizCompleted || false, // Include quiz status
          };

          const materials = subTopics[subTopicID].materials;
          for (const materialID in materials) {
            completeProgress[courseID].topics[topicID].subTopics[subTopicID].materials[materialID] = materials[materialID];
          }
        }

        // Include topic-level quiz status if it exists
        if (topics[topicID].quizCompleted !== undefined) {
          completeProgress[courseID].topics[topicID].quizCompleted = topics[topicID].quizCompleted;
        }
      }

      // Include course-level quiz status if it exists
      if (progress[courseID].quizCompleted !== undefined) {
        completeProgress[courseID].quizCompleted = progress[courseID].quizCompleted;
      }
    }

    if (result.length > 0) {
      // Update progress if a record exists
      const updateResult = await query(
        `UPDATE course_status SET progress = ? WHERE internID = ?`,
        [JSON.stringify(completeProgress), internID]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: 'Intern progress not found.' });
      }

      res.status(200).json({ message: 'Progress updated successfully' });
    } else {
      // Insert new progress if no record exists
      await query(
        `INSERT INTO course_status (internID, progress) VALUES (?, ?)`,
        [internID, JSON.stringify(completeProgress)]
      );
      res.status(201).json({ message: 'Progress saved successfully' });
    }
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress. Internal server error.' });
  }
});


// app.get('/api/intern-progress/:internID', async (req, res) => {
//   const internID = req.params.internID;

//   try {
//     const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);
//     if (result.length > 0 && result[0].progress) {
//       const progressData = result[0].progress;
//       const progress = typeof progressData === "string" ? JSON.parse(progressData) : progressData;
//       console.log("Progress :", progress);
//       console.log("Progress Topics:", progress.topics);
//       // console.log("Progress :", progress);
//       // console.log("Progress :", progress);

//       const courseData = [];

//       for (const courseID in progress) {
//         let completedMaterials = 0;
//         let totalMaterials = 0;

//         const course = progress[courseID];
//         if (course.topics) {
//           for (const topic in course.topics) {
//             const topicData = course.topics[topic];
//             if (topicData.subTopics) {
//               for (const subTopic in topicData.subTopics) {
//                 const subTopicData = topicData.subTopics[subTopic];
//                 if (subTopicData.materials) {
//                   totalMaterials += Object.keys(subTopicData.materials).length;
//                   completedMaterials += Object.values(subTopicData.materials).filter(status => status === true).length;
//                 }
//               }
//             }
//           }
//         }

//         const courseResult = await query(`
//           SELECT CourseName
//           FROM Course
//           WHERE id = ?
//         `, [courseID]);

//         console.log("course result :", courseResult);

//         if (courseResult.length > 0) {
//           const { course_name } = courseResult[0];
//           courseData.push({
//             course_name,
//             completed_materials: completedMaterials,
//             total_materials: totalMaterials,
//           });
//         }
//       }

//       console.log("courseData:", JSON.stringify(courseData, null, 2));
//       res.json({ course_status: progress, courseData });
//     } else {
//       res.json({ course_status: {} });
//     }
//   } catch (error) {
//     console.error('Error fetching course progress:', error);
//     res.status(500).json({ error: 'Failed to fetch course progress' });
//   }
// });



// API to get material content URL based on materialId

app.get('/api/intern-progress/:internID', async (req, res) => {
  const internID = req.params.internID;

  try {
    const result = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);
    if (result.length > 0 && result[0].progress) {
      const progressData = result[0].progress;
      const progress = typeof progressData === "string" ? JSON.parse(progressData) : progressData;

      const courseData = {};

      for (const row of result) {
        const { CourseName, Topic, SubTopic, Materials } = row;

        if (!courseData[CourseName]) {
          courseData[CourseName] = { topics: {}, completed_materials: 0, total_materials: 0 };
        }

        if (Topic) {
          if (!courseData[CourseName].topics[Topic]) {
            courseData[CourseName].topics[Topic] = { subTopics: {}, completed_materials: 0, total_materials: 0 };
          }

          if (SubTopic) {
            if (!courseData[CourseName].topics[Topic].subTopics[SubTopic]) {
              courseData[CourseName].topics[Topic].subTopics[SubTopic] = { materials: [], completed_materials: 0, total_materials: 0 };
            }

            if (Materials) {
              const materialsList = Array.isArray(Materials) ? Materials : [Materials];

              for (const material of materialsList) {
                courseData[CourseName].topics[Topic].subTopics[SubTopic].materials.push(material);
                courseData[CourseName].topics[Topic].subTopics[SubTopic].total_materials++;
                courseData[CourseName].topics[Topic].total_materials++;
                courseData[CourseName].total_materials++;

                // Assuming `material` contains a `status` field indicating completion
                if (material.status) {
                  courseData[CourseName].topics[Topic].subTopics[SubTopic].completed_materials++;
                  courseData[CourseName].topics[Topic].completed_materials++;
                  courseData[CourseName].completed_materials++;
                }
              }
            }
          }
        }
        // console.log("courseData :", courseData)
      }

      // Transform courseData to the desired format for the frontend
      const transformedCourseData = Object.keys(courseData).map((courseName) => {
        const course = courseData[courseName];
        return {
          course_name: courseName,
          completed_materials: course.completed_materials,
          total_materials: course.total_materials,
          topics: Object.keys(course.topics).map((topicName) => {
            const topic = course.topics[topicName];
            return {
              topic_name: topicName,
              completed_materials: topic.completed_materials,
              total_materials: topic.total_materials,
              subtopics: Object.keys(topic.subTopics).map((subTopicName) => {
                const subTopic = topic.subTopics[subTopicName];
                return {
                  subtopic_name: subTopicName,
                  completed_materials: subTopic.completed_materials,
                  total_materials: subTopic.total_materials,
                  materials: subTopic.materials,
                };
              }),
            };
          }),
        };
      });

      res.json({ course_status: progress, courseData: transformedCourseData });
    } else {
      res.json({ course_status: {}, courseData: [] });
    }
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});



app.get('/api/get-material-content/:materialId', async (req, res) => {
  const { materialId } = req.params;

  try {
    // Correct query to find the material data based on materialId
    const sql = 'SELECT material FROM courses WHERE JSON_CONTAINS(material, \'{"materialID": ?}\')';
    const [rows] = await query(sql, [materialId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Material not found' });
    }

    const courseMaterials = JSON.parse(rows[0].material);
    const material = courseMaterials.find(m => m.materialID === parseInt(materialId));

    if (!material) {
      return res.status(404).json({ error: 'Material not found' });
    }

    // Return the URL where the file can be accessed
    res.json({ url: material.url });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Create Folder (Course)
app.post('/api/create_course', async (req, res) => {
  const { courseName } = req.body;
  console.log("courseName :", courseName);
  try {
    const sql = 'INSERT INTO Course (CourseName) VALUES (?)';
    await query(sql, [courseName], (err) => {
      if (err) {
        console.error('Error creating course:', err);
        return res.status(500).json({ error: 'Failed to create course' });
      }
      return res.status(201).json({ message: 'Course created successfully' });
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});

// Create Topic
app.post('/api/create_topic', async (req, res) => {
  const { courseName, topicName } = req.body;

  if (!courseName || !topicName) {
    return res.status(400).json({ error: 'Course name and topic name are required' });
  }

  console.log('Course:', courseName, 'Topic:', topicName);

  try {
    const sql = 'INSERT INTO Course (CourseName, Topic) VALUES (?, ?)';
    await query(sql, [courseName, topicName]);

    return res.status(201).json({ message: 'Topic created successfully' });
  } catch (error) {
    console.error('Error creating topic:', error);
    return res.status(500).json({ error: 'Failed to create topic' });
  }
});





// Create SubTopic
app.post('/api/create_subtopic', async (req, res) => {
  const { courseName, topicName, subTopicName } = req.body;

  try {
    const sql = 'INSERT INTO course (Course, Topic, SubTopic) VALUES (?, ?, ?)';
    await query(sql, [courseName, topicName, subTopicName], (err) => {
      if (err) {
        console.error('Error creating subtopic:', err);
        return res.status(500).json({ error: 'Failed to create subtopic' });
      }
      return res.status(201).json({ message: 'SubTopic created successfully' });
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});


// Delete SubTopic
app.delete('/api/delete_subtopic', async (req, res) => {
  const { courseName, topicName, subTopicName } = req.body;

  try {
    const sql = 'DELETE FROM course WHERE Course = ? AND Topic = ? AND SubTopic = ?';
    await query(sql, [courseName, topicName, subTopicName], (err) => {
      if (err) {
        console.error('Error deleting subtopic:', err);
        return res.status(500).json({ error: 'Failed to delete subtopic' });
      }
      return res.status(200).json({ message: 'SubTopic deleted successfully' });
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});


app.post('/api/add_material/:courseName/:Topic/:SubTopic', upload.array('files', 100), async (req, res) => {
  const { courseName, Topic, SubTopic } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    // Fetch current materials from the database
    const results = await query('SELECT Materials FROM Course WHERE CourseName = ? AND Topic = ? AND SubTopic = ?',
      [courseName, Topic, SubTopic]);
    const course = results[0];

    let materials = [];

    // Parse existing materials if they are in JSON format
    if (course && course.Materials) {
      try {
        if (typeof course.Materials === 'string') {
          materials = JSON.parse(course.Materials) || [];
        } else {
          materials = course.Materials;
        }
      } catch (error) {
        console.error('Error parsing Materials JSON:', error);
        materials = [];
      }
    }

    // Generate new material IDs and prepare new files data
    let nextMaterialID = materials.length > 0 ? materials[materials.length - 1].materialID + 1 : 1;
    const newFiles = req.files.map((file, index) => ({
      materialID: nextMaterialID + index,
      name: file.originalname,
      url: `/uploads/${file.originalname}`,
      mimetype: file.mimetype,
    }));

    // Combine old and new materials
    const updatedMaterials = [...materials, ...newFiles];

    // Store the updated materials in the database (as a JSON string)
    await query('UPDATE Course SET Materials = ? WHERE CourseName = ? AND Topic = ? AND SubTopic = ?',
      [JSON.stringify(updatedMaterials), courseName, Topic, SubTopic]);

    res.status(200).json({ message: 'Materials added successfully', materials: updatedMaterials });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Create Topic
app.post('/api/add_topic', async (req, res) => {
  const { courseId, CourseName, topicName } = req.body;
  console.log("Data Recieved :", courseId, CourseName, topicName);
  try {
    const insertTopicQuery = `INSERT INTO Course ( Topic, CourseName) VALUES ("${topicName}", "${courseId}")`;
    const result = await query(insertTopicQuery);
    console.log("result :", result);
    return res.status(201).json({ message: 'Topic added successfully', topicId: result.insertId });
  } catch (error) {
    console.error('Error adding topic:', error);
    res.status(500).send('Error adding topic');
  }
});


app.delete('/api/delete_course/:courseName', async (req, res) => {
  const { courseName } = req.params;  // get courseName from URL params
  console.log("Course Name Received :", courseName);
  try {
    const deleteCourseQuery = `DELETE FROM Course WHERE CourseName = "${courseName}"`;
    const result = await query(deleteCourseQuery);
    console.log("result :", result);
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting Course:', error);
    res.status(500).send('Error deleting course');
  }
});

// Delete Topic
app.delete('/api/delete_topic', async (req, res) => {
  const { courseName, topicName } = req.body;

  try {
    const sql = 'DELETE FROM course WHERE Course = ? AND Topic = ?';
    await query(sql, [courseName, topicName], (err) => {
      if (err) {
        console.error('Error deleting topic:', err);
        return res.status(500).json({ error: 'Failed to delete topic' });
      }
      return res.status(200).json({ message: 'Topic deleted successfully' });
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Server Error' });
  }
});


// Create Subtopic
app.post('/api/add_subtopic', async (req, res) => {
  const { courseId, topicName, subTopicName } = req.body;
  console.log(req.body);
  try {
    const insertSubTopicQuery = `INSERT INTO Course ( Topic, CourseName, SubTopic) VALUES ("${topicName}", "${courseId}", "${subTopicName}")`;
    const result = await query(insertSubTopicQuery);

    return res.status(201).json({ message: 'Subtopic added successfully', subTopicId: result.insertId });
  } catch (error) {
    console.error('Error adding subtopic:', error);
    res.status(500).send('Error adding subtopic');
  }
});




app.post('/api/save-lms-questions', (req, res) => {
  const { token, enable, pages_data, CourseName, Topic, SubTopic } = req.body;
  console.log(req.body);

  if (!token || !pages_data || !CourseName) {
    return res.status(400).send('Missing required fields');
  }
  const quizData = {
    token: token,
    enable: enable,
    pages_data: JSON.parse(pages_data) // Parsing pages_data as it's received as a string
  };

  let updateQuery;
  let queryParams;

  if (SubTopic) {
    updateQuery = 'UPDATE Course SET Quiz = ? WHERE CourseName = ? AND Topic = ? AND SubTopic = ?';
    queryParams = [JSON.stringify(quizData), CourseName, Topic, SubTopic];
  } else if (Topic) {
    updateQuery = 'UPDATE Course SET Quiz = ? WHERE CourseName = ? AND Topic = ? AND SubTopic IS NULL';
    queryParams = [JSON.stringify(quizData), CourseName, Topic];
  } else {
    updateQuery = 'UPDATE Course SET Quiz = ? WHERE CourseName = ? AND Topic IS NULL AND SubTopic IS NULL';
    queryParams = [JSON.stringify(quizData), CourseName];
  }

  pool.query(updateQuery, queryParams, (err, result) => {
    if (err) {
      console.error('Error updating quiz:', err);
      return res.status(500).send('Error updating quiz');
    }
    res.status(200).send('Quiz updated successfully');
  });

});


app.get('/api/get-lms-quiz/:token', (req, res) => {
  const { token } = req.params;
  console.log()
  if (!token) {
    return res.status(400).send('Token is required');
  }

  // SQL query to fetch the quiz data based on the token
  const fetchQuery = 'SELECT Quiz FROM Course WHERE Quiz->"$.token" = ?';
  console.log("fetchQuery :", fetchQuery);

  pool.query(fetchQuery, [token], (err, result) => {
    if (err) {
      console.error('Error fetching quiz data:', err);
      return res.status(500).send('Error fetching quiz data');
    }

    if (result.length === 0) {
      return res.status(404).send('No quiz found with the given token');
    }

    const quizData = result[0].Quiz; // This is the JSON object stored in the Quiz column
    console.log("quizData :", quizData);
    res.status(200).json(quizData); // Send the quiz data as a JSON response
  });
});



app.post('/api/update-lms-quiz-status', (req, res) => {
  const { token, status } = req.body;
  console.log(token, status);
  const query = 'UPDATE Course SET quiz_status = ? WHERE token = ?';
  pool.query(query, [status, quizId], (error, results) => {
    if (error) {
      console.error('Error updating quiz status', error);
      return res.status(500).json({ success: false, message: 'Failed to update quiz status' });
    }
    res.json({ success: true, message: 'Quiz status updated successfully' });
  });
});




app.post('/api/submit-quiz/:token', async (req, res) => {
  const { internID, responses, score } = req.body;
  const token = req.params.token;
  const attemptedAt = new Date();
  console.log(internID, responses, score, token, attemptedAt)
  try {
    const [latestAttempt] = await query(
      'SELECT COALESCE(MAX(attempt_no), 0) AS latestAttempt FROM lms_responses WHERE internID = ? AND token = ?',
      [internID, token]
    );

    const attemptNo = latestAttempt.latestAttempt + 1; // Increment attempt number
    await query(
      'INSERT INTO lms_responses (internID, result, Attempted_at, attempt_no, token, responses) VALUES (?, ?, ?, ?, ?, ?)',
      [internID, score, attemptedAt, attemptNo, token, JSON.stringify(responses)]
    );

    res.status(201).json({ message: 'Quiz responses submitted successfully.' });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz data.' });
  }
});

// app.post('/api/intern-bulk-register', async (req, res) => {
//   const { bulkData } = req.body;
//   console.log("bulkData :", bulkData);

//   try {
//     // Extract emails and mobileNos from the bulkData
//     const ids = bulkData.map(data => data.candidateID);
//     const emails = bulkData.map(data => data.email);
//     const mobileNos = bulkData.map(data => data.mobileNo);

// // Check for existing records with same email or mobileNo
// const checkQuery = `
//   SELECT candidateID, email, mobileNo 
//   FROM intern_data 
//   WHERE candidateID IN (?)email IN (?) OR mobileNo IN (?)`;

// query(checkQuery, [ids, emails, mobileNos], (checkError, duplicates) => {
//   if (checkError) {
//     console.error('Error checking for duplicates:', checkError);
//     return res.status(500).json({ message: 'Error checking for duplicates', error: checkError });
//   }

//   if (duplicates.length > 0) {
//     // Duplicates found, return them in the response
//     return res.status(400).json({ 
//       message: 'Duplicate entries found', 
//       duplicates 
//     });
//   }

//       // No duplicates, proceed with insertion
//       const values = bulkData.map(data => [
//         data.candidateID,
//         data.fullName,
//         data.email,
//         data.mobileNo,
//         data.altMobileNo,
//         data.domain,
//         data.belongedToVasaviFoundation,
//         data.address,
//         data.batchNo,
//         data.modeOfInternship
//       ]);

//       const sqlQuery = `
//         INSERT INTO intern_data 
//         (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) 
//         VALUES ?`;

//       query(sqlQuery, [values], (insertError, result) => {
//         if (insertError) {
//           console.error('Error saving bulk data:', insertError);
//           return res.status(500).json({ message: 'Failed to save bulk data', error: insertError });
//         }
//         res.status(200).json({ message: 'Bulk data saved successfully', data: result });
//       });
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ message: 'An unexpected error occurred', error });
//   }
// });

// app.post('/api/intern-bulk-register', async (req, res) => {
//   const { bulkData } = req.body;
//   console.log("Received bulk data:", bulkData);

//   if (!Array.isArray(bulkData) || bulkData.length === 0) {
//     return res.status(400).json({ message: 'Invalid input data' });
//   }

//   try {
//     const currentYear = new Date().getFullYear().toString().slice(-2);
//     const values = [];
//     const emails = [];
//     const mobileNos = [];

//     // Get the last used numbers for each domain
//     const domains = [...new Set(bulkData.map(intern => intern.domain))];
//     const domainLastNumbers = {};

//     // Initialize last used numbers for each domain
//     for (const domain of domains) {
//       const domainFirstLetter = domain.charAt(0).toUpperCase();
//       const likePattern = `RS${currentYear}${domainFirstLetter}%`;

//       const lastInternQuery = `
//           SELECT candidateID 
//           FROM intern_data 
//           WHERE candidateID LIKE ? 
//           ORDER BY candidateID DESC 
//           LIMIT 1`;

//       const result = await query(lastInternQuery, [likePattern]);

//       if (result.length > 0) {
//         // Extract the last number from the ID (last 3 digits)
//         const lastNumber = parseInt(result[0].candidateID.slice(-3));
//         domainLastNumbers[domainFirstLetter] = lastNumber;
//       } else {
//         domainLastNumbers[domainFirstLetter] = 0;
//       }
//     }

//     // Process each intern
//     for (const intern of bulkData) {
//       const domainFirstLetter = intern.domain.charAt(0).toUpperCase();

//       // Increment the last number for this domain
//       domainLastNumbers[domainFirstLetter]++;

//       // Generate the new intern ID
//       const newInternID = `RS${currentYear}${domainFirstLetter}${String(domainLastNumbers[domainFirstLetter]).padStart(3, '0')}`;
//       console.log(`Generated ID for ${intern.fullName}: ${newInternID}`);

//       // Collect emails and mobile numbers for duplicate checking
//       emails.push(intern.email);
//       mobileNos.push(intern.mobileNo);

//       // Prepare values for bulk insertion
//       values.push([
//         newInternID,
//         intern.fullName,
//         intern.email,
//         intern.mobileNo,
//         intern.altMobileNo,
//         intern.domain,
//         intern.belongedToVasaviFoundation,
//         intern.address,
//         intern.batchNo,
//         intern.modeOfInternship
//       ]);
//     }

//     // Check for duplicates
//     const duplicatesCheckQuery = `
//         SELECT candidateID, email, mobileNo 
//         FROM intern_data 
//         WHERE email IN (?) OR mobileNo IN (?)`;

//     const duplicates = await new Promise((resolve, reject) => {
//       query(duplicatesCheckQuery, [emails, mobileNos], (error, results) => {
//         if (error) {
//           console.error('Error checking for duplicates:', error);
//           return reject(error);
//         }
//         resolve(results);
//       });
//     });

//     if (duplicates.length > 0) {
//       return res.status(400).json({
//         message: 'Duplicate entries found',
//         duplicates
//       });
//     }

//     // Proceed with bulk insertion
//     const sqlQuery = `
//         INSERT INTO intern_data 
//         (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) 
//         VALUES ?`;

//     query(sqlQuery, [values], (error, result) => {
//       if (error) {
//         console.error('Error saving bulk data:', error);
//         return res.status(500).json({ message: 'Failed to save bulk data', error });
//       }
//       res.status(200).json({
//         message: 'Bulk data saved successfully',
//         data: result,
//         generatedIDs: values.map(v => v[0])  // Return the generated IDs
//       });
//       sendEmail()
//     });

//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ message: 'An unexpected error occurred', error });
//   }
// });

app.post('/api/intern-bulk-register', async (req, res) => {
  const { bulkData } = req.body;
  console.log("Received bulk data:", bulkData);

  if (!Array.isArray(bulkData) || bulkData.length === 0) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const values = [];
    const emails = [];
    const mobileNos = [];
    const generatedInternData = []; // Store complete intern data with generated IDs

    // Get the last used numbers for each domain
    const domains = [...new Set(bulkData.map(intern => intern.domain))];
    const domainLastNumbers = {};

    // Initialize last used numbers for each domain
    for (const domain of domains) {
      const domainFirstLetter = domain.charAt(0).toUpperCase();
      const likePattern = `RS${currentYear}${domainFirstLetter}%`;

      const lastInternQuery = `
          SELECT candidateID 
          FROM intern_data 
          WHERE candidateID LIKE ? 
          ORDER BY candidateID DESC 
          LIMIT 1`;

      const result = await query(lastInternQuery, [likePattern]);

      if (result.length > 0) {
        const lastNumber = parseInt(result[0].candidateID.slice(-3));
        domainLastNumbers[domainFirstLetter] = lastNumber;
      } else {
        domainLastNumbers[domainFirstLetter] = 0;
      }
    }

    // Process each intern
    for (const intern of bulkData) {
      const domainFirstLetter = intern.domain.charAt(0).toUpperCase();
      domainLastNumbers[domainFirstLetter]++;

      const newInternID = `RS${currentYear}${domainFirstLetter}${String(domainLastNumbers[domainFirstLetter]).padStart(3, '0')}`;
      console.log(`Generated ID for ${intern.fullName}: ${newInternID}`);

      emails.push(intern.email);
      mobileNos.push(intern.mobileNo);

      // Store complete intern data with generated ID
      generatedInternData.push({
        ...intern,
        candidateID: newInternID
      });

      values.push([
        newInternID,
        intern.fullName,
        intern.email,
        intern.mobileNo,
        intern.altMobileNo,
        intern.domain,
        intern.belongedToVasaviFoundation,
        intern.address,
        intern.batchNo,
        intern.modeOfInternship
      ]);
    }

    // Check for duplicates
    const duplicatesCheckQuery = `
        SELECT candidateID, email, mobileNo 
        FROM intern_data 
        WHERE email IN (?) OR mobileNo IN (?)`;

    const duplicates = await new Promise((resolve, reject) => {
      query(duplicatesCheckQuery, [emails, mobileNos], (error, results) => {
        if (error) {
          console.error('Error checking for duplicates:', error);
          return reject(error);
        }
        resolve(results);
      });
    });

    if (duplicates.length > 0) {
      return res.status(400).json({
        message: 'Duplicate entries found',
        duplicates
      });
    }

    // Proceed with bulk insertion
    const sqlQuery = `
        INSERT INTO intern_data 
        (candidateID, fullName, email, mobileNo, altMobileNo, domain, belongedToVasaviFoundation, address, batchNo, modeOfInternship) 
        VALUES ?`;

    await new Promise((resolve, reject) => {
      query(sqlQuery, [values], async (error, result) => {
        if (error) {
          console.error('Error saving bulk data:', error);
          return reject(error);
        }
        resolve(result);
      });
    });

    // Send emails to all registered interns
    try {
      const emailPromises = generatedInternData.map(intern => {
        const mailOptions = {
          subject: 'Welcome to RamanaSoft',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #0a1b3d; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Welcome To RamanaSoft Consultancy Services</h1>
              </div>
              <div style="padding: 20px;">
                <p>Here are your account details,</p>
                <p><strong>Candidate ID:</strong> ${intern.candidateID}</p>
                <p><strong>Full Name:</strong> ${intern.fullName}</p>
                <p><strong>Email:</strong> ${intern.email}</p>
                <p><strong>Contact No:</strong> ${intern.mobileNo}</p>
                <p><strong>Domain:</strong> ${intern.domain}</p>
                <p><strong>Batch:</strong> ${intern.batchNo}</p>
                <p>Account created/approved successfully</p>
                <p>Best Regards,<br>Team RamanaSoft.</p>
              </div>
              <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px;">
                <p>&copy; 2024 RamanaSoft. All rights reserved.</p>
                <p>Contact us at <a href="mailto:support@ramanasoft.com" style="color: #0a1b3d;">support@ramanasoft.com</a></p>
              </div>
            </div>
          `
        };
        return sendEmail(intern.email, mailOptions);
      });

      await Promise.all(emailPromises);

      res.status(200).json({
        message: 'Bulk data saved successfully and emails sent',
        data: values,
        generatedIDs: generatedInternData.map(intern => intern.candidateID)
      });

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      res.status(207).json({
        message: 'Bulk data saved successfully but there were errors sending some emails',
        data: values,
        generatedIDs: generatedInternData.map(intern => intern.candidateID),
        emailError
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});



// app.post('/api/guest-bulk-register', async (req, res) => {
//   const { bulkData } = req.body;
//   console.log(bulkData);

//   try {
//     const emails = bulkData.map(data => data.email);
//     const mobileNos = bulkData.map(data => data.mobileNo);

//     const checkQuery = `
//       SELECT email, mobileNo 
//       FROM guest_data 
//       WHERE email IN (?) OR mobileNo IN (?)`;

//     query(checkQuery, [emails, mobileNos], (checkError, duplicates) => {
//       if (checkError) {
//         console.error('Error checking for duplicates:', checkError);
//         return res.status(500).json({ message: 'Error checking for duplicates', error: checkError });
//       }

//       if (duplicates.length > 0) {
//         return res.status(400).json({
//           message: 'Duplicate entries found',
//           duplicates,
//         });
//       }

//       const values = bulkData.map(data => [
//         data.candidateID,
//         data.fullName,
//         data.email,
//         data.mobileNo,
//         data.altMobileNo,
//         data.address,
//         data.batchNo,
//         data.modeOfInternship,
//         data.program,
//         data.domain,
//         data.megadriveStatus,
//         data.belongedToVasaviFoundation,
//       ]);

//       const sqlQuery = `
//         INSERT INTO guest_data 
//         (guestID, fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation) 
//         VALUES ?`;

//       query(sqlQuery, [values], (insertError, result) => {
//         if (insertError) {
//           console.error('Error saving bulk data:', insertError);
//           return res.status(500).json({ message: 'Failed to save bulk data', error: insertError });
//         }
//         res.status(200).json({ message: 'Bulk data saved successfully', data: result });
//       });
//     });
//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ message: 'An unexpected error occurred', error });
//   }
// });

// app.post('/api/guest-bulk-register', async (req, res) => {
//   const { bulkData } = req.body;
//   console.log("Received bulk data:", bulkData);

//   if (!Array.isArray(bulkData) || bulkData.length === 0) {
//     return res.status(400).json({ message: 'Invalid input data' });
//   }

//   try {
//     const currentYear = new Date().getFullYear().toString().slice(-2);
//     const values = [];
//     const emails = [];
//     const mobileNos = [];

//     // Get the last used number
//     const likePattern = `QT${currentYear}%`;

//     const lastGuestQuery = `
//       SELECT guestID 
//       FROM guest_data 
//       WHERE guestID LIKE ? 
//       ORDER BY guestID DESC 
//       LIMIT 1`;

//     const result = await query(lastGuestQuery, [likePattern]);

//     // Initialize the counter
//     let lastNumber = 0;
//     if (result.length > 0) {
//       // Extract the last number from the ID (last 5 digits)
//       lastNumber = parseInt(result[0].guestID.slice(-5));
//     }

//     // Process each guest
//     for (const guest of bulkData) {
//       // Increment the counter
//       lastNumber++;

//       // Generate the new guest ID
//       const newGuestID = `QT${currentYear}${String(lastNumber).padStart(5, '0')}`;
//       console.log(`Generated ID for ${guest.fullName}: ${newGuestID}`);

//       // Collect emails and mobile numbers for duplicate checking
//       emails.push(guest.email);
//       mobileNos.push(guest.mobileNo);

//       // Prepare values for bulk insertion
//       values.push([
//         newGuestID,
//         guest.fullName,
//         guest.email,
//         guest.mobileNo,
//         guest.altMobileNo,
//         guest.address,
//         guest.batchNo,
//         guest.modeOfInternship,
//         guest.program,
//         guest.domain,
//         guest.megadriveStatus,
//         guest.belongedToVasaviFoundation
//       ]);
//     }

//     // Check for duplicates
//     const duplicatesCheckQuery = `
//       SELECT guestID, email, mobileNo 
//       FROM guest_data 
//       WHERE email IN (?) OR mobileNo IN (?)`;

//     const duplicates = await new Promise((resolve, reject) => {
//       query(duplicatesCheckQuery, [emails, mobileNos], (error, results) => {
//         if (error) {
//           console.error('Error checking for duplicates:', error);
//           return reject(error);
//         }
//         resolve(results);
//       });
//     });

//     if (duplicates.length > 0) {
//       return res.status(400).json({
//         message: 'Duplicate entries found',
//         duplicates
//       });
//     }

//     // Proceed with bulk insertion
//     const sqlQuery = `
//       INSERT INTO guest_data 
//       (guestID, fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation) 
//       VALUES ?`;

//     query(sqlQuery, [values], (error, result) => {
//       if (error) {
//         console.error('Error saving bulk data:', error);
//         return res.status(500).json({ message: 'Failed to save bulk data', error });
//       }
//       res.status(200).json({
//         message: 'Bulk data saved successfully',
//         data: result,
//         generatedIDs: values.map(v => v[0])  // Return the generated IDs
//       });
//     });

//   } catch (error) {
//     console.error('Unexpected error:', error);
//     res.status(500).json({ message: 'An unexpected error occurred', error });
//   }
// });


app.post('/api/guest-bulk-register', async (req, res) => {
  const { bulkData } = req.body;
  console.log("Received bulk data:", bulkData);

  if (!Array.isArray(bulkData) || bulkData.length === 0) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    const values = [];
    const emails = [];
    const mobileNos = [];
    const generatedGuestData = []; // Store complete guest data with generated IDs

    // Get the last used number
    const likePattern = `QT${currentYear}%`;

    const lastGuestQuery = `
      SELECT guestID 
      FROM guest_data 
      WHERE guestID LIKE ? 
      ORDER BY guestID DESC 
      LIMIT 1`;

    const result = await query(lastGuestQuery, [likePattern]);

    // Initialize the counter
    let lastNumber = 0;
    if (result.length > 0) {
      // Extract the last number from the ID (last 5 digits)
      lastNumber = parseInt(result[0].guestID.slice(-5));
    }

    // Process each guest
    for (const guest of bulkData) {
      // Increment the counter
      lastNumber++;

      // Generate the new guest ID
      const newGuestID = `QT${currentYear}${String(lastNumber).padStart(5, '0')}`;
      console.log(`Generated ID for ${guest.fullName}: ${newGuestID}`);

      // Collect emails and mobile numbers for duplicate checking
      emails.push(guest.email);
      mobileNos.push(guest.mobileNo);

      // Store complete guest data with generated ID
      generatedGuestData.push({
        ...guest,
        guestID: newGuestID
      });

      // Prepare values for bulk insertion
      values.push([
        newGuestID,
        guest.fullName,
        guest.email,
        guest.mobileNo,
        guest.altMobileNo,
        guest.address,
        guest.batchNo,
        guest.modeOfInternship,
        guest.program,
        guest.domain,
        guest.megadrivestatus,
        guest.belongedToVasaviFoundation
      ]);
    }

    // Check for duplicates
    const duplicatesCheckQuery = `
      SELECT guestID, email, mobileNo 
      FROM guest_data 
      WHERE email IN (?) OR mobileNo IN (?)`;

    const duplicates = await new Promise((resolve, reject) => {
      query(duplicatesCheckQuery, [emails, mobileNos], (error, results) => {
        if (error) {
          console.error('Error checking for duplicates:', error);
          return reject(error);
        }
        resolve(results);
      });
    });

    if (duplicates.length > 0) {
      return res.status(400).json({
        message: 'Duplicate entries found',
        duplicates
      });
    }

    // Proceed with bulk insertion
    const sqlQuery = `
      INSERT INTO guest_data 
      (guestID, fullName, email, mobileno, altmobileno, address, batchno, modeOfTraining, program, domain, megadriveStatus, BelongedToVasaviFoundation) 
      VALUES ?`;

    await new Promise((resolve, reject) => {
      query(sqlQuery, [values], async (error, result) => {
        if (error) {
          console.error('Error saving bulk data:', error);
          return reject(error);
        }
        resolve(result);
      });
    });

    // Send emails to all registered guests
    try {
      const emailPromises = generatedGuestData.map(guest => {
        const mailOptions = {
          subject: 'Placement Profile Created Successfully',
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <div style="background-color: #0a1b3d; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">Welcome To RamanaSoft Consultancy Services</h1>
              </div>
              <div style="padding: 20px;">
                <p>Here are your account details,</p>
                <p><strong>Guest ID:</strong> ${guest.guestID}</p>
                <p><strong>Full Name:</strong> ${guest.fullName}</p>
                <p><strong>Email:</strong> ${guest.email}</p>
                <p><strong>Contact No:</strong> ${guest.mobileNo}</p>
                <p><strong>Program:</strong> ${guest.program}</p>
                <p><strong>Domain:</strong> ${guest.domain}</p>
                <p><strong>Batch:</strong> ${guest.batchNo}</p>
                <p><strong>Mode of Training:</strong> ${guest.modeOfInternship}</p>
                ${guest.megadriveStatus ? `<p><strong>Megadrive Status:</strong> ${guest.megadriveStatus}</p>` : ''}
                <p>Placement profile activated successfully. </p>
                <p>Best Regards,<br>Team RamanaSoft.</p>
              </div>
              <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px;">
                <p>&copy; 2024 RamanaSoft. All rights reserved.</p>
                <p>Contact us at <a href="mailto:support@ramanasoft.com" style="color: #0a1b3d;">support@ramanasoft.com</a></p>
              </div>
            </div>
          `
        };
        return sendEmail(guest.email, mailOptions);
      });

      await Promise.all(emailPromises);

      res.status(200).json({
        message: 'Bulk data saved successfully and emails sent',
        data: values,
        generatedIDs: generatedGuestData.map(guest => guest.guestID)
      });

    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      res.status(207).json({
        message: 'Bulk data saved successfully but there were errors sending some emails',
        data: values,
        generatedIDs: generatedGuestData.map(guest => guest.guestID),
        emailError
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ message: 'An unexpected error occurred', error });
  }
});

app.put('/api/hr_access/:id', async (req, res) => {
  const { id } = req.params;
  const { accessRights } = req.body; // Ensure accessRights is being sent correctly
  console.log(id, accessRights);

  try {
    const accessJson = JSON.stringify(accessRights);
    const result = await query(
      'UPDATE hr_data SET access = ? WHERE HRid = ?',
      [accessJson, id]
    );
    if (result.affectedRows === undefined || result.affectedRows === 0) {
      return res.status(404).json({ message: 'HR record not found' });
    }

    res.json({ message: 'Access updated successfully', access: JSON.parse(accessJson) });
  } catch (error) {
    console.error('Error updating access:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.get('/api/hr_access/:id', async (req, res) => {
  const { id } = req.params; // Get HR ID from the URL parameters
  console.log('Fetching access for HR ID:', id);

  try {
    const [result] = await query(
      'SELECT access FROM hr_data WHERE HRid = ?',
      [id]
    );

    if (!result) {
      return res.status(404).json({ message: 'HR record not found' });
    }
    const access = result.access;
    res.json({ message: 'Access retrieved successfully', access });
  } catch (error) {
    console.error('Error retrieving access:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});






// Add this endpoint to your existing API file
app.post('/api/upload-profile-image/:candidateID', uploadProfile.single('profile_image'), async (req, res) => {
  try {
    const { candidateID } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the old profile image filename
    const oldImageQuery = 'SELECT profile_img FROM intern_data WHERE candidateID = ?';
    const [oldImageResult] = await query(oldImageQuery, [candidateID]);

    // Delete old profile image if it exists
    if (oldImageResult && oldImageResult.profile_img) {
      const oldImagePath = path.join(profilesDir, oldImageResult.profile_img);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the profile_img field in the database
    const updateQuery = 'UPDATE intern_data SET profile_img = ? WHERE candidateID = ?';
    await query(updateQuery, [req.file.filename, candidateID]);

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    if (error.message.includes('Only .png, .jpg and .jpeg format allowed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error uploading profile image' });
  }
});



// Add this endpoint to your existing API file
app.post('/api/upload-guest-profile-image/:candidateID', uploadProfile.single('profile_image'), async (req, res) => {
  try {
    const { candidateID } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get the old profile image filename
    const oldImageQuery = 'SELECT profile_img FROM guest_data WHERE guestID = ?';
    const [oldImageResult] = await query(oldImageQuery, [candidateID]);

    // Delete old profile image if it exists
    if (oldImageResult && oldImageResult.profile_img) {
      const oldImagePath = path.join(profilesDir, oldImageResult.profile_img);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update the profile_img field in the database
    const updateQuery = 'UPDATE guest_data SET profile_img = ? WHERE guestID = ?';
    await query(updateQuery, [req.file.filename, candidateID]);

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      filename: req.file.filename
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    if (error.message.includes('Only .png, .jpg and .jpeg format allowed')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error uploading profile image' });
  }
});


// Separate endpoint for course progress
app.get('/api/dashboard-course-progress/:internID', async (req, res) => {
  const internID = req.params.internID;

  try {
    // Step 1: Get the intern's domain from the intern_data table
    const [internData] = await query('SELECT domain FROM intern_data WHERE candidateID = ?', [internID]);
    if (!internData || !internData.domain) {
      return res.status(404).json({ message: 'No domain found for the intern.' });
    }

    const internDomain = internData.domain;

    // Step 2: Fetch all course data for the intern's domain
    const courseData = await query(`
      SELECT CourseName, Topic, SubTopic, Materials, Quiz 
      FROM Course 
      WHERE CourseName = ?`, [internDomain]);

    // Step 3: Fetch intern's completed progress data
    const courseStatusResult = await query(`SELECT progress FROM course_status WHERE internID = ?`, [internID]);
    let completedProgress = {};

    if (courseStatusResult.length > 0 && courseStatusResult[0].progress) {
      completedProgress = typeof courseStatusResult[0].progress === 'string'
        ? JSON.parse(courseStatusResult[0].progress)
        : courseStatusResult[0].progress;
    }

    let totalMaterials = 0;
    let completedMaterials = 0;

    // Step 4: Organize course data and calculate progress
    const organizedData = {};
    courseData.forEach(item => {
      // Set up course structure
      if (!organizedData[item.CourseName]) {
        organizedData[item.CourseName] = { topics: {} };
      }

      // Set up topic structure
      if (item.Topic && !organizedData[item.CourseName].topics[item.Topic]) {
        organizedData[item.CourseName].topics[item.Topic] = { subTopics: {} };
      }

      // Set up subtopic structure
      if (item.SubTopic) {
        const materials = Array.isArray(item.Materials) ? item.Materials : [];
        organizedData[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
          materials,
          quiz: item.Quiz || null
        };

        // Calculate total materials in the course
        totalMaterials += materials.length;

        // Check for completed materials in the intern's progress
        const courseProgress = completedProgress[item.CourseName];
        const topicProgress = courseProgress?.topics[item.Topic];
        const subTopicProgress = topicProgress?.subTopics[item.SubTopic];

        if (subTopicProgress) {
          materials.forEach(material => {
            if (subTopicProgress.materials[material.materialID]) completedMaterials += 1;
          });
        }
      }
    });

    // Step 5: Calculate completion percentage
    const percentage = totalMaterials > 0 ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

    // Step 6: Prepare and send response
    res.status(200).json({
      count: Object.keys(organizedData).length,
      completedCourses: Object.values(completedProgress).filter(course => course.status).length,
      percentage,
      organizedData
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    res.status(500).json({ error: 'Failed to fetch course progress' });
  }
});




// Separate endpoint for job status
app.get('/api/dashboard-job-status/:internID', async (req, res) => {
  const internID = req.params.internID;
  try {
    const jobsData = await query(`
      SELECT * FROM applied_students
      INNER JOIN jobs ON applied_students.jobId = jobs.jobId 
      WHERE applied_students.candidateID = ?
    `, [internID]);

    const jobStatus = {
      applied: jobsData.length,
      shortlisted: jobsData.filter(job => job.status === 'shortlisted').length,
      total: jobsData.length
    };

    res.json(jobStatus);
  } catch (error) {
    console.error('Error fetching job status:', error);
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

app.get('/api/dashboard-quiz-status/:internID', async (req, res) => {
  const internID = req.params.internID;
  try {
    // Fetch total quiz count
    const totalQuizCountResult = await query(`SELECT COUNT(DISTINCT quiz_id) AS total FROM user_quizzes WHERE internID = ?`, [internID]);
    const totalQuizCount = totalQuizCountResult[0].total;

    // Fetch completed quiz count
    const completedQuizCountResult = await query(`SELECT COUNT(DISTINCT quiz_id) AS completed FROM user_quizzes WHERE internID = ? AND status = ?`, [internID, 1]);
    const completedQuizCount = completedQuizCountResult[0].completed;

    // Prepare the response
    const testsAttended = {
      completed: completedQuizCount,
      total: totalQuizCount
    };

    res.json(testsAttended);
  } catch (error) {
    console.error('Error fetching quiz status:', error);
    res.status(500).json({ error: 'Failed to fetch quiz status' });
  }
});


app.get('/api/dashboard-achievements-status/:internID', async (req, res) => {
  const internID = req.params.internID;
  try {
    const result = await query(`SELECT endDate FROM intern_data WHERE candidateID = ?`, [internID]);
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Intern not found' });
    }
    const endDate = new Date(result[0].endDate); // Assuming the date is returned in a valid format
    const currentDate = new Date();
    const totalAchievements = endDate > currentDate ? 1 : 2;
    const Achievements = {
      totalAchievements: totalAchievements
    };

    res.json(Achievements);
  } catch (error) {
    console.error('Error fetching achievements status:', error);
    res.status(500).json({ error: 'Failed to fetch achievements status' });
  }
});


// Separate endpoint for user name
app.get('/api/user-name/:internID', async (req, res) => {
  const internID = req.params.internID;
  try {
    const result = await query(`SELECT fullName FROM intern_data WHERE candidateID = ?`, [internID]);
    const userName = result.length ? result[0].fullName : 'User';
    res.json({ userName });
  } catch (error) {
    console.error('Error fetching user name:', error);
    res.status(500).json({ error: 'Failed to fetch user name' });
  }
});





app.post('/api/accept-guidelines/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  console.log(candidateID);
  try {
    await query('UPDATE intern_data SET guidelines = TRUE WHERE candidateID = ?', [candidateID]);
    res.status(200).json({ message: 'Guidelines accepted successfully.' });
  } catch (error) {
    console.error('Error updating guidelines status:', error);
    res.status(500).json({ message: 'Failed to update guidelines status.' });
  }
});


app.get('/api/check-guidelines/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  try {
    const result = await query('SELECT guidelines FROM intern_data WHERE candidateID = ?', [candidateID]);
    const guidelinesAccepted = result[0]?.guidelines || false;
    res.status(200).json({ guidelinesAccepted });
  } catch (error) {
    console.error('Error checking guidelines status:', error);
    res.status(500).json({ message: 'Failed to retrieve guidelines status.' });
  }
});




//placement statistics for super admin
app.get('/api/placement_report', async (req, res) => {

  try {
    let result;
    if (status === 'applied') {
      [result] = await query('SELECT COUNT(*) as count FROM applied_students;')

    }
    else {
      [result] = await query(`SELECT COUNT(*) as count FROM applied_students WHERE status='${status}'`)
    }
    console.log(result.count)

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
})




// app.get('/api/hr-stats', async (req, res) => {
//   console.log("HRStats API called");
//   try {
//     const sqlQuery = `
//       SELECT 
//     hr_data.fullName AS hr_name,
//     hr_data.HRid AS hrID,
//     jobs.postedOn,
//     COUNT(DISTINCT jobs.jobId) AS drives_conducted,
//     SUM(CASE WHEN jobs.status = 'jd-received' THEN 1 ELSE 0 END) AS selected,
//     SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS sent_profiles,
//     SUM(CASE WHEN jobs.status = 'drive-done' THEN 1 ELSE 0 END) AS attended,
//     SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS rejected,
//     SUM(CASE WHEN jobs.status = 'drive-scheduled' THEN 1 ELSE 0 END) AS in_progress,
//     SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS drives_pending
// FROM 
//     hr_data
// LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid 
// GROUP BY 
//     hr_data.fullName, hr_data.HRid, jobs.postedOn
// ORDER BY 
//     hr_data.HRid;

//     `;
//     const result = await query(sqlQuery);
//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });


app.get('/api/hr-stats', async (req, res) => {
  console.log("HRStats API called");
  try {
    const sqlQuery = `
    SELECT 
  hr_data.HRid AS hr_id,
  hr_data.fullName AS hr_name,
  COUNT(DISTINCT jobs.jobId) AS jobs_posted,
  SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS sent_profiles,
  SUM(CASE WHEN jobs.status IN ('drive-done', 'offer-received') THEN 1 ELSE 0 END) AS drives_done,
  COUNT(DISTINCT jobs.jobId) - SUM(CASE WHEN jobs.status = 'drive-done' THEN 1 ELSE 0 END) AS drives_pending
FROM 
  hr_data
LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid 
GROUP BY 
  hr_data.fullName, hr_data.HRid
ORDER BY 
  hr_data.fullName;

    `;
    const result = await query(sqlQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// app.get('/api/jobs_sdudents-stats', async (req, res) => {
//   console.log("Jobs_students Stats API called");
//   try {
//     const sqlQuery =
//       `
// SELECT 
//     hr_data.fullName AS hr_name,
//     COUNT(DISTINCT applied_students.candidateID) AS total_applications_received,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'eligible' THEN applied_students.candidateID END) AS total_profiles_sent,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) AS total_not_attended,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'eligible' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) AS total_attended,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END) AS total_placed,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'eligible' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END) AS total_rejected,
//     COUNT(DISTINCT CASE WHEN applied_students.status = 'eligible' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) - (COUNT(DISTINCT CASE WHEN applied_students.status = 'eligible' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) - COUNT(DISTINCT CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END) + COUNT(DISTINCT CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END)) AS total_pending
//     FROM 
//     hr_data
// LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid
// LEFT JOIN applied_students ON applied_students.jobID = jobs.jobId
// GROUP BY 
//     hr_data.fullName, hr_data.HRid
// ORDER BY 
//     hr_data.fullName;
// `;
//     const result = await query(sqlQuery);
//     console.log(result)
//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });



app.get('/api/jobs_sdudents-stats', async (req, res) => {
  console.log("Jobs_students Stats API called");
  try {
    const sqlQuery = `
SELECT 
    hr_data.fullName AS hr_name,
    SUM(CASE WHEN jobs.status = 'drive-done' AND jobs.postedBy = hr_data.HRid THEN 1 ELSE 0 END) AS drives_done,
    COUNT(applied_students.candidateID) AS total_applications_received,
    COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END) AS not_eligible,
    
    COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END) AS profiles_sent,
    COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) AS not_attended,
    (COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END)) - COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END)  AS attended,
    COUNT(CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END) AS selected,
    COUNT( CASE WHEN applied_students.status = 'not-placed' THEN applied_students.candidateID END) AS rejected,
    ((COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END)) - COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END))
      - (COUNT( CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END)
      + COUNT( CASE WHEN applied_students.status = 'not-placed' THEN applied_students.candidateID END)) AS pending
FROM 
    hr_data
LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid
LEFT JOIN applied_students ON applied_students.jobID = jobs.jobId
GROUP BY 
    hr_data.fullName, hr_data.HRid
ORDER BY 
    hr_data.fullName;

    `;

    const result = await query(sqlQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// app.get('/api/hr-stats', async (req, res) => {
//   console.log("HRStats API called");
//   try {
//     const sqlQuery = `
//       SELECT
//           hr_data.fullName AS hr_name,
// jobs.postedOn,
//           COUNT(DISTINCT jobs.jobId) AS drives_conducted,
//           SUM(CASE WHEN jobs.status = 'jd-received' THEN 1 ELSE 0 END) AS selected,
//           SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS sent_profiles,
//           SUM(CASE WHEN jobs.status = 'drive-done' THEN 1 ELSE 0 END) AS attended,
//           SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS rejected,
//           SUM(CASE WHEN jobs.status = 'drive-scheduled' THEN 1 ELSE 0 END) AS in_progress,
//           SUM(CASE WHEN jobs.status = 'profiles-sent' THEN 1 ELSE 0 END) AS drives_pending
//       FROM
//           hr_data
//       LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid
//       GROUP BY
//           hr_data.fullName, jobs.postedOn
//       ORDER BY
//           hr_data.fullName DESC;
//     `;
//     const result = await query(sqlQuery);
//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });


// app.get('/api/domain-stats', async (req, res) => {
//   const domainOptions = [
//     "Python Full Stack", "Java Full Stack", "Mern Full Stack",
//     "Testing Tools", "Scrum Master", "Business Analyst",
//     "Data Science", "Cyber Security", "Cloud Data Engineer",
//     "AI & Data Science", "DevOps & Cloud Computing",
//     "Project Management & Agile", "SalesForce",
//     "Full Stack Development", "Medical Coding",
//     "Investment Banking", "BI Reporting Tools",
//     "Microsoft Dynamics", "Service Now"
//   ];

//   try {
//     // Create a temporary table for domains if it doesn't exist
//     await query(`
//           CREATE TEMPORARY TABLE IF NOT EXISTS temp_domains (
//               domain VARCHAR(255)
//           )
//       `);

//     // Clear the temporary table
//     await query('TRUNCATE TABLE temp_domains');

//     // Insert domains into temporary table
//     const insertDomainValues = domainOptions.map(domain => `('${domain}')`).join(',');
//     await query(`INSERT INTO temp_domains (domain) VALUES ${insertDomainValues}`);

//     const sqlQuery = `
//       SELECT 
//           td.domain,
//           COUNT(DISTINCT j.jobId) AS total_jobs_posted,
//           COUNT(DISTINCT CASE WHEN a.status = 'eligible' THEN a.candidateID END) AS profiles_sent,
//           COUNT(DISTINCT CASE WHEN a.status = 'eligible' THEN a.candidateID END) 
//               - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END) AS attended,
//           COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END) AS selected,
//           (COUNT(DISTINCT CASE WHEN a.status = 'eligible' THEN a.candidateID END) 
//               - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END)) 
//               - COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END) AS rejected,
//           (COUNT(DISTINCT CASE WHEN a.status = 'eligible' THEN a.candidateID END) 
//               - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END)) 
//               - ( 
//                   (COUNT(DISTINCT CASE WHEN a.status = 'eligible' THEN a.candidateID END) 
//                       - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END)) 
//                   - COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END)
//                   + COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END)
//               ) AS pending
//       FROM 
//           temp_domains td
//       LEFT JOIN 
//           jobs j ON JSON_CONTAINS(j.domains, JSON_QUOTE(td.domain))
//       LEFT JOIN 
//           applied_students a ON a.jobID = j.jobId
//       GROUP BY 
//           td.domain
//       ORDER BY 
//           total_jobs_posted DESC, td.domain
//   `;


//     const result = await query(sqlQuery);

//     // Drop the temporary table
//     await query('DROP TEMPORARY TABLE IF EXISTS temp_domains');

//     res.status(200).json(result);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server Error" });
//   }
// });


app.get('/api/domain-stats', async (req, res) => {
  const domainOptions = [
    "Python Full Stack", "Java Full Stack", "Mern Full Stack",
    "Testing Tools", "Scrum Master", "Business Analyst", "Dot Net",
    "Data Science", "Cyber Security", "Cloud Data Engineer",
    "DevOps & Cloud Computing",
    "Project Management & Agile", "SalesForce",
    "Medical Coding",
    "Investment Banking", "BI Reporting Tools",
    "Microsoft Dynamics", "Service Now"
  ];

  try {
    // Create a temporary table for domains if it doesn't exist
    await query(`
          CREATE TEMPORARY TABLE IF NOT EXISTS temp_domains (
              domain VARCHAR(255)
          )
      `);

    // Clear the temporary table
    await query('TRUNCATE TABLE temp_domains');

    // Insert domains into temporary table
    const insertDomainValues = domainOptions.map(domain => `('${domain}')`).join(',');
    await query(`INSERT INTO temp_domains (domain) VALUES ${insertDomainValues}`);

    const sqlQuery = `
SELECT 
    td.domain,
    COUNT(DISTINCT j.jobId) AS total_jobs_posted,
    COUNT(a.candidateID) AS total_students_applied,
    COUNT(DISTINCT CASE WHEN a.status = 'not-eligible' THEN a.candidateID END) AS not_eligible,
    COUNT(a.candidateID) - COUNT(DISTINCT CASE WHEN a.status = 'not-eligible' THEN a.candidateID END) AS profiles_sent,
    (COUNT(a.candidateID) - COUNT(DISTINCT CASE WHEN a.status = 'not-eligible' THEN a.candidateID END))
        - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END) AS attended,
    COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END) AS selected,
    COUNT(DISTINCT CASE WHEN a.status = 'not-placed' THEN a.candidateID END) AS rejected,
    
    -- Corrected 'pending' calculation
    (COUNT(a.candidateID) - COUNT(DISTINCT CASE WHEN a.status = 'not-eligible' THEN a.candidateID END))
        - COUNT(DISTINCT CASE WHEN a.status = 'not-attended' THEN a.candidateID END)
        - (COUNT(DISTINCT CASE WHEN a.status = 'placed' THEN a.candidateID END)
        + COUNT(DISTINCT CASE WHEN a.status = 'not-placed' THEN a.candidateID END)) AS pending,

    COUNT(DISTINCT CASE WHEN j.status IN ('drive-done', 'offer-received') THEN j.jobId END) AS drives_done
FROM 
    temp_domains td
LEFT JOIN 
    jobs j ON JSON_CONTAINS(j.domains, JSON_QUOTE(td.domain))
LEFT JOIN 
    applied_students a ON a.jobID = j.jobId
GROUP BY 
    td.domain
ORDER BY 
    total_jobs_posted DESC, td.domain;

    `;

    const result = await query(sqlQuery);

    // Drop the temporary table
    await query('DROP TEMPORARY TABLE IF EXISTS temp_domains');

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


// Endpoint to search data by column HallTicket
app.get('/api/search', (req, res) => {
  const query = req.query.query; // Get the search query from the URL parameter
  console.log(query);
  // Check if query is provided
  if (!query) {
    console.log("No search query found");
    return res.status(400).json({ error: 'No search query provided' });
  }

  // Get data from the "results" table
  const sqlQuery = 'SELECT * FROM results WHERE Mobile = ? and examstatus = "completed"';
  console.log(sqlQuery);
  db2.query(sqlQuery, [query], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    // Check if results were found
    if (results.length === 0) {
      console.log("No data found in results table")
      return res.status(404).json({ error: 'No data found in results table' });
    }

    const email = results[0].Email;

    // Get data from the "MeritResults" table
    const sqlMerit = 'SELECT * FROM meritresults WHERE Email = ?';
    db2.query(sqlMerit, [email], (err, meritResults) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      // Combine both results and return a single response
      res.status(200).json({
        resultsTable: results,
        meritResultsTable: meritResults,
      });
    });
  });
});



app.post('/api/toggle_block_hr/:HRid', async (req, res) => {
  const { HRid } = req.params;
  const { blockProfile } = req.body;

  try {
    await query('UPDATE hr_data SET blockProfile = ? WHERE HRid = ?', [blockProfile, HRid]);
    res.status(200).json({ message: `HR ${blockProfile ? "blocked" : "unblocked"} successfully.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.post('/api/toggle_block_intern/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  const { blockProfile } = req.body;

  try {
    await query('UPDATE intern_data SET blockProfile = ? WHERE candidateID = ?', [blockProfile, candidateID]);
    res.status(200).json({ message: `Intern ${blockProfile ? "blocked" : "unblocked"} successfully.` });
  } catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).json({ message: 'Error toggling block status.' });
  }
});


app.post('/api/toggle_block_guest/:candidateID', async (req, res) => {
  const { candidateID } = req.params;
  const { blockProfile } = req.body;

  try {
    await query('UPDATE guest_data SET blockProfile = ? WHERE guestID = ?', [blockProfile, candidateID]);
    res.status(200).json({ message: `Guest ${blockProfile ? "blocked" : "unblocked"} successfully.` });
  } catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).json({ message: 'Error toggling block status.' });
  }
});





app.get('/api/job-stats/:id', async (req, res) => {
  console.log("HRStats API called for job ID:", req.params.id);

  const jobId = req.params.id;  // Get the job ID from the request parameters
  
  try {
    // SQL query with parameterized jobId
    const sqlQuery = `
    SELECT 
      COUNT(applied_students.applicationID) AS Students_applied,
      SUM(CASE WHEN applied_students.status = 'eligible' THEN 1 ELSE 0 END) AS Profiles_Sent,
      SUM(CASE WHEN applied_students.status = 'placed' THEN 1 ELSE 0 END) AS Placed,
      SUM(CASE WHEN applied_students.status = 'not-placed' THEN 1 ELSE 0 END) AS Rejected,
      SUM(CASE WHEN applied_students.status = 'not-Attended' THEN 1 ELSE 0 END) AS Not_Attended,
      SUM(CASE WHEN applied_students.status = 'not-eligible' THEN 1 ELSE 0 END) AS Not_Eligible     
    FROM 
      applied_students 
    WHERE
      applied_students.jobID = ?
    GROUP BY 
      applied_students.jobID
    `;
    
    // Execute the query with the jobId parameter
    const result = await query(sqlQuery, [jobId]);
    console.log(result);
    // Return the result in the response
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});




app.get('/api/jobs_sdudents-stats', async (req, res) => {
  console.log("Jobs_students Stats API called");
  try {
    const sqlQuery = `
SELECT 
    hr_data.fullName AS hr_name,
    SUM(CASE WHEN jobs.status = 'drive-done' AND jobs.postedBy = hr_data.HRid THEN 1 ELSE 0 END) AS drives_done,
    COUNT(applied_students.candidateID) AS total_applications_received,
    COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END) AS not_eligible,
    
    COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END) AS profiles_sent,
    COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END) AS not_attended,
    (COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END)) - COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END)  AS attended,
    COUNT(CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END) AS selected,
    COUNT( CASE WHEN applied_students.status = 'not-placed' THEN applied_students.candidateID END) AS rejected,
    ((COUNT(applied_students.candidateID) - COUNT(CASE WHEN applied_students.status = 'not-eligible' THEN applied_students.candidateID END)) - COUNT(CASE WHEN applied_students.status = 'not-attended' THEN applied_students.candidateID END))
      - (COUNT( CASE WHEN applied_students.status = 'placed' THEN applied_students.candidateID END)
      + COUNT( CASE WHEN applied_students.status = 'not-placed' THEN applied_students.candidateID END)) AS pending
FROM 
    hr_data
LEFT JOIN jobs ON jobs.postedBy = hr_data.HRid
LEFT JOIN applied_students ON applied_students.jobID = jobs.jobId
GROUP BY 
    hr_data.fullName, hr_data.HRid
ORDER BY 
    hr_data.fullName;

    `;

    const result = await query(sqlQuery);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get('/api/hr-status/:HRid', async (req, res) => {
  const HRid = req.params.HRid; // Access HRid properly
  try {
    const [hr] = await query(`SELECT blockProfile FROM hr_data WHERE HRid = ?`, [HRid]); // Parameterized query to prevent SQL injection
    if (!hr) {
      return res.status(404).json({ message: 'HR not found' });
    }
    res.json({ blockProfile: hr.blockProfile });
  } catch (error) {
    console.error('Error fetching HR status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/intern-status/:internID', async (req, res) => {
  const internID = req.params.internID; // Access internID properly
  try {
    const [intern] = await query(`SELECT blockProfile FROM intern_data WHERE candidateID = ?`, [internID]); // Parameterized query
    console.log(intern);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json({ blockProfile: intern.blockProfile });
  } catch (error) {
    console.error('Error fetching intern status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/api/guest-status/:guestID', async (req, res) => {
  const guestID = req.params.guestID; // Access guestID properly
  try {
    const [guest] = await query(`SELECT blockProfile FROM guest_data WHERE guestID = ?`, [guestID]); // Parameterized query
    if (!guest) {
      return res.status(404).json({ message: 'Guest not found' });
    }
    res.json({ blockProfile: guest.blockProfile });
  } catch (error) {
    console.error('Error fetching guest status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/api/hr-list', async (req, res) => {
  try {
    const hrList = await query(`SELECT HRid, fullName FROM hr_data`); // Adjust query based on your database structure
    res.json(hrList);
  } catch (error) {
    console.error('Error fetching HR list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

