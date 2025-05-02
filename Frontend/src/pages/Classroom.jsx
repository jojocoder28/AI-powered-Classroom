import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../main';
import { backend_api } from '../config';

import ClassroomListPanel from '../components/ClassroomListPanel';
import ClassroomDetailsPanel from '../components/ClassroomDetailsPanel';
import ParticipantsSection from '../components/ParticipantsSection'; // Import the ParticipantsSection

// --- Main Classroom Page Component ---

function Classroom() {
  const { roomId } = useParams();
  const { isAuthenticated, user, loading: authLoading } = useContext(Context);
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]=useState(null);

  // --- Fetch User's Classrooms (Requires Auth) ---
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
        setClassrooms([]);
        setSelectedClassroom(null);
        // Optional: Redirect to login if accessing this page directly requires auth
        // navigate('/login');
        return;
    }

    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      console.log('Fetching user classrooms...');
      try {
        const response = await axios.get(`${backend_api}/api/classrooms/${roomId}`, {
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
        setClassrooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [isAuthenticated, authLoading, navigate]);

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
      // Navigate to video page after attempting to join
      navigate(`/classroom/${roomId}/video`);
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

  return (
    <div className="flex h-[calc(100vh-theme(space.16))]">
      <ClassroomListPanel
        classrooms={classrooms}
        isLoading={isLoading}
        error={error}
        selectedClassroom={selectedClassroom}
        setSelectedClassroom={setSelectedClassroom}
        handleCreateClassroom={handleCreateClassroom}
        handleJoinClassroom={handleJoinClassroom}
        isAuthenticated={isAuthenticated}
        user={user}
      />
      <ClassroomDetailsPanel selectedClassroom={selectedClassroom} />
      {/* Add ParticipantsSection */}
      <ParticipantsSection classroomId={roomId} />
    </div>
  );
}

export default Classroom;