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
    }, [isAuthenticated, backend_api]);

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
    }, [fetchMyClassrooms, fetchAvailableClassrooms, user?.role]); // Added dependencies

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
        } catch (err) {
            console.error("Error creating classroom:", err);
            setCreateError(err.response?.data?.message || "Failed to create classroom.");
        } finally {
            setIsCreating(false);
            setTimeout(() => setCreateMessage(null), 3000);
        }
    };

    // Handler for joining a classroom (Students)
    const handleJoinClassroom = async (joinCode, classroomId) => {
        setJoiningClassroomId(classroomId); 
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
            setJoiningClassroomId(null); 
            setTimeout(() => {
                setJoinMessage(null);
                setJoinError(null);
            }, 3000);
        }
    };

    // --- Render Logic ---
    if (!isAuthenticated) {
        return <p className="text-center text-red-500 p-6 text-lg">Please log in to view classrooms.</p>; 
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Teacher: Classroom Creation Form */}
            {user?.role === 'Teacher' && (
                <div className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">Create New Classroom</h3>
                    <form onSubmit={handleCreateClassroom} className="space-y-5">
                        {/* Name Input */}
                        <div>
                            <label htmlFor="newClassName" className="block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2">Classroom Name</label>
                            <input type="text" id="newClassName" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} placeholder="e.g., Advanced React" required className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                        </div>
                        {/* Description Input */}
                        <div>
                            <label htmlFor="newClassDesc" className="block text-sm font-medium text-gray-200 dark:text-gray-300 mb-2">Description (Optional)</label>
                            <textarea id="newClassDesc" value={newClassDesc} onChange={(e) => setNewClassDesc(e.target.value)} placeholder="Describe the classroom" rows="4" className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400" />
                        </div>
                        {/* Messages/Errors */}
                        {createMessage && <p className="text-green-600 text-sm mt-2">{createMessage}</p>}
                        {createError && <p className="text-red-500 text-sm mt-2">{createError}</p>}
                        {/* Submit Button */}
                        <button type="submit" disabled={isCreating} className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isCreating ? 'Creating...' : 'Create Classroom'}
                        </button>
                    </form>
                </div>
            )}

            {/* User's Enrolled/Taught Classrooms Section */}
            <div className="mb-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">My Classrooms</h2>
                {loadingMyClassrooms && <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Loading your classrooms...</p>}
                {!loadingMyClassrooms && errorMyClassrooms && <p className="text-center text-red-500 text-lg">Error: {errorMyClassrooms}</p>}
                {!loadingMyClassrooms && !errorMyClassrooms && myClassrooms.length === 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                        {user?.role === 'Teacher' ? "You haven't created or joined any classrooms yet." : "You are not enrolled in any classrooms yet."}
                    </p>
                )}
                {!loadingMyClassrooms && myClassrooms.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myClassrooms.map((classroom) => (
                            <li key={classroom._id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{classroom.name}</h3>
                                    {classroom.description && <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">{classroom.description}</p>}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Role: <span className={`font-medium ${classroom.teacher?._id === user?._id ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {classroom.teacher?._id === user?._id ? 'Teacher' : 'Student'}
                                        </span>
                                    </p>
                                </div>
                                <Link to={`/classroom/${classroom._id}`} className="inline-block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    View Classroom
                                </Link> 
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Student: Available Classrooms to Join Section */}
            {user?.role === 'Student' && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b pb-3 border-gray-200 dark:border-gray-700">Available Classrooms to Join</h2>
                    {/* Join Action Messages/Errors */} 
                    {joinMessage && <p className="text-green-600 mb-4 text-sm text-center">{joinMessage}</p>}
                    {joinError && <p className="text-red-500 mb-4 text-sm text-center">{joinError}</p>}

                    {loadingAvailable && <p className="text-center text-gray-600 dark:text-gray-400 text-lg">Loading available classrooms...</p>}
                    {!loadingAvailable && errorAvailable && <p className="text-center text-red-500 text-lg">Error: {errorAvailable}</p>}
                    {!loadingAvailable && !errorAvailable && availableClassrooms.length === 0 && (
                        <p className="text-center text-gray-600 dark:text-gray-400 text-lg">There are no other classrooms available for you to join at this time.</p>
                    )}
                    {!loadingAvailable && availableClassrooms.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {availableClassrooms.map((classroom) => (
                                <li key={classroom._id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">{classroom.name}</h3>
                                        {classroom.description && <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">{classroom.description}</p>}
                                        {classroom.teacher && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Taught by: {classroom.teacher.name}</p>}
                                    </div>
                                    <button 
                                        onClick={() => handleJoinClassroom(classroom.joinCode, classroom._id)}
                                        disabled={isJoining && joiningClassroomId === classroom._id}
                                        className={`inline-block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isJoining && joiningClassroomId === classroom._id ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

// Note: Removed the InputStyle component as direct Tailwind classes are used.
// The export default MyClassroomsWrapper is also removed.

export default MyClassrooms; 
