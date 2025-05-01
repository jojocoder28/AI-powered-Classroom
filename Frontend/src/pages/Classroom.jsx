import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import axios from 'axios'; // Import axios
import ParticipantsSection from '../components/ParticipantsSection';
import { Context } from '../main'; // Import the context from main.jsx
import { backend_api } from '../config'; // Import backend API config

// --- Sub-Components (Keep placeholders or implement fully as needed) ---

const ChatSection = ({ classroomId }) => {
  const { isAuthenticated } = useContext(Context); // Get auth state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch messages (Placeholder/Actual)
  useEffect(() => {
    if (!classroomId || !isAuthenticated) return;
    // TODO: Implement actual message fetching using token from context/cookie
    console.log(`Chat: Fetching messages for classroom ${classroomId}`);
    setMessages([
      { id: 1, user: 'Alice', text: 'Hello everyone!' },
      { id: 2, user: 'Bob', text: 'Hi Alice!' }
    ]);
  }, [classroomId, isAuthenticated]);

  // Send message (Placeholder/Actual)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;
    console.log(`Chat: Sending message to classroom ${classroomId}: ${newMessage}`);
    // TODO: Implement actual message sending using token
    // Optimistic update:
    setMessages([...messages, { id: Date.now(), user: 'You', text: newMessage }]);
    setNewMessage('');
  };

  if (!isAuthenticated) {
    return <div className="border rounded p-4 mt-4 text-yellow-600">Log in to use the chat.</div>;
  }

  return (
    <div className="border rounded p-4 mt-4 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="flex-grow overflow-y-auto mb-2 border-b pb-2">
        {/* Message display logic */}
        {messages.length > 0 ? (
            messages.map(msg => (
              <p key={msg.id}><strong>{msg.user}:</strong> {msg.text}</p>
            ))
          ) : (
            <p className="text-gray-500 italic">No messages yet.</p>
          )}
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border rounded-l px-2 py-1 input-style" // Added input-style potentially
          disabled={!isAuthenticated} // Disable if not logged in
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600 disabled:opacity-50" disabled={!isAuthenticated || !newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

const VideoCallSection = ({ classroom }) => {
    const { isAuthenticated } = useContext(Context);
    // TODO: Fetch actual video link from classroom details if secured
    const videoLink = classroom?.videoLink || '#'; // Placeholder

    if (!isAuthenticated) {
       return <div className="border rounded p-4 my-4 text-yellow-600">Log in to access video call links.</div>;
    }

    return (
      <div className="border rounded p-4 my-4">
        <h3 className="text-lg font-semibold mb-2">Video Call</h3>
        {videoLink && videoLink !== '#' ? (
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join Video Call
          </a>
        ) : (
           <p className="text-gray-500 italic">Video call link not available or not configured for this class.</p>
        )}
      </div>
    );
};

const AssignmentsSection = ({ classroomId }) => {
  const { isAuthenticated, user } = useContext(Context); // Use context
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
         if (!token) throw new Error("Authentication required.");

         // --- Actual API Call ---
        // Replace with your actual endpoint to fetch assignments
        const response = await axios.get(`${backend_api}/api/v1/classroom/${classroomId}/assignments`, { // Example endpoint
          headers: { 'Authorization': `Bearer ${token}` },
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
      const response = await axios.post(`${backend_api}/api/v1/classroom/${classroomId}/assignments`, formData, { // Example endpoint
        headers: {
          'Authorization': `Bearer ${token}`,
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


// --- Main Classroom Page Component ---

function Classroom() {
  const { roomId } = useParams();
  const { isAuthenticated, user, loading: authLoading } = useContext(Context); // Use context
  const navigate = useNavigate(); // For potential redirects

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Component specific loading
  const [error, setError] = useState(null);
  //const [classroomId, setClassroomId] = useState(null); // Track selected classroom ID

  // --- Fetch User's Classrooms (Requires Auth) ---
  useEffect(() => {
    // Don't fetch if auth is loading or user is not authenticated
    if (authLoading) return;
    if (!isAuthenticated) {
        setClassrooms([]); // Clear classrooms if not logged in
        setSelectedClassroom(null); // Clear selection
        // Optional: Redirect to login if accessing this page directly requires auth
        // navigate('/login');
        return;
    }

    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      //console.log(req.params);
      console.log('Fetching user classrooms...');
      try {
        // --- Get token from cookie ---
         //if (!token) throw new Error("Authentication required.");

        // --- Actual API Call ---
        // Replace with your endpoint to get classrooms for the logged-in user
        const response = await axios.get(`${backend_api}/api/classrooms/${roomId}`, { // Example endpoint
            //headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        });

        if (response.data && response.data.success) {
            setClassrooms(response.data.classrooms || []);
        } else {
            throw new Error(response.data?.message || 'Failed to fetch classrooms');
        }

      } catch (err) {
        console.error("Error fetching classrooms:", err);
        setError(err.message || 'Could not load classrooms.');
        setClassrooms([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [isAuthenticated, authLoading, navigate]); // Re-run if auth state changes

  // --- Classroom Actions (Placeholders - Implement with API calls) ---
  const handleCreateClassroom = () => {
    // TODO: Use a modal form instead of prompt
    // TODO: Implement API call to create classroom using token from context/cookie
    const newName = prompt('Enter new classroom name:');
    if (newName && isAuthenticated) {
      console.log(`Creating classroom: ${newName}`);
      // Placeholder: API call
      // On success: refetch classrooms or add to state
      const newClassroom = { _id: Date.now().toString(), name: newName, description: 'Newly created (Simulated)' }; // Use _id for consistency
      setClassrooms([...classrooms, newClassroom]);
      setSelectedClassroom(newClassroom);
    } else if (!isAuthenticated) {
        alert("Please log in to create a classroom.");
    }
  };

  const handleJoinClassroom = () => {
    // TODO: Use a modal form
    // TODO: Implement API call to join classroom using token
    const joinCode = prompt('Enter classroom code to join:');
    if (joinCode && isAuthenticated) {
      console.log(`Attempting to join classroom with code: ${joinCode}`);
      // Placeholder: API call
      alert('Join functionality needs backend implementation.');
    } else if (!isAuthenticated) {
        alert("Please log in to join a classroom.");
    }
  };

  // --- Render Logic ---

  // Show main loading indicator while checking auth or fetching initial data
   if (authLoading || (isLoading && !classrooms.length)) {
    return <div className="p-4 flex justify-center items-center h-screen">Loading...</div>;
  }

  // Handle case where user is not logged in
  if (!isAuthenticated && !authLoading) {
      return (
          <div className="p-4 text-center">
              <p className="mb-4">Please log in to access your classrooms.</p>
              <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
      );
  }

  // Handle errors during classroom fetching
  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="flex h-[calc(100vh-theme(space.16))]"> {/* Adjust height based on potential Navbar/Header */}

      {/* Left Panel: Classroom List and Actions */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col bg-white dark:bg-gray-800">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Classrooms</h2>

        {/* Action Buttons - Only show if authenticated */}
        {isAuthenticated && (
            <div className="mb-4 flex space-x-2">
              <button
                  onClick={handleCreateClassroom}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
                  // Disable if not a teacher (adjust role check as needed)
                  disabled={user?.role !== 'Teacher'}
                  title={user?.role !== 'Teacher' ? "Only teachers can create classrooms" : ""}
              >
                  Create New
              </button>
              <button
                  onClick={handleJoinClassroom}
                  className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm disabled:opacity-50"
                   // Disable if not a student (adjust role check as needed)
                  disabled={user?.role !== 'Student'}
                   title={user?.role !== 'Student' ? "Only students can join classrooms" : ""}
              >
                  Join Existing
              </button>
            </div>
        )}

        {/* Classroom List */}
        <div className="flex-grow overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-2">
          {isLoading && <p>Loading list...</p>}
          {!isLoading && classrooms.length > 0 ? (
            <ul className="space-y-1">
              {classrooms.map(room => (
                <li
                  key={room._id} // Use unique _id from MongoDB
                  onClick={() => setSelectedClassroom(room)}
                  className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedClassroom?._id === room._id ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span className="block font-medium">{room.name}</span>
                  {room.description && <p className="text-xs text-gray-600 dark:text-gray-400">{room.description}</p>}
                </li>
              ))}
            </ul>
          ) : (
            !isLoading && <p className="text-gray-500 dark:text-gray-400 italic">No classrooms found. Create or join one!</p>
          )}
        </div>
      </div>

      {/* Right Panel: Selected Classroom Details */}
      <div className="w-2/3 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        {selectedClassroom ? (
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{selectedClassroom.name}</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">{selectedClassroom.description || 'No description provided.'}</p>

            {/* Sections that depend on the selected classroom ID */}
            <ParticipantsSection classroomId={selectedClassroom._id} />
            <VideoCallSection classroom={selectedClassroom} />
            <AssignmentsSection classroomId={selectedClassroom._id} />
            {/* Chat might be independent or tied to the classroom */}
            <ChatSection classroomId={selectedClassroom._id} />

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
             <p className="text-gray-500 dark:text-gray-400 text-lg">Select a classroom from the list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classroom; // Ensure this export is present
