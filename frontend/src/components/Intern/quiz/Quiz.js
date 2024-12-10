import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import { Card, Button, Container, Row, Col, ListGroup } from 'react-bootstrap';
import { Typography } from '@mui/material';
import { FaClock } from 'react-icons/fa';

const Quiz = () => {
  const user_id = Cookies.get("internID");
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [submittedQuizzes, setSubmittedQuizzes] = useState([]);
  
  // Add 5:30 to current time to match IST
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toISOString();
  });

  
  const handleQuizSubmission = (event) => {
    const { quizToken } = event.detail;
    // Move the quiz from assigned to submitted
    setAssignedQuizzes(prev => prev.filter(quiz => quiz.token !== quizToken));
    const submittedQuiz = assignedQuizzes.find(quiz => quiz.token === quizToken);
    if (submittedQuiz) {
      setSubmittedQuizzes(prev => [...prev, { ...submittedQuiz, status: true }]);
    }
  };
  
  
  useEffect(() => {
    console.log("Fetching data...");
    fetchData();
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(new Date(now.getTime() + (5.5 * 60 * 60 * 1000)).toISOString());
    }, 1000);
    window.addEventListener('quizSubmitted', handleQuizSubmission);
    
    return () => {
      console.log("Clearing interval timer");
      clearInterval(timer);
    };
  }, [user_id]);

  const fetchData = async () => {
    try {
      const response = await apiService.get(`/api/user-quizzes/${user_id}`);
      
      const data = response.data;
      const assigned = data.filter(quiz => !quiz.status);
      const submitted = data.filter(quiz => quiz.status);

      // Log times (they're already in IST from API)
      data.forEach((quiz) => {
        console.log(`Quiz: ${quiz.quiz_name}`);
        console.log(`IST Start: ${quiz.schedule_quiz_from}`);
        console.log(`IST End: ${quiz.schedule_quiz_to}`);
      });

      setAssignedQuizzes(assigned);
      setSubmittedQuizzes(submitted);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const formatTimeRemaining = (totalSeconds) => {
    if (totalSeconds < 60) {
      return `${totalSeconds}s remaining`;
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`;
    }
    return `${minutes}m ${seconds}s remaining`;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} IST`;
  };

  const getQuizStatus = (scheduleFrom, scheduleTo) => {
    const now = new Date(currentTime);
    const start = new Date(scheduleFrom);
    const end = new Date(scheduleTo);
    
    console.log("IST schedule from:", scheduleFrom);
    console.log("IST schedule To:", scheduleTo);
    console.log("IST schedule Now:", currentTime);
    
    // Compare timestamps directly since all times are in IST
    const nowTime = now.getTime();
    const startTime = start.getTime();
    const endTime = end.getTime();
  
    // If current time is before the start
    if (nowTime < startTime) {
      const totalSeconds = Math.ceil((startTime - nowTime) / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
  
      let timeText = '';
      if (hours > 0) {
        timeText = `Starts in ${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeText = `Starts in ${minutes}m ${seconds}s`;
      } else {
        timeText = `Starts in ${seconds}s`;
      }
  
      return {
        status: 'not available',
        time: timeText,
        color: '#1976d2'
      };
    }
  
    // If current time is between start and end
    if (nowTime >= startTime && nowTime <= endTime) {
      const totalSeconds = Math.ceil((endTime - nowTime) / 1000);
      return {
        status: 'available',
        time: formatTimeRemaining(totalSeconds),
        color: '#2e7d32'
      };
    }
  
    // If current time is past the end
    return {
      status: 'expired',
      time: 'Quiz expired',
      color: '#d32f2f'
    };
  };

  const handleAttemptQuiz = (quizId) => {
    const url = `/test/${quizId}`;
        const quizWindow = window.open(url, '_blank');
    // Poll every 2 seconds to check if quiz window is closed
    const checkWindow = setInterval(async () => {
      if (quizWindow.closed) {
        clearInterval(checkWindow);
        // Refetch data when quiz window closes
        await fetchData();
      }
    }, 2000);
  };

  const handleViewAnalysis = (quizToken) => {
    const url = `/quiz-analysis/${user_id}/${quizToken}`;
    window.open(url, '_blank');
  };

  return (
    <Container style={{ marginTop: '20px' }}>
      {assignedQuizzes.length > 0 ? (
        <Row>
          <Col>
            <Typography variant="h5" gutterBottom>
              Available Quizzes
            </Typography>
            <ListGroup>
              {assignedQuizzes.map((quiz) => {
                const { status, time, color } = getQuizStatus(quiz.schedule_quiz_from, quiz.schedule_quiz_to);
                const startTime = formatTime(quiz.schedule_quiz_from);
                const endTime = formatTime(quiz.schedule_quiz_to);

                return (
                  <ListGroup.Item key={quiz.id} className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <Typography
                            style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: '#333',
                              marginBottom: '4px'
                            }}
                          >
                            {quiz.quiz_name}
                          </Typography>
                          <Typography variant="body2" style={{ color: '#666' }}>
                            Scheduled: {startTime} - {endTime}
                          </Typography>
                        </div>
                        <div className="text-end">
                          {status === 'available' && (
                            <Button
                              onClick={() => handleAttemptQuiz(quiz.token)}
                              style={{
                                backgroundColor: '#007bff',
                                color: '#fff',
                                padding: '10px 15px',
                                border: 'none',
                                borderRadius: '5px',
                                fontWeight: 'bold',
                                marginBottom: '8px'
                              }}
                              className="w-100"
                            >
                              Attempt Quiz
                            </Button>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color }}>
                            <FaClock style={{ marginRight: '5px' }} />
                            <Typography style={{ color }}>
                              {time}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Col>
        </Row>
      ) : (
        <Typography variant="body1" align="center" style={{ margin: '20px 0', color:"white" }}>
          No quizzes assigned
        </Typography>
      )}

      {submittedQuizzes.length > 0 && (
        <Row style={{ marginTop: '40px' }}>
          <Col>
            <Typography variant="h5" gutterBottom  style={{color:"white"}}>
              Your Submissions
            </Typography>
            <ListGroup>
              {submittedQuizzes.map((quiz) => (
                <ListGroup.Item key={quiz.id} className="mb-3">
                    <Card.Body className="d-flex justify-content-between align-items-center">
                      <Typography variant="h6">{quiz.quiz_name}</Typography>
                      <Button 
                        onClick={() => handleViewAnalysis(quiz.token)}
                        style={{background:"#1e1f21", border:"none"}}
                      >
                        View Analysis
                      </Button>
                    </Card.Body>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Quiz;

