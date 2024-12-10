import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { InputAdornment, Button, Menu, MenuItem, IconButton, TextField } from '@mui/material';
import ramana from '../images/p3.png';

import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { FaInfo, FaPhone } from 'react-icons/fa';
import { BsBriefcaseFill } from 'react-icons/bs';
import { MdOutlineContactSupport } from "react-icons/md";
import { HiInformationCircle } from "react-icons/hi";

import img1 from '../images/Carousel/img1.jpg'
import img2 from '../images/Carousel/img2.jpg'
import img3 from '../images/Carousel/img3.jpg'
import img4 from '../images/Carousel/img4.jpg'
import img5 from '../images/Carousel/img5.jpg'
import img6 from '../images/Carousel/img6.jpg'
import img7 from '../images/Carousel/img7.jpg'

import ilovehr from "../images/projects/ilovehr.jpg";
import ecommerce from "../images/projects/ecommerce.jpg";
import quantaspeach from "../images/projects/quantaspeach.jpg";
import vehicleinsurance from "../images/projects/vehicleinsurance.jpg";
import homeinsurance from "../images/projects/homeinsurance.jpg";
import ticketbooking from "../images/projects/ticketbooking.jpg";
import marriageverse from "../images/projects/marriageverse.jpg";
import robomock from "../images/projects/robomock.jpg";
import qtnext from "../images/projects/qtnext.jpg";
import saythu from "../images/projects/saythu.jpg";

import About from './About';
import Contact from './Contact';
import SuperAdminLogin from './SALogin';
import OtpService from './OtpService';
import InternRegistration from '../../register/intern_Reg/intern_reg';
import HRRegistration from '../../register/hr_Reg/hr_register';
import GuestRegistration from '../../register/guest_Reg/guest_reg';
import ViewJobs from './Jobs';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import PageNotFound from '../../pageNotFound';
import '../components/HomeStyles/logo1.css'
import '../components/HomeStyles/Carousel.css'
import '../components/HomeStyles/text_section.css'
import '../components/HomeStyles/works.css'
import Footer from './Footer';





const NetworkBackground = () => {
  const canvasRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const numDots = 100; // Adjust the number of dots as needed


  const [isMobile, setIsMobile] = useState(false);

  // Detect if the screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 565); // Adjust breakpoint as needed
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize); // Add resize listener
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize dots with random positions and velocities
    const dots = Array.from({ length: numDots }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 2 + 1,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update each dot's position and draw it
      dots.forEach(dot => {
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Bounce dots off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#a6b0cf";
        ctx.fill();
      });

      // Draw lines between close dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.strokeStyle = `rgba(166, 176, 207, ${hovered ? 0.3 : 0.1})`; // Increase opacity on hover
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup function to stop animation and resize listener
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [hovered, numDots]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: !isMobile ? "50vh" : "35vh", alignItems:"center",  overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <section className="text-section">
        <h1 className="text-1">Where Innovation and Industry meet...</h1>
      </section>
      <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
};

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Function to go to the next slide
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === slides.length - 1 ? 0 : prevIndex + 1));
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1));
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying((prevState) => !prevState);
  };

  // Auto-slide effect
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(goToNext, 5000); // Change slide every 5 seconds
    }
    return () => clearInterval(interval); // Clear interval on component unmount
  }, [isPlaying, currentIndex]);


  return (
    <div className="carousel">
      <div className="carousel-slide">
        <img src={slides[currentIndex].image} alt="Slide" className="carousel-image fade-in" />
        <div className="carousel-text fade-in">
          <h2>{slides[currentIndex].title}</h2>
          <p>{slides[currentIndex].description}</p>
        </div>
      </div>
      {/* <div className="carousel-navigation">
        <button onClick={goToPrevious} className="carousel-button">❮</button>
        <span className="carousel-indicator">{currentIndex + 1}/{slides.length}</span>
        <button onClick={goToNext} className="carousel-button">❯</button>
      </div> */}
      {/* <div className="carousel-controls">
        <button onClick={togglePlayPause} className="carousel-play-pause-button">
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <span className="carousel-indicator">{currentIndex + 1}/{slides.length}</span>
      </div> */}
    </div>
  );
};



const Home = ({ defaultTab }) => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const firstOtpInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const scrollRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const [hover1, setHover1] = useState(false);
  const [hover2, setHover2] = useState(false);
  const [hover3, setHover3] = useState(false);
  const [hover4, setHover4] = useState(false);
  const [hover5, setHover5] = useState(false);

  const slides = [
    {
      image: img1,
      title: 'Grow your career',
      description: 'From developers and designers to strategists and SAP pros, there are endless opportunities for you to learn, grow and make a difference.',
    },
    {
      image: img2,
      title: 'Consulting',
      description: 'Unlock powerful insights, better decision-making capabilities, and create new value by tapping into data you didn’t even know you had.',
    },

    {
      image: img3,
      title: "Technology",
      description: "Get hands-on with the emerging technologies that our clients need to grow and work in new ways."
    },
    {
      image: img4,
      title: "Operations",
      description: "Join a team where technology elevates people—not the other way around. Use data, insights and technology to reimagine the way people work and help clients grow."
    },
    {
      image: img5,
      title: "Digital engineering and manufacturing",
      description: "Use data, digital and creative thinking to help clients reimagine the products they make and how they make them—faster, better and more sustainably."
    },
    {
      image: img6,
      title: "AI and Analytics",
      description: "AI is everywhere and it’s maturing at a rapid pace. Bring your skills and innovative approaches to help us advance it responsibly."
    },
    {
      image: img7,
      title: "Cybersecurity",
      description: "Use your expertise and start-up mentality to help clients build cyber-resilient businesses in a complex and ever-changing threat landscape."
    }

  ];



  const menuItems = [
    { id: 'About', name: 'About Us' },
    { id: 'Jobs', name: 'Careers' },
    { id: 'Contact', name: 'Contact Us' },
    { id: 'HrReg', name: 'Register as HR' },
    { id: 'InternReg', name: 'Register as Intern' },
    { id: 'HrReg', name: 'Register as Guest' },
    { id: 'HRLogin', name: 'Login as HR' },
    { id: 'SuperAdminLogin', name: 'Login as SA' },
    { id: 'InternLogin', name: 'Login as Intern' },
    { id: 'GuestLogin', name: 'Login as Guest' },
    { id: 'PrivacyPolicy', name: 'Privacy Ploicy' },
    { id: 'Security', name: 'Security' },
    { id: 'accessibility', name: 'accessibility' },
    { id: 'Cookies', name: 'cookies' },
    { id: 'PageNotFound', name: 'PageNotFound' },

  ];

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);


  useEffect(() => {
    const scrollContainer = scrollRef.current;

    const scrollSpeed = 1; // Adjust this value to control the scroll speed

    const autoScroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += scrollSpeed;
        // If reached the end, reset to the beginning
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }
    };

    const scrollInterval = setInterval(autoScroll, 30); // Adjust interval time to control smoothness

    return () => {
      clearInterval(scrollInterval); // Clean up interval on component unmount
    };
  }, []);


  useEffect(() => {
    if (defaultTab) {
      setSelectedView(defaultTab);
    }
  }, [defaultTab]);

  const [formData, setFormData] = useState({ email: '', password: '', mobileNo: '', otp: ['', '', '', '', '', ''] });
  const [errors, setErrors] = useState({ email: '', password: '', mobileNo : "" });

  useEffect(() => {
    const checkBlockStatusAndRedirect = async (userId, userType, dashboardRoute) => {
      try {
        // Fetch block status from the backend
        const response = await apiService.get(`/api/${userType}-status/${userId}`);
        
        if (response.data.blockProfile) {
          // If blocked, clear cookies and redirect to login
          toast.error('Your account is blocked. Please contact support.', { autoClose: 5000 });
          Cookies.remove(userType);
          Cookies.remove('verified');
          navigate('/login');
        } else {
          // If not blocked, navigate to the dashboard
          navigate(dashboardRoute);
        }
      } catch (error) {
        console.error(`Error checking block status for ${userType}:`, error);
        toast.error('Unable to verify account status. Please try again later.', { autoClose: 5000 });
      }
    };
  
    const verified = Cookies.get('verified') === 'true'; // Simplify verified check
  
    if (verified) {
      const HRid = Cookies.get('HRid');
      if (HRid) {
        checkBlockStatusAndRedirect(HRid, 'hr', '/hr_dash');
        return; // Stop further checks if HR is verified
      }
  
      const SAid = Cookies.get('SAid');
      if (SAid) {
        navigate('/SA_dash'); // Super admins are not checked for block status
        return;
      }
  
      const internID = Cookies.get('internID');
      if (internID) {
        checkBlockStatusAndRedirect(internID, 'intern', '/intern_dash');
        return;
      }
  
      const guestID = Cookies.get('guestID');
      if (guestID) {
        checkBlockStatusAndRedirect(guestID, 'guest', '/extern_dash');
        return;
      }
    }
  }, [navigate]);
  


  const [isMobile, setIsMobile] = useState(false);

  // Detect if the screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 565); // Adjust breakpoint as needed
    };

    handleResize(); // Check on initial load
    window.addEventListener('resize', handleResize); // Add resize listener
    return () => window.removeEventListener('resize', handleResize); // Cleanup
  }, []);

  const validateMobileNumber = (value) => {
    const mobileNumberRegex = /^[6-9][0-9]{9}$/; // Regex for valid mobile number
    if (value && !mobileNumberRegex.test(value)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        mobileNo: 'Please enter a valid mobile number starting with 6-9 and 10 digits.',
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, mobileNo: '' }));
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'email' && value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      setErrors({ ...errors, email: 'Invalid email address' });
    } else if (name === 'password' && !value) {
      setErrors({ ...errors, password: 'Password is required' });
    } else if (name === 'mobileNo') {
      validateMobileNumber(value);
    }
    else {
      setErrors({ ...errors, [name]: '' });
    }
  };


  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    const newOtp = [...formData.otp];

    if (/[0-9]/.test(value) || value === '') {
      newOtp[index] = value;
      setFormData({ ...formData, otp: newOtp });
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }

    if (e.key === 'Backspace' && index > 0 && !newOtp[index]) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const sendOtp = async () => {
    if (formData.mobileNo && formData.mobileNo.length === 10) {
      try {
        await apiService.post('/api/normal-login', { mobileNo: formData.mobileNo });
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log('Generated OTP:', generatedOtp);
        setOtp(generatedOtp);
        setOtpSent(true);
        setTimer(30);
        // await OtpService.sendOtp(formData.mobileNo, generatedOtp);
        toast.success('OTP sent successfully!', { autoClose: 5000 });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            toast.error('User not found, please register.', { autoClose: 5000 });
          } else if (error.response.status === 500) {
            toast.error('Server error, please try again later.', { autoClose: 5000 });
          } else {
            toast.error('Failed to send OTP, please try again.', { autoClose: 5000 });
          }
        }
        console.error('Error sending OTP:', error);
      }
    } else {
      setErrors({ ...errors, mobileNo: 'Mobile number must be 10 digits' });
      toast.error('Invalid mobile number. Please enter a valid 10-digit number.', { autoClose: 5000 });
    }
  };

  const GuestverifyOtp = async () => {
    const userOTP = formData.otp.join('')
    console.log("User OTP:" + userOTP)
    console.log("Generated otp" + otp)

    if (userOTP === otp) {
      toast.success('Login successful!', { autoClose: 5000 })
      setOtpSent(false)

      try {
        const response = await apiService.post('/api/normal-login', { mobileNo: formData.mobileNo })
        if (response.status === 200) {
          const intern = response.data.intern;
          console.log(response)
          if (response.data.type === "intern") {
            Cookies.set('role', 'intern', { expires: 30 });
            Cookies.set('internID', intern.candidateID, { expires: 30 });
            Cookies.set('verified', 'true', { expires: 30 });
            navigate('/intern_dash');
          }
          else if (response.data.type === 'guest') {
            Cookies.set('role', 'Guest', { expires: 30 });
            Cookies.set('guestID', intern.guestID, { expires: 30 });
            Cookies.set('verified', 'true', { expires: 30 });
            navigate('/extern_dash')
          }
        }
      }
      catch (error) {
        if (error.response.status === 400) {
          console.log(error.response)
        }
        else {
          console.log(error)
        }
      }
    }
    else {
      toast.error("Invalid OTP", { autoClose: 5000 })
    }
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      console.log(formData);
      try {
        const response = await apiService.post('/api/hr-login', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });

        // Handle successful login
        console.log(response);
        toast.success('Logged in successfully!', { autoClose: 5000 });

        // Clear all existing cookies
        document.cookie.split(';').forEach(cookie => {
          const cookieName = cookie.split('=')[0].trim();
          Cookies.remove(cookieName);
        });

        // Set new cookies
        Cookies.set('verified', true, { expires: 30 });
        Cookies.set("name", response.data.name, { expires: 30 });
        Cookies.set('HRid', response.data.HRid, { expires: 30 });
        Cookies.set('role', 'HR', { expires: 30 });

        // Navigate to HR dashboard
        navigate('/hr_dash');
      } catch (error) {
        console.log(error);

        // Handle different status codes
        if (error.response) {
          const statusCode = error.response.status;
          if (statusCode === 404) {
            toast.error('User not found', { autoClose: 5000 });
          }
          else if (statusCode === 405) {
            toast.error('Your Profile is Blocked, Contact Admin !', { autoClose: 5000 });
          }
          
          else if (statusCode === 401) {
            toast.error('Invalid credentials', { autoClose: 5000 });
          }
        } else {
          toast.error('Network error or server is unreachable', { autoClose: 5000 });
        }
      }
    } else {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : ''
      });
    }
  };

  const handleMenuItemClick = (id) => {
    navigate(`/${id.toLowerCase()}`);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const handleLoginClick = () => {
    navigate(`/login`)
    handleClose();
  };


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };




  const renderContent = () => {
    switch (selectedView) {
      case 'About':
        return <About />;
      case 'Contact':
        return <Contact />;
      case 'Jobs':
        return <ViewJobs />
      // case 'JobDesc':
      //   return <JobDesc />
      case 'HRLogin':
        return (
          // <div className='login'>
          //   <div className="container d-flex flex-column justify-content-center align-items-center" style={{ height: '85vh' }}>
          //     <img alt='logo' className='rounded mb-3' src={ramana} style={{ width: '200px', height: 'auto' }} />
          //     <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-white" style={{ width: '100%', maxWidth: '500px' }}>
          //       <h4 className='fw-bold mb-4 mt-2 text-nowrap' style={{ fontFamily: 'monospace' }}>
          //         HR Login <i className="fa-solid fa-right-to-bracket"></i>
          //       </h4>
          //       <form onSubmit={handleSubmit}>
          //         <TextField
          //           label="Email"
          //           variant="outlined"
          //           className="w-100 mb-3"
          //           name="email"
          //           value={formData.email}
          //           onChange={handleChange}
          //           required
          //           error={Boolean(errors.email)}
          //           helperText={errors.email}
          //           InputLabelProps={{ className: 'fw-bold text-secondary' }}
          //         />

          //         <TextField
          //           label="Password"
          //           variant="outlined"
          //           type={showPassword ? 'text' : 'password'}
          //           className="w-100 mb-3"
          //           name="password"
          //           value={formData.password}
          //           onChange={handleChange}
          //           required
          //           error={Boolean(errors.password)}
          //           helperText={errors.password}
          //           InputLabelProps={{ className: 'fw-bold text-secondary' }}
          //           InputProps={{
          //             endAdornment: (
          //               <InputAdornment position="end">
          //                 <IconButton
          //                   aria-label="toggle password visibility"
          //                   onClick={handleClickShowPassword}
          //                   onMouseDown={handleMouseDownPassword}
          //                   edge="end"
          //                 >
          //                   {showPassword ? <VisibilityOff /> : <Visibility />}
          //                 </IconButton>
          //               </InputAdornment>
          //             ),
          //           }}
          //         />

          //         <Button
          //           variant="contained"
          //           color="primary"
          //           type='submit'
          //           className='w-100'
          //         >
          //           Login
          //         </Button>
          //       </form>
          //       <div className="d-flex justify-content-center align-items-center w-100">
          //         <Link
          //           className='fw-bold text-center text-decoration-none text-primary p-2'
          //           onClick={() => setSelectedView('HrReg')}
          //         >
          //           Register as HR ?
          //         </Link>
          //       </div>
          //     </div>
          //   </div>
          // </div>
          <div className="login">
            <div className="container d-flex flex-column justify-content-center" style={{ height: '80vh' }}>
              <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-none" style={{ width: '100%', maxWidth: '500px' }}>
                <h4 className='fw-bold mb-4 mt-2 text-nowrap text-white' style={{ fontFamily: 'monospace' }}>
                  HR Login <i className="fa-solid fa-right-to-bracket"></i>
                </h4>

                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Email"
                    variant="outlined"
                    className="w-100 mb-4"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.email)}
                    helperText={errors.email}
                    InputLabelProps={{ className: 'fw-bold text-secondary' }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'white',
                        },
                        '&:hover fieldset': {
                          borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white', // White text color
                      },
                    }}
                  />

                  <TextField
                    label="Password"
                    variant="outlined"
                    type={showPassword ? 'text' : 'password'}
                    className="w-100 mb-5"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={Boolean(errors.password)}
                    helperText={errors.password}
                    InputLabelProps={{ className: 'fw-bold text-secondary' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: 'white',
                        },
                        '&:hover fieldset': {
                          borderColor: 'white',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'white',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        color: 'white', // White text color
                      },
                    }}
                  />

                  <Button
                    variant="contained"
                    type='submit'
                    className='w-100 border border-1 bg-transparent'
                  >
                    Login
                  </Button>
                </form>

                <div className="d-flex justify-content-center align-items-center w-100">
                  <Link
                    className='text-center text-decoration-none py-3 text-white'
                    onClick={() => setSelectedView('HrReg')}
                  >
                    Register as HR?
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
        case 'home':
          return (
            <div>
              <div>
                <NetworkBackground />
              </div>
              <section>
                <Carousel slides={slides} />
              </section>
  
              <div className='container'>
  
                <div className='projects_container'>
                  <h1>What we have built</h1>
                </div>
  
                <div className='projects_cards_container'>
  
                  <div className='row mb-5'>
                    <div className='project1_card_container col-lg-6 col-sm-12'
                      onMouseEnter={() => setHover1(true)}
                      onMouseLeave={() => setHover1(false)}
                    >
                      <img
                        src={qtnext}
                        className='project1_cardimg_container'
                        alt=''
                        style={{
                          filter: hover1 ? 'brightness(25%)' : 'brightness(100%)'
                        }}
                      />
  
                      {!hover1 &&
                        <div className='project1_card_text'
                        >
                          Practical tech training with live classes, hands-on learning, and certifications
                        </div>}
  
                      {hover1 && (
                        <div className='project1_card_textHover'
                          style={{
                            opacity: hover1 ? 2 : 0,
                            transition: "opacity 0.5s ease-in-out"
                          }}
                        >
                          QT NEXT is a learning platform that offers courses, assessments, and certifications in fields like DevOps and programming. It emphasizes practical learning through live classes and hands-on training to prepare users for careers in tech.</div>
                      )}
                    </div>
                  </div>
  
                  <div className='row justify-content-end mb-5'>
                    <div className='project2_card_container  col-sm-12 col-lg-6 '
                      onMouseEnter={() => setHover2(true)}
                      onMouseLeave={() => setHover2(false)}>
  
                      <img src={quantaspeach} alt='' className='project2_cardimg_container' style={{
                        filter: hover2 ? 'brightness(25%)' : 'brightness(100%)',
                      }} />
  
                      {!hover2 &&
                        <div className='project2_card_text'
                        >
                          Quantum-powered software for enhanced speed, security, and real-time data insights
                        </div>
                      }
  
                      {hover2 && (
                        <div className='project2_card_textHover'
                          style={{
                            opacity: hover2 ? 2 : 0,
                            transition: "opacity 0.5s ease-in-out"
                          }}
                        >
                          Quanta Speech aims to integrate quantum computing into our software development process, leveraging its unique capabilities to transform key areas like cryptography, machine learning, and data optimization. By adopting quantum technologies, we aim to enhance our software’s speed, security, and performance, enabling more efficient data analysis and real-time decision-making.
                        </div>
                      )}
                    </div>
                  </div>
  
                  <div className='row mb-5'>
                    <div className='project1_card_container col-sm-12 col-lg-6'
                      onMouseEnter={() => setHover3(true)}
                      onMouseLeave={() => setHover3(false)}
                    >
  
                      <img src={saythu} alt='' style={{
                        filter: hover3 ? 'brightness(25%)' : 'brightness(100%)',
                      }} className='project1_cardimg_container' />
  
                      {
                        !hover3 &&
                        <div className='project1_card_text'>
                          AI-driven tool for code analysis, quality checks, and vulnerability insights
                        </div>
                      }
  
                      {hover3 && (
                        <div className='project1_card_textHover' style={{ opacity: hover3 ? 2 : 0, transition: "opacity 0.5s ease-in-out" }}>
                          The Generative AI-Based Source Code Analysis Tool uses prompt engineering to analyze source code, providing insights into code structure, quality, and vulnerabilities. The tool supports file uploads in formats like .zip and .pdf, offering streamlined processing and reporting on recent code files to help teams maintain secure, high-quality, and optimized codebases.
                        </div>
                      )
                      }
                    </div>
                  </div>
  
                  <div className='row justify-content-end mb-5'>
                    <div className='project2_card_container col-sm-12 col-lg-6'
                      onMouseEnter={() => setHover4(true)}
                      onMouseLeave={() => setHover4(false)}
                    >
                      <img className='project2_cardimg_container' src={ilovehr} alt=''
                        style={{ filter: hover4 ? 'brightness(25%)' : 'brightness(100%)' }}
                      />
                      {
                        !hover4 &&
                        <div className='project2_card_text'>
                          Empowering HR as strategic partners to enrich and drive business value
                        </div>
                      }
  
                      {hover4 && (
                        <div className='project2_card_textHover' style={{ opacity: hover4 ? 2 : 0, transition: "opacity 0.5s ease-in-out" }}>
                          I Love HR is a transformative initiative aimed at evolving Human Resources (HR) teams from administrative and compliance-focused roles to proactive business partners that add significant value to organizations. The project focuses on enriching the company’s most vital asset—its people—by implementing strategic HR practices.
                        </div>
                      )}
                    </div>
                  </div>
  
                  <div className='row'>
                    <div className='project1_card_container col-sm-12 col-lg-6'
                      onMouseEnter={() => setHover5(true)}
                      onMouseLeave={() => setHover5(false)}
                    >
                      <img className='project1_cardimg_container'
                        src={homeinsurance}
                        alt=''
                        style={{ filter: hover5 ? 'brightness(27%)' : 'brightness(100%)'}}
                      />
  
                      {
                        !hover5 &&
                        <div className='project1_card_text'>
                          Efficient, automated management of property insurance policies and claims data
                        </div>
                      }
  
                      {hover5 && (
                        <div className='project1_card_textHover' style={{ opacity: hover5 ? 2 : 0, transition: "opacity 0.5s ease-in-out" }}>
                          The Property Insurance Management System is a robust software solution designed to automate and optimize the management of property insurance policies. The system enhances operational efficiency, reduces manual errors, and provides real-time access to policy and claims data, offering an end-to-end solution for managing property insurance.
                        </div>
                      )}
                    </div>
                  </div>
  
                </div>
  
              </div>
  
            </div>
          );
  
      case 'SuperAdminLogin':
        return <SuperAdminLogin />;


      case 'GuestLogin':
        return (
          <div className='login'>
            <div className="container d-flex flex-column justify-content-center" style={{ height: '80vh' }}>
              <div className="border rounded shadow p-3 d-flex flex-column align-items-center bg-none" style={{ width: '100%', maxWidth: '500px' }}>
                <h4 className='fw-bold mb-4 mt-2 text-nowrap' style={{ fontFamily: 'monospace', color: "white" }}>Login to Continue <i className="fa-solid fa-right-to-bracket"></i></h4>
                <TextField
                  label="Mobile No"
                  variant="outlined"
                  className="w-100 mb-3"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  error={Boolean(errors.mobileNo)}
                  helperText={errors.mobileNo}
                  inputProps={{
                    maxLength: 10,
                    pattern: "^[6-9][0-9]{9}$", // Regex pattern for valid mobile number
                    title: "Please enter a valid mobile number starting with 6-9 and 10 digits.",
                    inputMode: "numeric",
                  }}                  
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <span className="rounded p-2" style={{ background: "none", color: "white" }}>+91</span>
                      </InputAdornment>
                    ),
                    className: 'fw-bold',
                  }}
                  InputLabelProps={{ className: 'fw-bold text-secondary' }}
                  onKeyPress={(e) => {
                    const isValidInput = /[0-9]/;
                    if (!isValidInput.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "white",
                      },
                      "&:hover fieldset": {
                        borderColor: "white",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "white",
                      },
                      color: "white",
                      "& input": {
                        color: "white", // Text color inside input
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "white",
                    },
                    "& .MuiFormHelperText-root": {
                      color: "white",
                    },
                  }}
                />

                <Button
                  variant="contained"
                  onClick={sendOtp}
                  style={{ color: "white", border: "2px solid white", background: "none" }}
                  disabled={timer > 0}
                  className='w-50 sendotp'
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Send OTP'}
                </Button>
                {otpSent && (
                  <div className="d-flex flex-column align-items-center mt-3">
                    <p className='fw-bold text-success'>OTP sent successfully!</p>
                    <div className="d-flex justify-content-between mb-3 w-100">
                      {formData.otp.map((digit, index) => (
                        <TextField
                          key={index}
                          id={`otp-${index}`}
                          inputRef={index === 0 ? firstOtpInputRef : null} // Attach the ref to the first input field
                          variant="outlined"
                          className="text-center mx-1"
                          inputProps={{
                            maxLength: 1,
                            style: { textAlign: 'center', fontWeight: 'bold', color: "white", width: '0.8rem', height: '0.8rem', border: "2px solid white" },
                          }}
                          value={digit}
                          onChange={(e) => handleOtpChange(e, index)}
                          onFocus={(e) => e.target.select()}
                          onKeyDown={(e) => handleOtpChange(e, index)}
                        />
                      ))}
                    </div>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={GuestverifyOtp}
                      className='w-50 verifyotp'
                    >
                      Verify OTP
                    </Button>

                  </div>
                )}
              </div>
            </div>

          </div>
        );

      case 'InternReg':
        return <InternRegistration setSelectedView={setSelectedView} />;
      case 'HrReg':
        return <HRRegistration setSelectedView={setSelectedView} />

      case 'GuestReg':
        return <GuestRegistration setSelectedView={setSelectedView} />

      case 'PrivacyPolicy':
        return (
          <div className= "footer-heading-names" style={{ fontFamily: 'Arial, sans-serif', color: '#fff', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#999999' }}>Privacy Policy for Ramanasoft Consulting Services</h2>
            <p>
              Ramanasoft Consulting Services is committed to protecting the privacy of its visitors, contractors, and customers.
              This Privacy Policy explains the use and collection of information recorded and collected by us. If you have any
              questions, please contact us at <a style={{ color: "#999999", textDecoration: "none" }} href="mailto:support@ramanasoft.com">support@ramanasoft.com</a>.
            </p>
            <h3 style={{ color: '#999999' }}>Log Files</h3>
            <p>
              Ramanasoft follows standard industry practices in utilizing log files. It logs visitors when they visit our
              website, which is typical for hosting services to assist with analytics. Data collected includes IP addresses,
              browser types, ISPs, date & time, referring pages, pages viewed, and click data. This data is used for purposes
              such as trend analysis, management, visitor monitoring, and demographic studies.
            </p>
            <h3 style={{ color: '#999999' }}>Cookies and Web Beacons</h3>
            <p>
              Like most sites, Ramanasoft uses "cookies" to enhance user experience. These files collect information on visits,
              pages viewed, and time spent, allowing us to improve our site based on visitor behavior and preferences.
            </p>
            <h3 style={{ color: '#999999' }}>Information Collection and Use</h3>
            <p>
              We collect information when you contact us via email or submit information through forms on our website. This may
              include your name, email address, phone number, or other details needed to respond to your requests and fulfill
              your needs. Note: This information is used solely for official service purposes.
            </p>
            <h3 style={{ color: '#999999' }}>Third-Party Services</h3>
            <p>
              Ramanasoft may share data with third-party service providers to assist with services, such as hosting, analytics,
              or advertising. Access to your data is granted only as necessary to perform these services, and providers are
              prohibited from using your data for any other purposes. Third-party advertisers on our site may use cookies, web
              beacons, or JavaScript to deliver advertisements directly to your browser, thereby obtaining your IP address.
            </p>
            <h3 style={{ color: '#999999' }}>Data Security</h3>
            <p>
              <strong>Your Privacy, Our Responsibility!</strong> We are committed to protecting your information using
              standard security methods. Please note, however, that no data transmission or storage method over the Internet
              is completely secure. If a breach occurs on the third-party side, protection does not fall under our guarantee.
            </p>
            <h3 style={{ color: '#999999' }}>Children's Privacy</h3>
            <p>
              Ramanasoft does not intentionally collect personal information from children under 13. If we discover we have
              inadvertently gathered such information, we will take reasonable efforts to delete it promptly from our systems.
            </p>
            <h3 style={{ color: '#999999' }}>Changes to This Privacy Policy</h3>
            <p>
              Ramanasoft may revise this Privacy Policy at any time. Changes will be posted on this page with an updated
              effective date. To stay informed, please revisit this page to review how we protect your data.
            </p>
          </div>

        );
      case 'Security':
        return (
          <div className= "footer-heading-names" style={{fontFamily: 'Arial, sans-serif', color: '#fff', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#999999' }}>Terms and Conditions</h2>
            <p>
              Welcome to Ramanasoft Consulting Services. Accessing our website comprises your acknowledgment that you have read, understood, and are bound by the following Terms of Use ("ToU").
            </p>
            <p>
              Please take a moment to carefully understand the terms before leveraging our website services to overcome any future hindrances.
            </p>

            <h3 style={{ color: '#999999' }}>1. Acceptance of Terms</h3>
            <p>
              Before accessing our website you must agree to the terms you have read and accept to be bound by our Terms of Use. However, in the future, Ramanasoft may modify the existing ToU. Therefore, please visit this page to stay updated on any changes that may occur. Continued access and use of our website shall constitute acceptance of the revised terms.
            </p>

            <h3 style={{ color: '#999999' }}>2. User Agreement</h3>
            <p>
              The content of this site is to be leveraged for personal and educational use. Please note that commercial use of this site is prohibited without any professional or contractual relationship with Ramanasoft. As all content is inherited by Ramanasoft and without proving consent the use of it will be taken under action.
            </p>

            <h3 style={{ color: '#999999' }}>3. Intellectual Property Rights</h3>
            <p>
              Ramanasoft has the copyright of all text, data, content, images, graphics, video, and audio on this website including— its affiliates, licensors, and content providers. Therefore, users are prohibited from copying, distributing, or creating derivative works as it infringes on the intellectual property rights of Ramanasoft.
            </p>

            <h3 style={{ color: '#999999' }}>4. User Conduct</h3>
            <p>
              Thereon, you agree to the following TOUs:
            </p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>Any misrepresentation of identity or affiliation with any person or entity will be counted as a violation.</li>
              <li>To leverage the content of the website you must have contractual rights.</li>
              <li>Leveraging the content of Ramanasoft without consent is illegal and action will be taken.</li>
              <li>Interference with the site's functionality or operations is objectionable.</li>
            </ul>

            <h3 style={{ color: '#999999' }}>5. Third-Party Links</h3>
            <p>
              Ramanasoft can hyperlink to third-party sites which causes it to have no control over the third-party sites. Please note that we are not responsible for their practices, or damages and losses caused from their end. Therefore, we urge you to review their terms and policies before you access third-party sites.
            </p>

            <h3 style={{ color: '#999999' }}>6. Changes to Terms and Services</h3>
            <p>
              Ramanasoft has the right to change or discontinue any part of this website or its features and modify these Terms of Use, at its sole discretion. However, any changes or modifications of the terms will be updated on the site.
            </p>
            <p>
              Moreover, your continuation of using the site will be counted as an acceptance, of those changes of terms.
            </p>

            <h3 style={{ color: '#999999' }}>7. Disclaimer of Warranties</h3>
            <p>
              The website and all content represented here are offered "as is" and "as available." Ramanasoft neither explicitly nor implicitly warrants that the website or its contents are accurate, reliable, or available. The entire risk arising in connection with, previews of use and use of the website is borne by you, and Ramanasoft will not be liable for:
            </p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>Damages, whether property or person, are caused by the use of the website.</li>
              <li>Unauthorized access to your personal information or data breaches.</li>
              <li>Viruses, malware, or other harmful software are transmitted from the site.</li>
            </ul>

            <h3 style={{ color: '#999999' }}>Governing Law and Jurisdiction</h3>
            <p>
              Note that Indian laws govern the website's terms and conditions.
            </p>
            <p>
              Therefore, any dispute caused against the TOUs shall be taken under the vision of the courts. By availing of our services, you agree to this jurisdiction.
            </p>

            <p>
              Please contact us through the contact details (add the link to contact), for any queries concerning the Terms and Conditions.
            </p>
          </div>

        );

      case 'accessibility':
        return (
          <div className= "footer-heading-names" style={{ fontFamily: 'Arial, sans-serif', color: '#fff', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#999999' }}>Website Accessibility</h2>
            <p>
              Ramanasoft Consulting Services is committed to making our website accessible to all our users, including those with disabilities, as we strive to create an inclusive experience in the navigation and progressive improvement for all levels of access and abilities.
            </p>

            <h3 style={{ color: '#999999' }}>1. Accessibility Features</h3>
            <p>
              Some accessibility features available on our site that better help the user gain easier access to information include:
            </p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li>Text Contrast: We employed high contrasting text and background colors to make reading easier for those with visual impairments.</li>
              <li>Keyboard Navigation: The website is fully navigable using the keyboard, allowing users to interact with elements without a mouse.</li>
              <li>Alt Text for Images: Images on our site include descriptive alternative (alt) text to assist screen readers for users with visual impairments.</li>
              <li>Responsive Design: Our website is accessible on various devices, including smartphones, tablets, and desktops.</li>
              <li>Clear Navigation: Our content is well-arranged with a simple, intuitive structure, readable headings, clearly defined links, and readable text.</li>
            </ul>

            <h3 style={{ color: '#999999' }}>2. Web Content Accessibility Guidelines (WCAG)</h3>
            <p>
              Ramanasoft complies with the principles of WCAG 2.1 AA. We are committed to aligning our website with these guidelines to ensure all users can have an exceptional experience.
            </p>

            <h3 style={{ color: '#999999' }}>3. Feedback and Support</h3>
            <p>
              We have made efforts to ensure accessibility on our website. If you experience any access issues or have suggestions, please let us know. We will work to apply your suggested amendments and provide seamless solutions.
            </p>
          </div>

        );

      case 'Cookies':
        return (
          <div className= "footer-heading-names" style={{fontFamily: 'Arial, sans-serif', color: '#fff', lineHeight: '1.6' }}>
            <h2 style={{ textAlign: 'center', color: '#999999' }}>Cookies</h2>
            <p>
              We use cookies on the Ramanasoft Consulting Services website to make it easier for you to visit our website. This cookie policy sets out how we will collect, or otherwise receive, your personal data through the use of cookies and what you can do about them.
            </p>

            <h3 style={{ color: '#999999' }}>What Are Cookies?</h3>
            <p>
              Cookies are small text files stored on your device when you access our website, helping us remember your preferences and enhance functionality in addition to being used for analyzing website performance.
            </p>

            <h3 style={{ color: '#999999' }}>Types of Cookies Used</h3>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
              <li><strong>Essential Cookies:</strong> Necessary for the proper working of the website.</li>
              <li><strong>Performance Cookies:</strong> Help us improve our website by understanding usage patterns.</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences for a more personalized experience.</li>
              <li><strong>Targeting Cookies:</strong> Used for targeted advertisement and marketing.</li>
            </ul>

            <h3 style={{ color: '#999999' }}>How We Use Cookies</h3>
            <p>
              Cookies improve performance, personalize content, analyze traffic, and deliver relevant ads.
            </p>

            <h3 style={{ color: '#999999' }}>Third-Party Cookies</h3>
            <p>
              We might use other third-party services, such as Google Analytics or advertising networks, that set their own cookies. Please check their privacy policies to learn more.
            </p>

            <h3 style={{ color: '#999999' }}>Managing Cookies</h3>
            <p>
              Cookies can be controlled with your browser's preference settings. Turning off cookies might impair functionality for some websites.
            </p>

            <h3 style={{ color: '#999999' }}>Revision to the Cookie Policy</h3>
            <p>
              The company reserves the right to make changes to this policy from time to time. Whenever modifications are made, a re-visit to this page is in order.
            </p>
          </div>

        );

      case 'PageNotFound':
        return <PageNotFound />
      default:
        return null;
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    // <div className="container-fluid justify-content-center" style={{ background: "black" }}>
    //   <section className='header' style={{position:'sticky', top:0, zIndex:1}}>
    //     <div className="container-fluid justify-content-center" style={{ alignItems: "center", background: '#000000', height: "57px", display: "flex", borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>
    //       <Link onClick={() => setSelectedView('home')} to="/">
    //         <img src={ramana} alt="ramanaSoft" width={'150px'} style={{ marginLeft: "30px", marginTop: "5px" }} />
    //       </Link>

    //       <ul
    //         className='d-flex justify-content-end text-nowrap align-items-center header w-100 text-white p-2 fw-bold'
    //         style={{ listStyle: 'none', alignItems: "center", marginTop: "30px" }}
    //       >
    //         {menuItems
    //           .filter((item) => item.id !== 'HRLogin' && item.id !== 'SuperAdminLogin' && item.id !== 'InternLogin' && item.id !== 'InternReg' && item.id !== 'HrReg' && item.id !== 'GuestReg' && item.id !== 'GuestLogin' && item.id !== 'PrivacyPolicy' && item.id !== 'Security' && item.id !== 'accessibility' && item.id !== 'Cookies' && item.id !== 'PageNotFound')
    //           .map((item) => (
    //             <li
    //               key={item.id}
    //               onClick={() => handleMenuItemClick(item.id)}
    //               style={{
    //                 cursor: 'pointer',
    //                 margin: '0px 15px',
    //                 border: '1px solid transparent',
    //                 borderRadius: '4px',
    //                 color: selectedView === item.id ? '#fff' : '#fff',
    //                 transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
    //               }}
    //             >
    //               {item.name}
    //             </li>
    //           ))}
    //         <li>
    // <Button variant="contained" color="primary" onClick={handleLoginClick} style={{ marginLeft: '20px', marginTop: "5px", background: "rgba(0, 0, 0, .08)", color: "white", border: "1px solid white" }}>
    //   Login
    // </Button>
    //         </li>
    //       </ul>
    //     </div>
    //   </section>
    //   <div className='content'>
    //     {renderContent()}
    //   </div>
    //   <Footer />
    //   {showBackToTop && (
    //     <div
    //       className='back-to-top'
    //       style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }}
    //       onClick={scrollToTop}
    //     >
    //       <button className='p-2 rounded btn btn-outline-dark' title='back to top'>
    //         <i className='fas fa-arrow-up text-warning fs-5'></i>
    //       </button>
    //     </div>
    //   )}
    // </div>


    <div className="container-fluid justify-content-center" style={{ background: "black" }}>
      {/* <section className="header" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
        <div className="container-fluid justify-content-center" style={{ alignItems: "center", background: '#000000', height: "57px", display: "flex", borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>
          <Link onClick={() => setSelectedView('home')} to="/">
            <img src={ramana} alt="ramanaSoft" width={'150px'} style={{ marginLeft: "30px", marginTop: "5px" }} />
          </Link>
          <ul className="d-flex justify-content-end text-nowrap align-items-center header w-100 text-white p-2 fw-bold" style={{ listStyle: 'none', marginTop: "30px" }}>
            {menuItems
              .filter((item) => !['HRLogin', 'SuperAdminLogin', 'InternLogin', 'InternReg', 'HrReg', 'GuestReg', 'GuestLogin', 'PrivacyPolicy', 'Security', 'accessibility', 'Cookies', 'PageNotFound'].includes(item.id))
              .map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  style={{
                    cursor: 'pointer',
                    margin: '0px 15px',
                    border: '1px solid transparent',
                    borderRadius: '4px',
                    color: selectedView === item.id ? '#fff' : '#fff',
                    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
                  }}
                >
                  {item.name}
                </li>
              ))}
            <li>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLoginClick}
                style={{
                  marginLeft: '20px',
                  marginTop: "5px",
                  background: "rgba(0, 0, 0, .08)",
                  color: "white",
                  border: "1px solid white"
                }}
              >
                Login
              </Button>
            </li>
          </ul>

          <div className="d-block d-md-none" style={{ marginRight: "15px" }}>
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "25px",
                cursor: "pointer"
              }}
            >
              &#9776;
            </button>
          </div>
        </div>
      </section> */}


      <nav className="navbar navbar-expand-md bg-body-dark sticky-top" data-bs-theme="dark" style={{ zIndex: 1, background: "black" }}>
        <div className="container-fluid">
          <div className="navbar-brand">
            <Link to="/">
              <img src={ramana} style={{width : !isMobile ? "150px" : "100px"}} alt="Logo" />
            </Link>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarTogglerDemo02"
            aria-controls="navbarTogglerDemo02"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" style={{fontSize:"1.5rem"}}></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarTogglerDemo02">
            <div className="navbar-nav ms-auto d-flex align-items-center">
              <div className="nav-item mx-4">
                <NavLink
                  to="/about"
                  className={({ isActive }) => `nav-link newfont ${isActive ? 'active-link' : ''}`}
                >
                  <HiInformationCircle className="me-1" /> About
                </NavLink>
              </div>
              <div className="nav-item mx-4">
                <NavLink
                  to="/jobs"
                  className={({ isActive }) => `nav-link newfont ${isActive ? 'active-link' : ''}`}
                >
                  <BsBriefcaseFill className="me-1" /> Careers
                </NavLink>
              </div>
              <div className="nav-item mx-4">
                <NavLink
                  to="/contact"
                  className={({ isActive }) => `nav-link newfont ${isActive ? 'active-link' : ''}`}
                >
                  <MdOutlineContactSupport className="me-1" /> Talk to Us
                </NavLink>
              </div>
              <div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLoginClick}
                  style={{ marginLeft: '20px', marginTop: '5px', background: 'rgba(0, 0, 0, .08)', color: 'white', border: '1px solid white' }}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="content">
        {renderContent()}
      </div>

      <Footer />

      {/* Back to Top Button */}
      {showBackToTop && (
        <div className="back-to-top" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: '999' }} onClick={scrollToTop}>
          <button className="p-2 rounded btn btn-outline-dark" title="back to top">
            <i className="fas fa-arrow-up text-warning fs-5"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;

