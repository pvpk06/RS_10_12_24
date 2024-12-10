import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './general.css';
import Notification from '../Create/notification';
import apiService from '../../../../../../apiService';
import { colors } from '@mui/material';

const QuizOptionsForm = ({ token }) => {
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialValues, setInitialValues] = useState({
        timeLimit: '',
        scheduleQuizFrom: '',
        scheduleQuizTo: '',
        qns_per_page: '',
        randomizeQuestions: false,
        confirmBeforeSubmission: false,
        showResultsAfterSubmission: false,
        showAnswersAfterSubmission: false,
    });

    const today = new Date().toISOString().slice(0, 16); // This gives YYYY-MM-DDTHH:MM

    //     const convertToIST = (dateString) => {
    //     const date = new Date(dateString);
    //     console.log(date);
    //     console.log("date String :", date.toISOString().slice(0, 19).replace('T', ' '));
    //     return date.toISOString().slice(0, 19).replace('T', ' '); // Format as 'YYYY-MM-DD HH:MM:SS'
    // };

    // Yup validation schema
    const validationSchema = Yup.object().shape({
        timeLimit: Yup.number()
            .required('Time limit is required')
            .min(1, 'Time limit must be at least 1 minute'),
        scheduleQuizFrom: Yup.date()
            .required('Start date is required')
            .min(new Date(), 'Start date cannot be in the past'),
        scheduleQuizTo: Yup.date()
            .required('End date is required')
            .min(Yup.ref('scheduleQuizFrom'), 'End date cannot be before the start date')
            .test('is-time-limit-valid', 'The end date should be equal to or greater than the time limit', function (value) {
                const { scheduleQuizFrom, timeLimit } = this.parent;
                if (!scheduleQuizFrom || !value || !timeLimit) return true; // Skip validation if values are missing
                const fromTime = new Date(scheduleQuizFrom).getTime();
                const toTime = new Date(value).getTime();
                const timeDiffInMinutes = (toTime - fromTime) / (1000 * 60); // Convert difference to minutes
                return timeDiffInMinutes >= Number(timeLimit); // Allow equal or greater time difference
            }),
        qns_per_page: Yup.number()
            .required('Number of questions per page is required')
            .min(1, 'There must be at least 1 question per page'),
        randomizeQuestions: Yup.boolean(),
        confirmBeforeSubmission: Yup.boolean(),
        showResultsAfterSubmission: Yup.boolean(),
        showAnswersAfterSubmission: Yup.boolean(),
    });

    // Fetch initial quiz options when the component mounts
    useEffect(() => {
        const fetchQuizOptions = async () => {
            try {
                const response = await apiService.get(`/api/quiz-options/${token}`);
                console.log('Fetched quiz options:', response.data);

                if (response.data) {

			const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear(); // Use getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Use getUTCMonth()
    const day = String(date.getUTCDate()).padStart(2, '0'); // Use getUTCDate()
    const hours = String(date.getUTCHours()).padStart(2, '0'); // Use getUTCHours()
    const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Use getUTCMinutes()
    return `${year}-${month}-${day}T${hours}:${minutes}`; // Returns in 'YYYY-MM-DDTHH:MM' format
};

                    // Pre-fill form with fetched data
                    setInitialValues({
                        timeLimit: response.data.timeLimit || '',
                        scheduleQuizFrom: formatDate(response.data.scheduleQuizFrom),
                        scheduleQuizTo: formatDate(response.data.scheduleQuizTo),
                        qns_per_page: response.data.qns_per_page || '',
                        randomizeQuestions: response.data.randomizeQuestions || false,
                        confirmBeforeSubmission: response.data.confirmBeforeSubmission || false,
                        showResultsAfterSubmission: response.data.showResultsAfterSubmission || false,
                        showAnswersAfterSubmission: response.data.showAnswersAfterSubmission || false,
                    });
                console.log(initialValues);
			setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching quiz options:', err);
                setError('Error fetching quiz options');
                setLoading(false);
            }
        };

        fetchQuizOptions();
    }, [token]);

    const closeNotification = () => {
        setNotification({ message: '', type: '' });
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await apiService.post('/api/quiz-options', {
                token,
                timeLimit: values.timeLimit,
                // scheduleQuizFrom: convertToIST(values.scheduleQuizFrom),
                // scheduleQuizTo: convertToIST(values.scheduleQuizTo),
                scheduleQuizFrom: values.scheduleQuizFrom,
                scheduleQuizTo: values.scheduleQuizTo,
                qns_per_page: values.qns_per_page,
                randomizeQuestions: values.randomizeQuestions,
                confirmBeforeSubmission: values.confirmBeforeSubmission,
                showResultsAfterSubmission: values.showResultsAfterSubmission,
                showAnswersAfterSubmission: values.showAnswersAfterSubmission,
            });
            console.log('Quiz options saved successfully:', response.data);
            setNotification({ message: 'Quiz options saved successfully', type: 'success' });
        } catch (error) {
            console.error('Error saving quiz options:', error);
            setNotification({ message: 'Error saving quiz options', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='General_quiz-options-container'>
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={closeNotification}
            />
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="General_quiz-options-form">
                        <div className="General_form-group">
                            <label style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
                                Time Limit (minutes) :
                                <Field
                                    type="number"
                                    name="timeLimit"
                                    min="1"
                                />
                            </label>
                            <ErrorMessage name="timeLimit" component="div" style={{color:"red"}} className="General_error" />
                        </div>

                        <div className="General_form-group">
                            <label>
                                Schedule Quiz :
                                <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
                                    <span style={{ display: "inline-block", width: "100px" }}>Start Date :</span>
                                    <Field
                                        type="datetime-local"
                                        name="scheduleQuizFrom"
                                        min={today}
                                        className="General_datetime"
                                    />
                                </div>
                                </label>
                                <label>
                                <ErrorMessage name="scheduleQuizFrom" component="div" style={{color:"red",fontWeight:"normal"}} className="General_error" />
                                <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
                                    <span style={{ display: "inline-block", width: "100px" }}>End Date :</span>
                                    <Field
                                        type="datetime-local"
                                        name="scheduleQuizTo"
                                        min={today}
                                        className="General_datetime"
                                    />
                                </div>
                                </label>
                                <ErrorMessage name="scheduleQuizTo" component="div" style={{color:"red"}} className="General_error" />
                        </div>

                        <div className="General_form-group">
                            <label style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
                                No of Questions per page:
                                <Field
                                    type="number"
                                    name="qns_per_page"
                                    min="1"
                                />
                            </label>
                            <ErrorMessage name="qns_per_page" component="div" style={{color:"red"}} className="General_error" />
                        </div>

                        <div className="General_form-group General_checkbox">
                            <label>
                                <Field
                                    type="checkbox"
                                    name="randomizeQuestions"
                                />
                                Randomize Questions
                            </label>
                        </div>

                        <div className="General_form-group General_checkbox">
                            <label>
                                <Field
                                    type="checkbox"
                                    name="confirmBeforeSubmission"
                                />
                                Confirm Before Submission
                            </label>
                        </div>

                        <div className="General_form-group General_checkbox">
                            <label>
                                <Field
                                    type="checkbox"
                                    name="showResultsAfterSubmission"
                                />
                                Show Results After Submission
                            </label>
                        </div>

                        <div className="General_form-group General_checkbox">
                            <label>
                                <Field
                                    type="checkbox"
                                    name="showAnswersAfterSubmission"
                                />
                                Show Answers After Submission
                            </label>
                        </div>
                        <div className="General_submit-button-container">
                    <button className='General_submit-button' type="submit"  disabled={isSubmitting}>Save Options</button>
                </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default QuizOptionsForm;


// import React, { useState, useEffect } from 'react';
// import './general.css';
// import Notification from '../Create/notification';
// import apiService from '../../../../../../apiService';

// const QuizOptionsForm = ({ token }) => {
//     const [notification, setNotification] = useState({ message: '', type: '' });
//     const [quizOptions, setQuizOptions] = useState({
//         timeLimit: '',
//         scheduleQuizFrom: '',
//         scheduleQuizTo: '',
//         qns_per_page: '',
//         randomizeQuestions: false,
//         confirmBeforeSubmission: false,
//         showResultsAfterSubmission: false,
//         showAnswersAfterSubmission: false,
//     });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const today = new Date().toISOString().slice(0, 16); // This gives YYYY-MM-DDTHH:MM

//     // const date = () => {
//     //     console.log("current date :", new Date());
//     // }
//     // useEffect(()=>{
//     //     date();
//     // },[])

    // const convertToIST = (dateString) => {
    //     const date = new Date(dateString);
    //     console.log(date);
    //     console.log("date String :", date.toISOString().slice(0, 19).replace('T', ' '));
    //     return date.toISOString().slice(0, 19).replace('T', ' '); // Format as 'YYYY-MM-DD HH:MM:SS'
    // };
    

//     useEffect(() => {
//         const fetchQuizOptions = async () => {
//             try {
//                 const response = await apiService.get(`/api/quiz-options/${token}`);
//                 console.log('Fetched quiz options:', response.data);

//                 if (response.data) {
//                     const formatDate = (dateString) => {
//                         const date = new Date(dateString);
//                         console.log("date :", date)
//                         const year = date.getFullYear();
//                         console.log("year", year)
//                         const month = String(date.getMonth() + 1).padStart(2, '0');
//                         console.log("month", month)
//                         const day = String(date.getDate()).padStart(2, '0');
//                         console.log("day", day)
//                         const hours = String(date.getHours()).padStart(2, '0');
//                         console.log("hours", hours)
//                         const minutes = String(date.getMinutes()).padStart(2, '0');
//                         return `${year}-${month}-${day}T${hours}:${minutes}`;

//                     };

//                     setQuizOptions({
//                         ...response.data,
//                         scheduleQuizFrom: formatDate(response.data.scheduleQuizFrom),
//                         scheduleQuizTo: formatDate(response.data.scheduleQuizTo),
//                     });
//                 }
//                 setLoading(false);
//             } catch (err) {
//                 console.error('Error fetching quiz options:', err);
//                 setError('Error fetching quiz options');
//                 setLoading(false);
//             }
//         };

//         fetchQuizOptions();
//     }, [token]);
//     const closeNotification = () => {
//         setNotification({ message: '', type: '' });
//     };
//     const handleQuizOptionChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setQuizOptions({
//             ...quizOptions,
//             [name]: type === 'checkbox' ? checked : value,
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const response = await apiService.post('/api/quiz-options', {
//                 token,
//                 timeLimit: quizOptions.timeLimit,
//                 // scheduleQuizFrom: convertToIST(quizOptions.scheduleQuizFrom),
//                 // scheduleQuizTo: convertToIST(quizOptions.scheduleQuizTo),
//                 scheduleQuizFrom: quizOptions.scheduleQuizFrom,
//                 scheduleQuizTo: quizOptions.scheduleQuizTo,
//                 qns_per_page: quizOptions.qns_per_page,
//                 randomizeQuestions: quizOptions.randomizeQuestions,
//                 confirmBeforeSubmission: quizOptions.confirmBeforeSubmission,
//                 showResultsAfterSubmission: quizOptions.showResultsAfterSubmission,
//                 showAnswersAfterSubmission: quizOptions.showAnswersAfterSubmission,
//             });
//             console.log('Quiz options saved successfully:', response.data);
//             setNotification({ message: 'Quiz options saved successfully', type: 'success' });
//         } catch (error) {
//             console.error('Error saving quiz options:', error);
//             setNotification({ message: 'Error saving quiz options', type: 'error' });
//         }
//     };
    
    

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>{error}</div>;

//     return (
//         <div className='General_quiz-options-container'>
//             <Notification
//                 message={notification.message}
//                 type={notification.type}
//                 onClose={closeNotification}
//             />
//             <form className="General_quiz-options-form" onSubmit={handleSubmit}>
//                 <div className="General_form-group" >
//                     <label style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
//                         Time Limit (minutes) :
//                         <input
//                             type="number"
//                             min="1"
//                             name="timeLimit"
//                             value={quizOptions.timeLimit}
//                             onChange={handleQuizOptionChange}
//                         />
//                     </label>
//                 </div>
//                 <div className="General_form-group">
//                     <label>
//                         Schedule Quiz :
//                         <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
//                             <span style={{ display: "inline-block", width: "100px" }}>Start Date :</span>
//                             <input
//                                 type="datetime-local"
//                                 name="scheduleQuizFrom"
//                                 min={today}
//                                 value={quizOptions.scheduleQuizFrom}
//                                 onChange={handleQuizOptionChange}
//                                 style={{ marginLeft: "10px" }}
//                             />
//                         </div>
//                         <div style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
//                             <span style={{ display: "inline-block", width: "100px" }}>End Date :</span>
//                             <input
//                                 type="datetime-local"
//                                 name="scheduleQuizTo"
//                                 min={today}
//                                 value={quizOptions.scheduleQuizTo}
//                                 onChange={handleQuizOptionChange}
//                                 style={{ marginLeft: "10px" }}
//                             />
//                         </div>
//                     </label>

//                 </div>
//                 <div className="General_form-group">
//                     <label style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "30px" }}>
//                         No of Questions per page:
//                         <input
//                             type="number"
//                             min="1"
//                             name="qns_per_page"
//                             value={quizOptions.qns_per_page}
//                             onChange={handleQuizOptionChange}
//                         />
//                     </label>
//                 </div>
//                 <div className="General_form-group General_checkbox">
//                     <label>
//                         <input
//                             type="checkbox"
//                             name="randomizeQuestions"
//                             checked={quizOptions.randomizeQuestions}
//                             onChange={handleQuizOptionChange}
//                         />
//                         Randomize Questions
//                     </label>
//                 </div>
//                 <div className="General_form-group General_checkbox">
//                     <label>
//                         <input
//                             type="checkbox"
//                             name="confirmBeforeSubmission"
//                             checked={quizOptions.confirmBeforeSubmission}
//                             onChange={handleQuizOptionChange}
//                         />
//                         Confirm Before Submission
//                     </label>
//                 </div>
//                 <div className="General_form-group General_checkbox">
//                     <label>
//                         <input
//                             type="checkbox"
//                             name="showResultsAfterSubmission"
//                             checked={quizOptions.showResultsAfterSubmission}
//                             onChange={handleQuizOptionChange}
//                         />
//                         Show Results After Submission
//                     </label>
//                 </div>
//                 <div className="General_form-group General_checkbox">
//                     <label>
//                         <input
//                             type="checkbox"
//                             name="showAnswersAfterSubmission"
//                             checked={quizOptions.showAnswersAfterSubmission}
//                             onChange={handleQuizOptionChange}
//                         />
//                         Show Answers After Submission
//                     </label>
//                 </div>
                // <div className="General_submit-button-container">
                //     <button className='General_submit-button' type="submit">Save Options</button>
                // </div>
//             </form>
//         </div>
//     );
// };

// export default QuizOptionsForm;





