import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../main';
import { backend_api } from '../config';

const AssignmentsSection = ({ classroomId }) => {
  const { isAuthenticated, user } = useContext(Context);
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

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

  // Handle file upload (requires auth)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !isAuthenticated) return;

    // --- Get token from cookie ---
     const nameEQ = "token=";
     const ca = document.cookie.split(';');
     let token = null;
     for(let i=0; i < ca.length; i++) {
         let c = ca[i];
         while (c.charAt(0) === ' ') c = c.substring(1, c.length);
         if (c.indexOf(nameEQ) === 0) {
             token = c.substring(nameEQ.length, c.length);
             break;
         }
     }
     if (!token) {
         setError("Authentication required to upload.");
         return;
     }

    setIsUploading(true);
    setError('');
    console.log(`Assignments: Uploading file ${file.name} to classroom ${classroomId}`);

    const formData = new FormData();
    formData.append('assignmentFile', file); // Match the backend's expected field name
    // formData.append('title', 'Optional Title'); // Add other fields if needed

    try {
        // --- Actual API Call ---
       // Replace with your actual endpoint to upload assignments
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
         document.getElementById('assignment-upload-input').value = ''; // Clear file input
       } else {
          throw new Error(response.data?.message || 'File upload failed.');
       }
    } catch (err) {
      console.error("Error uploading assignment:", err);
      setError(err.message || 'Upload failed.');
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
                              <li key={assign._id}> {/* Use unique ID from data */}
                                  {/* Make filename a link to download/view - adjust URL as needed */}
                                  <a href={assign.fileUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{assign.fileName || assign.title || 'Untitled File'}</a>
                                  {/* Optional: Add uploader info or date */}
                                  {/* <span className="text-xs text-gray-500 ml-2">({new Date(assign.createdAt).toLocaleDateString()})</span> */}
                              </li>
                          ))}
                      </ul>
                  ) : (
                      <p className="text-gray-500 italic">No files uploaded yet.</p>
                  )}
              </div>

              {/* Only show upload form to teachers, or based on specific permissions */}
              {user?.role === 'Teacher' && (
                  <form onSubmit={handleUpload}>
                      <h4 className="font-medium mb-1">Upload New File:</h4>
                      <input
                          id="assignment-upload-input"
                          type="file"
                          onChange={handleFileChange}
                          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1 mb-2"
                          required
                      />
                      <button
                          type="submit"
                          disabled={!file || isUploading}
                          className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                          {isUploading ? 'Uploading...' : 'Upload Assignment'}
                      </button>
                  </form>
              )}
               {/* Students might see a different input for *submitting* assignments */}
              {user?.role === 'Student' && (
                  <div className="mt-4">
                       {/* TODO: Add submission form/button if needed */}
                      <p className="text-sm text-gray-600 italic">(Students: Submit assignments via the specific assignment link or portal)</p>
                  </div>
              )}
          </>
      )}
    </div>
  );
};

export default AssignmentsSection;