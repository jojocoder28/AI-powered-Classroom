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
    <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 flex flex-col bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Classrooms</h2>

      {/* Action Buttons - Only show if authenticated */}
      {isAuthenticated && (
        <div className="mb-4 flex space-x-2">
          <button
            onClick={handleCreateClassroom}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-sm disabled:opacity-50"
            // Disable if not a teacher (adjust role check as needed)
            disabled={user?.role !== 'Teacher'}
            title={user?.role !== 'Teacher' ? "Only teachers can create classrooms" : ""}
          >
            Create New
          </button>
          <button
            onClick={handleJoinClassroom}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 text-sm disabled:opacity-50"
            // Disable if not a student (adjust role check as needed)
            disabled={user?.role !== 'Student'}
            title={user?.role !== 'Student' ? "Only students can join classrooms" : ""}
          >
            Join Existing
          </button>
        </div>
      )}

      {/* Classroom List */}
      <div className="flex-grow overflow-y-auto border-t border-gray-200 dark:border-gray-700 pt-2">
        {isLoading && <p>Loading list...</p>}
        {error && <p className="text-red-600">Error: {error}</p>}
        {!isLoading && !error && classrooms.length > 0 ? (
          <ul className="space-y-1">
            {classrooms.map(room => (
              <li
                key={room._id} // Use unique _id from MongoDB
                onClick={() => setSelectedClassroom(room)}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedClassroom?._id === room._id ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="block font-medium">{room.name}</span>
                {room.description && <p className="text-xs text-gray-600 dark:text-gray-400">{room.description}</p>}
              </li>
            ))
            }
          </ul>
        ) : (
          !isLoading && !error && <p className="text-gray-500 dark:text-gray-400 italic">No classrooms found. Create or join one!</p>
        )}
      </div>
    </div>
  );
};

export default ClassroomListPanel;