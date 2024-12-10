import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Grid, Card, CardContent, IconButton, Modal, Box, Typography, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import logo from "./images/image1.png";
import CEO_Signature from "./images/ramprasadsir_sign.png";
import Manager_Sign from './images/ravisir_sign.png'

import stamp from "./images/ramanasoft_stump.png";
import "./offerLetter.css";

import { Download } from '@mui/icons-material';
import Cookies from 'js-cookie';
import apiService from "../../../apiService";
const internID = Cookies.get("internID");

console.log(internID);




const CertificateGenerator = ({ certificateData }) => {
  console.log("certificateData :", certificateData);

  const certificateRef = useRef(null);

  const toCamelCase = (str) => {
    console.log('Input string:', str); // Debugging line
    if (typeof str !== 'string' || !str) {
      return str;
    }
  
    return str
      .split(' ')
      .map((word, index) => {
        if (index === 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };
  

  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };

  const generatePDF = () => {
    html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("Experience-Letter.pdf");
    });
  };

  return (
    <div className='Certificate_Generator' style={{ marginTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "10px" }}>
        <Typography>
          Your Experience Letter
        </Typography>

        <div className="button-container">
          <Button onClick={generatePDF}>
            <Download />
          </Button>
        </div>
      </div>
      <div ref={certificateRef} className="certificate">
        <img src={logo} alt="Company Logo" className="company-logo" />
        <p className="date">Date: {formatDate(certificateData.endDate)}</p>
        <h1>Experience Letter</h1>
        <div style={{ marginLeft: "37px" }}>Dear <strong>{toCamelCase(certificateData.studentName)}</strong>,</div>
        <div style={{ marginLeft: "37px" }}>
          Congratulations on your successful completion of <strong>Internship</strong> on
          <strong> {certificateData.domain}</strong> in our organization.
        </div>
        <div className="details">
          <p><strong>Position</strong>: {certificateData.position}</p>
          <p><strong>Certification Id</strong>: {certificateData.certificationId}</p>
          <p><strong>Duration</strong>: {formatDate(certificateData.startDate)} to {formatDate(certificateData.endDate)}</p>

        </div>
        <p>
          Your willingness to learn, adapt, showing sensitivity to urgency and
          involvement in the tasks assigned to you is appreciated by the entire
          Software Developer team. We are sure you will see success coming to
          you more easily with this approach.
        </p>
        <p>
          Besides showing high comprehension capacity, managing assignments with
          the utmost expertise, and exhibiting maximal efficiency, you have also
          maintained an outstanding professional demeanor and showcased
          excellent moral character throughout the traineeship period.
        </p>
        <div style={{ marginLeft: "37px" }} >
          We hereby certify your overall work as <strong>Good</strong> to the best of my
          knowledge.
          <br />
          Wishing you the best of luck in your future endeavors.
        </div>
        <img src={stamp} alt='CEO' style={{ width: "120px", height: "120px", marginLeft: "30px", marginTop: "40px" }} />
        <div className='signature-container'>
          <p className="ceo-signature">C.E.O</p>
          <p className="manager-signature">Program Manager</p>
        </div>
        <div className='signature-container2'>
          <img src={CEO_Signature} alt='CEO' style={{ width: "120px", height: "30px", marginLeft: "30px" }} />
          <img src={Manager_Sign} alt='Program_Manager' style={{ width: "120px", height: "40px", marginRight: "20px" }} />
        </div>
      </div>
    </div>
  );
};

const OfferLetter = ({ internDetails }) => {
  const certificateRef = useRef(null);
  console.log("internDetails :", internDetails);
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
  };


  const generatePDF = () => {
    html2canvas(certificateRef.current, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save("Offer-letter.pdf");
    });
  };


  return (
    <div className="certificate-generator">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "10px" }}>
        <Typography>
          Your Offer Letter
        </Typography>

        <div className="button-container">
          <Button onClick={generatePDF}>
            <Download />
          </Button>
        </div>
      </div>

      <div className="offerletter" ref={certificateRef} >
        <img src={logo} alt="Company Logo" className="company-logo" />

        <h1>Offer Letter</h1>
        <p style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-start", textAlign: "right" }}>{formatDate(internDetails.dateAccepted)}</p>
        <p>Dear <strong>{internDetails.fullName}</strong>,</p>
        <p style={{ textIndent: "20px" }}>
          We are delighted to offer you a <strong>3 months</strong> internship opportunity with our company. You will be joining us as a <strong>{internDetails.domain}</strong> intern, where you will have the chance to work on cutting-edge software solutions across various industries. We are confident that your time with us will be both educational and rewarding.
        </p>

        <p style={{ textIndent: "20px" }}>
          Throughout the duration of your internship, you will be an integral part of our team, working closely with developers, testers, and project managers. You will gain exposure to various stages of the software development lifecycle, including requirements gathering, design, coding, and testing.
        </p>
        <p>
          As an intern, you will have the opportunity to: <br />
          <div style={{ marginLeft: "20px" }}>
            •	Work with a variety of technologies and programming languages.<br />
            •	Learn and apply software development methodologies such as Agile and Waterfall.<br />
            •	Develop your coding and debugging skills.<br />
            •	Learn about software testing and quality assurance processes.<br />
            •	Collaborate with team members on projects and contribute to the development of software solutions.<br />
            •	Gain exposure to the software industry and network with professionals in the field.<br />
          </div>
        </p>
        <p>
          We believe this internship will provide a valuable opportunity to expand your skills, gain practical experience, and build your professional network. We look forward to welcoming you to our team and working with you.
        </p>

        <div className="company-info">
          <p>Sincerely,</p>
          <p>From <strong>RamanaSoft.</strong></p>
          <img src={stamp} alt="Company Stamp" className="stamp" style={{ width: "120px", height: "120px", marginLeft: "60px", }} />
          <div className="signature-container">
            <img src={CEO_Signature} alt="Authorized Signatory" className="signature" style={{ width: "120px", height: "30px", marginLeft: "60px" }} />
          </div>
        </div>
      </div>
    </div>
  );
};


const Achievements = () => {
  const [internDetails, setInternDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  const [certificateData, setCertificateData] = useState({ name: "", domain: "", position: "", CertificateID: "", startDate: "", endDate: "" });

  const domainPositions = {
    "Python Full Stack": "Full Stack Developer",
    "Java Full Stack": "Full Stack Developer",
    "Mern Full Stack": "Full Stack Developer",
    "Testing Tools": "Software Testing Engineer",
    "Scrum Master": "Scrum Master",
    "Businesses Analyst": "Business Analyst",
    "Data Science": "Data Science intern",
    "Cyber Security": "Cyber Security Analyst",
    "Dot Net": "Dot Net Intern"
  };

  useEffect(() => {
    const fetchInternDetails = async () => {
      try {
        const id = internID;
        if (!id) throw new Error("No intern ID found in cookies");

        const response = await apiService.get(`/api/intern_data/${id}`);
        const details = response.data[0];
        setInternDetails(details);

        // Check if the certificate should be unlocked
        const currentDate = new Date();
        const endDate = new Date(details.endDate);
        console.log(currentDate, endDate);
        setCertificateUnlocked(currentDate >= endDate);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching intern details:", error);
        setLoading(false);
      }
    };

    fetchInternDetails();
  }, []);



  const internID = Cookies.get("internID");

  useEffect(() => {
    const fetchOrGenerateCertificate = async () => {
      try {

        if (!internID) throw new Error("No intern ID found in cookies");

        const response = await apiService.get(`/api/show_certificate/${internID}`);

        if (response.status === 200 && response.data.certificate) {
          setCertificateData(response.data.certificate);
        }
        console.log(certificateData);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log("Certificate not found, generating a new one...");

          const internResponse = await apiService.get(`/api/intern_data/${internID}`);

          const intern = internResponse.data[0]
          console.log(intern);

          const month = new Date().getMonth() + 1;
          const monthString = month < 10 ? `0${month}` : `${month}`;
          const certIdResponse = await apiService.get(`/api/generate-certificate-id/${intern.domain}/${monthString}`);
          const newCertificationId = certIdResponse.data.newCertificationId;

          const newCertificateDetails = {
            internID: internID,
            studentName: intern.fullName,
            domain: intern.domain,
            position: domainPositions[intern.domain],
            certificationId: newCertificationId,
            startDate: intern.dateAccepted,
            endDate: intern.endDate,
          };
          console.log(newCertificateDetails);

          // Save new certificate
          const saveResponse = await apiService.post("/api/save_certificate_data", newCertificateDetails);
          if (saveResponse.status === 200) {
            setCertificateData(newCertificateDetails);
          }
        } else {
          console.error("Error fetching or generating certificate:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrGenerateCertificate();
  }, [internID]);


  const handleCardClick = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="container mt-5">
      <Grid container spacing={3}>
        {/* Offer Letter Card */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => handleCardClick("offer")}
            sx={{
              cursor: "pointer",
              backgroundColor: activeModal === "offer" ? "#d4edda" : "#ffffff",
              border: activeModal === "offer" ? "2px solid #28a745" : "1px solid #cccccc",
            }}
          >
            <CardContent>
              <IconButton>
                <LockOpenIcon sx={{ color: "#28a745" }} />
              </IconButton>
              <Typography variant="h6">Offer Letter</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Certificate Card */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => handleCardClick("certificate")}
            sx={{
              cursor: certificateUnlocked ? "pointer" : "not-allowed",
              backgroundColor: certificateUnlocked
                ? activeModal === "certificate"
                  ? "#d4edda"
                  : "#ffffff"
                : "#f8d7da",
              border: certificateUnlocked
                ? activeModal === "certificate"
                  ? "2px solid #28a745"
                  : "1px solid #cccccc"
                : "1px solid #dc3545",
            }}
          >
            <CardContent>
              <IconButton>
                {certificateUnlocked ? (
                  <LockOpenIcon sx={{ color: "#28a745" }} />
                ) : (
                  <LockIcon sx={{ color: "#dc3545" }} />
                )}
              </IconButton>
              <Typography variant="h6">Experience Letter</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modal */}
      <Modal
        open={Boolean(activeModal)}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: "90vw",
            maxWidth: 900,
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          {activeModal === "offer" && <OfferLetter internDetails={internDetails} />}
          {activeModal === "certificate" && (<CertificateGenerator certificateData={certificateData} />)}
        </Box>
      </Modal>
    </div>
  );
};

export default Achievements;

