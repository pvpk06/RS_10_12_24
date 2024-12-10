import { useState, useEffect } from 'react';
import '../components/HomeStyles/Footer.css'
import { Link } from 'react-router-dom'
const Footer = () => {
    const letters = ['R', 'A', 'M', 'A', 'N', 'A', 'S', 'O', 'F', 'T'];
    const [activeIndexes, setActiveIndexes] = useState([]);

    const handleMouseEnter = () => {
        setActiveIndexes(letters.map((_, index) => index));
    };

    const handleMouseLeave = () => {
        // When mouse leaves the container, deactivate all the letters.
        setActiveIndexes([]);
    };

    useEffect(() => {
        const timeouts = letters.map((_, index) =>
            setTimeout(() => {
                setActiveIndexes((prev) => [...prev, index]);
            }, 750 * (index + 1))
        );

        return () => timeouts.forEach((timeout) => clearTimeout(timeout));
    }, [letters.length]);

    return (
        <div style={{ width: '100%', height: 'auto', marginTop: "50px", backgroundColor: 'black', color: 'white', fontWeight: "bold" }}>
            <div className='container'>
                <div className='row py-3 row-gap-4'>
                    <div className='col-6 col-md-6 col-lg-2'>
                        <div className='mb-3 footer-link' style={{ color: "#999999" }}><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/jobs">Careers</Link></div>
                        <div className='mb-3 footer-link' style={{ color: "#999999" }}><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/about">About Us</Link></div>
                        <div className='mb-3 footer-link' style={{ color: "#999999" }}><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/contact">Contact Us</Link></div>
                        <div className='mb-3 footer-link' style={{ color: "#999999" }}><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} >Locations</Link></div>
                    </div>
                    <div className='col-6 col-md-6 col-lg-2'>
                        <div className='mb-3 footer-link'><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/privacy-policy">Privacy Statement</Link></div>
                        <div className='mb-3 footer-link'><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/security">Terms & Conditions</Link></div>
                        <div className='mb-3 footer-link'><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/cookies">Cookie Policy</Link></div>
                        <div className='mb-3 footer-link'><Link style={{ color: "#999999", cursor: "pointer", textDecoration: "none" }} to="/accessibility">Accessibility</Link></div>
                    </div>
                    <div className='col-12 col-md-12 col-lg-8' style={{color:"#fff"}}>
                        <div className='d-flex justify-content-center align-items-center'>
                            <div className="logo-container">
                                <div>
                                    <div
                                        className="word"
                                        style={{color:"white"}}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                    >
                                        {letters.map((letter, index) => (
                                            <span
                                                key={index}
                                                className={activeIndexes.includes(index) ? `active nth-child-${index + 1}` : ''}
                                                style={{ animationDelay: `${index * 0.1}s` }}
                                            >
                                                {letter}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="subtitle text-end" style={{color:"rgba(163,156,156,52%)"}}>Consulting Services</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='footer-rights-text col pb-5'>
                        ©2024 RamanaSoft. All rights reserved.
                    </div>
                </div>
            </div>
        </div>
        
    );
};

export default Footer;


// import { useState, useEffect } from 'react';

// const Footer = () => {
//     const letters = ['R', 'A', 'M', 'A', 'N', 'A', 'S', 'O', 'F', 'T'];
//     const [activeIndexes, setActiveIndexes] = useState([]);

//     // const handleMouseEnter = (index) => {
//     //     setActiveIndexes((prev) => [...prev, index]);
//     // };

//     // const handleMouseLeave = (index) => {
//     //     setActiveIndexes((prev) => prev.filter((i) => i !== index));
//     // };

//     const handleMouseEnter = () => {
//         // When hovering over the container, activate all the letters.
//         setActiveIndexes(letters.map((_, index) => index));
//     };

//     const handleMouseLeave = () => {
//         // When mouse leaves the container, deactivate all the letters.
//         setActiveIndexes([]);
//     };


//     useEffect(() => {
//         const timeouts = letters.map((_, index) =>
//             setTimeout(() => {
//                 setActiveIndexes((prev) => [...prev, index]);
//             }, 750 * (index + 1))
//         );

//         return () => timeouts.forEach((timeout) => clearTimeout(timeout));
//     }, [letters.length]);

//     return (
//         <div style={{ width: '100%', height: '300px', marginTop: "50px", backgroundColor: 'black', color: 'white' }}>
//             <div className='container'>
//                 <div className='row py-3'>
//                     <div className='col-2'>
//                         <div className='mb-3'>Preference Center</div>
//                         <div className='mb-3'>Careers</div>
//                         <div className='mb-3'>About Us</div>
//                         <div className='mb-3'>Contact Us</div>
//                         <div className='mb-3'>Locations</div>
//                     </div>
//                     <div className='col-2'>
//                         <div className='mb-3'>Privacy Statement</div>
//                         <div className='mb-3'>Terms & Conditions</div>
//                         <div className='mb-3'>Cookie Policy/Settings</div>
//                         <div>Accessibility Statement</div>
//                     </div>
//                     <div className='col d-flex justify-content-center align-items-center'>
//                         <div className="logo-container">
//                             {/* <div className="logo-text">
//                                 {letters.split('').map((letter, index) => (
//                                     <span
//                                         key={index}
//                                         className={`letter ${letter === 'A' && index === 4 ? 'A' : ''} ${hoveredIndex === index ? 'hovered' : ''}`}
//                                         onMouseEnter={() => handleMouseEnter(index)}
//                                         onMouseLeave={handleMouseLeave}
//                                         style={{ animationDelay: `${index * 0.1}s` }}
//                                     >
//                                         {letter}
//                                     </span>
//                                 ))}
//                             </div> */}
//                             <div>
//                                 <div
//                                 className="word"
//                                 onMouseEnter={handleMouseEnter}
//                                 onMouseLeave={handleMouseLeave}

//                                 >
//                                     {letters.map((letter, index) => (
//                                         <span
//                                             key={index}
//                                             className={activeIndexes.includes(index) ? `active nth-child-${index + 1}` : ''}
//                                             onMouseEnter={() => handleMouseEnter(index)}
//                                             onMouseLeave={() => handleMouseLeave(index)}
//                                             style={{ animationDelay: `${index * 0.1}s` }}
//                                         >
//                                             {letter}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="subtitle text-end">Consulting Services</div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className='row'>
//                     <div className='col'>
//                         ©2024 RamanaSoft. All rights reserved.
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Footer;
