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
        const response = await axios.get(`${backend_api}/api/classrooms/${roomId}`, {
          withCredentials: true,
        });

        if (response.data?.success) {
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

  const handleCreateClassroom = () => {
    const newName = roomId;
    if (newName && isAuthenticated) {
      const newClassroom = { _id: roomId, name: newName, description: 'Newly created (Simulated)' };
      setClassrooms([...classrooms, newClassroom]);
      setSelectedClassroom(newClassroom);
    } else if (!isAuthenticated) {
      alert("Please log in to create a classroom.");
    }
  };

  const handleJoinClassroom = () => {
    if (roomId && isAuthenticated) {
      const newClassroom = { _id: roomId, name: roomId, description: 'Joined class' };
      setSelectedClassroom(newClassroom);
      navigate(`/classroom/${roomId}`);
    } else if (!isAuthenticated) {
      alert("Please log in to join a classroom.");
    }
  };

  if (authLoading || (isLoading && !classrooms.length)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="p-10 text-center">
        <p className="mb-4 text-xl">Please log in to access your classrooms.</p>
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">Go to Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 px-6 py-6 space-y-6 overflow-x-hidden">
      {/* Header Section */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-indigo-700">Welcome to the Classroom</h1>
        <p className="text-md text-gray-500 mt-1">Manage your learning space effortlessly</p>
      </header>

      {/* Classroom List */}
      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Classrooms</h2>
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
      </section>

      {/* Classroom Details */}
      {selectedClassroom && (
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Classroom Details</h2>
          <ClassroomDetailsPanel selectedClassroom={selectedClassroom} />
        </section>
      )}

      {/* Participants */}
      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Participants</h2>
        <ParticipantsSection classroomId={roomId} />
      </section>

      {/* Placeholder for Video/Assignment
      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Live Sessions & Assignments</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-indigo-100 rounded-lg bg-indigo-50">
            <p className="text-indigo-700 font-medium">Video Call Feature Coming Soon</p>
          </div>
          <div className="p-4 border border-green-100 rounded-lg bg-green-50">
            <p className="text-green-700 font-medium">Assignment Upload Area</p>
          </div>
        </div>
      </section> */}
    </div>
  );
}

export default Classroom;
