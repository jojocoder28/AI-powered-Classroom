import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../main'; // Adjust the import path if necessary
import { backend_api } from '../config'; // Assuming backend_api is your main backend URL

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
      } else {
        // Clear classrooms if not authenticated
        setClassrooms([]);
        setClassroomsLoading(false);
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
          setAssignments(response.data.classroom.assignments || []);
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
    const mlBackendUrl = 'http://localhost:5000'; // Or your deployed ML backend URL

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

    const mlBackendUrl = 'http://localhost:5000'; // Or your deployed ML backend URL

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
    <div className="container mx-auto p-4 flex flex-col lg:flex-row">
      {/* Sidebar for Classroom and PDF Selection */}
      <div className="lg:w-1/4 w-full pr-4">
        <h2 className="text-2xl font-bold mb-4">RAG Chat</h2>

        {/* Classroom Selection */}
        <div className="mb-4">
          <label htmlFor="classroomSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Classroom:</label>
          {classroomsLoading ? (
            <p>Loading classrooms...</p>
          ) : error && !selectedClassroomId ? ( // Show general error only if no classroom is selected yet
             <p className="text-red-500">{error}</p>
          ) : (
            <select
              id="classroomSelect"
              value={selectedClassroomId}
              onChange={handleClassroomSelect}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={classroomsLoading}
            >
              <option value="">--Select a Classroom--</option>
              {classrooms.map(classroom => (
                <option key={classroom._id} value={classroom._id}>
                  {classroom.name}
                </option>
              ))}
            </select>
           )}
            {!classroomsLoading && classrooms.length === 0 && !error && (
               <p>No enrolled classrooms found.</p>
            )}
        </div>

        {/* Assignment/PDF Selection */}
        {selectedClassroomId && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Assignments:</h3>
            {loading && !mlLoading ? ( // Use general loading for assignments fetch
              <p>Loading assignments...</p>
            ) : error && selectedClassroomId && !mlLoading ? ( // Show assignment specific error
              <p className="text-red-500">{error}</p>
            ) : assignments.length > 0 ? (
              <div>
                 <p className="text-gray-700 text-sm mb-2">Select PDFs to include in RAG:</p>
                 <ul>
                  {assignments.map(assignment => (
                     // Assuming assignment object has a 'submissionFile' object with a 'url'
                    assignment.submissionFile?.url && (
                      <li key={assignment._id} className="mb-1">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox"
                            value={assignment.submissionFile.url}
                            checked={selectedPdfUrls.includes(assignment.submissionFile.url)}
                            onChange={() => handlePdfSelect(assignment.submissionFile.url)}
                          />
                          <span className="ml-2 text-gray-700">{assignment.title}</span>
                        </label>
                      </li>
                    )
                  ))}
                </ul>
              </div>
            ) : (selectedClassroomId && !loading && !error && (
              <p>No assignments with attached PDFs found in this classroom.</p>
            ))}
          </div>
        )}

        {/* Process PDFs Button */}
        {selectedClassroomId && selectedPdfUrls.length > 0 && !ragProcessed && (
           <button
              onClick={processPdfsForRag}
              disabled={mlLoading || loading}
              className={
                `bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${(mlLoading || loading) && 'opacity-50 cursor-not-allowed'}`
              }
            >
              {mlLoading ? 'Processing PDFs...' : 'Process Selected PDFs for RAG'}
            </button>
        )}

        {ragProcessed && (
             <p className="text-green-600 mt-2">RAG is ready! You can now ask questions about the selected PDFs.</p>
        )}
         {mlLoading && <p className="text-blue-600 mt-2">ML Backend Processing...</p>}

      </div>

      {/* Main Chat Panel */}
      <div className="lg:w-3/4 w-full bg-gray-100 p-4 rounded-lg shadow-md flex flex-col h-[calc(100vh-150px)] overflow-hidden">
        <h3 className="text-xl font-semibold mb-4">Chat with RAG</h3>

        {/* Chat Display */}
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          {chatHistory.map((message, index) => (
            <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <span
                className={
                  `inline-block p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : message.type === 'rag' ? 'bg-green-300 text-gray-800' : 'bg-gray-300 text-gray-800'}`
                }
              >
                {message.text}
              </span>
            </div>
          ))}
           {loading && !mlLoading && <div className="text-center text-gray-600">Getting answer...</div>}
        </div>

        {/* Question Input */}
        {ragProcessed && (
          <form onSubmit={handleAskQuestion} className="flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the selected PDFs..."
              className="flex-grow shadow border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={loading || mlLoading}
            />
            <button
              type="submit"
              disabled={loading || mlLoading || !question.trim()}
              className={
                `bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline ${ (loading || mlLoading || !question.trim()) && 'opacity-50 cursor-not-allowed'}`
              }
            >
              Ask
            </button>
          </form>
        )}
         {error && !loading && !mlLoading && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default RagChat;
