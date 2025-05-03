import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../main';
import { backend_api } from '../config';

import ClassroomListPanel from '../components/ClassroomListPanel';
import ClassroomDetailsPanel from '../components/ClassroomDetailsPanel';
import ParticipantsSection from '../components/ParticipantsSection';

function Classroom() {
  const { roomId } = useParams();
  const { isAuthenticated, user, loading: authLoading } = useContext(Context);
  const navigate = useNavigate();

  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch classrooms user is part of
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setClassrooms([]);
      setSelectedClassroom(null);
      return;
    }

    const fetchClassrooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backend_api}/api/classrooms/myclassrooms`, { // Changed endpoint to get user's classrooms
          withCredentials: true,
        });

        if (response.data?.success) {
          setClassrooms(response.data.classrooms || []);
          // Optional: Select the classroom matching the roomId from the fetched list
          const initialSelected = response.data.classrooms.find(cls => cls._id === roomId);
          setSelectedClassroom(initialSelected || null);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch classrooms');
        }
      } catch (err) {
        console.error("Error fetching my classrooms:", err);
        setError(err.message || 'Could not load your classrooms.');
        setClassrooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassrooms();
  }, [isAuthenticated, authLoading, backend_api, roomId]); // Added dependencies

  // Handle classroom selection from the list
  const handleSelectClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    // Optionally navigate to the specific classroom URL
    if (classroom?._id !== roomId) {
        navigate(`/classroom/${classroom._id}`);
    }
  };

  // Simplified handlers - actual creation/joining logic might be elsewhere
  const handleCreateClassroom = () => {
    // This is likely handled on the MyClassrooms page, but keeping for context
    alert("Navigate to MyClassrooms page to create a classroom.");
    navigate('/myclassrooms');
  };

  const handleJoinClassroom = () => {
     // This is likely handled on the MyClassrooms page, but keeping for context
     alert("Navigate to MyClassrooms page to join a classroom.");
     navigate('/myclassrooms');
  };


  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-200">
        <p className="text-lg font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-200 p-10">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
             <p className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">Please log in to access your classrooms.</p>
             <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition duration-200">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-200">
      {/* Classroom List Panel (Sidebar) */}
      <div className="w-full lg:w-1/4 xl:w-1/5 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
         <ClassroomListPanel
            classrooms={classrooms}
            isLoading={isLoading}
            error={error}
            selectedClassroom={selectedClassroom}
            setSelectedClassroom={handleSelectClassroom} // Use new handler
            handleCreateClassroom={handleCreateClassroom} // Kept for now, though navigation added
            handleJoinClassroom={handleJoinClassroom}   // Kept for now, though navigation added
            isAuthenticated={isAuthenticated}
            user={user}
          />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col p-6 lg:p-8 space-y-6 overflow-y-auto">
         {/* Header Section */}
        <header className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-200">Classroom View</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">Details and participants</p>
        </header>

        {/* Classroom Details */}
        {selectedClassroom ? (
           <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-700">Details: {selectedClassroom.name}</h2>
            <ClassroomDetailsPanel selectedClassroom={selectedClassroom} />
          </section>
        ) : (
           <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Select a classroom from the list to view details.</p>
           </div>
        )}

        {/* Participants */}
        {selectedClassroom && (
          <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-700">Participants</h2>
            {/* Pass the selected classroom's ID to ParticipantsSection */}
            <ParticipantsSection classroomId={selectedClassroom._id} />
          </section>
        )}

         {/* Placeholder for other sections like Video/Assignment */}
         <section className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
           <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-700">Additional Sections</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-4 border border-indigo-300 rounded-lg bg-indigo-50 dark:bg-indigo-900 dark:border-indigo-700">
               <p className="text-indigo-800 dark:text-indigo-200 font-medium">Video Call Feature Coming Soon</p>
             </div>
             <div className="p-4 border border-green-300 rounded-lg bg-green-50 dark:bg-green-900 dark:border-green-700">
               <p className="text-green-800 dark:text-green-200 font-medium">Assignment Area Coming Soon</p>
             </div>
           </div>
         </section>

      </div>
    </div>
  );
}

export default Classroom;
