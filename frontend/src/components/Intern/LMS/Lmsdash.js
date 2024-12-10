import React, { useState, useEffect } from 'react';
import {
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogActions,
  FormControl,
  FormControlLabel,
  DialogContent,
  Radio,
  RadioGroup,
  IconButton,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Container } from 'react-bootstrap';
import Cookies from 'js-cookie';
import apiService from '../../../apiService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const TopicCard = ({ topic, onViewLessons, onTakeCourse, isLocked }) => (
  <Card
    // sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', background:"#1e1f21" }}
    sx={{
      height: '200px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#2c2c2c',
      color: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h5" component="div" gutterBottom style={{ color: "white" }}>
        {topic.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" style={{ color: "white" }}>
        {topic.description}
      </Typography>

      {isLocked ? (
        <LockIcon color="disabled" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
      ) : (
        <LockOpenIcon color="success" sx={{ position: 'absolute', top: '16px', right: '16px' }} />
      )}
      {/* <Button color="primary" onClick={onViewLessons} sx={{ mt: 2 }}>
        View Lessons
      </Button> */}
    </CardContent>
    <button
      style={{
        backgroundColor: isLocked ? '#444' : '#000',
        color: isLocked ? '#aaa' : 'white',
        height: '40px',
        border: '2px solid #1e1f21',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        fontWeight: 'bold',
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transition: 'background 0.3s ease',
      }}
      // style={{background:"none", color:"white", height:"50px", border:"none"}}
      onClick={onTakeCourse}
      disabled={isLocked} // Disable button if the topic is locked
      sx={{ m: 2 }}
    >
      Take Course
    </button>
  </Card>
);

// const TopicCard = ({ topic, onTakeCourse, isLocked }) => (
//   <Card
// sx={{
//   height: '200px',
//   width: '300px',
//   display: 'flex',
//   flexDirection: 'column',
//   justifyContent: 'space-between',
//   backgroundColor: '#2c2c2c',
//   color: 'white',
//   borderRadius: '8px',
//   boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
//   position: 'relative',
//   transition: 'transform 0.3s ease, box-shadow 0.3s ease',
//   '&:hover': {
//     transform: 'scale(1.05)',
//     boxShadow: '0 8px 12px rgba(0, 0, 0, 0.4)',
//   },
// }}
//   >
//     <CardContent sx={{ flexGrow: 1, padding: '16px' }}>
//       <Typography
//         variant="h6"
//         sx={{ fontWeight: 'bold', marginBottom: '8px' }}
//       >
//         {topic.name}
//       </Typography>
//       <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '14px' }}>
//         {topic.description}
//       </Typography>
//       {isLocked ? (
//         <LockIcon
//           color="disabled"
//           sx={{
//             position: 'absolute',
//             top: '16px',
//             right: '16px',
//           }}
//         />
//       ) : (
//         <LockOpenIcon
//           color="success"
//           sx={{
//             position: 'absolute',
//             top: '16px',
//             right: '16px',
//           }}
//         />
//       )}
//     </CardContent>
//     <button
// style={{
//   backgroundColor: isLocked ? '#444' : '#007bff',
//   color: isLocked ? '#aaa' : 'white',
//   height: '40px',
//   border: 'none',
//   borderBottomLeftRadius: '8px',
//   borderBottomRightRadius: '8px',
//   fontWeight: 'bold',
//   cursor: isLocked ? 'not-allowed' : 'pointer',
//   transition: 'background 0.3s ease',
// }}
//       onClick={onTakeCourse}
//       disabled={isLocked}
//     >
//       {isLocked ? 'Locked' : 'Take Course'}
//     </button>
//   </Card>
// );


const LessonDialog = ({ open, onClose, lessons }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogContent>
      <List>
        {lessons.map((lesson, index) => (
          <ListItem key={index}>
            <ListItemText primary={lesson.name} />
          </ListItem>
        ))}
      </List>
    </DialogContent>
  </Dialog>
);



const QuizModal = ({
  quizOpen,
  setQuizOpen,
  currentQuiz,
  quizResponses,
  setQuizResponses,
  quizSubmitted,
  setQuizSubmitted,
  quizScore,
  setQuizScore,
  courseStatus,
  setCourseStatus,
  handleQuizResponse,
  handleSubmitQuiz,
}) => {
  const [quizPhase, setQuizPhase] = useState('instructions'); // Moved to the new component

  const totalQuestions = currentQuiz?.pages_data[0]?.question_list.length || 0;
  const correctAnswers = Object.values(quizResponses).filter(
    (response, index) => response === currentQuiz.pages_data[0]?.question_list[index]?.correct_answer
  ).length;

  const renderInstructionsPage = () => (
    <DialogContent>
      <Typography variant="h6" gutterBottom>
        Complete the following quiz before moving further!
      </Typography>
      <Typography variant="body1" paragraph>
        Here are some important guidelines you must consider:
      </Typography>
      <Typography variant="body1" component="ul">
        <li>This quiz contains {totalQuestions} questions.</li>
        <li>Select only one answer for each question.</li>
        <li>You must score at least 100% to proceed to the next content.</li>
        <li>You can submit the quiz multiple times.</li>
        <li>You will move further once you secure 100% in this quiz.</li>
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Click "Start Quiz" when you're ready to begin.
      </Typography>
    </DialogContent>
  );

  const renderQuizQuestions = () => (
    <DialogContent>
      {currentQuiz?.pages_data[0]?.question_list.map((question, index) => (
        <div key={question.question_id} className="Attempt_questionPreview">
          <Typography
            variant="subtitle1"
            className="Attempt_questionHeader"
            dangerouslySetInnerHTML={{
              __html: `${question.question_text || question.text || 'Question Text Missing'}`,
            }}
          />
          <RadioGroup
            name={`question-${question.question_id}`}
            value={quizResponses[question.question_id] || ''}
            onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
          >
            {question.options_list.map((option, optIndex) => (
              <div key={optIndex} className="Attempt_option">
                <input
                  type="radio"
                  value={option}
                  checked={quizResponses[question.question_id] === option}
                  onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
                />
                <label>{option}</label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
    </DialogContent>
  );

  const renderQuizResults = () => (
    <DialogContent>
      <Typography
        variant="h6"
        color={'black'}
        className="Attempt_error"
      >
        Your score: {quizScore !== null ? `${quizScore.toFixed(2)}%` : 'N/A'}
        {quizScore === 100
          ? ' - Great job! You can now proceed to the next content.'
          : ' - Please try again to unlock the next content.'}
      </Typography>
      <Typography variant="body1" className="Attempt_detail">
        Total Questions: {totalQuestions}
      </Typography>
      <Typography variant="body1" className="Attempt_detail">
        Correct Answers: {correctAnswers}
      </Typography>
      <Typography
        variant="body1"
        className="Attempt_detail"
        sx={{
          color: quizScore !== null && quizScore === 100 ? 'green' : 'red', // Conditional styling
        }}
      >
        {quizScore !== null && correctAnswers / totalQuestions > 0.7
          ? "You're doing great! Keep it up!"
          : "Consider reviewing the material before attempting the quiz again."}
      </Typography>
    </DialogContent>
  );

  return (
    <Dialog
      open={quizOpen}
      onClose={() => {
        setQuizOpen(false);
        setQuizPhase('instructions'); // Reset quiz phase
      }}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          width: '98%',
          height: '98%',
          maxHeight: '90vh',
        },
      }}
      classes={{ paper: 'Attempt_container' }}
    >
      {quizPhase === 'instructions' && renderInstructionsPage()}
      {quizPhase === 'quiz' && renderQuizQuestions()}
      {quizPhase === 'results' && renderQuizResults()}

      <DialogActions>
        <button
          onClick={() => setQuizOpen(false)}
          style={{
            background: 'none',
            border: '1px solid black',
            color: 'black',
            height: '35px',
            borderRadius: '3px',
          }}
        >
          Close
        </button>

        {quizPhase === 'instructions' && (
          <Button
            onClick={() => setQuizPhase('quiz')}
            color="primary"
            variant="contained"
            className="Attempt_button"
          >
            Start Quiz
          </Button>
        )}

        {quizPhase === 'quiz' && (
          <Button
            onClick={() => {
              handleSubmitQuiz();
              setQuizPhase('results');
            }}
            color="primary"
            variant="contained"
            className="Attempt_button Attempt_submitButton"
          >
            Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const LMS_dash = () => {
  const internID = Cookies.get('internID');
  const [courses, setCourses] = useState({});
  const [courseStatus, setCourseStatus] = useState({});
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [iframeUrl, setIframeUrl] = useState('');
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('overview');
  const [openSubTopics, setOpenSubTopics] = useState({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizResponses, setQuizResponses] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);

  useEffect(() => {
    if (internID) {
      fetchCoursesForIntern();
    }
  }, [internID]);

  const fetchCoursesForIntern = async () => {
    try {
      const response = await apiService.get(`/api/intern-courses/${internID}`);
      console.log("Data :", response.data);
      const organizedCourses = organizeData(response.data);
      setCourses(organizedCourses);
      fetchProgressForIntern(organizedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const organizeData = (data) => {
    console.log(data);
    const organized = {};
    data.forEach((item) => {
      // Initialize the course if not already created
      if (!organized[item.CourseName]) {
        organized[item.CourseName] = { topics: {}, quiz: item.Quiz || null };
      }

      // Initialize the topic if it exists and not already created
      if (item.Topic) {
        if (!organized[item.CourseName].topics[item.Topic]) {
          organized[item.CourseName].topics[item.Topic] = { subTopics: {}, quiz: item.Quiz || null };
        }

        // Initialize the subtopic if it exists and not already created
        if (item.SubTopic) {
          if (!organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic]) {
            organized[item.CourseName].topics[item.Topic].subTopics[item.SubTopic] = {
              materials: item.Materials || [],
              quiz: item.Quiz || null,
            };
          }
        }
      }
    });
    console.log("organized :", organized);
    return organized;
  };

  const fetchProgressForIntern = async (fetchedCourses) => {
    try {
      const response = await apiService.get(`/api/intern-progress/${internID}`);
      console.log(response.data);
      const progress = response.data.course_status || {};
      console.log("progress", progress);
      console.log(Object.keys(progress).length);
      // If intern progress is null or empty, unlock the first material
      if (Object.keys(progress).length === 0) {
        // Get the first course, topic, and subtopic
        const firstCourse = Object.keys(fetchedCourses)[0];
        console.log("firstCourse :", firstCourse);
        const firstTopic = Object.keys(fetchedCourses[firstCourse]?.topics || {})[0];
        console.log("firstTopic :", firstTopic);
        const firstSubTopic = Object.keys(fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics || {})[0];
        console.log("firstSubTopic :", firstSubTopic);
        const firstMaterial = fetchedCourses[firstCourse]?.topics[firstTopic]?.subTopics[firstSubTopic]?.materials[0];
        console.log("firstMaterial :", firstMaterial);
        if (firstMaterial) {
          // Set state to unlock the first material
          const initialCourseStatus = {
            [firstCourse]: {
              status: true,
              topics: {
                [firstTopic]: {
                  status: true,
                  subTopics: {
                    [firstSubTopic]: {
                      status: true,
                      materials: {
                        [firstMaterial.materialID]: true,
                      },
                    },
                  },
                },
              },
            },
          };

          setCourseStatus(initialCourseStatus);
          setSelectedCourse(firstCourse);
          setSelectedTopic(firstTopic);
          setSelectedSubTopic(firstSubTopic);
          setSelectedMaterial(firstMaterial);
          // setIframeUrl(`http://backend.ramanasoft.com:5000${firstMaterial.url}`);
          setIframeUrl(`https://backend.ramanasoft.com:5000${firstMaterial.url}`);

          // setIframeUrl(`https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

        }
      } else {
        setCourseStatus(progress);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  const handleCompleteMaterial = async () => {
    const updatedCourseStatus = {
      ...courseStatus,
      [selectedCourse]: {
        ...courseStatus[selectedCourse],
        status: true,
        topics: {
          ...courseStatus[selectedCourse]?.topics,
          [selectedTopic]: {
            ...courseStatus[selectedCourse]?.topics?.[selectedTopic],
            status: true,
            subTopics: {
              ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics,
              [selectedSubTopic]: {
                ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic],
                status: true,
                materials: {
                  ...courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials,
                  [selectedMaterial.materialID]: true,
                },
              },
            },
          },
        },
      },
    };

    setCourseStatus(updatedCourseStatus);

    try {
      await apiService.post('/api/update-progress', {
        internID,
        progress: updatedCourseStatus,
      });
      console.log("Progress updated successfully.");
      moveToNextMaterial(); // Move to the next material
      moveToNextTopic();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const moveToNextMaterial = () => {
    const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];

    if (currentTopicMaterials.length === 0) {
      console.log('No materials available in the current subtopic.');
      moveToNextSubTopic();
      return;
    }

    const currentIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);
    if (currentIndex === -1) {
      console.error('Current material not found in the current subtopic.');
      return;
    }

    // Check if quiz exists and is completed only if a quiz is present
    const subTopicData = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic];
    const quizExists = !!subTopicData?.quiz;  // Only check if quiz exists
    const quizCompleted = quizExists ? subTopicData?.quizCompleted === true : true; // Skip check if no quiz

    if (currentIndex === currentTopicMaterials.length - 1 && !quizCompleted && quizExists) {
      console.log('Complete the quiz before moving to the next subtopic.');
      return;
    }

    if (currentIndex < currentTopicMaterials.length - 1) {
      const nextMaterial = currentTopicMaterials[currentIndex + 1];
      if (!nextMaterial || !nextMaterial.url) {
        console.error('Next material is missing or has no URL.');
        return;
      }

      setSelectedMaterial(nextMaterial);
      setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);
      setCourseStatus(prevStatus => ({
        ...prevStatus,
        [selectedCourse]: {
          ...prevStatus[selectedCourse],
          topics: {
            ...prevStatus[selectedCourse].topics,
            [selectedTopic]: {
              ...prevStatus[selectedCourse].topics[selectedTopic],
              subTopics: {
                ...prevStatus[selectedCourse].topics[selectedTopic].subTopics,
                [selectedSubTopic]: {
                  ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic],
                  materials: {
                    ...prevStatus[selectedCourse].topics[selectedTopic].subTopics[selectedSubTopic].materials,
                    [nextMaterial.materialID]: true,
                  },
                },
              },
            },
          },
        },
      }));
    } else {
      moveToNextSubTopic();
    }
  };


  // Same for moveToNextSubTopicOrTopic
  const moveToNextSubTopicOrTopic = () => {
    const currentCourse = courses[selectedCourse];
    if (!currentCourse || !currentCourse.topics || !currentCourse.topics[selectedTopic]) {
      console.error('Selected course or topic is missing.');
      return;
    }

    const topic = currentCourse.topics[selectedTopic];
    const subTopics = topic.subTopics || {};

    const topicKeys = Object.keys(currentCourse?.topics || {});
    const currentTopicIndex = topicKeys.indexOf(selectedTopic);
    const subTopicKeys = Object.keys(subTopics);
    const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

    if (currentSubTopicIndex < subTopicKeys.length - 1) {
      const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
      const nextMaterial = subTopics[nextSubTopic]?.materials[0];

      setSelectedSubTopic(nextSubTopic);
      if (nextMaterial) {
        setSelectedMaterial(nextMaterial);
        // setIframeUrl(`http://backend.ramanasoft.com:5000${nextMaterial.url}`);
        setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);

      }

      setCourseStatus((prevStatus) => ({
        ...prevStatus,
        [selectedCourse]: {
          ...prevStatus[selectedCourse],
          topics: {
            ...prevStatus[selectedCourse].topics,
            [selectedTopic]: {
              ...prevStatus[selectedCourse].topics?.[selectedTopic],
              subTopics: {
                ...prevStatus[selectedCourse].topics?.[selectedTopic]?.subTopics,
                [nextSubTopic]: {
                  ...prevStatus[selectedCourse].topics?.[selectedTopic]?.subTopics?.[nextSubTopic],
                  status: true, // Unlock the next subtopic
                },
              },
            },
          },
        },
      }));
    } else if (currentTopicIndex < topicKeys.length - 1) {
      const nextTopic = topicKeys[currentTopicIndex + 1];
      setSelectedTopic(nextTopic);
    } else {
      console.log("All topics and subtopics completed!");
    }
  };


  // const moveToNextSubTopic = (updatedCourseStatus) => {
  //   const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
  //   const subTopicKeys = Object.keys(courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics || {});
  //   const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

  //   if (currentSubTopicIndex < subTopicKeys.length - 1) {
  //     const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
  //     const nextMaterial = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[nextSubTopic]?.materials?.[0];

  //     if (nextMaterial) {
  //       setSelectedSubTopic(nextSubTopic);
  //       setSelectedMaterial(nextMaterial);
  //       // setIframeUrl(`http://backend.ramanasoft.com:5000${nextMaterial.url}`);
  //       setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);

  //       // Unlock the next subtopic and its first material
  //       const updatedStatus = {
  //         ...updatedCourseStatus,
  //         [selectedCourse]: {
  //           ...updatedCourseStatus[selectedCourse],
  //           topics: {
  //             ...updatedCourseStatus[selectedCourse].topics,
  //             [selectedTopic]: {
  //               ...updatedCourseStatus[selectedCourse].topics[selectedTopic],
  //               subTopics: {
  //                 ...updatedCourseStatus[selectedTopic]?.subTopics,
  //                 [nextSubTopic]: {
  //                   status: true, // Unlock the subtopic
  //                   materials: {
  //                     [nextMaterial.materialID]: true, // Unlock the first material
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       };

  //       setCourseStatus(updatedStatus);
  //     } else {
  //       console.log("No materials available in the next subtopic.");
  //     }
  //   }
  // };



  const moveToNextSubTopic = (updatedCourseStatus) => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const subTopicKeys = Object.keys(courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics || {});
    const currentSubTopicIndex = subTopicKeys.indexOf(selectedSubTopic);

    // Check if the current subtopic has a quiz and if it's completed
    const currentSubTopicQuiz = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.quiz;
    const currentQuizCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.quizCompleted === true;

    if (currentSubTopicQuiz && !currentQuizCompleted) {
      console.log("Complete the quiz for the current subtopic before proceeding.");
      // Optionally, trigger the quiz modal or notify the user
      handleTakeQuiz(currentSubTopicQuiz, selectedCourse, selectedTopic, selectedSubTopic);
      return;
    }

    if (currentSubTopicIndex < subTopicKeys.length - 1) {
      const nextSubTopic = subTopicKeys[currentSubTopicIndex + 1];
      const nextMaterial = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[nextSubTopic]?.materials?.[0];

      if (nextMaterial) {
        setSelectedSubTopic(nextSubTopic);
        setSelectedMaterial(nextMaterial);
        setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);

        // Unlock the next subtopic and its first material
        const updatedStatus = {
          ...updatedCourseStatus,
          [selectedCourse]: {
            ...updatedCourseStatus[selectedCourse],
            topics: {
              ...updatedCourseStatus[selectedCourse].topics,
              [selectedTopic]: {
                ...updatedCourseStatus[selectedCourse].topics[selectedTopic],
                subTopics: {
                  ...updatedCourseStatus[selectedTopic]?.subTopics,
                  [nextSubTopic]: {
                    status: true, // Unlock the subtopic
                    materials: {
                      [nextMaterial.materialID]: true, // Unlock the first material
                    },
                  },
                },
              },
            },
          },
        };

        setCourseStatus(updatedStatus);
      } else {
        console.log("No materials available in the next subtopic.");
      }
    } else {
      console.log("No more subtopics available in this topic.");
    }
  };



  const moveToNextTopic = () => {
    const topicKeys = Object.keys(courses[selectedCourse]?.topics || {});
    const currentTopicIndex = topicKeys.indexOf(selectedTopic);

    // Check if all subtopics and their quizzes (if any) in the current topic are completed
    const allSubTopicsCompleted = Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).every((subTopic) => {
      const subTopicMaterials = courses[selectedCourse]?.topics[selectedTopic]?.subTopics?.[subTopic]?.materials || [];

      // Check if all materials in the subtopic are completed
      const allMaterialsCompleted = subTopicMaterials.every(
        (material) => courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
      );

      // Check if the quiz exists and is completed (only if it exists)
      const subTopicQuizExists = courses[selectedCourse]?.topics[selectedTopic]?.subTopics?.[subTopic]?.quiz != null;
      const subTopicQuizCompleted = !subTopicQuizExists ||
        courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopic]?.quizCompleted === true;

      return allMaterialsCompleted && subTopicQuizCompleted;
    });

    // Check if the quiz for the current topic exists and is completed (only if it exists)
    const topicQuizExists = courses[selectedCourse]?.topics[selectedTopic]?.quiz != null;
    const topicQuizCompleted = !topicQuizExists ||
      courseStatus[selectedCourse]?.topics?.[selectedTopic]?.quizCompleted === true;

    console.log("All subtopics completed:", allSubTopicsCompleted);
    console.log("Topic quiz completed:", topicQuizCompleted);

    // Move to the next topic if current topic requirements are met
    if (allSubTopicsCompleted && topicQuizCompleted && currentTopicIndex < topicKeys.length - 1) {
      const nextTopic = topicKeys[currentTopicIndex + 1];
      setSelectedTopic(nextTopic);

      const nextSubTopic = Object.keys(courses[selectedCourse].topics[nextTopic]?.subTopics || {})[0];
      if (nextSubTopic) {
        setSelectedSubTopic(nextSubTopic);

        const nextMaterial = courses[selectedCourse].topics[nextTopic].subTopics[nextSubTopic]?.materials[0];
        if (nextMaterial) {
          setSelectedMaterial(nextMaterial);
          setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);

          setCourseStatus((prevStatus) => ({
            ...prevStatus,
            [selectedCourse]: {
              ...prevStatus[selectedCourse],
              topics: {
                ...prevStatus[selectedCourse].topics,
                [nextTopic]: {
                  ...prevStatus[nextTopic],
                  subTopics: {
                    [nextSubTopic]: {
                      materials: {
                        [nextMaterial.materialID]: true,
                      },
                    },
                  },
                },
              },
            },
          }));
        }
      }
    } else {
      console.log("Complete all subtopics, their materials, and quizzes before moving to the next topic.");
    }
  };



  const handleViewLessons = (course, topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setLessonDialogOpen(true);
  };

  const handleTakeCourse = (course, topic) => {
    setSelectedCourse(course);
    setSelectedTopic(topic);
    setViewMode('detail');

    const firstSubTopic = Object.keys(courses[course]?.topics[topic]?.subTopics || {})[0];
    const firstMaterial = courses[course]?.topics[topic]?.subTopics[firstSubTopic]?.materials[0];
    setSelectedSubTopic(firstSubTopic);
    setSelectedMaterial(firstMaterial);
    // setIframeUrl(firstMaterial && `http://backend.ramanasoft.com:5000${firstMaterial.url}`);
    setIframeUrl(firstMaterial && `https://backend.ramanasoft.com:5000${firstMaterial.url}`);
    // setIframeUrl(firstMaterial && `https://ramanasoftwebsite-production.up.railway.app${firstMaterial.url}`);

  };

  const handleToggleSubTopic = (subTopic) => {
    setOpenSubTopics((prev) => ({
      ...prev,
      [subTopic]: !prev[subTopic],
    }));
  };

  const isMaterialUnlocked = (course, topic, subTopic, materialIndex) => {
    const courseData = courses[course];
    if (!courseData || !courseData.topics) return false;

    const topicData = courseData.topics[topic];
    if (!topicData || !topicData.subTopics) return false;

    const subTopicData = topicData.subTopics[subTopic];
    if (!subTopicData || !subTopicData.materials || subTopicData.materials.length <= materialIndex) return false;

    const material = subTopicData.materials[materialIndex];

    const isCompleted = courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true;

    if (Object.keys(courseStatus).length > 0) {
      return isCompleted || (materialIndex === 0 && courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.status === true);
    }

    return materialIndex === 0;
  };

  const renderTopicList = () => {
    return Object.entries(courses).map(([courseName, courseData]) => (
      <Grid container spacing={3} key={courseName} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Typography variant="h5" style={{ color: "white" }}>{courseName}</Typography>
        </Grid>
        <Grid item xs={12}>
          {renderQuiz(courseData.quiz, courseName)} {/* Render quiz here in a full-width grid item */}
        </Grid>
        {Object.entries(courseData.topics).map(([topicName, topicData]) => {
          const isTopicUnlocked = courseStatus[courseName]?.topics?.[topicName]?.status === true;
          return (
            <Grid item xs={12} sm={6} md={4} key={topicName}>
              <TopicCard
                topic={{
                  name: topicName,
                  description: topicData.description,
                }}
                onViewLessons={() => handleViewLessons(courseName, topicName)}
                onTakeCourse={() => handleTakeCourse(courseName, topicName)}
                isLocked={!isTopicUnlocked}
              />
            </Grid>
          );
        })}
      </Grid>
    ));
  };



  const renderDetailView = () => {
    if (!selectedCourse || !selectedTopic) return null;

    return (
      <Grid container>
        <Grid item xs={12} style={{ color: "white" }}>
          <IconButton onClick={() => setViewMode('overview')} sx={{ color: "white", gap: "10px" }}>
            <ArrowBackIcon /> Back
          </IconButton>
        </Grid>
        <Grid item xs={12} md={8} sx={{ maxHeight: '100%', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom style={{ color: "white" }}>Material Content</Typography>
          <iframe
            src={iframeUrl}
            title="Material Content"
            width="100%"
            height="600px"
            style={{ border: 'none' }}
          />
          <Button
            style={{ display: "flex-end" }}
            variant="contained"
            color="primary"
            onClick={handleCompleteMaterial}
            sx={{ mt: 2 }}
          >
            Complete and Next
          </Button>
        </Grid>
        <Grid item xs={6} sm={6} md={4} sx={{
          maxHeight: '650px',
          marginTop: "30px",
          overflowY: 'auto',
          padding: '5px',
          paddingLeft: "10px"
        }}>
          <List>
            {Object.entries(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(([subTopicName, subTopicData]) => {
              const isSubTopicUnlocked = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.status === true;

              return (
                <React.Fragment key={subTopicName}>
                  <ListItem button onClick={() => handleToggleSubTopic(subTopicName)}>
                    <ListItemText
                      primary={
                        <Typography
                          color='white'
                          variant="body1" // Adjust the variant as needed
                          sx={{
                            fontWeight: isSubTopicUnlocked ? 'bolder' : 'normal', // Make it bold if unlocked
                            color: isSubTopicUnlocked ? "white" : "white",
                            cursor:"pointer"
                          }}
                        >
                          {subTopicName}
                        </Typography>
                      }
                    />
                    {openSubTopics[subTopicName] ? <ExpandLess style={{ color: "white" }} /> : <ExpandMore style={{ color: "white" }} />}
                    {/* {isSubTopicUnlocked ? <LockOpenIcon color="success" sx={{padding:"20px"}} /> : <LockIcon color="disabled" />} */}
                    {/* {
                      isSubTopicUnlocked
                        ? openSubTopics[subTopicName]
                          ? <ExpandLess style={{ color: "white" }} />
                          : <ExpandMore style={{ color: "#a1a4a6" }} />
                        : null
                    } */}

                  </ListItem>
                  <Collapse in={openSubTopics[subTopicName]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {subTopicData?.materials?.map((material, index) => {
                        console.log(selectedCourse, selectedTopic, subTopicName)
                        const isUnlocked = isMaterialUnlocked(selectedCourse, selectedTopic, subTopicName, index);

                        const isCompleted = courseStatus[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[subTopicName]?.materials?.[material.materialID] === true;
                        return (
                          <ListItem
                            key={material.materialID}
                            button
                            sx={{ pl: 4 }}
                            onClick={() => {
                              if (isUnlocked) {
                                setSelectedSubTopic(subTopicName);
                                setSelectedMaterial(material);
                                // setIframeUrl(`http://backend.ramanasoft.com:5000${material.url}`);
                                setIframeUrl(`https://backend.ramanasoft.com:5000${material.url}`);
                              }
                            }}
                            disabled={!isUnlocked}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  variant="body1" // Adjust the variant as needed
                                  sx={{
                                    fontWeight: isSubTopicUnlocked ? 'bolder' : 'normal', // Make it bold if unlocked
                                    fontSize: "14px",
                                    color: (isMaterialUnlocked ? 'white' : '#5dade2'), // Change color based on unlocked status
                                  }}
                                >
                                  {material.name}
                                </Typography>
                              }
                            />
                            {(isCompleted && <CheckCircleOutlineIcon color="success" style={{ height: "20px" }} />) || (isMaterialUnlocked && <LockIcon color="#5dade2" style={{ height: "20px" }} />)}

                          </ListItem>
                        );
                      })}
                      {renderQuiz(subTopicData.quiz, selectedCourse, selectedTopic, subTopicName)}
                    </List>
                  </Collapse>
                </React.Fragment>
              );
            })}
          </List>
          {renderQuiz(courses[selectedCourse]?.topics[selectedTopic]?.quiz, selectedCourse, selectedTopic)}
        </Grid>
      </Grid>
    );
  };

  // Modified isQuizUnlocked function to handle optional quizzes
  const isQuizUnlocked = (course, topic, subTopic) => {

    // Case 1: SubTopic Quiz
    if (subTopic) {
      // Check if quiz exists for this subtopic
      const hasQuiz = courses[course]?.topics[topic]?.subTopics[subTopic]?.quiz != null;
      if (!hasQuiz) return false; // No quiz to unlock

      const subTopicMaterials = courses[course]?.topics[topic]?.subTopics[subTopic]?.materials || [];
      // Check if all materials in the subtopic are completed
      const allMaterialsCompleted = subTopicMaterials.every(material =>
        courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.materials?.[material.materialID] === true
      );

      return allMaterialsCompleted;
    }

    // Case 2: Topic Quiz
    if (topic) {
      // Check if quiz exists for this topic
      const hasQuiz = courses[course]?.topics[topic]?.quiz != null;
      if (!hasQuiz) return false;

      const subTopics = courses[course]?.topics[topic]?.subTopics || {};
      return Object.keys(subTopics).every((subTopicKey) => {
        const subTopicData = subTopics[subTopicKey];
        // Check if subtopic has a quiz that needs to be completed
        const subTopicHasQuiz = subTopicData?.quiz != null;
        const subTopicQuizCompleted = !subTopicHasQuiz ||
          courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopicKey]?.quizCompleted === true;

        // Check materials completion
        const materials = subTopicData?.materials || [];
        const allMaterialsCompleted = materials.every(material =>
          courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopicKey]?.materials?.[material.materialID] === true
        );

        return allMaterialsCompleted && subTopicQuizCompleted;
      });
    }

    // Case 3: Course Quiz
    // Check if course has a quiz
    const hasQuiz = courses[course]?.quiz != null;
    if (!hasQuiz) return false;

    // Check all topics and their subtopics
    const topics = courses[course]?.topics || {};
    return Object.keys(topics).every((topicKey) => {
      const topicData = topics[topicKey];
      const topicHasQuiz = topicData?.quiz != null;
      const topicQuizCompleted = !topicHasQuiz ||
        courseStatus[course]?.topics?.[topicKey]?.quizCompleted === true;

      const subTopics = topicData?.subTopics || {};
      const allSubTopicsCompleted = Object.keys(subTopics).every((subTopicKey) => {
        const subTopicData = subTopics[subTopicKey];
        const subTopicHasQuiz = subTopicData?.quiz != null;
        const subTopicQuizCompleted = !subTopicHasQuiz ||
          courseStatus[course]?.topics?.[topicKey]?.subTopics?.[subTopicKey]?.quizCompleted === true;

        const materials = subTopicData?.materials || [];
        const allMaterialsCompleted = materials.every(material =>
          courseStatus[course]?.topics?.[topicKey]?.subTopics?.[subTopicKey]?.materials?.[material.materialID] === true
        );

        return allMaterialsCompleted && subTopicQuizCompleted;
      });

      return allSubTopicsCompleted && topicQuizCompleted;
    });
  };

  const handleTakeQuiz = (quizData, course, topic, subTopic) => {
    setCurrentQuiz({
      ...quizData,
      course,
      topic,
      subTopic,
    });
    setQuizOpen(true);
    setQuizResponses({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // const moveToNextContent = () => {
  //   const currentTopicMaterials = courses[selectedCourse]?.topics?.[selectedTopic]?.subTopics?.[selectedSubTopic]?.materials || [];

  //   const currentMaterialIndex = currentTopicMaterials.findIndex(m => m.materialID === selectedMaterial?.materialID);

  //   if (currentMaterialIndex < currentTopicMaterials.length - 1) {
  //     // Move to the next material in the current subtopic
  //     const nextMaterial = currentTopicMaterials[currentMaterialIndex + 1];
  //     setSelectedMaterial(nextMaterial);
  //     setIframeUrl(`https://backend.ramanasoft.com:5000${nextMaterial.url}`);

  //   } else {
  //     moveToNextSubTopicOrTopic();
  //   }
  // };



  const handleSubmitQuiz = async () => {
    try {
      let correctAnswers = 0;
      const totalQuestions = currentQuiz.pages_data[0].question_list.length;

      currentQuiz.pages_data[0].question_list.forEach((question) => {
        if (quizResponses[question.question_id] === question.correct_answer) {
          correctAnswers++;
        }
      });

      const score = (correctAnswers / totalQuestions) * 100;
      console.log(totalQuestions);
      console.log(score);

      // Update the backend with the quiz result
      await apiService.post(`/api/submit-quiz/${currentQuiz.token}`, {
        internID,
        responses: quizResponses,
        score: score,
      });

      setQuizSubmitted(true); // Set quiz as submitted
      setQuizScore(score); // Update quiz score

      if (score >= 100) {
        const updatedCourseStatus = {
          ...courseStatus,
          [currentQuiz.course]: {
            ...courseStatus[currentQuiz.course],
            topics: {
              ...courseStatus[currentQuiz.course]?.topics,
              [currentQuiz.topic]: {
                ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic],
                subTopics: {
                  ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic]?.subTopics,
                  [currentQuiz.subTopic]: {
                    ...courseStatus[currentQuiz.course]?.topics?.[currentQuiz.topic]?.subTopics?.[currentQuiz.subTopic],
                    quizCompleted: true,
                  },
                },
              },
            },
          },
        };
        setCourseStatus(updatedCourseStatus);

        // Update the backend with the new course status
        try {
          await apiService.post('/api/update-progress', {
            internID,
            progress: updatedCourseStatus,
          });
          console.log("Quiz completion status updated successfully.");
          // moveToNextContent();
          // moveToNextSubTopicOrTopic();
          // moveToNextTopic();
          // moveToNextMaterial();

        } catch (error) {
          console.error('Error updating quiz completion status:', error);
        }
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };





  const handleQuizResponse = (questionId, answer) => {
    setQuizResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  // const renderQuizModal = () => {
  //   const totalQuestions = currentQuiz?.pages_data[0]?.question_list.length || 0;
  //   const correctAnswers = Object.values(quizResponses).filter((response, index) => response === currentQuiz.pages_data[0].question_list[index].correct_answer).length;
  //   return (
  //     <Dialog
  //       open={quizOpen}
  //       onClose={() => setQuizOpen(false)}
  //       fullWidth
  //       maxWidth="lg"
  //       sx={{
  //         '& .MuiDialog-paper': {
  //           width: '98%', // Custom width percentage
  //           height: '98%', // Custom height percentage
  //           maxHeight: '90vh', // Prevent overflow on large screens
  //         },
  //       }} // Additional styles
  //       classes={{ paper: 'Attempt_container' }} // Adding custom class for container
  //     >
  //       <DialogContent>
  //         {!quizSubmitted ? ( // If quiz is not submitted, show the questions
  //           currentQuiz?.pages_data[0]?.question_list.map((question, index) => (
  //             <div key={question.question_id} className="Attempt_questionPreview">
  //               <Typography variant="subtitle1" className="Attempt_questionHeader">
  //                 {`${index + 1}. ${question.question_text || question.text || 'Question Text Missing'}`}
  //               </Typography>
  //               <RadioGroup
  //                 name={`question-${question.question_id}`}
  //                 value={quizResponses[question.question_id] || ''}
  //                 onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
  //               >
  //                 {question.options_list.map((option, optIndex) => (
  //                   <div key={optIndex} className="Attempt_option">
  //                     <input
  //                       type="radio"
  //                       value={option}
  //                       checked={quizResponses[question.question_id] === option}
  //                       onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
  //                     />
  //                     <label>{option}</label>
  //                   </div>
  //                 ))}
  //               </RadioGroup>
  //             </div>
  //           ))
  //         ) : ( // If quiz is submitted, show the results
  //           <>
  //             <Typography variant="h6" color={quizScore === 100 ? 'success' : 'error'} className="Attempt_error">
  //               Your score: {quizScore.toFixed(2)}%
  //               {quizScore === 100 ? ' - Great job! You can now proceed to the next content.' : ' - Please try again to unlock the next content.'}
  //             </Typography>
  //             <Typography variant="body1" className="Attempt_detail">
  //               Total Questions: {totalQuestions}
  //             </Typography>
  //             <Typography variant="body1" className="Attempt_detail">
  //               Correct Answers: {correctAnswers}
  //             </Typography>
  //             <Typography variant="body1" className="Attempt_detail">
  //               {correctAnswers / totalQuestions > 0.7 ?
  //                 "You're doing great! Keep it up!" :
  //                 "Consider reviewing the material before attempting the quiz again."}
  //             </Typography>
  //           </>
  //         )}
  //       </DialogContent>
  //       <DialogActions>
  //         <Button onClick={() => setQuizOpen(false)} className="Attempt_button">Close</Button>
  //         {!quizSubmitted && (
  //           <Button onClick={handleSubmitQuiz} color="primary" variant="contained" className="Attempt_button Attempt_submitButton">
  //             Submit
  //           </Button>
  //         )}
  //       </DialogActions>
  //     </Dialog>
  //   );
  // };


  // Modified renderQuiz function to handle optional quizzes

  // const renderQuizModal = () => {
  //   // State to track quiz phase: 'instructions', 'quiz', 'results'
  //   const [quizPhase, setQuizPhase] = useState('instructions');

  //   const totalQuestions = currentQuiz?.pages_data[0]?.question_list.length || 0;
  //   const correctAnswers = Object.values(quizResponses).filter(
  //     (response, index) => response === currentQuiz.pages_data[0].question_list[index].correct_answer
  //   ).length;

  //   const renderInstructionsPage = () => (
  //     <DialogContent>
  //       <Typography variant="h6" gutterBottom>
  //         Complete the following quiz before moving further !
  //       </Typography>
  //       <Typography variant="body1" paragraph>
  //         Here are some important guidelines you must consider:
  //       </Typography>
  //       <Typography variant="body1" component="ul">
  //         <li>This quiz contains {totalQuestions} questions.</li>
  //         <li>Select only one answer for each question.</li>
  //         <li>You must score at least 100% to proceed to the next content.</li>
  //         <li>You can submit the quiz multiple times.</li>
  //         <li>You will move further once you secure 100% in this quiz.</li>
  //       </Typography>
  //       <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
  //         Click "Start Quiz" when you're ready to begin.
  //       </Typography>
  //     </DialogContent>
  //   );

  //   const renderQuizQuestions = () => (
  //     <DialogContent>
  //       {currentQuiz?.pages_data[0]?.question_list.map((question, index) => (
  //         <div key={question.question_id} className="Attempt_questionPreview">
  //           <Typography
  //             variant="subtitle1"
  //             className="Attempt_questionHeader"
  //             dangerouslySetInnerHTML={{
  //               __html: `${question.question_text || question.text || 'Question Text Missing'}`,
  //             }}
  //           />
  //           <RadioGroup
  //             name={`question-${question.question_id}`}
  //             value={quizResponses[question.question_id] || ''}
  //             onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
  //           >
  //             {question.options_list.map((option, optIndex) => (
  //               <div key={optIndex} className="Attempt_option">
  //                 <input
  //                   type="radio"
  //                   value={option}
  //                   checked={quizResponses[question.question_id] === option}
  //                   onChange={(e) => handleQuizResponse(question.question_id, e.target.value)}
  //                 />
  //                 <label>{option}</label>
  //               </div>
  //             ))}
  //           </RadioGroup>
  //         </div>
  //       ))}
  //     </DialogContent>
  //   );


  //   const renderQuizResults = () => (
  //     <DialogContent>
  //       <Typography
  //         variant="h6"
  //         color={'black'}
  //         className="Attempt_error"
  //       >
  //         Your score: {quizScore !== null ? `${quizScore.toFixed(2)}%` : 'N/A'}
  //         {quizScore === 100
  //           ? ' - Great job! You can now proceed to the next content.'
  //           : ' - Please try again to unlock the next content.'}
  //       </Typography>
  //       <Typography variant="body1" className="Attempt_detail">
  //         Total Questions: {totalQuestions}
  //       </Typography>
  //       <Typography variant="body1" className="Attempt_detail">
  //         Correct Answers: {correctAnswers}
  //       </Typography>
  //       <Typography
  //         variant="body1"
  //         className="Attempt_detail"
  //         sx={{
  //           color: quizScore !== null && quizScore === 100 ? 'green' : 'red', // Conditional styling
  //         }}
  //       >
  //         {quizScore !== null && correctAnswers / totalQuestions > 0.7
  //           ? "You're doing great! Keep it up!"
  //           : "Consider reviewing the material before attempting the quiz again."}
  //       </Typography>

  //     </DialogContent>
  //   );

  //   return (
  //     <Dialog
  //       open={quizOpen}
  //       onClose={() => setQuizOpen(false)}
  //       fullWidth
  //       maxWidth="lg"
  //       sx={{
  //         '& .MuiDialog-paper': {
  //           width: '98%',
  //           height: '98%',
  //           maxHeight: '90vh',
  //         },
  //       }}
  //       classes={{ paper: 'Attempt_container' }}
  //     >
  //       {quizPhase === 'instructions' && renderInstructionsPage()}
  //       {quizPhase === 'quiz' && renderQuizQuestions()}
  //       {quizPhase === 'results' && renderQuizResults()}

  //       <DialogActions>
  //         <button onClick={() => setQuizOpen(false)} style={{background:"none", border:"1px solid black", color:"black", height:"35px", borderRadius:"3px"}}>
  //           Close
  //         </button>

  //         {quizPhase === 'instructions' && (
  //           <Button
  //             onClick={() => setQuizPhase('quiz')}
  //             color="primary"
  //             variant="contained"
  //             className="Attempt_button"
  //           >
  //             Start Quiz
  //           </Button>
  //         )}

  //         {quizPhase === 'quiz' && (
  //           <Button
  //             onClick={() => {
  //               handleSubmitQuiz();
  //               setQuizPhase('results');
  //             }}
  //             color="primary"
  //             variant="contained"
  //             className="Attempt_button Attempt_submitButton"
  //           >
  //             Submit
  //           </Button>
  //         )}
  //       </DialogActions>
  //     </Dialog>
  //   );
  // };



  const renderQuiz = (quiz, course, topic, subTopic) => {
    // If no quiz exists, return null
    if (!quiz) return null;

    // Determine if the quiz exists at the appropriate level
    const quizExists = subTopic ?
      courses[course]?.topics?.[topic]?.subTopics?.[subTopic]?.quiz != null :
      topic ?
        courses[course]?.topics?.[topic]?.quiz != null :
        courses[course]?.quiz != null;

    if (!quizExists) return null;

    const isUnlocked = isQuizUnlocked(course, topic, subTopic);
    const quizCompleted = subTopic ?
      courseStatus[course]?.topics?.[topic]?.subTopics?.[subTopic]?.quizCompleted === true :
      topic ?
        courseStatus[course]?.topics?.[topic]?.quizCompleted === true :
        courseStatus[course]?.quizCompleted === true;

    return (
      <Button
        variant="contained"
        color={quizCompleted ? "success" : (isUnlocked ? "primary" : "secondary")}
        onClick={() => !quizCompleted && handleTakeQuiz(quiz, course, topic, subTopic)}
        disabled={!isUnlocked || quizCompleted}
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: "40px",
          justifyContent: 'center',

        }}
      >
        {quizCompleted ? (
          <div style={{color:"green", textTransform:"capitalize"}}>
            <CheckCircleIcon sx={{ marginRight: 1, color:"green" }} />
            Quiz Completed
          </div>
        ) : isUnlocked ? (
          <div style={{color:"white", textTransform:"capitalize"}}>
            <LockOpenIcon sx={{ marginRight: 1 }} />
            Take Quiz
          </div>
        ) : (
          <div style={{color:"#a1a4a6", textTransform:"capitalize"}}>
            <LockIcon sx={{ marginRight: 1 }} />
            Quiz Locked
          </div>
        )}
      </Button>
    );
  };


  return (
    <Container>
      {viewMode === 'overview' ? renderTopicList() : renderDetailView()}
      <LessonDialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        lessons={selectedTopic ? Object.keys(courses[selectedCourse]?.topics[selectedTopic]?.subTopics || {}).map(subTopic => ({ name: subTopic })) : []}
      />
      {<QuizModal
  quizOpen={quizOpen}
  setQuizOpen={setQuizOpen}
  currentQuiz={currentQuiz}
  quizResponses={quizResponses}
  setQuizResponses={setQuizResponses}
  quizSubmitted={quizSubmitted}
  setQuizSubmitted={setQuizSubmitted}
  quizScore={quizScore}
  setQuizScore={setQuizScore}
  courseStatus={courseStatus}
  setCourseStatus={setCourseStatus}
  handleQuizResponse={handleQuizResponse}
  handleSubmitQuiz={handleSubmitQuiz}
/>
}
    </Container>
  );

};

export default LMS_dash;

