import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../main'; // Adjust the import path if necessary
import { backend_api } from '../config'; // Assuming backend_api is your main backend URL
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChalkboardTeacher, faFilePdf, faBolt, faCircleCheck, faSpinner, faPaperPlane, faBookOpen, faMagic } from '@fortawesome/free-solid-svg-icons';

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

  if (!isAuthenticated) {
    return <div className="container mx-auto p-4 text-center text-red-600">Please log in to access the RAG Chat.</div>;
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
          {loading && !mlLoading ? (
            <p className="text-gray-600"><FontAwesomeIcon icon={faSpinner} spin /> Loading assignments...</p>
          ) : error && !mlLoading ? (
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
          ) : (
            <p className="text-gray-600 text-sm">No scrolls (PDFs) found in this realm.</p>
          )}
        </div>
      )}

      {/* Process PDFs */}
      {selectedClassroomId && selectedPdfUrls.length > 0 && !ragProcessed && (
        <button
          onClick={processPdfsForRag}
          disabled={mlLoading || loading}
          className={`w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${mlLoading || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FontAwesomeIcon icon={faBolt} />
          {mlLoading ? 'Magicking the PDFs...' : 'Summon the AI'}
        </button>
      )}

      {/* RAG Ready */}
      {ragProcessed && (
        <p className="text-green-600 text-center mt-4 flex items-center justify-center gap-2 text-sm">
          <FontAwesomeIcon icon={faCircleCheck} />
          AI is all ears! Ask away.
        </p>
      )}

      {mlLoading && <p className="text-blue-600 text-center mt-4 text-sm">Crunching PDFs with GPT wizardry...</p>}
    </div>

    {/* Main Chat Panel */}
    <div className="lg:w-3/4 w-full bg-transparent p-6 rounded-2xl shadow-lg flex flex-col h-full">
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
        {!ragProcessed && chatHistory.length === 0 && !mlLoading && (
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
            className="flex-grow border border-gray-300 rounded-l-lg py-3 px-4 text-gray-100 focus:outline-none focus:border-teal-500"
            disabled={loading || mlLoading}
          />
          <button
            type="submit"
            disabled={loading || mlLoading || !question.trim()}
            className={`bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-r-lg flex items-center gap-2 ${loading || mlLoading || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            Send
          </button>
        </form>
      )}
      {error && !loading && !mlLoading && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
    </div>
  </div>
);

};

export default RagChat;
