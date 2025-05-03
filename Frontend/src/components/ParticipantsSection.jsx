import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { backend_api } from '../config';
import { Context } from '../main';
import { Link } from 'react-router-dom';

const ParticipantsSection = ({ classroomId }) => {
  const { isAuthenticated, user, loading: authLoading } = useContext(Context);
  const [participants, setParticipants] = useState([]);
  const [participantEmotions, setParticipantEmotions] = useState({}); // State to store participant emotions
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to fetch participants
  useEffect(() => {
    if (!classroomId || authLoading) return;

    const fetchParticipants = async () => {
      if (!isAuthenticated) {
        setError("Please log in to view participants.");
        return;
      }

      setIsLoading(true);
      setError(null);
      console.log(`Participants: Fetching for classroom ${classroomId}`);
      try {
        const response = await axios.get(`${backend_api}/api/classrooms/${classroomId}/participants`, {
          withCredentials: true,
        });

        if (response.data && response.data.success) {
          console.log("Participants: ", response.data.participants);
          setParticipants(response.data.participants || []);
        } else {
          throw new Error(response.data?.message || 'Failed to fetch participants');
        }
      } catch (err) {
        console.error("Error fetching participants:", err);
        setError(err.message || 'Could not load participants.');
        setParticipants([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [classroomId, isAuthenticated, authLoading, backend_api]); // Added backend_api dependency

  // Effect to fetch participant emotions (only for teachers)
  useEffect(() => {
    let intervalId;
  
    const fetchParticipantEmotions = async () => {
      if (!isAuthenticated || user?.role !== 'Teacher' || participants.length === 0) {
        setParticipantEmotions({});
        return;
      }
  
      const studentIds = participants
        .filter(p => p.role === 'Student')
        .map(p => p._id);
  
      if (studentIds.length === 0) {
        setParticipantEmotions({});
        return;
      }
  
      try {
        console.log("Fetching emotions for student IDs:", studentIds);
        const response = await axios.post(
          `${backend_api}/api/studentactivity/latestEmotions`,
          { studentIds },
          { withCredentials: true }
        );
  
        if (response.data?.success) {
          console.log("Fetched emotions:", response.data.emotions);
          setParticipantEmotions(response.data.emotions);
        } else {
          console.error("Failed to fetch emotions:", response.data?.message);
        }
      } catch (err) {
        console.error("Error fetching emotions:", err);
      }
    };
  
    fetchParticipantEmotions();
    intervalId = setInterval(fetchParticipantEmotions, 5000);
  
    return () => clearInterval(intervalId);
  }, [isAuthenticated, user?.role, participants, backend_api]); // Added backend_api dependency

  if (authLoading) {
    return <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center text-gray-600 dark:text-gray-300">Verifying authentication...</div>;
  }

  // Use gray-700 for text in light mode for better readability, gray-200 in dark mode
  const textColorClass = "text-gray-700 dark:text-gray-200";
  const titleColorClass = "text-gray-800 dark:text-gray-200";
  const borderColorClass = "border-gray-200 dark:border-gray-700";

  return (
    <div className={`p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg ${textColorClass}`}>
      <h3 className={`text-2xl font-bold mb-4 border-b pb-3 ${borderColorClass} ${titleColorClass}`}>Participants</h3>
      
      {isLoading && <p className="text-center text-gray-600 dark:text-gray-300 text-lg">Loading participants...</p>}
      {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
      {!isLoading && !error && !isAuthenticated && (
        <p className="text-center text-yellow-600 dark:text-yellow-400 text-lg">Please log in to see the participants.</p>
      )}
      
      {!isLoading && !error && isAuthenticated && (
        participants.length > 0 ? (
          <ul className="space-y-4">
            {participants.map(participant => {
              const emotionData = participantEmotions[participant._id];
              return (
                <li key={participant._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Link to={`/profile/${participant._id}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline text-lg">
                      {participant.firstName} {participant.lastName}
                    </Link>
                    <span className={`ml-3 text-xs font-semibold px-2 py-0.5 rounded-full ${participant.role === 'Teacher' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                      {participant.role}
                    </span>
                     {/* Display emotion if user is Teacher and emotion data exists */}
                    {user?.role === 'Teacher' && emotionData && ( 
                      <span className="ml-3 text-sm text-gray-600 dark:text-gray-300">
                        Emotion: <span className="font-medium">{emotionData.emotion}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{participant.email}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg italic">No participants found for this classroom.</p>
        )
      )}
    </div>
  );
};

export default ParticipantsSection;