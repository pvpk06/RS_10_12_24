import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './quizattempt.css';
import apiService from '../../../apiService';
import { Pagination, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const SuccessPopup = ({ message, onClose }) => (
  <div className="Attempt_popupStyle">
    <p>{message}</p>
    <button onClick={onClose}>Close</button>
  </div>
);

const QuizAttempt = () => {
  const { token } = useParams();
  const user_id = Cookies.get("internID");
  const [quizData, setQuizData] = useState(null);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(5);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await apiService.get(`/api/get-quiz/${token}`);
        const data = response.data;

        if (typeof data.pages_data === 'string') {
          data.pages_data = JSON.parse(data.pages_data);
        }

        if (data.randomize_questions) {
          data.pages_data = data.pages_data.map(page => ({
            ...page,
            question_list: shuffleArray(page.question_list)
          }));
        }

        setQuizData(data);
        setQuestionsPerPage(data.no_of_qns_per_page || 5);

        // Initialize time limit
        let timeLimit = data.time_limit ? data.time_limit * 60 : 0; // Convert minutes to seconds

        const savedStartTime = localStorage.getItem(`startTime_${token}_${user_id}`);
        const savedTimeLeft = localStorage.getItem(`timeLeft_${token}_${user_id}`);

        if (savedStartTime && savedTimeLeft) {
          const now = new Date();
          const elapsedSinceLastSave = Math.floor((now - new Date(savedStartTime)) / 1000);
          timeLimit = Math.max(0, parseInt(savedTimeLeft, 10) - elapsedSinceLastSave);
        } else {
          localStorage.setItem(`startTime_${token}_${user_id}`, new Date().toISOString());
        }

        setTimeLeft(timeLimit);
        localStorage.setItem(`timeLeft_${token}_${user_id}`, timeLimit);

      } catch (error) {
        setError('Error fetching quiz data');
      }
    };

    fetchQuizData();
  }, [token, user_id]);

  useEffect(() => {
    if (timeLeft <= 0 || !quizData) return;

    const timerId = setInterval(() => {
      setTimeLeft(prevTimeLeft => {
        const newTime = prevTimeLeft - 1;
        localStorage.setItem(`timeLeft_${token}_${user_id}`, newTime);
        
        if (newTime <= 0) {
          clearInterval(timerId);
          handleSubmit(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, quizData, token, user_id]);

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };


  const convertToUTC = (dateString) => {
    console.log('Converting to UTC:', dateString);
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const result = utcDate.toISOString().slice(0, 19).replace('T', ' ');
    console.log('Converted UTC time:', result);
    return result;
  };


  function formatMySQLDate(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

  const handleInputChange = (questionText, value) => {
    setResponses(prevResponses => ({
      ...prevResponses,
      [questionText]: value
    }));
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!quizData) return;

    const startTime = localStorage.getItem(`startTime_${token}_${user_id}`);
    const endTime = new Date().toISOString();
    const duration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000);

    const formattedResponses = Object.entries(responses).map(([questionText, answer]) => ({
      questionText,
      answer
    }));

    const submissionData = {
      userId: user_id,
      token,
      responses: formattedResponses,
      startTime:formatMySQLDate(startTime),
      endTime:formatMySQLDate(endTime),
      duration
    };

    if (isAutoSubmit) {
      await submitQuiz(submissionData);
    } else {
      const allQuestions = quizData.pages_data.reduce((acc, page) => 
        acc.concat(page.question_list || []), []);
      const answeredQuestions = Object.keys(responses).length;
      
      setConfirmationData({
        totalQuestions: allQuestions.length,
        answeredQuestions,
        unansweredQuestions: allQuestions.length - answeredQuestions,
        submissionData
      });
      setShowConfirmation(true);
    }
  };

  // const submitQuiz = async (submissionData) => {
  //   try {
  //     await apiService.post('/api/submit-quiz', submissionData);
  //     cons
  //     await apiService.put(`/api/update-user-quiz-status/${submissionData.userId}/${submissionData.token}`);
  //     setShowSuccessPopup(true);
  //     localStorage.removeItem(`timeLeft_${token}_${user_id}`);
  //     localStorage.removeItem(`startTime_${token}_${user_id}`);
  //   } catch (error) {
  //     console.log(error);
  //     setError('Error submitting quiz');
  //   }
  // };

// Modified QuizAttempt.js component
const submitQuiz = async (submissionData) => {
  try {
    await apiService.post('/api/submit-quiz', submissionData);
    console.log('Quiz submitted successfully');
    await apiService.put(`/api/update-user-quiz-status/${submissionData.userId}/${submissionData.token}`);
        // Dispatch custom event for quiz submission
        const event = new CustomEvent('quizSubmitted', {
          detail: { quizToken: submissionData.token }
        });
        window.dispatchEvent(event);

    setShowSuccessPopup(true);
    localStorage.removeItem(`timeLeft_${token}_${user_id}`);
    localStorage.removeItem(`startTime_${token}_${user_id}`);
  } catch (error) {
    console.error('Error submitting quiz:', error.response ? error.response.data : error.message);
    setError('Error submitting quiz');
  }
};


  // const submitQuiz = async (submissionData) => {
  //   try {
  //     console.log('Submitting quiz data:', submissionData);
  //     await apiService.post('/api/submit-quiz', submissionData);
  //     console.log('Quiz submitted successfully');
      // await apiService.put(`/api/update-user-quiz-status/${submissionData.userId}/${submissionData.token}`);
  //     console.log('User quiz status updated');
  //     // const result = await apiService.get(`/api/calculate-results/${submissionData.token}/${submissionData.userId}`);
  //     // console.log('Quiz result:', result.data); // You can store or display this data if needed.
  
  //     setShowSuccessPopup(true);
  //     localStorage.removeItem(`timeLeft_${token}_${user_id}`);
  //     localStorage.removeItem(`startTime_${token}_${user_id}`);
  //   } catch (error) {
  //     console.error('Error submitting quiz:', error.response ? error.response.data : error.message);
  //     setError('Error submitting quiz');
  //   }
  // };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: 'QUIZ_SUBMITTED', token }, '*');
    }
    window.close(); // Close the window after submission
  };

  
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const getQuestionsForCurrentPage = () => {
    if (!quizData) return [];

    const allQuestions = quizData.pages_data.reduce((acc, page) => 
      acc.concat(page.question_list || []), []);
    const start = (currentPage - 1) * questionsPerPage;
    const end = start + questionsPerPage;
    return allQuestions.slice(start, end);
  };

  if (error) return <div className="Attempt_error">Error: {error}</div>;
  if (!quizData) return <div className="Attempt_loading">Loading...</div>;

  const questionsForCurrentPage = getQuestionsForCurrentPage();
  const numPages = Math.ceil(quizData.pages_data.reduce((acc, page) => 
    acc + (page.question_list?.length || 0), 0) / questionsPerPage);

  return (
    <div className="Attempt_container">
      <h2 className="Attempt_heading">Quiz Attempt</h2>
      <div className="Attempt_timeLeft">Time Left: {formatTime(timeLeft)}</div>
      {questionsForCurrentPage.length > 0 ? (
        <div className="Attempt_questionPreview">
          {questionsForCurrentPage.map((question, index) => (
            <div key={index} className="Attempt_questionContainer">
              <p className="Attempt_questionHeader">
                Question {index + 1 + (currentPage - 1) * questionsPerPage}
              </p>
              <p className="Attempt_questionText" 
                dangerouslySetInnerHTML={{ __html: question.question_text }}>
              </p>
              {question.options_list?.map((option, optionIndex) => (
                <div key={optionIndex} className="Attempt_option">
                  <label>
                    <input
                      type="radio"
                      name={`question-${index + 1}`}
                      value={option}
                      checked={responses[question.question_text] === option}
                      onChange={(e) => handleInputChange(question.question_text, e.target.value)}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
          ))}
          
          <div className="Attempt_paginationControls">
            <Pagination
              count={numPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </div>

          <button 
            className="Attempt_button Attempt_submitButton" 
            onClick={() => handleSubmit(false)}
          >
            Submit Quiz
          </button>
        </div>
      ) : (
        <p>No questions available for this page.</p>
      )}

      {showSuccessPopup && (
        <SuccessPopup 
          message="Quiz submitted successfully!" 
          onClose={handleClosePopup} 
        />
      )}

      <Dialog
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Quiz Submission"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmationData && (
              <>
                <p>Total Questions: {confirmationData.totalQuestions}</p>
                <p>Answered Questions: {confirmationData.answeredQuestions}</p>
                <p>Unanswered Questions: {confirmationData.unansweredQuestions}</p>
                <p>Are you sure you want to submit the quiz?</p>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmation(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              setShowConfirmation(false);
              submitQuiz(confirmationData.submissionData);
            }} 
            autoFocus
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuizAttempt;

