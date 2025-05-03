import React from 'react';
// Removed imports for components that are now sections in Classroom.jsx

const ClassroomDetailsPanel = ({
  selectedClassroom,
}) => { 
  return (
    <div className="p-6 lg:p-8 rounded-xl bg-white dark:bg-gray-800 text-gray-200 shadow-lg">
      {selectedClassroom ? (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold border-b pb-4 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">{selectedClassroom.name} Details</h3>
          
          {/* Description */}
          <div>
            <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Description:</p>
            <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{selectedClassroom.description || 'No description provided.'}</p>
          </div>

          {/* Placeholder for other details like Join Code (handle visibility based on user role) */}
          {/* Example (Teacher only): */}
          {/* {user?.role === 'Teacher' && ( */}
          {/*   <div> */}
          {/*     <p className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Join Code:</p> */}
          {/*     <p className="text-gray-600 dark:text-gray-200">{selectedClassroom.joinCode}</p> */}
          {/*   </div> */}
          {/* )} */}

          {/* You would include other specific classroom details here */}
          {/* E.g., Teacher Name, Creation Date, etc. */}

        </div>
      ) : (
        <div className="flex items-center justify-center h-full min-h-[150px]">
           <p className="text-gray-600 dark:text-gray-300 text-xl font-semibold text-center">Select a classroom from the list to view details here.</p>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetailsPanel;
