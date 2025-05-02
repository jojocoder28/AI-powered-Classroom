import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../main'; // Adjust the import path if necessary
import { backend_api } from '../config'; // Assuming backend_api is your main backend URL
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faFilePdf, faBolt, faCircleCheck, faSpinner, faPaperPlane, faBookOpen, faMagic, faQuestionCircle, faSquarePollVertical, faClock } from '@fortawesome/free-solid-svg-icons';

const RagChat = () => {
  const { isAuthenticated } = useContext(Context); // Removed user from context here
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedPdfUrls, setSelectedPdfUrls] = useState([]);
  const [ragProcessed, setRagProcessed] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false); // For general loading (assignments, asking question)
  const [mlLoading, setMlLoading] = useState(false); // For ML backend processing loading
  const [error, setError] = useState('');
  const [classroomsLoading, setClassroomsLoading] = useState(true); // New loading state for fetching classrooms

  // Quiz State
  const [quiz, setQuiz] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'quiz'

  // Fetch enrolled classrooms when user is authenticated
  useEffect(() => {
    const fetchEnrolledClassrooms = async () => {
      if (isAuthenticated) {
        setClassroomsLoading(true);
        try {
          // Assuming this endpoint exists and returns enrolled classrooms
          const response = await axios.get(`${backend_api}/api/classrooms/myclassrooms`, {
            withCredentials: true,
          });
          // Assuming the response data contains an array of classrooms, e.g., response.data.classrooms
          setClassrooms(response.data.classrooms || []);
        } catch (err) {
          console.error('Error fetching enrolled classrooms:', err);
          setError('Failed to fetch enrolled classrooms.');
          setClassrooms([]);
        } finally {
          setClassroomsLoading(false);
        }
      }
    };

    fetchEnrolledClassrooms();
  }, [isAuthenticated, backend_api]); // Dependency on isAuthenticated and backend_api

  // Fetch assignments when a classroom is selected
  useEffect(() => {
    if (selectedClassroomId) {
      const fetchAssignments = async () => {
        setLoading(true);
        setError('');
        setQuiz(null); // Clear quiz when classroom changes
        setQuizResult(null);
        setUserAnswers({});
        setChatHistory([]); // Clear chat when classroom changes
        setRagProcessed(false);
        try {
          // Assuming assignments are fetched from /api/v1/classroom/:id/assignments
          const response = await axios.get(`${backend_api}/api/classrooms/${selectedClassroomId}/assignments`, {
            withCredentials: true,
          });
          // Assuming assignments are in response.data.classroom.assignments
          // And each assignment has a submissionFile object with a url
          setAssignments(response.data.assignments || []);
        } catch (err) {
          console.error('Error fetching assignments:', err);
          setError('Failed to fetch assignments.');
          setAssignments([]);
        } finally {
          setLoading(false);
        }
      };
      fetchAssignments();
    } else {
      setAssignments([]);
       // Also clear selection and RAG state when classroom selection is cleared
      setSelectedPdfUrls([]);
      setRagProcessed(false);
      setChatHistory([]);
      setQuiz(null);
      setQuizResult(null);
      setUserAnswers({});
    }
  }, [selectedClassroomId, backend_api]);

  const handleClassroomSelect = (e) => {
    setSelectedClassroomId(e.target.value);
     // Assignments and other related states will be cleared by the second useEffect
  };

  const handlePdfSelect = (url) => {
    setSelectedPdfUrls(prevSelected =>
      prevSelected.includes(url) ? prevSelected.filter(item => item !== url) : [...prevSelected, url]
    );
  };

  const processPdfsForRag = async () => {
    if (selectedPdfUrls.length === 0) {
      setError('Please select at least one PDF to process.');
      return;
    }

    setMlLoading(true);
    setError('');
    setRagProcessed(false);
    setChatHistory([]); // Clear chat history on reprocessing
    setQuiz(null); // Clear quiz on reprocessing
    setQuizResult(null);
    setUserAnswers({});
    setCurrentView('chat'); // Switch to chat view after processing

    // Replace with the actual URL of your ML backend
    const mlBackendUrl = 'http://localhost:5001'; // Or your deployed ML backend URL

    try {
      const response = await axios.post(`${mlBackendUrl}/process_assignment_pdfs`, {
        file_paths: selectedPdfUrls,
      });

      if (response.data.message) {
        setRagProcessed(true);
        setChatHistory([{ type: 'system', text: response.data.message }]);
      } else {
         setError(response.data.error || 'Failed to process PDFs for RAG.');
          setChatHistory([{ type: 'system', text: `Error: ${response.data.error || 'Failed to process PDFs for RAG.'}` }]);
      }

    } catch (err) {
      console.error('Error processing PDFs for RAG:', err);
      setError('Failed to process PDFs for RAG. Make sure the ML backend is running and accessible.');
       setChatHistory([{ type: 'system', text: 'Error: Failed to communicate with RAG backend.' }]);
    } finally {
      setMlLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!ragProcessed) {
      setError('Please process PDFs for RAG first.');
      setChatHistory(prevHistory => [...prevHistory, { type: 'system', text: 'Please process PDFs for RAG first.' }]);
      return;
    }

    const userQuestion = question;
    setChatHistory(prevHistory => [...prevHistory, { type: 'user', text: userQuestion }]);
    setQuestion(''); // Clear input
    setLoading(true);
    setError('');

    const mlBackendUrl = 'http://localhost:5001'; // Or your deployed ML backend URL

    try {
      const response = await axios.post(`${mlBackendUrl}/ask`, {
        question: userQuestion,
      });

      if (response.data.answer) {
        setChatHistory(prevHistory => [...prevHistory, { type: 'rag', text: response.data.answer }]);
      } else {
        setError(response.data.error || 'Failed to get answer from RAG.');
        setChatHistory(prevHistory => [...prevHistory, { type: 'rag', text: `Error: ${response.data.error || 'Failed to get answer from RAG.'}` }]);
      }

    } catch (err) {
      console.error('Error asking question:', err);
      setError('Failed to get answer from RAG. Make sure the ML backend is running.');
      setChatHistory(prevHistory => [...prevHistory, { type: 'rag', text: 'Error: Failed to communicate with RAG backend.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!ragProcessed) {
      setError('Please process PDFs for AI first before generating a quiz.');
      return;
    }
    if(selectedPdfUrls.length === 0){
      setError('Please select at least one PDF to generate a quiz from.');
      return;
    }

    setQuizLoading(true);
    setError('');
    setQuiz(null);
    setQuizResult(null);
    setUserAnswers({});
    setCurrentView('quiz');

    const mlBackendUrl = 'http://localhost:5001'; // Or your deployed ML backend URL

    try {
      // Assuming a new endpoint /generate_quiz that accepts file_paths
      const response = await axios.post(`${mlBackendUrl}/generate_quiz`, {
         file_paths: selectedPdfUrls,
      });

      if (response.data.quiz) {
         let quizText = response.data.quiz;
         // Clean up Markdown-style code block
         quizText = quizText.replace(/```json|```/g, '').trim();

         try {
           const parsedQuiz = JSON.parse(quizText);
           setQuiz(parsedQuiz);
         } catch (parseError) {
           console.error('Error parsing quiz JSON:', parseError);
           setError('Failed to parse quiz data from the AI.');
           setCurrentView('chat'); // Go back to chat view on parsing error
         }

      } else {
         setError(response.data.error || 'Failed to generate quiz.');
         setCurrentView('chat'); // Go back to chat view on generation error
      }

    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Make sure the ML backend is running and the /generate_quiz endpoint is available.');
      setCurrentView('chat'); // Go back to chat view on API error
    } finally {
      setQuizLoading(false);
    }
  };

   const handleQuizOptionChange = (questionIndex, selectedOption) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOption,
    }));
  };

  const handleSubmitQuiz = () => {
    setSubmittingQuiz(true);
    let score = 0;
    const detailedResults = quiz.map((q, index) => {
      const correct = q.correct_answer === userAnswers[index];
      if (correct) score++;
      return {
        question: q.question,
        selected: userAnswers[index] || 'Not attempted',
        correct: q.correct_answer,
        isCorrect: correct,
      };
    });
    setQuizResult({ score, detailedResults });
    setSubmittingQuiz(false);
  };

  if (!isAuthenticated) {
    return <div className="container mx-auto p-4 text-center text-red-600">Please log in to access the AI Learn features.</div>;
  }


return (
  <div className="container mx-auto p-4 flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
    {/* Left Panel */}
    <div className="lg:w-1/4 w-full bg-white p-6 rounded-2xl shadow-lg overflow-y-auto">
      <h2 className="text-3xl font-extrabold text-teal-700 flex items-center gap-2 mb-6">
        <FontAwesomeIcon icon={faMagic} className="text-pink-500" />
        AI Learn
      </h2>

      {/* Classroom Selector */}
      <div className="mb-6">
        <label htmlFor="classroomSelect" className="block text-gray-700 font-semibold mb-2">
          <FontAwesomeIcon icon={faChalkboardTeacher} className="mr-2 text-indigo-500" />
          Pick Your Classroom:
        </label>
        {classroomsLoading ? (
          <p className="text-gray-600"><FontAwesomeIcon icon={faSpinner} spin /> Summoning classrooms...</p>
        ) : error && !selectedClassroomId ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : (
          <div className="relative">
            <select
              id="classroomSelect"
              value={selectedClassroomId}
              onChange={handleClassroomSelect}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 pr-10 rounded-lg focus:outline-none focus:border-teal-500 appearance-none"
              disabled={classroomsLoading}
            >
              <option value="">🎓 -- Pick a Classroom --</option>
              {classrooms.map(classroom => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 pointer-events-none">
              <FontAwesomeIcon icon={faChalkboardTeacher} />
            </div>
          </div>
        )}
        {!classroomsLoading && classrooms.length === 0 && !error && (
          <p className="text-gray-600 text-sm mt-2">No enrolled classrooms. Join one already 🥲</p>
        )}
      </div>

      {/* Assignments/PDFs */}
      {selectedClassroomId && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-teal-700 flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePdf} />
            Magic Scrolls (Assignments)
          </h3>
          {loading && !mlLoading && !quizLoading ? (
            <p className="text-gray-600"><FontAwesomeIcon icon={faSpinner} spin /> Loading assignments...</p>
          ) : error && !mlLoading && !quizLoading ? (
            <p className="text-red-500 text-sm">{error}</p>
          ) : assignments.length > 0 ? (
            <ul className="space-y-2">
              {assignments.map(a => a.storagePath && (
                <li key={a._id}>
                  <label className="inline-flex items-center text-gray-700">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-teal-600 focus:ring-teal-500"
                      value={a.storagePath}
                      checked={selectedPdfUrls.includes(a.storagePath)}
                      onChange={() => handlePdfSelect(a.storagePath)}
                    />
                    <span className="ml-3 text-sm">{a.title}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (selectedClassroomId && !loading && !error && (
            <p className="text-gray-600 text-sm">No scrolls (PDFs) found in this realm.</p>
          ))}
        </div>
      )}

      {/* Process PDFs Button */}
      {selectedClassroomId && selectedPdfUrls.length > 0 && !ragProcessed && (
         <button
            onClick={processPdfsForRag}
            disabled={mlLoading || loading || quizLoading}
            className={
              `w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${mlLoading || loading || quizLoading ? 'opacity-50 cursor-not-allowed' : ''}`
            }
          >
            <FontAwesomeIcon icon={mlLoading ? faSpinner : faBolt} spin={mlLoading} />
            {mlLoading ? 'Magicking the PDFs...' : 'Summon the AI'}
          </button>
      )}

      {/* Options after Processing */}
      {ragProcessed && (
        <div className="mt-6 space-y-4">
           <p className="text-green-600 text-center flex items-center justify-center gap-2 text-sm">
            <FontAwesomeIcon icon={faCircleCheck} />
            AI is all ears! Choose your adventure:
           </p>
           <button
              onClick={() => setCurrentView('chat')}
               className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-150 ease-in-out ${currentView === 'chat' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
            >
              <FontAwesomeIcon icon={faBookOpen} /> AI Chat Arena
            </button>
             <button
              onClick={handleGenerateQuiz}
              disabled={quizLoading || loading || mlLoading}
               className={`w-full py-2 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition duration-150 ease-in-out ${currentView === 'quiz' ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} ${(quizLoading || loading || mlLoading) && 'opacity-50 cursor-not-allowed'}`}
            >
               <FontAwesomeIcon icon={quizLoading ? faSpinner : faQuestionCircle} spin={quizLoading} /> Generate Quiz
            </button>
        </div>
      )}

      {mlLoading && <p className="text-blue-600 text-center mt-4 text-sm">Crunching PDFs with GPT wizardry...</p>}
       {error && !loading && !mlLoading && !quizLoading && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

    </div>

    {/* Right Panel (Chat or Quiz) */}
    <div className="lg:w-3/4 w-full bg-mint-cream p-6 rounded-2xl shadow-lg flex flex-col h-full">

       {currentView === 'chat' && (
          <div className="flex flex-col h-full">
             <h3 className="text-2xl font-bold text-teal-700 mb-6 border-b-2 border-teal-100 pb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faBookOpen} />
               AI Chat Arena
             </h3>
             {/* Chat Display */}
             <div className="flex-grow overflow-y-auto mb-6 pr-4 space-y-4">
               {chatHistory.map((msg, idx) => (
                 <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <span className={`inline-block p-3 rounded-lg max-w-md whitespace-pre-wrap ${msg.type === 'user' ? 'bg-teal-600 text-white rounded-br-none' : msg.type === 'rag' ? 'bg-teal-100 text-gray-800 rounded-bl-none' : 'bg-gray-300 text-gray-800'}`}>
                     {msg.text}
                   </span>
                 </div>
               ))}
               {loading && !mlLoading && <div className="text-center text-gray-600 mt-4"><FontAwesomeIcon icon={faSpinner} spin /> AI is brainstorming...</div>}
               {!ragProcessed && chatHistory.length === 0 && !mlLoading && !quizLoading && (
                 <div className="text-center text-gray-600 mt-10">
                   Pick a class and scrolls above ⬆️ and hit "Summon the AI".
                 </div>
               )}
             </div>
             {/* Input Box */}
             {ragProcessed && (
               <form onSubmit={handleAskQuestion} className="flex items-center border-t-2 border-teal-100 pt-4">
                 <input
                   type="text"
                   value={question}
                   onChange={(e) => setQuestion(e.target.value)}
                   placeholder="Ask your deeply philosophical (or silly) question..."
                   className="flex-grow border border-gray-300 rounded-l-lg py-3 px-4 text-gray-800 focus:outline-none focus:border-teal-500"
                   disabled={loading || mlLoading || quizLoading}
                 />
                 <button
                   type="submit"
                   disabled={loading || mlLoading || quizLoading || !question.trim()}
                   className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-r-lg flex items-center gap-2 ${(loading || mlLoading || quizLoading || !question.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                   <FontAwesomeIcon icon={faPaperPlane} />
                   Send
                 </button>
               </form>
             )}
          </div>
       )}

       {currentView === 'quiz' && (
          <div className="flex flex-col h-full">
             <h3 className="text-2xl font-bold text-teal-700 mb-6 border-b-2 border-teal-100 pb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faSquarePollVertical} />
               Course Quiz
             </h3>

             {quizLoading && <p className="text-center text-gray-600 mt-10"><FontAwesomeIcon icon={faSpinner} spin /> Crafting your quiz...</p>}

             {quiz && quiz.length > 0 && !quizResult && (
                <div className="flex-grow overflow-y-auto mb-6 pr-4 space-y-6">
                   {quiz.map((q, index) => (
                     <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                       <p className="text-gray-800 font-semibold mb-3">{index + 1}. {q.question}</p>
                       <div className="space-y-2">
                         {q.options.map((option, optIdx) => (
                           <label key={optIdx} className="flex items-center text-gray-700 cursor-pointer">
                             <input
                               type="radio"
                               name={`question-${index}`}
                               value={option}
                               checked={userAnswers[index] === option}
                               onChange={() => handleQuizOptionChange(index, option)}
                               className="form-radio h-4 w-4 text-teal-600 focus:ring-teal-500"
                             />
                             <span className="ml-3 text-sm">{option}</span>
                           </label>
                         ))}
                       </div>
                     </div>
                   ))}
                   <div className="mt-6 text-center">
                      <button
                         onClick={handleSubmitQuiz}
                         disabled={submittingQuiz || Object.keys(userAnswers).length !== quiz.length}
                         className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out ${ (submittingQuiz || Object.keys(userAnswers).length !== quiz.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
                       >
                        {submittingQuiz ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                   </div>
                </div>
             )}

             {quizResult && (
               <div className="flex-grow overflow-y-auto mb-6 pr-4 space-y-4">
                 <h3 className="text-xl font-bold text-teal-700 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faSquarePollVertical} />
                   Your Quiz Results: <span className="text-green-600">{quizResult.score} / {quiz.length}</span>
                 </h3>
                 <h4 className="text-lg font-semibold text-gray-800 mb-3">Detailed Feedback:</h4>
                 <div className="space-y-4">
                   {quizResult.detailedResults.map((res, i) => (
                     <div key={i} className={`p-4 rounded-lg shadow-sm ${res.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                       <p className="text-gray-800 font-semibold">{i + 1}. {res.question}</p>
                       <p className={`mt-1 text-sm ${res.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                         <strong>Your Answer:</strong> {res.selected}
                       </p>
                       {!res.isCorrect && (
                         <p className="mt-1 text-sm text-gray-700">
                           <strong>Correct Answer:</strong> {res.correct}
                         </p>
                       )}
                     </div>
                   ))}
                 </div>
               </div>
             )}
             {error && quizLoading && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
             {quiz && quiz.length === 0 && !quizLoading && !quizResult && (
                 <div className="text-center text-gray-600 mt-10">
                   Could not generate a quiz from the selected documents.
                 </div>
              )}
          </div>
       )}

       {/* Initial State when no class/pdfs selected or processed */}
       {!selectedClassroomId && chatHistory.length === 0 && !mlLoading && !quizLoading && !quiz && (
           <div className="text-center text-gray-600 mt-20">
              <p className="text-lg mb-4">Welcome to AI Learn!</p>
              <p>Select a classroom and relevant assignments from the left panel to get started.</p>
              <p className="mt-2">You can either chat with the AI about the content or generate a quiz to test your knowledge.</p>
           </div>
       )}

    </div>
  </div>
);

};

export default RagChat;
