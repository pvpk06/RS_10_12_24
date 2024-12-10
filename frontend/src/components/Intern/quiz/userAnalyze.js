import React, { useState, useEffect } from 'react';
import apiService from '../../../apiService';
import { useParams } from 'react-router-dom';
import './useranalysis.css';

const UserQuizAnalysis = () => {
  const { userId, quizToken } = useParams();
  const [analysisData, setAnalysisData] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await apiService.get(`/api/quiz-analysis/${userId}/${quizToken}`);
        console.log('API Response:', response.data);
        setAnalysisData(response.data); // Set the array of attempts
        if (response.data.length > 0) {
          setSelectedAttempt(response.data[0]); // Default to the latest attempt
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz analysis:', err);
        setError('Error fetching quiz analysis');
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [userId, quizToken]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  if (analysisData.length === 0) {
    return <div>No data available</div>;
  }

  const handleAttemptChange = (attemptNumber) => {
    const selected = analysisData.find(attempt => attempt.attempt_number === attemptNumber);
    setSelectedAttempt(selected);
  };

  const { responses, start_time, end_time, duration, score, grade } = selectedAttempt || {};
  const totalQuestions = responses?.length || 0;
  const correctAnswers = responses?.filter(r => r.is_correct).length || 0;

  return (
    <div className="analysis-container">
      <h2>Quiz Analysis</h2>

      <div className="attempt-selection">
        <label>Select Attempt: </label>
        <select onChange={e => handleAttemptChange(Number(e.target.value))} value={selectedAttempt?.attempt_number || ''}>
          {analysisData.map(attempt => (
            <option key={attempt.attempt_number} value={attempt.attempt_number}>
              Attempt {attempt.attempt_number}
            </option>
          ))}
        </select>
      </div>

      {selectedAttempt && (
        <>
          <div className="result-summary">
            <p>Date submitted: {new Date(end_time).toLocaleString()}</p>
            <p>Score: {score} ({grade})</p>
            <p>Duration: {duration}s</p>
          </div>

          <h3>Your Responses</h3>
          {totalQuestions === 0 && <p>No responses found</p>}
          {responses.map((response, index) => (
            <div key={index} className="question-container">
              <div className="question-header">
                <span className={response.is_correct ? "correct" : "incorrect"}>
                  {response.is_correct ? "✓" : "✗"}
                </span>
                <span>Points: {response.is_correct ? "1/1" : "0/1"}</span>
              </div>
              <div className="question-content">
                <p dangerouslySetInnerHTML={{ __html: response.questionText || 'No question text' }}></p>
                <div className={`option ${response.is_correct ? 'correct' : 'incorrect'}`}>
                  Your answer: {response.answer}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default UserQuizAnalysis;

