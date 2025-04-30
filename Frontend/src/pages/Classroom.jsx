import React, { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext'; // Assuming you might need auth context

// --- Placeholder Sub-Components --- 
// In a real app, these would likely be separate files

const ChatSection = ({ classroomId }) => {
  // TODO: Fetch chat messages for classroomId
  // TODO: Implement message input and sending
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    console.log(`Chat: Fetching messages for classroom ${classroomId}`);
    // Placeholder: fetch messages API call
    setMessages([ 
      { id: 1, user: 'Alice', text: 'Hello everyone!' },
      { id: 2, user: 'Bob', text: 'Hi Alice!' }
    ]);
  }, [classroomId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    console.log(`Chat: Sending message to classroom ${classroomId}: ${newMessage}`);
    // Placeholder: Send message API call
    // Optimistically update UI or wait for response
    setMessages([...messages, { id: Date.now(), user: 'You', text: newMessage}]);
    setNewMessage('');
  };

  return (
    <div className="border rounded p-4 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="flex-grow overflow-y-auto mb-2 border-b pb-2">
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
          className="flex-grow border rounded-l px-2 py-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600">
          Send
        </button>
      </form>
    </div>
  );
};

const VideoCallSection = ({ classroom }) => {
  // TODO: Get the actual video call link, perhaps stored in the classroom object
  const videoLink = classroom?.videoLink || '#'; // Placeholder
  return (
    <div className="border rounded p-4 my-4 ">
      <h3 className="text-lg font-semibold mb-2">Video Call</h3>
      {videoLink !== '#' ? (
        <a 
          href={videoLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Join Video Call
        </a>
      ) : (
         <p className="text-gray-500 italic">Video call link not available.</p>
      )}
    </div>
  );
};

const AssignmentsSection = ({ classroomId }) => {
  // TODO: Fetch existing assignments/files for classroomId
  // TODO: Implement file input, upload logic, and display
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [assignments, setAssignments] = useState([]); // Placeholder

  useEffect(() => {
    console.log(`Assignments: Fetching for classroom ${classroomId}`);
    // Placeholder: fetch assignments API call
    setAssignments([
        { id: 1, name: 'Project Proposal.pdf', url: '#' },
        { id: 2, name: 'Milestone 1 Report.docx', url: '#' }
    ]);
  }, [classroomId]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    console.log(`Assignments: Uploading file ${file.name} to classroom ${classroomId}`);
    // Placeholder: Upload file API call
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
    // On success, update assignments list, clear file input
    setAssignments([...assignments, { id: Date.now(), name: file.name, url: '#'}]);
    setFile(null);
    document.getElementById('assignment-upload-input').value = ''; // Clear file input
    setUploading(false);
  };

  return (
    <div className="border rounded p-4 my-4 ">
      <h3 className="text-lg font-semibold mb-2">Assignments / Files</h3>
      <div className="mb-4">
        <h4 className="font-medium mb-1">Uploaded Files:</h4>
        {assignments.length > 0 ? (
            <ul className="list-disc pl-5">
            {assignments.map(assign => (
                <li key={assign.id}><a href={assign.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{assign.name}</a></li>
            ))}
            </ul>
        ) : (
            <p className="text-gray-500 italic">No files uploaded yet.</p>
        )}
      </div>
      <form onSubmit={handleUpload}>
        <h4 className="font-medium mb-1">Upload New File:</h4>
        <input 
          id="assignment-upload-input"
          type="file" 
          onChange={handleFileChange} 
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-1 mb-2"
        />
        <button 
          type="submit" 
          disabled={!file || uploading}
          className={`bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {uploading ? 'Uploading...' : 'Upload Assignment'}
        </button>
      </form>
    </div>
  );
};

// --- Main Classroom Page Component ---

function Classroom() {
  // const { user, token } = useAuth(); // Get user/token if needed for API calls
  const [classrooms, setClassrooms] = useState([]); // List of all joined/available classrooms
  const [selectedClassroom, setSelectedClassroom] = useState(null); // The currently active classroom object
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch classrooms on component mount
  useEffect(() => {
    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      console.log('Fetching classrooms...');
      try {
        // --- Placeholder API Call ---
        // const response = await fetch('/api/classrooms', { 
        //   headers: { 'Authorization': `Bearer ${token}` } 
        // });
        // if (!response.ok) throw new Error('Failed to fetch classrooms');
        // const data = await response.json();
        // setClassrooms(data);

        // --- Simulation ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const mockClassrooms = [
          { id: '101', name: 'React Fundamentals', description: 'Learn the basics of React', videoLink: 'https://meet.google.com/xyz-abc' },
          { id: '102', name: 'Advanced Node.js', description: 'Deep dive into Node.js concepts' },
          { id: '103', name: 'Project Collaboration Space', description: 'Team project work area', videoLink: 'https://zoom.us/j/123456789' },
        ];
        setClassrooms(mockClassrooms);
        // --- End Simulation ---

      } catch (err) {
        console.error("Error fetching classrooms:", err);
        setError(err.message || 'Could not load classrooms.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
    // }, [token]); // Dependency array might include token if using auth
  }, []); // Run once on mount

  const handleCreateClassroom = () => {
    // TODO: Implement Create Classroom Modal/Form
    const newName = prompt('Enter new classroom name:');
    if (newName) {
        console.log(`Creating classroom: ${newName}`);
        // Placeholder: API call to create classroom
        // On success, add to list and maybe select it
        const newClassroom = { id: Date.now().toString(), name: newName, description: 'Newly created' };
        setClassrooms([...classrooms, newClassroom]);
        setSelectedClassroom(newClassroom);
    }
  };

  const handleJoinClassroom = () => {
    // TODO: Implement Join Classroom Modal/Form (e.g., using an invite code)
    const joinCode = prompt('Enter classroom code to join:');
    if (joinCode) {
        console.log(`Attempting to join classroom with code: ${joinCode}`);
        // Placeholder: API call to join classroom
        // On success, fetch updated list or add directly
        alert('Join functionality not fully implemented.');
    }
  };

  // Render logic
  if (isLoading) {
    return <div className="p-4">Loading classrooms...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="flex h-screen p-4 space-x-4 ">
      {/* Left Panel: Classroom List and Actions */} 
      <div className="w-1/3 border rounded p-4  flex flex-col">
        <h2 className="text-xl font-bold mb-4">Classrooms</h2>
        <div className="mb-4 flex space-x-2">
          <button 
            onClick={handleCreateClassroom} 
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Create New
          </button>
          <button 
            onClick={handleJoinClassroom} 
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm"
          >
            Join Existing
          </button>
        </div>
        <div className="flex-grow overflow-y-auto border-t pt-2">
          {classrooms.length > 0 ? (
            <ul>
              {classrooms.map(room => (
                <li 
                  key={room.id} 
                  onClick={() => setSelectedClassroom(room)}
                  className={`p-2 rounded cursor-pointer  hover:bg-gray-500 ${selectedClassroom?.id === room.id ? 'bg-blue-100 text-black font-semibold' : ''}`}
                >
                  {room.name}
                  <p className="text-xs text-gray-600">{room.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No classrooms joined yet.</p>
          )}
        </div>
      </div>

      {/* Right Panel: Selected Classroom Details */} 
      <div className="w-2/3 border rounded p-4  overflow-y-auto">
        {selectedClassroom ? (
          <div>
            <h2 className="text-2xl font-bold mb-4">{selectedClassroom.name}</h2>
            <p className="mb-4 text-gray-700">{selectedClassroom.description}</p>
            
            {/* Integrate placeholder components */}
            <VideoCallSection classroom={selectedClassroom} />
            <AssignmentsSection classroomId={selectedClassroom.id} />
            <ChatSection classroomId={selectedClassroom.id} />

          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
             <p className="text-gray-500 text-lg">Select a classroom from the list to view details, or create/join one.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classroom;
