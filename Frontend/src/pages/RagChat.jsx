import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Context } from '../main'; // Adjust the import path if necessary
import { backend_api } from '../config'; // Assuming backend_api is your main backend URL

const RagChat = () => {
  const { isAuthenticated, user } = useContext(Context);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [selectedPdfUrls, setSelectedPdfUrls] = useState([]);
  const [ragProcessed, setRagProcessed] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [error, setError] = useState('');

  // Assuming user context contains enrolledClassrooms
  useEffect(() => {
    if (isAuthenticated && user?.enrolledClassrooms) {
      setClassrooms(user.enrolledClassrooms);
    }
  }, [isAuthenticated, user]);

  // Fetch assignments when a classroom is selected
  useEffect(() => {
    if (selectedClassroomId) {
      const fetchAssignments = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await axios.get(`${backend_api}/api/classrooms/${selectedClassroomId}/assignments`, {
            withCredentials: true,
          });
          // Assuming assignments are in response.data.assignments and each assignment has a fileUrl
          // Note: You might need to adjust this based on your actual backend response structure
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
    }
  }, [selectedClassroomId, backend_api]);

  const handleClassroomSelect = (e) => {
    setSelectedClassroomId(e.target.value);
    setAssignments([]); // Clear assignments on classroom change
    setSelectedPdfUrls([]); // Clear selected PDFs on classroom change
    setRagProcessed(false); // Reset RAG status
    setChatHistory([]); // Clear chat history
    setError('');
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
    setChatHistory([]);

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
      }

    } catch (err) {
      console.error('Error processing PDFs for RAG:', err);
      setError('Failed to process PDFs for RAG. Make sure the ML backend is running and accessible.');
    } finally {
      setMlLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!ragProcessed) {
      setError('Please process PDFs for RAG first.');
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
        setChatHistory(prevHistory => [...prevHistory, { type: 'rag', text: 'Error: Could not get answer.' }]);
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
    return <div className="container">Please log in to access the RAG Chat.</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col lg:flex-row">
      {/* Sidebar for Classroom and PDF Selection */}
      <div className="lg:w-1/4 w-full pr-4">
        <h2 className="text-2xl font-bold mb-4">RAG Chat</h2>

        {/* Classroom Selection */}
        <div className="mb-4">
          <label htmlFor="classroomSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Classroom:</label>
          <select
            id="classroomSelect"
            value={selectedClassroomId}
            onChange={handleClassroomSelect}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">--Select a Classroom--</option>
            {classrooms.map(classroom => (
              <option key={classroom._id} value={classroom._id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment/PDF Selection */}
        {selectedClassroomId && (
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Select Assignment PDFs:</h3>
            {loading ? (
              <p>Loading assignments...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : assignments.length > 0 ? (
              <ul>
                {assignments.map(assignment => (
                   // Assuming assignment object has a 'submissionFile' object with a 'url' or a direct 'fileUrl'
                   // You might need to adjust 'assignment.submissionFile?.url' based on your schema
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
            ) : (
              <p>No assignments found with attached PDFs in this classroom.</p>
            )}
          </div>
        )}

        {/* Process PDFs Button */}
        {selectedPdfUrls.length > 0 && !ragProcessed && (
           <button
              onClick={processPdfsForRag}
              disabled={mlLoading}
              className={
                `bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${mlLoading && 'opacity-50 cursor-not-allowed'}`
              }
            >
              {mlLoading ? 'Processing...' : 'Process Selected PDFs for RAG'}
            </button>
        )}

        {ragProcessed && (
             <p className="text-green-600">RAG is ready! You can now ask questions.</p>
        )}

      </div>

      {/* Main Chat Panel */}
      <div className="lg:w-3/4 w-full bg-gray-100 p-4 rounded-lg shadow-md flex flex-col h-[calc(100vh-150px)]">
        <h3 className="text-xl font-semibold mb-4">Chat with RAG</h3>

        {/* Chat Display */}
        <div className="flex-grow overflow-y-auto mb-4 pr-2">
          {chatHistory.map((message, index) => (
            <div key={index} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <span
                className={
                  `inline-block p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-800'}`
                }
              >
                {message.text}
              </span>
            </div>
          ))}
           {mlLoading && <div className="text-center text-gray-600">Processing PDFs...</div>}
           {loading && <div className="text-center text-gray-600">Getting answer...</div>}
        </div>

        {/* Question Input */}
        {ragProcessed && (
          <form onSubmit={handleAskQuestion} className="flex">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the PDFs..."
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
         {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default RagChat;
