'use strict';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Context } from '../main'; // Adjust path if needed
import { backend_api } from '../config'; // Adjust path if needed

function MyClassrooms() {
    const { isAuthenticated, user } = useContext(Context);
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return; // Don't fetch if not logged in
        }

        const fetchClassrooms = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${backend_api}/api/classrooms/myclassrooms`, {
                    withCredentials: true, // Important to send the auth cookies
                });
                setClassrooms(response.data.data || []); // Ensure it's an array
            } catch (err) {
                console.error("Error fetching classrooms:", err);
                setError(err.response?.data?.message || "Failed to load classrooms. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchClassrooms();
    }, [isAuthenticated]); // Re-run if authentication status changes

    if (!isAuthenticated) {
        // Although Dashboard already checks, it's good practice here too
        return null; 
    }

    if (loading) {
        return <p className="text-gray-600 dark:text-gray-400">Loading your classrooms...</p>;
    }

    if (error) {
        return <p className="text-red-500">Error: {error}</p>;
    }

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">My Classrooms</h2>
            {classrooms.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                    {user?.role === 'Teacher' 
                        ? "You haven't created any classrooms yet." 
                        : "You are not enrolled in any classrooms yet."
                    }
                </p>
            ) : (
                <ul className="space-y-4">
                    {classrooms.map((classroom) => (
                        <li key={classroom._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 hover:shadow-md transition-shadow duration-200">
                            <h3 className="text-xl font-medium text-indigo-600 dark:text-indigo-400 mb-1">{classroom.name}</h3>
                            {classroom.description && (
                                <p className="text-gray-700 dark:text-gray-300 mb-2">{classroom.description}</p>
                            )}
                             <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                Role: {classroom.teacher._id === user?._id ? 'Teacher' : 'Student'}
                            </p>

                            <Link 
                                to={`/classroom/${classroom._id}`}
                                className="text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm"
                            >
                                View Classroom
                            </Link> 
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default MyClassrooms;
