import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import axios from 'axios'; // Use axios for consistency
import { backend_api } from '../config'; // Use the config from main.jsx context setup
import { Context } from '../main'; // Import the context from main.jsx
import { Link } from 'react-router-dom'; // Import Link for potential future use

const ParticipantsSection = ({ classroomId }) => {
  const { isAuthenticated, user, loading: authLoading } = useContext(Context); // Consume the context
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't fetch if no classroom is selected or if auth context is still loading
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
        // Get token from cookie (as done in main.jsx check)

        // Actual API Call
        const response = await axios.get(`${backend_api}/api/classroom/${classroomId}/participants`, {
          withCredentials: true, // Important if backend expects cookies
        });

        if (response.data && response.data.success) {
            setParticipants(response.data.participants || []);
        } else {
            throw new Error(response.data?.message || 'Failed to fetch participants');
        }

      } catch (err) {
        console.error("Error fetching participants:", err);
        setError(err.message || 'Could not load participants.');
        setParticipants([]); // Clear participants on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  // Add isAuthenticated and authLoading as dependencies
  }, [classroomId, isAuthenticated, authLoading]);

  // Show loading state from context if it's loading
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
            {participants.map(participant => (
              <li key={participant._id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                <div>
                   {/* Example: Link to a user profile page if it exists */}
                  <Link to={`/profile/${participant._id}`} className="font-medium hover:underline"> 
                    {participant.firstName} {participant.lastName}
                  </Link>
                  <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${participant.role === 'Teacher' ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                    {participant.role}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{participant.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No participants found for this classroom.</p>
        )
      )}
    </div>
  );
};

export default ParticipantsSection;
