import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiService from '../../apiService';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = ({ setSelectedView }) => {
  const internID = Cookies.get('internID');
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showCards, setShowCards] = useState([]);
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    courseProgress: { count: 0, percentage: 0 },
    jobStatus: { applied: 0, shortlisted: 0, total: 0 },
    testsAttended: { completed: 0, passed: 0 },
    Achievements: { totalAchievements:0 },

  });
  const [userName, setUserName] = useState('User');


  const handleMenuItemClick = (view) => {
    setSelectedView(view);
    navigate(`/intern_dash/${view.toLowerCase()}`);
  };

  

  useEffect(() => {
    // Fetch data when the component mounts
    fetchUserName();
    fetchCourseProgress();
    fetchJobStatus();
    fetchQuizStatus();
    fetchAchievementStatus();
  }, []);

  // Sequentially show greeting and cards
  useEffect(() => {
    if (!loading) {
      setShowGreeting(true);
      cardData.forEach((_, index) => {
        setTimeout(() => {
          setShowCards((prev) => [...prev, index]);
        }, (index + 1) * 500); // delay each card by 500ms
      });
    }
  }, [loading]);

  const fetchUserName = async () => {
    try {
      const { data } = await apiService.get(`/api/user-name/${internID}`);
      setUserName(data.userName || 'User');
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const fetchCourseProgress = async () => {
    try {
      const { data } = await apiService.get(`/api/dashboard-course-progress/${internID}`);
      console.log("Course Data :", data);
      setDashboardData((prevData) => ({ ...prevData, courseProgress: data }));
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  const fetchJobStatus = async () => {
    try {
      const { data } = await apiService.get(`/api/dashboard-job-status/${internID}`);
      console.log("Jobs Data :", data);
      setDashboardData((prevData) => ({ ...prevData, jobStatus: data }));
    } catch (error) {
      console.error('Error fetching job status:', error);
    }
  };

  const fetchQuizStatus = async () => {
    try {
      const { data } = await apiService.get(`/api/dashboard-quiz-status/${internID}`);
      console.log("Quiz Data :", data);
      setDashboardData((prevData) => ({ ...prevData, testsAttended: data }));
    } catch (error) {
      console.error('Error fetching quiz status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievementStatus = async () => {
    try {
      const { data } = await apiService.get(`/api/dashboard-achievements-status/${internID}`);
      console.log("Achievements Data :", data);
      setDashboardData((prevData) => ({ ...prevData, Achievements: data }));
    } catch (error) {
      console.error('Error fetching quiz status:', error);
    } finally {
      setLoading(false);
    }
  };

  const cardData = [
    {
      title: 'Course Progress',
      color: '#1e1f21',
      icon: '📚',
      mainText: `${dashboardData.courseProgress.percentage}% Completed`,
      progress: dashboardData.courseProgress.percentage,
      view: 'LMS'
    },
    {
      title: 'Jobs Status',
      color: '#1e1f21',
      icon: '✍️',
      mainText: `${dashboardData.jobStatus.applied} Applications`,
      view: 'Applied'
    },
    {
      title: 'Tests Attended',
      color: '#1e1f21',
      icon: '📑',
      mainText: `${dashboardData.testsAttended.completed} Completed`,
      view: 'Quiz'
    },
    {
      title: 'Achivements',
      color: '#1e1f21',
      icon: '📃',
      mainText: `${dashboardData.Achievements.totalAchievements} Achieved`,
      view: 'Achievements'
    }
  ];

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '32px',
      opacity: showGreeting ? 1 : 0,
      transform: showGreeting ? 'translateY(0)' : 'translateY(-20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
    greeting: {
      fontSize: '32px',
      fontWeight: '500',
      color: '#ffffff',
      WebkitBackgroundClip: 'text',
      textShadow: '2px 2px 4px rgba(255, 255, 255, 255)',
      transition: 'all 0.3s ease',
    },
    greetingHover: {
      textShadow: '2px 2px 6px rgba(255, 255, 255, 0.8)',
      transform: 'scale(1.05)',
    },
    cardsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      cursor:'pointer'
    },
    cardContent: {
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
    },
    icon: {
      fontSize: '32px',
      marginBottom: '8px',
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '500',
      marginBottom: '4px',
    },
    card: {
      padding: '24px',
      borderRadius: '12px',
      opacity: 0,
      color: 'white',
      transform: 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
    cardVisible: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    progressBarContainer: {
      width: '100%',
      backgroundColor: '#ccc',
      height: '8px',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    progressBar: (percentage) => ({
      width: `${percentage}%`,
      backgroundColor: '#4caf50',
      height: '100%',
      borderRadius: '4px',
    }),
  };

  if (loading) {
    return <div >Loading dashboard data...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1
          style={{
            ...styles.greeting,
            ...(isHovered ? styles.greetingHover : {}),
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Hello, {userName}!
        </h1>
      </div>
      <div style={styles.cardsGrid}>
        {cardData.map((card, index) => (
          <Card
            key={index}
            style={{
              ...styles.card,

              backgroundColor: card.color,
              ...(showCards.includes(index) ? styles.cardVisible : {}),
            }}
            onClick={() => handleMenuItemClick(card.view)}
          >
            <div style={styles.cardContent}>
              <span style={styles.icon}>{card.icon}</span>
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <div style={{ fontSize: '24px', fontWeight: '600', marginTop: '8px' }}>{card.mainText}</div>
              
              {/* Progress bar for Course Progress */}
              {card.title === 'Course Progress' && (
                <div style={styles.progressBarContainer}>
                  <div style={styles.progressBar(card.progress)} />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Home;
