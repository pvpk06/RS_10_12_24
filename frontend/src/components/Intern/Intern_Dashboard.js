import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Checkbox, FormControlLabel, Link } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfo, faTimes, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';

import Joyride from 'react-joyride';
import './styles/internDash.css';
import AppliedJobs from './AppliedJobs.js';
import Profile from './Profile.js';
import JobPortal from './JobPortal';
import p3 from '../images/p3.jpeg';
import Quiz from './quiz/Quiz.js';
import Lmsdash from './LMS/Lmsdash.js';
import Home from './intern_home.js';
import Cookies from 'js-cookie'
import apiService from '../../apiService.js';
import CloseIcon from '@mui/icons-material/Close';
import Achievements from './Achievements/Achievements.js';
// import ResumeDash from './BuildYourResume/resumeDash.js';

import img1 from '../Home/images/Carousel/img1.jpg'
import img2 from '../Home/images/Carousel/img2.jpg'
import img3 from '../Home/images/Carousel/img3.jpg'

const WelcomeTour = ({ onStart, onSkip }) => {
  return (
    <Dialog open={true} onClose={onSkip}>
      <DialogTitle>Welcome to Your Dashboard!</DialogTitle>
      <DialogContent>
        <Typography variant="body1" className="mb-4">
          Would you like to take a quick tour to learn about all the features available to you?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outline" onClick={onSkip}>
          Skip Tour
        </Button>
        <Button onClick={onStart}>
          Start Tour
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const GuidelinesModal = ({ open, onAccept, guidelinesAccepted, onClose }) => {
  const [accepted, setAccepted] = useState(false);

  const handleAcceptAndContinue = () => {
    if (accepted) {
      onAccept(); // Call the onAccept function passed as a prop
    }
  };

  return (
    <Dialog open={open} onClose={() => { }} maxWidth="lg" fullWidth>
      <DialogTitle>Internship Guidelines</DialogTitle>
      {guidelinesAccepted && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}

      <DialogContent className="space-y-4">
        <ol className="list-decimal pl-6 space-y-2">
          <li><strong>Uninformed Absences:</strong> More than 3 uninformed leaves without prior approval will result in immediate termination.</li>
          <li><strong>Non-Compliance with Dress Code:</strong> Repeated failure to wear ID cards or follow the dress code will result in disciplinary action. Prohibited attire includes sweatshirts, torn jeans, and T-shirts with inappropriate prints (e.g., bad words). Losing your ID card will result in a ₹500 fine for a replacement.</li>
          <li><strong>Language:</strong> Please communicate in English while on the floor.</li>
          <li><strong>Dress Code:</strong> Always wear formal shoes and adhere to the professional dress code. Boys must tuck in their shirts.</li>
          <li><strong>Equipment:</strong> Bring your own laptop daily.</li>
          <li><strong>Failure to Provide Work Status Updates:</strong> Daily work status updates must be submitted on group channels and via email. Consistent failure to provide these updates will result in termination.</li>
          <li><strong>Misuse of Communication Tools:</strong> Failure to use required tools (e.g., Noysi) or using them improperly can lead to termination.</li>
          <li><strong>Leave Policy:</strong> Planned leave must be requested at least 1 day in advance with necessary documents. Unplanned leave should be communicated to the manager and HR immediately. Interview leave requires notification at least 1 day prior with supporting documents.</li>
          <li><strong>Violation of Code of Conduct:</strong> Disrespectful or unprofessional behavior can lead to immediate termination.</li>
          <li><strong>Performance Issues:</strong> Failing to meet performance expectations or not submitting tasks can result in termination.</li>
          <li><strong>Repeated Leave Violations:</strong> Exceeding the allowed leave without prior approval will result in termination.</li>
          <li><strong>Insubordination:</strong> Refusing reasonable instructions may lead to termination.</li>
          <li><strong>Harassment and Discrimination:</strong> Any form of harassment, discrimination, or bullying will result in immediate termination.</li>
          <li><strong>Substance Abuse:</strong> Being under the influence during work hours will lead to immediate termination.</li>
          <li><strong>Theft or Misappropriation:</strong> Stealing or misusing company property will lead to termination.</li>
          <li><strong>Breach of Confidentiality:</strong> Unauthorized sharing of confidential information will result in termination.</li>
          <li><strong>Failure to Meet Internship Requirements:</strong> Not meeting minimum hours or project completion may result in termination.</li>
          <li><strong>Attendance at Meetings and Training:</strong> Absences from mandatory sessions without approval will lead to disciplinary action.</li>
          <li><strong>Rejecting or Not Attending Mock Interviews:</strong> This will lead to termination.</li>
          <li><strong>Use of Company Resources:</strong> Misusing resources can lead to termination.</li>
          <li><strong>Conflict of Interest:</strong> Outside employment conflicting with internship duties requires approval or may result in termination.</li>
          <li><strong>Professional Development:</strong> Lack of growth initiative may lead to termination.</li>
          <li><strong>Attendance:</strong> Maintaining 90% attendance is mandatory for completion.</li>
        </ol>
        {!guidelinesAccepted && ( // Only display if guidelines have not been accepted
          <FormControlLabel
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
            }
            label={
              <Typography>
                I have read and accept the internship guidelines
              </Typography>
            }
          />
        )}
      </DialogContent>
      <DialogActions>
        {!guidelinesAccepted && (
          <Button
            disabled={guidelinesAccepted || !accepted}
            onClick={handleAcceptAndContinue}
          >
            Accept and Continue
          </Button>

        )}

      </DialogActions>
    </Dialog>
  );
};

const InternDashboard = ({ defaultTab }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [selectedView, setSelectedView] = useState(defaultTab || 'Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false); // New state for guidelines status
  const candidateID = Cookies.get('internID');
  console.log("candidateID, ", candidateID);

  const menuItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: 'fas fa-home' },
    { id: 'LMS', name: 'LMS', icon: 'fas fa-book' },
    { id: 'Quiz', name: 'Quiz', icon: 'fas fa-laptop-code' },
    { id: 'Jobs', name: 'Jobs', icon: 'fas fa-chalkboard-user' },
    { id: 'Applied', name: 'Applied', icon: 'fas fa-edit' },
    { id: 'Profile', name: 'Profile', icon: 'fas fa-user' },
    // { id: 'Resume', name: 'Resume', icon: 'fas fa-user' },
    { id: 'noysi', name: 'Noysi', icon: 'far fa-comment-alt' },
    { id: 'Achievements', name: 'Achievements', icon: 'fas fa-user' },

  ];

  useEffect(() => {
    const checkGuidelinesStatus = async () => {
      try {
        const response = await apiService.get(`/api/check-guidelines/${candidateID}`);
        if (!response.data.guidelinesAccepted) {
          setShowGuidelines(true);
        }
        setGuidelinesAccepted(response.data.guidelinesAccepted);
      } catch (error) {
        console.error('Failed to check guidelines status:', error);
      }
    };

    checkGuidelinesStatus();
  }, []);


  const handleGuidelinesAccept = async () => {
    try {
      console.log("candidateID :", candidateID);
      await apiService.post(`/api/accept-guidelines/${candidateID}`);
      console.log("accepted");
      setGuidelinesAccepted(true);
      setShowGuidelines(false);
      // Redirect the user to the next page or continue the application flow
    } catch (error) {
      console.error('Failed to accept guidelines:', error);
    }
  };

  const animatedImageUrl = 'https://img.freepik.com/premium-vector/cute-kawaii-robot-character-friendly-chat-bot-assistant-online-applications-cartoon-vector-illustration_1093343-236.jpg'; // Replace with the actual path to your animated guide image

  
  const tourSteps = [
    {
      target: '.intern-toggle-button',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
          Click here to open or close the sidebar.
        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-Dashboard',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
        This is your Dashboard, where you can view a comprehensive overview of your key statistics and track your progress in real-time.        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-Applied',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
          This is the Applied section, where you can view all the jobs you've applied to and track your application status.
        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-Jobs',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
          This is the Jobs section, where you can browse posted job opportunities and apply directly from here.
        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-LMS',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
        This is the LMS section, where you can access course materials and engage with your study resources.        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-Quiz',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
          This is the Quiz section where you can complete tests assigned to you.
        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '#menu-item-Profile',
      placement: 'right',
      content: (
        <div style={{display:"flex"}}>
        <div>
        This is the Profile section, where you can view and update your personal information.        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
    {
      target: '.Logout',
      placement: 'top',
      content: (
        <div style={{display:"flex"}}>
        <div>
          Click here to logout.
        </div>
          <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
        </div>
      ),
    },
  ];
  

  // Handler for showing guidelines
  const handleShowGuidelines = () => {
    setShowGuidelines(true);
  };

  // Handler for starting tour
  const handleStartTour = () => {
    setShowWelcome(false);
    setRunTour(true);
  };

  const handleMenuItemClick = (view) => {
    setSelectedView(view);
    navigate(`/intern_dash/${view.toLowerCase()}`);
  };

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    navigate('/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const NoysiRedirect = () => {
    useEffect(() => {
      window.open("https://connect.ramanasoft.com", "_blank");
    }, []);
  
    return null;
  };
  
  
  const renderContent = () => {
    switch (selectedView) {
      // case 'Resume':
      //   return <ResumeDash />
        
      case 'Dashboard':
        return <Home setSelectedView={setSelectedView} />;
      case 'Applied':
        return <AppliedJobs />;
      case 'Jobs':
        return <JobPortal setSelectedView={setSelectedView} />;
      case 'Quiz':
        return <Quiz />;
      case 'Profile':
        return <Profile />;
      case 'LMS':
        return <Lmsdash />;  
        
        case 'Achievements': 
        return <Achievements />;
        case 'noysi':
          return <NoysiRedirect />;

      default:
        return <Home setSelectedView={setSelectedView} />;
    }
  };
  

  return (
    <>
{/* <div id="carouselExampleRide" class="carousel slide" data-bs-ride="true" touch="true" wrap="true" style={{width:"100%", height:"5vh", background:"white"}} >
  <div class="carousel-inner" style={{fontSize:"18px", textAlign:"center", alignItems:"center"}}>
    <div class="carousel-item active">
        <p>Project 01</p>
    </div>
    <div class="carousel-item">
      <p>Project 02</p>
    </div>
    <div class="carousel-item">
      <p>Project 03</p>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div> */}
    <div className={`intern_dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {showWelcome && (
        <WelcomeTour
          onStart={handleStartTour}
          onSkip={() => setShowWelcome(false)}
        />
      )}

      {showGuidelines && (
        <GuidelinesModal
          open={showGuidelines}
          guidelinesAccepted={guidelinesAccepted}
          onAccept={handleGuidelinesAccept}
          onClose={() => setShowGuidelines(false)}
        />
      )}

      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={({ status }) => {
          if (['finished', 'skipped'].includes(status)) {
            setRunTour(false);
          }
        }}
      />

      <nav className={`intern-side-nav ${isSidebarOpen ? 'open' : 'closed'}`} style={{ backgroundColor: "#1e1f21" }}>
        <div className="logo">
          {isSidebarOpen ?
            <div style={{ display: "flex", gap: "8px" }}>
              <img className="logo-img" src={p3} alt="logo" />
              <button
                title='Intern Guidelines'
                style={{ width: "15px", color: "white", background: "none", border: "none" }}
                onClick={handleShowGuidelines}
              >
                <FontAwesomeIcon icon={faInfo} />
              </button>

              <button
                title='Quick Tour'
                style={{ width: "15px", color: "white", background: "none", border: "none" }}
                onClick={handleStartTour}
              >
                <FontAwesomeIcon icon={faEthereum} />
              </button>
            </div>
            : ''}
        </div>

        <button className="intern-toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
        </button>

        <div className="icons-container">
          <ul>
            {menuItems
            .filter((i) => (i.id !== "Achievements"))
            .map((item) => (
              <li
                key={item.id}
                id={`menu-item-${item.id}`}
                onClick={() => handleMenuItemClick(item.id)}
                className={selectedView === item.id ? 'active' : ''}
              >
                <i className={item.icon}></i>
                {isSidebarOpen && <span>{item.name}</span>}
              </li>
            ))}
          </ul>
        </div>

        <Button
          className="Logout"
          variant="outlined"
          onClick={handleLogout}
          style={{
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            fontSize: "13px",
            position: "absolute",
            bottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s, color 0.3s",
          }}
        >
          Logout <FontAwesomeIcon icon={faSignOutAlt} />
        </Button>
      </nav>

      <div className={`intern-main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`} style={{ background: "#000000" }} >
        {renderContent()}
      </div>
    </div>
    </>
  );
};

export default InternDashboard;


// import React, { useState, useEffect } from 'react';
// import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Checkbox, FormControlLabel } from '@mui/material';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// import { faInfo, faTimes, faBars, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
// import { faEthereum } from '@fortawesome/free-brands-svg-icons';
// import Joyride from 'react-joyride';
// import { useNavigate, useLocation } from 'react-router-dom';
// import Cookies from 'js-cookie'
// import './styles/internDash.css';
// import AppliedJobs from './AppliedJobs.js';
// import Profile from './Profile.js';
// import JobPortal from './JobPortal';
// import p3 from '../images/p3.jpeg';
// import Quiz from './quiz/Quiz.js';
// import Lmsdash from './LMS/Lmsdash.js';
// import Home from './intern_home.js';

// const WelcomeTour = ({ onStart, onSkip }) => {
//   return (
//     <Dialog open={true} onClose={onSkip}>
//       <DialogTitle>Welcome to Your Dashboard!</DialogTitle>
//       <DialogContent>
//         <Typography variant="body1" className="mb-4">
//           Would you like to take a quick tour to learn about all the features available to you?
//         </Typography>
//       </DialogContent>
//       <DialogActions>
//         <Button variant="outline" onClick={onSkip}>
//           Skip Tour
//         </Button>
//         <Button onClick={onStart}>
//           Start Tour
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const GuidelinesModal = ({ open, onAccept }) => {
//   const [accepted, setAccepted] = useState(false);

//   // const handleAccept = async () => {
//   //   try {
//   //     // Make API call to store guidelines acceptance
//   //     const response = await fetch('/api/guidelines/accept', {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         accepted: true,
//   //         acceptedAt: new Date().toISOString()
//   //       })
//   //     });

//   //     if (response.ok) {
//   //       onAccept();
//   //     } else {
//   //       console.error('Failed to store guidelines acceptance');
//   //     }
//   //   } catch (error) {
//   //     console.error('Error storing guidelines acceptance:', error);
//   //   }
//   // };

  
//   return (
//     <Dialog open={open} onClose={() => {}} maxWidth="md" fullWidth>
//       <DialogTitle>Internship Guidelines</DialogTitle>
//       <DialogContent className="space-y-4">
        // <ol className="list-decimal pl-6 space-y-2">
        //     <li><strong>Uninformed Absences:</strong> More than 3 uninformed leaves without prior approval will result in immediate termination.</li>
        //     <li><strong>Non-Compliance with Dress Code:</strong> Repeated failure to wear ID cards or follow the dress code will result in disciplinary action. Prohibited attire includes sweatshirts, torn jeans, and T-shirts with inappropriate prints (e.g., bad words). Losing your ID card will result in a ₹500 fine for a replacement.</li>
        //     <li><strong>Language:</strong> Please communicate in English while on the floor.</li>
        //     <li><strong>Dress Code:</strong> Always wear formal shoes and adhere to the professional dress code. Boys must tuck in their shirts.</li>
        //     <li><strong>Equipment:</strong> Bring your own laptop daily.</li>
        //     <li><strong>Failure to Provide Work Status Updates:</strong> Daily work status updates must be submitted on group channels and via email. Consistent failure to provide these updates will result in termination.</li>
        //     <li><strong>Misuse of Communication Tools:</strong> Failure to use required tools (e.g., Noysi) or using them improperly can lead to termination.</li>
        //     <li><strong>Leave Policy:</strong> Planned leave must be requested at least 1 day in advance with necessary documents. Unplanned leave should be communicated to the manager and HR immediately. Interview leave requires notification at least 1 day prior with supporting documents.</li>
        //     <li><strong>Violation of Code of Conduct:</strong> Disrespectful or unprofessional behavior can lead to immediate termination.</li>
        //     <li><strong>Performance Issues:</strong> Failing to meet performance expectations or not submitting tasks can result in termination.</li>
        //     <li><strong>Repeated Leave Violations:</strong> Exceeding the allowed leave without prior approval will result in termination.</li>
        //     <li><strong>Insubordination:</strong> Refusing reasonable instructions may lead to termination.</li>
        //     <li><strong>Harassment and Discrimination:</strong> Any form of harassment, discrimination, or bullying will result in immediate termination.</li>
        //     <li><strong>Substance Abuse:</strong> Being under the influence during work hours will lead to immediate termination.</li>
        //     <li><strong>Theft or Misappropriation:</strong> Stealing or misusing company property will lead to termination.</li>
        //     <li><strong>Breach of Confidentiality:</strong> Unauthorized sharing of confidential information will result in termination.</li>
        //     <li><strong>Failure to Meet Internship Requirements:</strong> Not meeting minimum hours or project completion may result in termination.</li>
        //     <li><strong>Attendance at Meetings and Training:</strong> Absences from mandatory sessions without approval will lead to disciplinary action.</li>
        //     <li><strong>Rejecting or Not Attending Mock Interviews:</strong> This will lead to termination.</li>
        //     <li><strong>Use of Company Resources:</strong> Misusing resources can lead to termination.</li>
        //     <li><strong>Conflict of Interest:</strong> Outside employment conflicting with internship duties requires approval or may result in termination.</li>
        //     <li><strong>Professional Development:</strong> Lack of growth initiative may lead to termination.</li>
        //     <li><strong>Attendance:</strong> Maintaining 90% attendance is mandatory for completion.</li>
        //   </ol>
        
//         <FormControlLabel
//           control={
//             <Checkbox 
//               checked={accepted} 
//               onChange={(e) => setAccepted(e.target.checked)}
//               className="mt-4"
//             />
//           }
//           label="I have read and accept the internship guidelines"
//         />
//       </DialogContent>
//       <DialogActions>
//         <Button
//           disabled={!accepted}
//           // onClick={handleAccept}
//           variant={accepted ? 'default' : 'outline'}
//         >
//           Accept and Continue
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const InternDashboard = ({ defaultTab, onShowGuidelines, onStartTour }) => {
//   const [showGuidelines, setShowGuidelines] = useState(false);
//   const [showWelcome, setShowWelcome] = useState(false);
//   const [runTour, setRunTour] = useState(false);
//   const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
//   const [selectedView, setSelectedView] = useState(defaultTab || 'Dashboard');
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
//   const navigate = useNavigate();


//   const menuItems = [
//     { id: 'Dashboard', name: 'Dashboard', icon: 'fas fa-home' },
//     { id: 'Applied', name: 'Applied', icon: 'fas fa-edit' },
//     { id: 'Jobs', name: 'Jobs', icon: 'fas fa-chalkboard-user' },
//     { id: 'LMS', name: 'LMS', icon: 'fas fa-book' },
//     { id: 'Quiz', name: 'Quiz', icon: 'fas fa-laptop-code' },
//     { id: 'Profile', name: 'Profile', icon: 'fas fa-user' },
//   ];
  

//   // useEffect(() => {
//   //   // Check if user has accepted guidelines
//   //   const checkGuidelines = async () => {
//   //     try {
//   //       const response = await fetch('/api/guidelines/status');
//   //       const data = await response.json();
        
//   //       if (!data.accepted) {
//   //         setShowGuidelines(true);
//   //       } else {
//   //         setGuidelinesAccepted(true);
//   //       }
//   //     } catch (error) {
//   //       console.error('Error checking guidelines status:', error);
//   //     }
//   //   };

//   //   checkGuidelines();
//   // }, []);

//   const handleGuidelinesAccept = () => {
//     setShowGuidelines(false);
//     setGuidelinesAccepted(true);
//     setShowWelcome(true);
//   };

//   const handleStartTour = () => {
//     setShowWelcome(false);
//     setRunTour(true);
//   };


//   const handleMenuItemClick = (view) => {
//     setSelectedView(view);
//     navigate(`/intern_dash/${view.toLowerCase()}`);
//   };

//   const handleLogout = () => {
//     Object.keys(Cookies.get()).forEach(cookieName => {
//       Cookies.remove(cookieName);
//     });
//     navigate('/');
//   };

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   const renderContent = () => {
//     switch (selectedView) {
//       case 'Dashboard':
//         return <Home setSelectedView={setSelectedView} />;
//       case 'Applied':
//         return <AppliedJobs />;
//       case 'Jobs':
//         return <JobPortal setSelectedView={setSelectedView} />;
//       case 'Quiz':
//         return <Quiz />;
//       case 'Profile':
//         return <Profile />;
//       case 'LMS':
//         return <Lmsdash />;
//       default:
//         return <Home setSelectedView={setSelectedView} />;
//     }
//   };

//   const tourSteps = [
//     {
//       target: '.dashboard-header',
//       content: 'Welcome to your dashboard! This is where you can access all features.',
//       placement: 'bottom'
//     },
//     // Add more tour steps as needed
//   ];

//   // if (!guidelinesAccepted) {
//   //   return <GuidelinesModal open={showGuidelines} onAccept={handleGuidelinesAccept} />;
//   // }

//   return (
//     <div className={`intern_dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
//       {showWelcome && (
//         <WelcomeTour 
//           onStart={handleStartTour}
//           onSkip={() => setShowWelcome(false)}
//         />
//       )}

//       {showGuidelines && (
//         <GuidelinesModal 
//           open={showGuidelines}
//           onAccept={handleGuidelinesAccept}
//         />
//       )}

//       <Joyride
//         steps={tourSteps}
//         run={runTour}
//         continuous
//         showProgress
//         showSkipButton
//         callback={({ status }) => {
//           if (['finished', 'skipped'].includes(status)) {
//             setRunTour(false);
//           }
//         }}
//       />


// <nav className={`intern-side-nav ${isSidebarOpen ? 'open' : 'closed'}`} style={{ backgroundColor: "#2D3748" }}>
//         <div className="logo">
//           {isSidebarOpen ? 
//           <div style={{display:"flex", gap:"8px"}}>
//           <img className="logo-img" src={p3} alt="logo" />
//           <button
//           style={{width:"15px", color:"white", background:"none", border:"none"}}
//           onClick={onShowGuidelines}
//         >
//           <FontAwesomeIcon icon={faInfo} />
//         </button>
        
//         <button
//           style={{width:"15px", color:"white", background:"none", border:"none"}}
//           onClick={onStartTour}
//         >
//           <FontAwesomeIcon icon={faEthereum} />
//         </button>    
//         </div>       
//            : ''}

//         </div>
//         <button className="intern-toggle-button" onClick={toggleSidebar}>
//           <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
//         </button>
//         <div className="icons-container">
//           <ul>
//             {menuItems.map((item) => (
//               <li
//                 key={item.id}
//                 id={`menu-item-${item.id}`} // ID for targeting in Joyride
//                 onClick={() => handleMenuItemClick(item.id)}
//                 className={selectedView === item.name ? 'active' : ''}
//               >
//                 <i className={item.icon}></i>
//                 {isSidebarOpen && <span>{item.name}</span>}
//               </li>
//             ))}
//           </ul>
//         </div>
//         <Button
//           className="Logout"
//           variant="outlined"
//           onClick={handleLogout}
//           style={{
//             color: "#fff",
//             border: "none",
//             padding: "10px 20px",
//             fontSize: "13px",
//             position: "absolute",
//             bottom: "10px",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//             boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//             transition: "background-color 0.3s, color 0.3s",
//           }}
//         >
//           Logout <FontAwesomeIcon icon={faSignOutAlt} />
//         </Button>
//       </nav>
//       <div className={`intern-main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default InternDashboard;

// // import React, { useState, useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// // import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
// // import Joyride from 'react-joyride'; // Import Joyride
// // import './styles/internDash.css';
// // import AppliedJobs from './AppliedJobs.js';
// // import Profile from './Profile.js';
// // import JobPortal from './JobPortal';
// // import p3 from '../images/p3.jpeg';
// // import Quiz from './quiz/Quiz.js';
// // import Cookies from 'js-cookie';
// // import Lmsdash from './LMS/Lmsdash.js';
// // import Home from './intern_home.js';
// // import {
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   Button,
// //   Typography,
// //   Checkbox,
// //   FormControlLabel
// // } from '@mui/material';

// // function GuidelinesModal() {
// //   const [open, setOpen] = useState(false);
// //   const [accepted, setAccepted] = useState(false);

// //   const handleClickOpen = () => {
// //     setOpen(true);
// //   };

// //   const handleClose = () => {
// //     setOpen(false);
// //     setAccepted(false); // Reset the checkbox on close
// //   };

// //   const handleAcceptChange = (event) => {
// //     setAccepted(event.target.checked);
// //   };

// //   return (
// //     <div>
// //       <Button variant="contained" color="primary" onClick={handleClickOpen}>
// //         View Internship Guidelines
// //       </Button>
      
// //       <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
// //         <DialogTitle>Internship Guidelines</DialogTitle>
// //         <DialogContent dividers>
// //           <ol>
// //             <li><strong>Uninformed Absences:</strong> More than 3 uninformed leaves without prior approval will result in immediate termination.</li>
// //             <li><strong>Non-Compliance with Dress Code:</strong> Repeated failure to wear ID cards or follow the dress code will result in disciplinary action. Prohibited attire includes sweatshirts, torn jeans, and T-shirts with inappropriate prints (e.g., bad words). Losing your ID card will result in a ₹500 fine for a replacement.</li>
// //             <li><strong>Language:</strong> Please communicate in English while on the floor.</li>
// //             <li><strong>Dress Code:</strong> Always wear formal shoes and adhere to the professional dress code. Boys must tuck in their shirts.</li>
// //             <li><strong>Equipment:</strong> Bring your own laptop daily.</li>
// //             <li><strong>Failure to Provide Work Status Updates:</strong> Daily work status updates must be submitted on group channels and via email. Consistent failure to provide these updates will result in termination.</li>
// //             <li><strong>Misuse of Communication Tools:</strong> Failure to use required tools (e.g., Noysi) or using them improperly can lead to termination.</li>
// //             <li><strong>Leave Policy:</strong> Planned leave must be requested at least 1 day in advance with necessary documents. Unplanned leave should be communicated to the manager and HR immediately. Interview leave requires notification at least 1 day prior with supporting documents.</li>
// //             <li><strong>Violation of Code of Conduct:</strong> Disrespectful or unprofessional behavior can lead to immediate termination.</li>
// //             <li><strong>Performance Issues:</strong> Failing to meet performance expectations or not submitting tasks can result in termination.</li>
// //             <li><strong>Repeated Leave Violations:</strong> Exceeding the allowed leave without prior approval will result in termination.</li>
// //             <li><strong>Insubordination:</strong> Refusing reasonable instructions may lead to termination.</li>
// //             <li><strong>Harassment and Discrimination:</strong> Any form of harassment, discrimination, or bullying will result in immediate termination.</li>
// //             <li><strong>Substance Abuse:</strong> Being under the influence during work hours will lead to immediate termination.</li>
// //             <li><strong>Theft or Misappropriation:</strong> Stealing or misusing company property will lead to termination.</li>
// //             <li><strong>Breach of Confidentiality:</strong> Unauthorized sharing of confidential information will result in termination.</li>
// //             <li><strong>Failure to Meet Internship Requirements:</strong> Not meeting minimum hours or project completion may result in termination.</li>
// //             <li><strong>Attendance at Meetings and Training:</strong> Absences from mandatory sessions without approval will lead to disciplinary action.</li>
// //             <li><strong>Rejecting or Not Attending Mock Interviews:</strong> This will lead to termination.</li>
// //             <li><strong>Use of Company Resources:</strong> Misusing resources can lead to termination.</li>
// //             <li><strong>Conflict of Interest:</strong> Outside employment conflicting with internship duties requires approval or may result in termination.</li>
// //             <li><strong>Professional Development:</strong> Lack of growth initiative may lead to termination.</li>
// //             <li><strong>Attendance:</strong> Maintaining 90% attendance is mandatory for completion.</li>
// //           </ol>
          
// //           <Typography variant="body1" gutterBottom>
// //             I have read, understood, and agree to comply with the above internship guidelines. I acknowledge that failure to comply may result in termination from the program.
// //           </Typography>
          
// //           <FormControlLabel
// //             control={<Checkbox checked={accepted} onChange={handleAcceptChange} color="primary" />}
// //             label="I accept the internship guidelines."
// //           />
// //         </DialogContent>
        
// //         <DialogActions>
// //           <Button onClick={handleClose} color="secondary">
// //             Close
// //           </Button>
// //           {accepted && (
// //             <Button variant="contained" color="primary" onClick={() => {handle}}>
// //               Accept and Continue
// //             </Button>
// //           )}
// //         </DialogActions>
// //       </Dialog>
// //     </div>
// //   );
// // }

// // const InternDashboard = ({ defaultTab }) => {
//   // const navigate = useNavigate();
// //   const location = useLocation();
//   // const [selectedView, setSelectedView] = useState(defaultTab || 'Dashboard');
//   // const [isSidebarOpen, setIsSidebarOpen] = useState(true);
// //   const [runTour, setRunTour] = useState(false);
// //   const [ShowGuidelinesModal, setShowGuidelinesModal] = useState(true);

// //   const handleCloseModal = () => {
// //     setShowGuidelinesModal(false); // Close modal when dismissed
// //   };
// //   useEffect(() => {
// //     const hasSeenTour = localStorage.getItem('hasSeenTour');
// //     if (!hasSeenTour) {
// //       setRunTour(true);
// //       localStorage.setItem('hasSeenTour', 'true'); // Mark tour as seen
// //     }
// //   }, []);

// //   useEffect(() => {
// //     const searchParams = new URLSearchParams(location.search);
// //     const tab = searchParams.get('tab') || defaultTab || 'Dashboard';
// //     if (tab) {
// //       setSelectedView(tab.charAt(0).toUpperCase() + tab.slice(1));
// //     }
// //   }, [location, defaultTab]);

//   // const menuItems = [
//   //   { id: 'Dashboard', name: 'Dashboard', icon: 'fas fa-home' },
//   //   { id: 'Applied', name: 'Applied', icon: 'fas fa-edit' },
//   //   { id: 'Jobs', name: 'Jobs', icon: 'fas fa-chalkboard-user' },
//   //   { id: 'LMS', name: 'LMS', icon: 'fas fa-book' },
//   //   { id: 'Quiz', name: 'Quiz', icon: 'fas fa-laptop-code' },
//   //   { id: 'Profile', name: 'Profile', icon: 'fas fa-user' },
//   // ];

//   // const handleMenuItemClick = (view) => {
//   //   setSelectedView(view);
//   //   navigate(`/intern_dash/${view.toLowerCase()}`);
//   // };

//   // const handleLogout = () => {
//   //   Object.keys(Cookies.get()).forEach(cookieName => {
//   //     Cookies.remove(cookieName);
//   //   });
//   //   navigate('/');
//   // };

//   // const toggleSidebar = () => {
//   //   setIsSidebarOpen(!isSidebarOpen);
//   // };

//   // const renderContent = () => {
//   //   switch (selectedView) {
//   //     case 'Dashboard':
//   //       return <Home setSelectedView={setSelectedView} />;
//   //     case 'Applied':
//   //       return <AppliedJobs />;
//   //     case 'Jobs':
//   //       return <JobPortal setSelectedView={setSelectedView} />;
//   //     case 'Quiz':
//   //       return <Quiz />;
//   //     case 'Profile':
//   //       return <Profile />;
//   //     case 'LMS':
//   //       return <Lmsdash />;
//   //     default:
//   //       return null;
//   //   }
//   // };

// //   const animatedImageUrl = 'https://img.freepik.com/premium-vector/cute-kawaii-robot-character-friendly-chat-bot-assistant-online-applications-cartoon-vector-illustration_1093343-236.jpg'; // Replace with the actual path to your animated guide image

// //   const steps = [
// //     {
// //       target: '.intern-toggle-button',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           Click here to open or close the sidebar.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-Dashboard',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the Dashboard section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-Applied',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the Applied Jobs section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-Jobs',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the Jobs section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-LMS',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the LMS section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-Quiz',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the Quiz section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '#menu-item-Profile',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           This is the Profile section.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //     {
// //       target: '.Logout',
// //       content: (
// //         <div style={{display:"flex"}}>
// //         <div>
// //           Click here to logout.
// //         </div>
// //           <img src={animatedImageUrl} alt="Guide animation" style={{ width: '100px', marginRight: '10px' }} />
// //         </div>
// //       ),
// //     },
// //   ];
  

// //   return (
// //     <div className={`intern_dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
// //             {ShowGuidelinesModal && <GuidelinesModal onClose={handleCloseModal} />} {/* Render modal at the beginning */}
// //       <Joyride
// //         steps={steps}
// //         run={runTour}
// //         continuous
// //         showProgress
// //         showSkipButton
// //         callback={({ action }) => {
// //           if (action === 'close' || action === 'skip') {
// //             setRunTour(false); // End tour if closed or skipped
// //           }
// //         }}
        
//     //   />
//     //   <nav className={`intern-side-nav ${isSidebarOpen ? 'open' : 'closed'}`} style={{ backgroundColor: "#2D3748" }}>
//     //     <div className="logo">
//     //       {isSidebarOpen ? <img className="logo-img" src={p3} alt="logo" /> : ''}
//     //     </div>
//     //     <button className="intern-toggle-button" onClick={toggleSidebar}>
//     //       <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
//     //     </button>
//     //     <div className="icons-container">
//     //       <ul>
//     //         {menuItems.map((item) => (
//     //           <li
//     //             key={item.id}
//     //             id={`menu-item-${item.id}`} // ID for targeting in Joyride
//     //             onClick={() => handleMenuItemClick(item.id)}
//     //             className={selectedView === item.name ? 'active' : ''}
//     //           >
//     //             <i className={item.icon}></i>
//     //             {isSidebarOpen && <span>{item.name}</span>}
//     //           </li>
//     //         ))}
//     //       </ul>
//     //     </div>
//     //     <Button
//     //       className="Logout"
//     //       variant="outlined"
//     //       onClick={handleLogout}
//     //       style={{
//     //         color: "#fff",
//     //         border: "none",
//     //         padding: "10px 20px",
//     //         fontSize: "13px",
//     //         position: "absolute",
//     //         bottom: "10px",
//     //         display: "flex",
//     //         alignItems: "center",
//     //         gap: "8px",
//     //         boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
//     //         transition: "background-color 0.3s, color 0.3s",
//     //       }}
//     //     >
//     //       Logout <FontAwesomeIcon icon={faSignOutAlt} />
//     //     </Button>
//     //   </nav>
//     //   <div className={`intern-main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
//     //     {renderContent()}
//     //   </div>
//     // </div>
// //   );
// // };

// // export default InternDashboard;


