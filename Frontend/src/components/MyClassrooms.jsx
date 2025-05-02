'use strict';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Context } from '../main'; // Adjust path if needed
import { backend_api } from '../config'; // Adjust path if needed

function MyClassrooms() {
    const { isAuthenticated, user } = useContext(Context);
    
    // State for user's joined/taught classrooms
    const [myClassrooms, setMyClassrooms] = useState([]);
    const [loadingMyClassrooms, setLoadingMyClassrooms] = useState(true);
    const [errorMyClassrooms, setErrorMyClassrooms] = useState(null);

    // State for available classrooms (for students)
    const [availableClassrooms, setAvailableClassrooms] = useState([]);
    const [loadingAvailable, setLoadingAvailable] = useState(false);
    const [errorAvailable, setErrorAvailable] = useState(null);
    
    // State for joining a classroom
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState(null);
    const [joinMessage, setJoinMessage] = useState(null);
    const [joiningClassroomId, setJoiningClassroomId] = useState(null); // Track which button is loading

    // State for classroom creation form (for teachers)
    const [newClassName, setNewClassName] = useState('');
    const [newClassDesc, setNewClassDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState(null);
    const [createMessage, setCreateMessage] = useState(null);

    // --- Fetching Data ---

    // Fetch classrooms user is part of (taught or enrolled)
    const fetchMyClassrooms = useCallback(async () => {
        if (!isAuthenticated) {
            setLoadingMyClassrooms(false);
            return;
        }
        setLoadingMyClassrooms(true);
        setErrorMyClassrooms(null);
        try {
            const response = await axios.get(`${backend_api}/api/classrooms/myclassrooms`, {
                withCredentials: true,
            });
            setMyClassrooms(response.data.classrooms || []);
        } catch (err) {
            console.error("Error fetching my classrooms:", err);
            setErrorMyClassrooms(err.response?.data?.message || "Failed to load your classrooms.");
        } finally {
            setLoadingMyClassrooms(false);
        }
    }, []);

    // Fetch classrooms available for joining (students only)
    const fetchAvailableClassrooms = useCallback(async () => {
        if (!isAuthenticated || user?.role !== 'Student') {
            setLoadingAvailable(false);
            return;
        }
        setLoadingAvailable(true);
        setErrorAvailable(null);
        try {
            const response = await axios.get(`${backend_api}/api/classrooms/available`, {
                withCredentials: true,
            });
            setAvailableClassrooms(response.data.classrooms || []);
        } catch (err) {
            console.error("Error fetching available classrooms:", err);
            setErrorAvailable(err.response?.data?.message || "Failed to load available classrooms.");
        } finally {
            setLoadingAvailable(false);
        }
    }, [isAuthenticated, user?.role, backend_api]);

    // Initial data fetch on component mount or auth change
    useEffect(() => {
        fetchMyClassrooms();
        if (user?.role === 'Student') {
            fetchAvailableClassrooms();
        }
    }, []);

    // --- Event Handlers ---

    // Handler for creating a new classroom (Teachers)
    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) {
            setCreateError('Classroom name is required.');
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        setCreateMessage(null);
        try {
            await axios.post(`${backend_api}/api/classrooms`, 
                { name: newClassName, description: newClassDesc }, 
                { withCredentials: true }
            );
            setCreateMessage('Classroom created successfully!');
            setNewClassName('');
            setNewClassDesc('');
            await fetchMyClassrooms(); // Refresh user's classroom list
            // No need to refresh available classrooms here
        } catch (err) {
            console.error("Error creating classroom:", err);
            setCreateError(err.response?.data?.message || "Failed to create classroom.");
        } finally {
            setIsCreating(false);
            // Optionally clear message after a delay
            setTimeout(() => setCreateMessage(null), 3000);
        }
    };

    // Handler for joining a classroom (Students)
    const handleJoinClassroom = async (joinCode, classroomId) => {
        setJoiningClassroomId(classroomId); // Set loading state for this specific button
        setIsJoining(true);
        setJoinError(null);
        setJoinMessage(null);
        try {
            await axios.post(`${backend_api}/api/classrooms/join`, 
                { joinCode }, 
                { withCredentials: true }
            );
            setJoinMessage('Successfully joined classroom!');
            await fetchMyClassrooms(); // Refresh user's classroom list
            await fetchAvailableClassrooms(); // Refresh available classrooms list
        } catch (err) {
            console.error("Error joining classroom:", err);
            setJoinError(err.response?.data?.message || "Failed to join classroom.");
        } finally {
            setIsJoining(false);
            setJoiningClassroomId(null); // Clear loading state for button
             // Optionally clear message/error after a delay
            setTimeout(() => {
                setJoinMessage(null);
                setJoinError(null);
            }, 3000);
        }
    };

    // --- Render Logic ---
    if (!isAuthenticated) {
        return <p className="text-red-500 p-4">Please log in to view classrooms.</p>; 
    }

    return (
        <div className="mt-8 space-y-10">
            {/* Teacher: Classroom Creation Form */}
            {user?.role === 'Teacher' && (
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Create New Classroom</h3>
                    <form onSubmit={handleCreateClassroom} className="space-y-4">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="newClassName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Classroom Name</label>
                            <input type="text" id="newClassName" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Advanced React" required className="w-full input-style" />
                        </div>
                        {/* Description Input */}
                        <div>
                            <label htmlFor="newClassDesc" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                            <textarea id="newClassDesc" value={newClassDesc} onChange={(e) => setNewClassDesc(e.target.value)} placeholder="Describe the classroom" rows="3" className="w-full input-style" />
                        </div>
                        {/* Messages/Errors */}
                        {createMessage && <p className="text-green-600 text-sm">{createMessage}</p>}
                        {createError && <p className="text-red-500 text-sm">{createError}</p>}
                        {/* Submit Button */}
                        <button type="submit" disabled={isCreating} className={`w-full btn-primary ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isCreating ? 'Creating...' : 'Create Classroom'}
                        </button>
                    </form>
                </div>
            )}

            {/* User's Enrolled/Taught Classrooms Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">My Classrooms</h2>
                {loadingMyClassrooms && <p className="text-gray-600 dark:text-gray-400">Loading your classrooms...</p>}
                {!loadingMyClassrooms && errorMyClassrooms && <p className="text-red-500">Error: {errorMyClassrooms}</p>}
                {!loadingMyClassrooms && !errorMyClassrooms && myClassrooms.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400">
                        {user?.role === 'Teacher' ? "You haven't created or joined any classrooms yet." : "You are not enrolled in any classrooms yet."}
                    </p>
                )}
                {!loadingMyClassrooms && myClassrooms.length > 0 && (
                    <ul className="space-y-4">
                        {myClassrooms.map((classroom) => (
                            <li key={classroom._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-medium text-indigo-600 dark:text-indigo-400 mb-1">{classroom.name}</h3>
                                    {classroom.description && <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">{classroom.description}</p>}
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Role: <span className={`font-medium ${classroom.teacher?._id === user?._id ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {classroom.teacher?._id === user?._id ? 'Teacher' : 'Student'}
                                        </span>
                                    </p>
                                </div>
                                <Link to={`/classroom/${classroom._id}`} className="btn-secondary text-sm py-1 px-3">
                                    View
                                </Link> 
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Student: Available Classrooms to Join Section */}
            {user?.role === 'Student' && (
                <div>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Available Classrooms to Join</h2>
                    {/* Join Action Messages/Errors */} 
                    {joinMessage && <p className="text-green-600 mb-3 text-sm">{joinMessage}</p>}
                    {joinError && <p className="text-red-500 mb-3 text-sm">{joinError}</p>}

                    {loadingAvailable && <p className="text-gray-600 dark:text-gray-400">Loading available classrooms...</p>}
                    {!loadingAvailable && errorAvailable && <p className="text-red-500">Error: {errorAvailable}</p>}
                    {!loadingAvailable && !errorAvailable && availableClassrooms.length === 0 && (
                        <p className="text-gray-600 dark:text-gray-400">There are no other classrooms available for you to join at this time.</p>
                    )}
                    {!loadingAvailable && availableClassrooms.length > 0 && (
                        <ul className="space-y-4">
                            {availableClassrooms.map((classroom) => (
                                <li key={classroom._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-medium text-indigo-600 dark:text-indigo-400 mb-1">{classroom.name}</h3>
                                        {classroom.description && <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">{classroom.description}</p>}
                                        {classroom.teacher && <p className="text-sm text-gray-500 dark:text-gray-400">Taught by: {classroom.teacher.name}</p>}
                                        {/* Display Join Code for debugging if needed, but usually hide from student */}
                                        {/* <p className="text-xs text-gray-400">Code: {classroom.joinCode}</p> */} 
                                    </div>
                                    <button 
                                        onClick={() => handleJoinClassroom(classroom.joinCode, classroom._id)}
                                        disabled={isJoining && joiningClassroomId === classroom._id}
                                        className={`btn-primary text-sm py-1 px-3 ${isJoining && joiningClassroomId === classroom._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {isJoining && joiningClassroomId === classroom._id ? 'Joining...' : 'Join'}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

// Basic input style for consistency (optional, adjust as needed)
const InputStyle = () => (
  <style>{`
    .input-style {
      padding: 0.5rem 0.75rem;
      border: 1px solid #D1D5DB; /* gray-300 */
      border-radius: 0.375rem; /* rounded-md */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
      background-color: white;
      color: #111827; /* gray-900 */
    }
    .input-style:focus {
      outline: none;
      border-color: #4F46E5; /* indigo-500 */
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3); /* focus:ring-indigo-500/30 */
    }
    .dark .input-style {
      background-color: #374151; /* dark:bg-gray-700 */
      border-color: #4B5563; /* dark:border-gray-600 */
      color: #F9FAFB; /* dark:text-white */
    }
    /* Basic Button Styles (adapt to your project's design system) */
    .btn-primary {
        padding: 0.5rem 1rem;
        background-color: #4F46E5; /* bg-indigo-600 */
        color: white;
        border-radius: 0.375rem; /* rounded-md */
        font-weight: 500; /* font-medium */
        transition: background-color 0.15s ease-in-out;
    }
    .btn-primary:hover {
        background-color: #4338CA; /* hover:bg-indigo-700 */
    }
    .btn-secondary {
        padding: 0.5rem 1rem;
        background-color: #E5E7EB; /* bg-gray-200 */
        color: #1F2937; /* text-gray-800 */
        border-radius: 0.375rem; /* rounded-md */
        font-weight: 500; /* font-medium */
        transition: background-color 0.15s ease-in-out;
    }
    .btn-secondary:hover {
        background-color: #D1D5DB; /* hover:bg-gray-300 */
    }
     .dark .btn-secondary {
        background-color: #4B5563; /* dark:bg-gray-600 */
        color: #F9FAFB; /* dark:text-gray-100 */
    }
    .dark .btn-secondary:hover {
        background-color: #525f73; /* dark:hover:bg-gray-500 */
    }
  `}</style>
);

// Inject styles (optional, consider moving to CSS file)
function MyClassroomsWrapper() {
    return (
        <>
            <InputStyle /> 
            <MyClassrooms />
        </>
    );
}

// export default MyClassroomsWrapper; // Use this if you include the styles
export default MyClassrooms; // Use this if styles are handled globally or in CSS

