import React, { useEffect, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import contact1 from '../images/contact1.jpg'
import './styling.css';
import { toast } from 'react-toastify';

import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fontSize } from '@mui/system';

const validationSchema = Yup.object({
  to_name: Yup.string()
    .required('Full Name is required')
    .min(5, 'Full Name must be at least 5 characters long')
    .max(30, 'Full Name must be at most 30 characters long')
    .matches(
      /^[A-Za-z]+ [A-Za-z]+$/,
      'Full Name must consist of a first name and a last name, separated by a space, and should contain only letters'
    ),
  from_name: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  message: Yup.string()
    .required('Message is required')
    .min(20, 'Message must be at least 10 characters long')
    .max(150, "Message Shouldn't exceed 150 charecters")
    ,
});


const Contact = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [formData, setFormData] = useState({
    to_name: '',
    from_name: '',
    message: '',
  });
  useEffect(()=>{
    window.scrollTo(0, 0);
 },[]);
 
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleScroll = () => {
    if (window.pageYOffset > 300) {
      setShowBackToTop(true);
    } else {
      setShowBackToTop(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const form = useRef();
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm('service_b8w3fbs', 'template_jwxga0b', form.current, 'IbKEkzMWeB4fDNBSj')
      .then(
        () => {
          toast.success("We got your message!, we'll get back to you.");
          setFormData({
            to_name: '',
            from_name: '',
            message: '',
          })
        },
        (error) => {
          toast.warning('FAILED...', error.text);
        },
      );
  };

  return (
    <div className='p-1'>

      <section className="branches mt-5">
        <div className="container">
          <h2 style={{color:"white", marginBottom:"50px"}}>Our Branches </h2>
          <div className="row mb-5 ">
            <div className="col-md-5 py-4" style={{color:"white"}}>
              <div className='contact-page-heading'>RamanaSoft Consulting Services</div>
              <p >
                Aditya Trade Center<br />
                404, fourth floor, <br />
                Ameerpet, Hyderabad<br />
                Telangana, India.
              </p>
              <p>
                <strong>Phone:</strong> 1800-2020-0344<br />
                <strong>Email:</strong> support@ramanasoft.com
              </p>
            </div>
            <div className="col-md-7">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d238.0516257759557!2d78.44636970361658!3d17.43667573157586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb90cf65909a77%3A0x711aa7f9600e3ad1!2sAditya%20Trade%20Center!5e0!3m2!1sen!2sus!4v1718983589638!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Location 1"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <section className='contact-form container'>
        <div className='mb-4 mt-3 d-flex align-items-center row'>
          <div className='form shadow rounded col-6'>
            <h2 className='text-center fw-bold' style={{color:"white"}}>Contact Us <i className="fa-solid fa-comment"></i></h2>
            <Formik
              initialValues={{
                to_name: '',
                from_name: '',
                message: '',
              }}
              validationSchema={validationSchema}
              onSubmit={sendEmail}
            >
              <Form id="contact-form">
                <div className="mb-3">
                  <label htmlFor="to_name" className="form-label fw-bold" style={{ color: "white", fontSize:"12px" }}>Full Name</label>
                  <Field
                    type="text"
                    name="to_name"
                    className="form-control"
                    style={{ border: "1px solid white", color: "white", background: "none" }}
                  />
                  <ErrorMessage name="to_name" component="div" style={{ color: 'red', fontSize:"12px", marginTop:"5px" }} />
                </div>
                <div className="mb-3">
                  <label htmlFor="from_name" className="form-label fw-bold" style={{ color: "white", fontSize:"12px" }}>Email Address</label>
                  <Field
                    type="email"
                    name="from_name"
                    className="form-control"
                    style={{ border: "1px solid white", color: "white", background: "none" }}
                  />
                  <ErrorMessage name="from_name" component="div" style={{ color: 'red', fontSize:"12px", marginTop:"5px" }} />
                </div>
                <div className="mb-3">
                  <label htmlFor="message" className="form-label fw-bold" style={{ color: "white" }}>Message</label>
                  <Field
                    as="textarea"
                    name="message"
                    className="form-control"
                    style={{ border: "1px solid white", color: "white", background: "none" }}
                    rows="3"
                  />
                  <ErrorMessage name="message" component="div" style={{ color: 'red', fontSize:"12px", marginTop:"5px" }} />
                </div>
                <div>
                  <button type="submit" className="btn px-4 fw-bold border shadow" style={{ color: "white" }}>
                    Submit <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
          <div className='col-6' style={{width:"50%"}}>
            <img className=' contact-call-image' height="400px" width="500px" src={contact1} alt=''/>
          </div>
        </div>
      </section>

      {showBackToTop && (
        <div className="back-to-top" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }} onClick={scrollToTop}>
          <button className='p-2 rounded btn btn-outline-dark' title='back to top'>
            <i className="fas fa-arrow-up text-warning fs-5"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Contact;

