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
  }, [classroomId, isAuthenticated, authLoading]); // Depend on classroomId, isAuthenticated, authLoading

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
  }, [isAuthenticated, user?.role, participants]); // ✅ updated dependencies
   // Depend on auth state and participants list

  if (authLoading) {
    return <div className="border rounded p-4 my-4"><p>Verifying authentication...</p></div>;
  }

  return (
    <div className="border rounded p-4 my-4">
      <h3 className="text-lg font-semibold mb-3">Participants</h3>
      {isLoading && <p className="text-gray-500">Loading participants...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!isLoading && !error && !isAuthenticated && (
        <p className="text-yellow-600">Please log in to see the participants.</p>
      )}
      {!isLoading && !error && isAuthenticated && (
        participants.length > 0 ? (
          <ul className="space-y-2">
            {participants.map(participant => {
              const emotionData = participantEmotions[participant._id]; // Get emotion for participant
              return (
                <li key={participant._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                  <div>
                    <Link to={`/profile/${participant._id}`} className="font-medium hover:underline">
                      {participant.firstName} {participant.lastName}
                    </Link>
                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${participant.role === 'Teacher' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                      {participant.role}
                    </span>
                    {/* Display emotion if user is Teacher and emotion data exists */}
                    {user?.role === 'Teacher' && emotionData && ( 
                      <span className="ml-2 text-sm text-gray-700">
                        Emotion: {emotionData.emotion}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">{participant.email}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No participants found for this classroom.</p>
        )
      )}
    </div>
  );
};

export default ParticipantsSection;