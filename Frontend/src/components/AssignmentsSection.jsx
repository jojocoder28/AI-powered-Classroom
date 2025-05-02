import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../main';
import { backend_api } from '../config';

const AssignmentsSection = ({ classroomId }) => {
  const { isAuthenticated, user } = useContext(Context);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(''); // State for assignment title
  const [description, setDescription] = useState(''); // State for assignment description
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false); // State to toggle upload form visibility

  // Fetch assignments (requires auth)
  useEffect(() => {
    if (!classroomId || !isAuthenticated) {
        setAssignments([]); // Clear assignments if not logged in or no class selected
        return;
    };

    const fetchAssignments = async () => {
      setIsLoading(true);
      setError('');
      console.log(`Assignments: Fetching for classroom ${classroomId}`);
      try {
         // --- Get token from cookie ---
        
         // --- Actual API Call ---
        // Replace with your actual endpoint to fetch assignments
        const response = await axios.get(`${backend_api}/api/classrooms/${classroomId}/assignments`, { // Example endpoint
          withCredentials: true,
        });

        if (response.data && response.data.success) {
             setAssignments(response.data.assignments || []);
        } else {
             throw new Error(response.data?.message || 'Failed to fetch assignments');
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
        setError(err.message || 'Could not load assignments.');
        setAssignments([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssignments();
  }, [classroomId, isAuthenticated]); // Re-fetch if classroom or auth state changes

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  // Handle file upload (requires auth)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !isAuthenticated || !title) { // Title is now required
         setError("Please provide a title and select a file.");
         return;
    };

    // --- Get token from cookie (this might be handled by axios withCredentials, but keeping for clarity if needed elsewhere) ---
    // const nameEQ = "token=";
    // const ca = document.cookie.split(';');
    // let token = null;
    // for(let i=0; i < ca.length; i++) {
    //     let c = ca[i];
    //     while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    //     if (c.indexOf(nameEQ) === 0) {
    //         token = c.substring(nameEQ.length, c.length);
    //         break;
    //     }
    // }
    // if (!token) {
    //     setError("Authentication required to upload.");
    //     return;
    // }

    setIsUploading(true);
    setError('');
    console.log(`Assignments: Uploading file ${file.name} to classroom ${classroomId}`);

    const formData = new FormData();
    formData.append('assignmentFile', file); // Match the backend's expected field name
    formData.append('title', title); // Add title
    if (description) { // Add description if provided
        formData.append('description', description);
    }

    try {
        // --- Actual API Call ---
      const response = await axios.post(`${backend_api}/api/classrooms/${classroomId}/assignments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
        },
        withCredentials: true,
      });

       if (response.data && response.data.success) {
         // Add the new assignment to the list (or re-fetch)
         setAssignments(prev => [...prev, response.data.assignment]); // Assuming backend returns the new assignment object
         setFile(null);
         setTitle(''); // Clear title input
         setDescription(''); // Clear description input
         document.getElementById('assignment-upload-input').value = ''; // Clear file input
         setShowUploadForm(false); // Hide form on success
       } else {
          throw new Error(response.data?.message || 'File upload failed.');
       }
    } catch (err) {
      console.error("Error uploading assignment:", err);
      setError(err.response?.data?.message || err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- Render Logic ---
  if (!isAuthenticated) {
      return <div className="border rounded p-4 my-4 text-yellow-600">Log in to view or manage assignments.</div>;
  }

  return (
    <div className="border rounded p-4 my-4">
      <h3 className="text-lg font-semibold mb-2">Assignments / Files</h3>
       {isLoading && <p>Loading assignments...</p>}
       {error && <p className="text-red-600">Error: {error}</p>}

      {!isLoading && !error && (
          <>
              <div className="mb-4">
                  <h4 className="font-medium mb-1">Uploaded Files:</h4>
                  {assignments.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                          {assignments.map(assign => (
                              // Ensure assign._id is unique and stable for keys
                              <li key={assign._id || assign.cloudinaryPublicId || Math.random()}> 
                                  {/* Use storagePath from backend response */} 
                                  <a href={assign.storagePath || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{assign.title || assign.originalFileName || 'Untitled File'}</a>
                                  {/* Optional: Add uploader info or date */}
                                  {/* <span className="text-xs text-gray-500 ml-2">({new Date(assign.createdAt).toLocaleDateString()})</span> */}
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-gray-500 italic">No files uploaded yet.</p>
                  )}
              </div>

              {/* Only show upload section to teachers, or based on specific permissions */}
              {user?.role === 'Teacher' && (
                <div className="mt-4">
                  {!showUploadForm ? (
                    <button
                      onClick={() => setShowUploadForm(true)}
                      className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                      Upload New Assignment
                    </button>
                  ) : (
                    <form onSubmit={handleUpload} className="border p-4 rounded">
                      <h4 className="font-medium mb-3">Upload Assignment File:</h4>
                      
                      <div className="mb-3">
                          <label htmlFor="assignment-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title:</label>
                          <input
                              type="text"
                              id="assignment-upload-input"
                              value={title}
                              onChange={handleTitleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                          />
                      </div>

                       <div className="mb-3">
                          <label htmlFor="assignment-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional):</label>
                          <textarea
                              id="assignment-description"
                              value={description}
                              onChange={handleDescriptionChange}
                              rows="3"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          ></textarea>
                      </div>

                      <div className="mb-3">
                           <label htmlFor="assignment-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select File:</label>
                          <input
                              id="assignment-file"
                              type="file"
                              onChange={handleFileChange}
                              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              required
                          />
                      </div>
                      
                      <div className="flex space-x-2">
                          <button
                              type="submit"
                              disabled={!file || !title || isUploading} // Disable if no file, no title, or uploading
                              className={
                                  `flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed`
                              }
                          >
                              {isUploading ? 'Uploading...' : 'Upload'}
                          </button>
                           <button
                            type="button"
                            onClick={() => setShowUploadForm(false)}
                            className="flex-1 justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                      </div>

                    </form>
                  )}
                </div>
              )}

               {/* Students might see a different input for *submitting* assignments */}
              {user?.role === 'Student' && (
                  <div className="mt-4">
                       {/* TODO: Add submission form/button if needed */}
                      <p className="text-sm text-gray-600 italic dark:text-gray-400">(Students: Submit assignments via the specific assignment link or portal)</p>
                  </div>
              )}
          </>
      )}
    </div>
  );
};

export default AssignmentsSection;