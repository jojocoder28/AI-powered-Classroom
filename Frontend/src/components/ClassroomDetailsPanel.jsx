import React from 'react';
import ParticipantsSection from '../components/ParticipantsSection';
//import VideoCallSection from './VideoCallSection'; // Assuming these will be in the same components folder
import AssignmentsSection from './AssignmentsSection';
//import ChatSection from './ChatSection';
import VideoPage from './VideoPage';

const ClassroomDetailsPanel = ({
  selectedClassroom,
}) => { 
  return (
    <div className="p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      {selectedClassroom ? (
        <div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{selectedClassroom.name}</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">{selectedClassroom.description || 'No description provided.'}</p>

          {/* Sections that depend on the selected classroom ID */}
          {/* <ParticipantsSection classroomId={selectedClassroom._id} /> */}
          <VideoPage roomId={selectedClassroom._id} />
          <AssignmentsSection classroomId={selectedClassroom._id} />
          {/* Chat might be independent or tied to the classroom */}
          {/* <ChatSection classroomId={selectedClassroom._id} /> */}
          {/* <VideoCallSection classroom={selectedClassroom} /> */}

          {/* Add any other sections you want to include here */}

        </div>
      ) : (
        <div className="flex items-center justify-center h-full">

           <p className="text-gray-500 dark:text-gray-400 text-lg">Select a classroom from the list to view details.</p>
        </div>
      )}
    </div>
  );
};

export default ClassroomDetailsPanel;