import React from 'react';
import { Link } from 'react-router-dom';

const ClassroomListPanel = ({
  classrooms,
  isLoading,
  error,
  selectedClassroom,
  setSelectedClassroom,
  handleCreateClassroom,
  handleJoinClassroom,
  isAuthenticated,
  user
}) => {
  return (
    <div className="h-full p-6 bg-white dark:bg-gray-800 text-gray-200 shadow-lg rounded-lg flex flex-col">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-700">Classrooms</h2>

      {/* Action Buttons - Only show if authenticated */}
      {isAuthenticated && (
        <div className="mb-6 flex space-x-4">
          {
            user?.role === 'Teacher' ?(
              <button
                onClick={handleCreateClassroom}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Classroom
              </button>
            ):(
              <button
                onClick={handleJoinClassroom}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Classroom
              </button>
            )
          }
        </div>
      )}

      {/* Classroom List */}
      <div className="flex-grow overflow-y-auto space-y-3 pr-2">
        {isLoading && <p className="text-center text-gray-600 dark:text-gray-300 text-lg">Loading classrooms...</p>}
        {error && <p className="text-center text-red-500 text-lg">Error: {error}</p>}
        {!isLoading && !error && classrooms.length > 0 ? (
          <ul className="space-y-3">
            {classrooms.map(room => (
              <li
                key={room._id}
                onClick={() => setSelectedClassroom(room)}
                className={`p-4 rounded-md cursor-pointer transition duration-200 border border-gray-200 dark:border-gray-700 ${selectedClassroom?._id === room._id ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-300 dark:border-blue-700 shadow-sm' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
              >
                <span className={`block font-semibold mb-1 ${selectedClassroom?._id === room._id ? 'text-blue-800 dark:text-blue-100' : 'text-gray-800 dark:text-gray-200'}`}>{room.name}</span>
                {room.description && <p className={`text-xs ${selectedClassroom?._id === room._id ? 'text-blue-700 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>{room.description}</p>}
              </li>
            ))}
          </ul>
        ) : (
          !isLoading && !error && isAuthenticated && (
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg italic">
              {user?.role === 'Teacher' ? "You haven't created any classrooms yet." : "You haven't joined any classrooms yet."}
            </p>
          )
        )}
         {!isLoading && !error && !isAuthenticated && (
             <p className="text-center text-gray-600 dark:text-gray-300 text-lg italic">Please log in to see your classrooms.</p>
         )}
      </div>
    </div>
  );
};

export default ClassroomListPanel;
