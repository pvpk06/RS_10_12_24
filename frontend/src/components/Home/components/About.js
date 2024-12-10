import React, { useEffect, useState } from 'react'
import './styling.css';
import '../components/HomeStyles/about.css'
import CEO from '../images/CEO.png'
import proff from '../images/proff.jpg'
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Card, CardContent, Typography } from '@mui/material';

function Counter({ target, label }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => `${Math.round(latest)}+`);

  useEffect(() => {
    const animation = animate(count, target, { duration: 2 });
    return animation.stop;
  }, [count, target]);

  return (
    <div style={{ textAlign: "center", color: "white" }}>
      <motion.h1  className='about_counter_conts'>
        {rounded}
      </motion.h1>
      <p className='about_counter_label'>{label}</p>
    </div>
  );
}





const About = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };
  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const containerStyle = {
    display: 'flex',
    gap: '70px',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '100px'
  };

  const cardStyle = {
    height: '400px',
    width: '500px',
    backgroundColor: '#ffffff',
    padding: '20px'
  };

  const headerStyle = {
    fontWeight: 'bold',
    marginBottom: '16px'
  };

  const MotionTypography = motion(Typography);

  const textAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };


  return (
    <div className='container'>


      {/* <section style={{ display: "flex", justifyContent: "space-around", padding: "30px 0", color: "white" }}>
        <Counter target={600} label="Ramanasoft employees" />
        <Counter target={150} label="clients served till date" />
        <Counter target={100} label="healthy partnerships" />
      </section> */}

       <section className='d-flex justify-content-between text-light '>
        <Counter target={600} label="Ramanasoft employees" className='about_counter_conts' />
        <Counter target={150} label="clients served till date" />
        <Counter target={100} label="healthy partnerships" />
      </section>

      

      <section className="about ">
        <div className="code-ethics">

          {/* Corporate Profile Section */}
          <div className="sections">
            <div className="section-title " onClick={() => toggleSection('ethics')}>
              Corporate Profile
              <span className="toggle-icon">{openSection === 'ethics' ? '-' : '+'}</span>
            </div>
            <div className={`section-content col-12 ${openSection === 'ethics' ? 'open' : ''}`}>
              Ramanasoft is an IT software company, founded in 2022, and it is a pioneering company about being one of the prominent software companies that operates with a specialized consulting service and a suite of software products for leading multinational corporations globally. Its time in establishing it was strongly based on technical strength with a customer-centric approach driving innovation that has delivered quality solutions to businesses all across the globe.
            </div>
          </div>

          {/* About the Company Section */}
          <div className="section">
            <div className="section-title" onClick={() => toggleSection('Inclusion')}>
              About the Company
              <span className="toggle-icon">{openSection === 'Inclusion' ? '-' : '+'}</span>
            </div>
            <div className={`section-content col-12 ${openSection === 'Inclusion' ? 'open' : ''}`}>
              Ramanasoft offers consultancy and software services upscaled with innovation to leading-edge, scalable, and adaptable solutions to meet the ever-changing needs of the modern business scenario. Our CEO, Mr. Ram Prasad, has led Ramanasoft to achieve success in developing leading-edge software and consultancy services to make operations more streamlined, boost productivity, and facilitate digital transformation.
            </div>
          </div>

          {/* Our Services Section */}
          <div className="section">
            <div className="section-title" onClick={() => toggleSection('Responsible')}>
              Our Services
              <span className="toggle-icon">{openSection === 'Responsible' ? '-' : '+'}</span>
            </div>
            <div className={`section-content ${openSection === 'Responsible' ? 'open' : ''}`}>
              <ul>
                <li>Custom Software Development</li>
                <li>IT Consulting</li>
                <li>Cloud Solutions</li>
                <li>Generative AI Services</li>
                <li>Data Analytics</li>
                <li>Cybersecurity Services</li>
                <li>Digital Transformation</li>
              </ul>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="section" style={{ paddingBottom: "14px", borderBottom: "1px solid #716868" }}>
            <div className="section-title" onClick={() => toggleSection('workforce')}>
              Why Choose Us?
              <span className="toggle-icon">{openSection === 'workforce' ? '-' : '+'}</span>
            </div>
            <div className={`section-content ${openSection === 'workforce' ? 'open' : ''}`}>
              <ul>
                <li>
                  <strong>Guaranteed Experience:</strong> Our diverse skill set across the team ensures that we deliver outcome-based solutions to businesses of all sizes.
                </li>
                <li>
                  <strong>Tailored Solution:</strong> We first understand your business needs and then customize our offerings based on the requirements.
                </li>
                <li>
                  <strong>Client-centric Approach:</strong> We offer exceptional support and ensure client satisfaction at every step building long-lasting relationships.
                </li>
                <li>
                  <strong>Innovation:</strong> Solutions designed to be future-proof, integrating the latest technologies for scalable outcomes.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* <section style={{ padding: "20px", margin: "20px", width: "97%", height: "600px", backgroundColor: "white" }}>
        <div>
          <img src={proff} alt='' width="500px" height="500px" style={{ borderRadius: "8px" }} />
        </div>

        <div>
          WE LOVE TO INNOVATE.
        </div>
      </section> */}

      {/* <section style={{
        padding: "20px",
        margin: "20px",
        width: "97%",
        height: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "none",
        borderRadius: "12px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
      }}>
       
        <div style={{
          flex: "1",
          display: "flex",
          justifyContent: "center"
        }}>
          <img
            src={proff}
            alt="Innovation"
            width="700px"
            height="500px"
          />
        </div>
        <div style={{
          flex: "1",
          textAlign: "center",
          fontSize: "1em",
          fontWeight: "bold",
          color: "#333",
          position: "relative"
        }}>
          <h1 style={{
            color: "#fff",
            textShadow: "3px 3px 5px rgba(0, 0, 0, 0.2), -3px -3px 5px rgba(0, 0, 0, 0.2)",
            animation: "fade-in 2s ease-in-out, scale-up 1.5s ease-in-out",
            fontSize: "2.3em"
          }}>
            Pioneering tomorrow’s tech, today.
          </h1>
        </div> */}


      {/* <style jsx>{` */}
      {/* /* Slight Scale-Up Animation for Text */}
      {/* @keyframes scale-up { */}
      {/* 0% { */}
      {/* // transform: scale(0.95); */}
      {/* } */}
      {/* 100% { */}
      {/* transform: scale(1); */}
      {/* } */}
      {/* } */}
      {/* `}</style> */}
      {/* </section> */}


      <section className=' row sec-img' >
        <div className='col-12 col-md-6 col-lg-6 '>
  
          <img
            src={proff}
            alt="Innovation"
            className='img-fluid'
      
          />
  
        </div>
        <div className='col-12 col-md-6 col-lg-6 text-light text-center' >
          <h1  style={{
            color: "#fff",
            textShadow: "3px 3px 5px rgba(0, 0, 0, 0.2), -3px -3px 5px rgba(0, 0, 0, 0.2)",
            animation: "fade-in 2s ease-in-out, scale-up 1.5s ease-in-out",
            fontSize: "2.3em"
          }}>
            Pioneering tomorrow’s tech, today.
          </h1>
        </div> 


      </section>

      {/* <section style={{ padding: "100px 40px", color: "white" }}>
        <div className="d-flex flex-column align-items-start">
          <h1 style={{ fontSize: "2.5em", lineHeight: "1.2" }}>
            <span style={{ fontSize: "2.7em", display: "inline-block", marginRight: "10px" }}>We</span>
            offer consulting and software services upscaled with innovation, delivering scalable, adaptable solutions to meet modern business needs.
          </h1>
        </div>
      </section> */}

      <section className='abt '>
        <div className="d-flex flex-column align-items-start">
          <h1 >
            <span >We</span>
            offer consulting and software services upscaled with innovation, delivering scalable, adaptable solutions to meet modern business needs.
          </h1>
        </div>
      </section>



      <section>
        <div className='row '>
          <div className='col-12 col-md-6 col-lg-6'>
            <Card className='w-100 h-100'>
              <CardContent>
                <MotionTypography
                  variant="h5"
                  style={headerStyle}
                  {...textAnimation}
                >
                  OUR MISSION & VISION
                </MotionTypography>
                <MotionTypography
                  variant="body1"
                  style={{ marginBottom: '20px' }}
                  {...textAnimation}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  At Ramanasoft, we believe in providing the best consultancy and software solutions to help businesses become better, overcome challenges, achieve operational excellence, and grow more sustainably. We strive to be a trusted business partner delivering value through innovation, advanced technology, and a focus on client success.
                </MotionTypography>
                <MotionTypography
                  variant="body1"
                  style={{ marginTop: '20px' }}
                  {...textAnimation}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  We view ourselves as a software consultancy and product provider at a world level synonymous with quality, reliability, and transformation.
                </MotionTypography>
              </CardContent>
            </Card>
          </div>
          <div className='col-12 col-md-6 col-lg-6'>
            <Card className='w-100 h-100'>
              <CardContent>
                <MotionTypography
                  variant="h5"
                  style={headerStyle}
                  {...textAnimation}
                >
                  OUR TEAM
                </MotionTypography>
                <MotionTypography
                  variant="body1"
                  style={{ marginBottom: '20px' }}
                  {...textAnimation}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  At Ramanasoft, we feel proud to be working with a dynamic team of professionals, each an expert in their field. Consultants, engineers, data analysts, and security experts work together in software development to produce innovative and high-quality solutions that benefit clients.
                </MotionTypography>
                <MotionTypography
                  variant="body1"
                  style={{ marginTop: '20px' }}
                  {...textAnimation}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  Our CEO, Ram Prasad, leads us with excellent management, keeping our energy high and our focus constant on our core values: excellence, reliability, and pleasing our clients.
                </MotionTypography>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* <section style={{ padding: "20px" }}>
        <div className='d-flex' style={{ width: "100%" }}>
          <img src={CEO} alt="CEO" width="420px" height="560px" style={{ borderRadius: "8px" }} />
          <div className="d-flex flex-column justify-content-center" style={{ marginLeft: "40px", color: "#FFF", flex: "1" }}>
            <h5 style={{ fontSize: "30px", alignItems: "center", fontWeight: "bold", lineHeight: "1.3" }}>
              "Innovation is the heartbeat of progress —
              To keep pace with a rapidly evolving world, we must empower minds with the skills to not only adapt but to lead. To thrive, harness the power of data and AI, fostering agility and building pathways to sustainable growth."
            </h5>
            <div className='mt-2'>
              - Ramprasad/Chairman & CEO
            </div>
          </div>
        </div>
      </section> */}

      <section >
        <div className='row mt-5 '>
          <div className='col-12 col-md-6 col-lg-6 text-center'>
            <img src={CEO} alt="CEO" className='ceo-img img-fluid'  />
          </div>
          <div className="col-12 col-md-6 col-lg-6 d-flex justify-content-center align-items-center" >
            <div className='text-start ms-2 ceo_abt text-start  '>
            <h5 className='text-light  ' >
              "Innovation is the heartbeat of progress —
              To keep pace with a rapidly evolving world, we must empower minds with the skills to not only adapt but to lead. To thrive, harness the power of data and AI, fostering agility and building pathways to sustainable growth."
            </h5>
            <div className='mt-2 text-light ms-5'>
              - Ram Prasad <small>CEO</small>
            </div>
            </div>
           
          </div>
         
        </div>
        
  
      
      </section>

      {/* 
      {showBackToTop && (
        <div className="back-to-top" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }} onClick={scrollToTop}>
          <button className='p-2 rounded  btn btn-outline-dark' title='back to top'>
            <i className="fas fa-arrow-up  text-warning fs-5"></i>
          </button>
        </div>
      )} */}
    </div>
  )
}

export default About



// import React, { useEffect, useState } from 'react'
// import './styling.css';
// import '../components/HomeStyles/about.css'
// import CEO from '../images/CEO.png'
// import proff from '../images/proff.jpg'
// import { motion, useMotionValue, useTransform, animate } from "framer-motion";
// import { Card, CardContent, Typography } from '@mui/material';

// function Counter({ target, label }) {
//   const count = useMotionValue(0);
//   const rounded = useTransform(count, (latest) => `${Math.round(latest)}+`);

//   useEffect(() => {
//     const animation = animate(count, target, { duration: 2 });
//     return animation.stop;
//   }, [count, target]);

//   return (
//     <div style={{ textAlign: "center", color: "white" }}>
//       <motion.h1 style={{ fontSize: "2.5em", margin: "0", fontWeight: "bold" }}>
//         {rounded}
//       </motion.h1>
//       <p style={{ fontSize: "1em", opacity: 0.8 }}>{label}</p>
//     </div>
//   );
// }





// const About = () => {
//   const [showMenu, setShowMenu] = useState(false);
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   const [openSection, setOpenSection] = useState(null);

//   const toggleSection = (section) => {
//     setOpenSection(openSection === section ? null : section);
//   };
//   // useEffect(() => {
//   //   window.scrollTo(0, 0);
//   // }, []);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   const containerStyle = {
//     display: 'flex',
//     gap: '70px',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: '100px'
//   };

//   const cardStyle = {
//     height: '400px',
//     width: '500px',
//     backgroundColor: '#ffffff',
//     padding: '20px'
//   };

//   const headerStyle = {
//     fontWeight: 'bold',
//     marginBottom: '16px'
//   };

//   const MotionTypography = motion(Typography);

//   const textAnimation = {
//     initial: { opacity: 0, y: 20 },
//     animate: { opacity: 1, y: 0 },
//     transition: { duration: 0.5, ease: "easeOut" }
//   };


//   return (
//     <div>


//       <section style={{ display: "flex", justifyContent: "space-around", padding: "30px 0", color: "white" }}>
//         <Counter target={600} label="Ramanasoft employees" />
//         <Counter target={150} label="clients served till date" />
//         <Counter target={100} label="healthy partnerships" />
//       </section>

//       <section className="about">
//         <div className="code-ethics">

//           {/* Corporate Profile Section */}
//           <div className="section">
//             <div className="section-title" onClick={() => toggleSection('ethics')}>
//               Corporate Profile
//               <span className="toggle-icon">{openSection === 'ethics' ? '-' : '+'}</span>
//             </div>
//             <div className={`section-content col-6 ${openSection === 'ethics' ? 'open' : ''}`}>
//               Ramanasoft is an IT software company, founded in 2022, and it is a pioneering company about being one of the prominent software companies that operates with a specialized consulting service and a suite of software products for leading multinational corporations globally. Its time in establishing it was strongly based on technical strength with a customer-centric approach driving innovation that has delivered quality solutions to businesses all across the globe.
//             </div>
//           </div>

//           {/* About the Company Section */}
//           <div className="section">
//             <div className="section-title" onClick={() => toggleSection('Inclusion')}>
//               About the Company
//               <span className="toggle-icon">{openSection === 'Inclusion' ? '-' : '+'}</span>
//             </div>
//             <div className={`section-content col-6 ${openSection === 'Inclusion' ? 'open' : ''}`}>
//               Ramanasoft offers consultancy and software services upscaled with innovation to leading-edge, scalable, and adaptable solutions to meet the ever-changing needs of the modern business scenario. Our CEO, Mr. Ram Prasad, has led Ramanasoft to achieve success in developing leading-edge software and consultancy services to make operations more streamlined, boost productivity, and facilitate digital transformation.
//             </div>
//           </div>

//           {/* Our Services Section */}
//           <div className="section">
//             <div className="section-title" onClick={() => toggleSection('Responsible')}>
//               Our Services
//               <span className="toggle-icon">{openSection === 'Responsible' ? '-' : '+'}</span>
//             </div>
//             <div className={`section-content ${openSection === 'Responsible' ? 'open' : ''}`}>
//               <ul>
//                 <li>Custom Software Development</li>
//                 <li>IT Consulting</li>
//                 <li>Cloud Solutions</li>
//                 <li>Generative AI Services</li>
//                 <li>Data Analytics</li>
//                 <li>Cybersecurity Services</li>
//                 <li>Digital Transformation</li>
//               </ul>
//             </div>
//           </div>

//           {/* Why Choose Us Section */}
//           <div className="section" style={{ paddingBottom: "14px", borderBottom: "1px solid #716868" }}>
//             <div className="section-title" onClick={() => toggleSection('workforce')}>
//               Why Choose Us?
//               <span className="toggle-icon">{openSection === 'workforce' ? '-' : '+'}</span>
//             </div>
//             <div className={`section-content ${openSection === 'workforce' ? 'open' : ''}`}>
//               <ul>
//                 <li>
//                   <strong>Guaranteed Experience:</strong> Our diverse skill set across the team ensures that we deliver outcome-based solutions to businesses of all sizes.
//                 </li>
//                 <li>
//                   <strong>Tailored Solution:</strong> We first understand your business needs and then customize our offerings based on the requirements.
//                 </li>
//                 <li>
//                   <strong>Client-centric Approach:</strong> We offer exceptional support and ensure client satisfaction at every step building long-lasting relationships.
//                 </li>
//                 <li>
//                   <strong>Innovation:</strong> Solutions designed to be future-proof, integrating the latest technologies for scalable outcomes.
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* <section style={{ padding: "20px", margin: "20px", width: "97%", height: "600px", backgroundColor: "white" }}>
//         <div>
//           <img src={proff} alt='' width="500px" height="500px" style={{ borderRadius: "8px" }} />
//         </div>

//         <div>
//           WE LOVE TO INNOVATE.
//         </div>
//       </section> */}

//       <section style={{
//         padding: "20px",
//         margin: "20px",
//         width: "97%",
//         height: "auto",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         backgroundColor: "none",
//         borderRadius: "12px",
//         boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
//       }}>
//         <div style={{
//           flex: "1",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center"
//         }}>
//           <img
//             src={proff}
//             className='proff-image'
//             alt="Innovation"
//           />

//           <div style={{
//             flex: "1",
//             textAlign: "center",
//             fontSize: "1em",
//             fontWeight: "bold",
//             color: "#333",
//             position: "relative"
//           }}>
//             <h1 style={{
//               color: "#fff",
//               textShadow: "3px 3px 5px rgba(0, 0, 0, 0.2), -3px -3px 5px rgba(0, 0, 0, 0.2)",
//               animation: "fade-in 2s ease-in-out, scale-up 1.5s ease-in-out",
//               fontSize: "2.3em"
//             }}>
//               Pioneering tomorrow’s tech, today.
//             </h1>
//           </div>
//         </div>
//         {/* Keyframe Styles */}
//         <style jsx>{`
//     .proff-image {
//       width: 100%;
//       height: auto;
//       object-fit: cover;
//       max-width: 700px; /* Base max size for larger screens */
//     }

//     .responsive-section {
//       display: flex;
//     }

//     @media (max-width: 768px) {
//       .responsive-section {
//         display: block; /* Stacks items vertically on smaller screens */
//         text-align: center;
//       }

//       .proff-image {
//         max-width: 80%;
//       }
      
//       h1 {
//         font-size: 1.8em;
//         padding: 0.5em;
//       }
//     }

//     @media (max-width: 480px) {
//       .proff-image {
//         max-width: 100%;
//       }

//       h1 {
//         font-size: 1.5em;
//         padding: 0.5em;
//       }
//     }

//     /* Slight Scale-Up Animation for Text */
//     @keyframes scale-up {
//       0% {
//         transform: scale(0.95);
//       }
//       100% {
//         transform: scale(1);
//       }
//     }
//   `}</style>
//       </section>


//       <section style={{ padding: "100px 40px", color: "white" }}>
//         <div className="d-flex flex-column align-items-start">
//           <h1 style={{ fontSize: "2.5em", lineHeight: "1.2" }}>
//             <span style={{ fontSize: "2.7em", display: "inline-block", marginRight: "10px" }}>We</span>
//             offer consulting and software services upscaled with innovation, delivering scalable, adaptable solutions to meet modern business needs.
//           </h1>
//         </div>
//       </section>



//       <section>
//         <div style={containerStyle}>
//           <Card style={cardStyle}>
//             <CardContent>
//               <MotionTypography
//                 variant="h5"
//                 style={headerStyle}
//                 {...textAnimation}
//               >
//                 OUR MISSION & VISION
//               </MotionTypography>
//               <MotionTypography
//                 variant="body1"
//                 style={{ marginBottom: '20px' }}
//                 {...textAnimation}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//               >
//                 At Ramanasoft, we believe in providing the best consultancy and software solutions to help businesses become better, overcome challenges, achieve operational excellence, and grow more sustainably. We strive to be a trusted business partner delivering value through innovation, advanced technology, and a focus on client success.
//               </MotionTypography>
//               <MotionTypography
//                 variant="body1"
//                 {...textAnimation}
//                 transition={{ delay: 0.4, duration: 0.5 }}
//               >
//                 We view ourselves as a software consultancy and product provider at a world level synonymous with quality, reliability, and transformation.
//               </MotionTypography>
//             </CardContent>
//           </Card>

//           <Card style={cardStyle}>
//             <CardContent>
//               <MotionTypography
//                 variant="h5"
//                 style={headerStyle}
//                 {...textAnimation}
//               >
//                 OUR TEAM
//               </MotionTypography>
//               <MotionTypography
//                 variant="body1"
//                 {...textAnimation}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//               >
//                 At Ramanasoft, we feel proud to be working with a dynamic team of professionals, each an expert in their field. Consultants, engineers, data analysts, and security experts work together in software development to produce innovative and high-quality solutions that benefit clients.
//               </MotionTypography>
//               <MotionTypography
//                 variant="body1"
//                 style={{ marginTop: '20px' }}
//                 {...textAnimation}
//                 transition={{ delay: 0.4, duration: 0.5 }}
//               >
//                 Our CEO, Ram Prasad, leads us with excellent management, keeping our energy high and our focus constant on our core values: excellence, reliability, and pleasing our clients.
//               </MotionTypography>
//             </CardContent>
//           </Card>
//         </div>
//       </section>

//       {/* <section style={{ padding: "20px" }}>
//         <div className='d-flex' style={{ width: "100%" }}>
//           <img src={CEO} alt="CEO" width="420px" height="560px" style={{ borderRadius: "8px" }} />
//           <div className="d-flex flex-column justify-content-center" style={{ marginLeft: "40px", color: "#FFF", flex: "1" }}>
//             <h5 style={{ fontSize: "30px", alignItems: "center", fontWeight: "bold", lineHeight: "1.3" }}>
//               "Innovation is the heartbeat of progress —
//               To keep pace with a rapidly evolving world, we must empower minds with the skills to not only adapt but to lead. To thrive, harness the power of data and AI, fostering agility and building pathways to sustainable growth."
//             </h5>
//             <div className='mt-2'>
//               - Ramprasad/Chairman & CEO
//             </div>
//           </div>
//         </div>
//       </section> */}

// <section style={{ padding: "20px" }} className="ceo-section">
//   <div className="ceo-content d-flex" style={{ width: "100%" }}>
//     <img
//       src={CEO}
//       alt="CEO"
//       className="ceo-image"
//       style={{ borderRadius: "8px" }}
//     />
//     <div className="ceo-text d-flex flex-column justify-content-center" style={{ marginLeft: "40px", color: "#FFF", flex: "1" }}>
//       <h5 style={{ fontSize: "30px", alignItems: "center", fontWeight: "bold", lineHeight: "1.3" }}>
//         "Innovation is the heartbeat of progress — To keep pace with a rapidly evolving world, we must empower minds with the skills to not only adapt but to lead. To thrive, harness the power of data and AI, fostering agility and building pathways to sustainable growth."
//       </h5>
//       <div className="mt-2">
//         - Ramprasad/Chairman & CEO
//       </div>
//     </div>
//   </div>

//   <style jsx>{`
//     .ceo-image {
//       width: 420px;
//       height: auto;
//     }

//     @media (max-width: 768px) {
//       .ceo-content {
//         display: block;
//         text-align: center;
//       }
      
//       .ceo-image {
//         width: 80%; /* Adjust width for smaller screens */
//         margin: 0 auto;
//       }

//       .ceo-text {
//         margin-left: 0;
//         margin-top: 20px;
//       }

//       h5 {
//         font-size: 24px; /* Slightly smaller font for smaller screens */
//         padding: 0 1em;
//       }
//     }

//     @media (max-width: 480px) {
//       .ceo-image {
//         width: 100%; /* Full width on extra-small screens */
//       }

//       h5 {
//         font-size: 20px; /* Further reduce font size for better readability */
//         padding: 0 1em;
//       }
//     }
//   `}</style>
// </section>

//       {/* 
//       {showBackToTop && (
//         <div className="back-to-top" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }} onClick={scrollToTop}>
//           <button className='p-2 rounded  btn btn-outline-dark' title='back to top'>
//             <i className="fas fa-arrow-up  text-warning fs-5"></i>
//           </button>
//         </div>
//       )} */}
//     </div>
//   )
// }

// export default About

