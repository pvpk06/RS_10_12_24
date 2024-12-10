import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet, useParams } from 'react-router-dom';
import './HR_Dash.css';
import RSLogo from './RSLogo.png';
import Cookies from 'js-cookie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import HrPortal from './Home/HrDashboard';
import { Dropdown } from 'react-bootstrap';
import JobApplicationsTable from './Home/StudentsApplied'
import StudentsPlaced from './Home/StudentsPlaced';
import JobStatus from '../JobStatus/JobStatus';
import HrJobDesc from '../HrViewJobs/HrJobDesc';
import StudentDetails from './Home/StudentData';
import CompanyData from './Home/CompanyData';
import HrPostJobs from '../HrPostJobs/HrPostJobs';
import HrLMSDash from '../LMS/HrLMSDash';
import RegistrationRequests from '../Intern_Requests/RegistrationRequests';
import ProfilePage from '../HrProfile/HrProfile';
import HrViewJobs from '../HrViewJobs/HrViewJobs';
import HrLeads from '../JobStatus/HrLeads';
import CertificateGenerator from '../Certificate/certificate';
import QuizDash from '../Quiz/quiz/quizdash';
import CreateDash from '../Quiz/quiz/QuizCreate/CreateDash';
import GuestRegistrationRequests from '../Intern_Requests/guestRequests';
import OfferLetter from '../Offer_Letter/offerLetter'
import PreviewQuiz from '../Quiz/quiz/preview/preview';
import InternBulkRegister from '../BulkRegister/InternBulkUpload';
import GuestBulkRegister from '../BulkRegister/GuestBulkUpload';
import apiService from '../../../apiService';
import InternTable from '../intern_data/internData';
import GuestData from '../intern_data/guestData';
const HRDash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedView, setSelectedView] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [accessibleMenuItems, setAccessibleMenuItems] = useState([]);

  const { '*': currentPath } = useParams();
  const name = Cookies.get('name');
  const HRid = Cookies.get("HRid");
  const menuItems = [
    { id: 'home', name: 'Dashboard', icon: 'fas fa-home' },
    {
      id: 'jobGallery', name: 'Jobs Gallery', icon: 'fas fa-list',
      submenu: [
        { id: 'postjob', name: 'Post a Job', icon: 'fas fa-plus' },
        { id: 'jobs', name: 'All Jobs', icon: 'fas fa-list' },
        { id: 'companies', name: 'Companies', icon: 'fas fa-caret-square-right' },
      ]
    },
    { id: 'lms', name: 'LMS', icon: 'fas fa-book' },
    { id: 'quiz', name: 'Quiz', icon: 'fa-solid fa-list-check' },
    { id: 'allInterns', name: 'All Interns', icon: 'fas fa-list' },
    { id: 'allGuests', name: 'All Guests', icon: 'fas fa-list' },

    { id: 'internRequests', name: 'Intern Requests', icon: 'fa fa-user-plus' },
    { id: 'guestRequests', name: 'Guest Requests', icon: 'fa fa-user-plus' },
    { id: 'internshipCertificate', name: 'Certificate', icon: 'fa fa-file-alt' },
    { id: 'offerLetter', name: 'Offer Letter', icon: 'fas fa-sticky-note' },
	      {
      id: 'bulkRegister', name: 'Bulk Register', icon: 'fas fa-file-export',
      submenu: [
        { id: 'bulkIntern', name: 'Interns', icon: 'fas fa-file-export' },
        { id: 'bulkGuest', name: 'Guests', icon: 'fas fa-file-export' },
      ]
    },
    { id: 'profile', name: 'Profile', icon: 'fa fa-user' },
  ];


  // useEffect(() => {
  //   const fetchAccessRights = async () => {
  //     try {
  //       const response = await apiService.get(`/api/hr_access/${HRid}`);
  //       const allowedAccess = response.data.access; // Array of accessible menu item IDs.
  
  //       // Filter menu items based on access rights.
  //       const filterMenuItems = (items) =>
  //         items.filter(item => {
  //           if (item.submenu) {
  //             item.submenu = filterMenuItems(item.submenu);
  //             return allowedAccess.includes(item.id) || item.submenu.length > 0;
  //           }
  //           return allowedAccess.includes(item.id);
  //         });
  
  //       const filteredItems = filterMenuItems(menuItems);
  
  //       // Ensure "Dashboard" and "Profile" are always accessible.
  //       const mandatoryItems = menuItems.filter(item =>
  //         ['home', 'profile'].includes(item.id)
  //       );
  //       const finalMenuItems = [...mandatoryItems, ...filteredItems];
  
  //       setAccessibleMenuItems(finalMenuItems);
  //     } catch (error) {
  //       console.error('Failed to fetch access rights:', error);
  //     }
  //   };
  
  //   fetchAccessRights();
  // }, [HRid]);
  

  useEffect(() => {
    const fetchAccessRights = async () => {
      try {
        const response = await apiService.get(`/api/hr_access/${HRid}`);
        const allowedAccess = response.data.access; // Array of accessible menu item IDs.
        const filterMenuItems = (items) =>
          items.filter(item => {
            if (item.submenu) {
              item.submenu = filterMenuItems(item.submenu);
              return allowedAccess.includes(item.id) || item.submenu.length > 0;
            }
            return allowedAccess.includes(item.id);
          });
        setAccessibleMenuItems(filterMenuItems(menuItems));
      } catch (error) {
        console.error('Failed to fetch access rights:', error);
      }
    };

    fetchAccessRights();
  }, [HRid]);

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2) {
      const view = pathParts[2];
      setSelectedView(view);
    }
  }, [location]);

  const handleMenuItemClick = (id) => {
    setSelectedView(id);
    navigate(`/HR_dash/${id}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  const toggleSubmenu = (id) => {
    setExpandedMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const logout = () => {
    Object.keys(Cookies.get()).forEach(cookieName => {
      Cookies.remove(cookieName);
    });

    navigate("/")
  }

  const renderMenuItem = (item) => (
    <li key={item.id} className="menu-item-container">
      <div
        className={`menu-item ${selectedView === item.id ? 'active' : ''}`}
        onClick={() => item.submenu ? toggleSubmenu(item.id) : handleMenuItemClick(item.id)}
      >
        <i className={item.icon}></i>
        {isSidebarOpen && <span>{item.name}</span>}
        {item.submenu && isSidebarOpen && (
          <i className={`submenu-toggle fas ${expandedMenus[item.id] ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        )}
      </div>
      {item.submenu && expandedMenus[item.id] && (
        <ul className="submenu">
          {item.submenu.map(subItem => (
            <li
              key={subItem.id}
              className={`submenu-item ${selectedView === subItem.id ? 'active' : ''}`}
              onClick={() => handleMenuItemClick(subItem.id)}
            >
              <i className={subItem.icon}></i>
              {isSidebarOpen && subItem.name}
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  const renderContent = () => {

    if (currentPath.startsWith('job_desc/')) {
      const jobId = currentPath.split('/')[1];
      return <HrJobDesc jobId={jobId} setSelectedView={setSelectedView} />;
    }


    if (currentPath.startsWith('student/')) {
      const candidateID = currentPath.split('/')[1];
      console.log("candidateID", candidateID);
      return (
        <StudentDetails candidateID={candidateID} />
      );
    }

    if (currentPath.startsWith('preview/')) {
      const token = currentPath.split('/')[1];
      console.log(token);
      return (
        <PreviewQuiz token={token} />
      );
    }

    if (currentPath.startsWith('edit/')) {
      const defaultTab = currentPath.split('/')[1];
      const token = currentPath.split('/')[2];
      console.log("Default tab, token :", defaultTab, token);
      return <CreateDash defaultTab={defaultTab} token={token} />;
    }


    if (currentPath.startsWith('companies/')) {
      const companyID = currentPath.split('/')[1];
      return <CompanyData companyID={companyID} />;
    }

    const statusMapping = {
      "students-qualified": "qualified",
      "students-placed": "placed",
      "students-not-placed": "not-placed",
      "not-attended": "not-attended",
      "under-progress": "under-progress",
      "interns-not-interested": "not-interested",
      "not-eligible": "not-eligible",
      "eligible": "eligible",
      "level-1": "level-1",
      "level-2": "level-2",
      "level-3": "level-3",
    };

    switch (selectedView) {

      case 'lms':
        return <HrLMSDash />

      case 'quiz':
        return <QuizDash />

      case 'internRequests':
        return <RegistrationRequests />;

      case 'guestRequests':
        return <GuestRegistrationRequests />

      case 'postjob':
        return <HrPostJobs />;

      case 'jobs':
        return <HrViewJobs />;

        case 'allInterns':
          return <InternTable />;
  
        case 'allGuests' :
          return <GuestData />

      case 'companies':
        return <HrLeads />

      case 'internshipCertificate':
        return <CertificateGenerator />

      case 'offerLetter':
        return <OfferLetter />

      case 'bulkIntern':
        return <InternBulkRegister />
      case 'bulkGuest':
        return <GuestBulkRegister />


      case 'profile':
        return <ProfilePage />

      case "students-applied":
        return <JobApplicationsTable />

      case "students-qualified":
	    case "students-not-qualified":
      case "students-placed":
      case "students-not-placed":
      case "not-attended":
      case "interns-not-interested":
      case "not-eligible":
      case "under-progress":
      case "eligible":
      case 'level-1':
      case 'level-2':
      case 'level-3':
        return <StudentsPlaced status={statusMapping[selectedView]} />;

      case "hr-leads":
        return <HrLeads />
      case "all-jobs":
        return <JobStatus statusInfo="all-jobs" />;
      case "jd-received":
        return <JobStatus statusInfo="jd-received" />;
      case "profiles-sent":
        return <JobStatus statusInfo="profiles-sent" />;
      case "drive-scheduled":
        return <JobStatus statusInfo="drive-scheduled" />;
      case "drive-done":
        return <JobStatus statusInfo="drive-done" />;
        case "offer-received":
          return <JobStatus statusInfo="offer-received" />;
        
      case "not-interested":
        return <JobStatus statusInfo="not-interested" />;
      case 'dashboard':
        return <HrPortal />


      default:
        return <HrPortal />;
    }
  };

  return (
    <div className={`dashboard ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <nav className={`SA_side-nav ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          {isSidebarOpen ? <img className="logo-img" src={RSLogo} alt='text' /> : ''}
        </div>
        <button className="SA-toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
        </button>
        <div className='icons-container'>
          <ul>
            {accessibleMenuItems.map(renderMenuItem)}
          </ul>
        </div>
      </nav>
      <div className={`main-content ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <div className="top-panel">
          <div className="pvpk">
            <Dropdown.Item className="btn bg-transparent logout-btn fw-bold w-100 pt-0" style={{cursor:"auto"}}>
              {name}
            </Dropdown.Item>
            <button
              onClick={logout}
              className="btn bg-transparent logout-btn fw-bold w-100 pt-0"
              style={{ color: 'white' }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        </div>

        {renderContent()}
        <Outlet />
      </div>
    </div>
  );
};

export default HRDash;

