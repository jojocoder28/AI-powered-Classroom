import React, { useContext } from 'react';
import { Context } from '../main';

const VideoCallSection = ({ classroom }) => {
    const { isAuthenticated } = useContext(Context);
    // TODO: Fetch actual video link from classroom details if secured
    const videoLink = classroom?.videoLink || '#'; // Placeholder

    if (!isAuthenticated) {
       return <div className="border rounded p-4 my-4 text-yellow-600">Log in to access video call links.</div>;
    }

    return (
      <div className="border rounded p-4 my-4">
        <h3 className="text-lg font-semibold mb-2">Video Call</h3>
        {videoLink && videoLink !== '#' ? (
          <a
            href={videoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Join Video Call
          </a>
        ) : (
           <p className="text-gray-500 italic">Video call link not available or not configured for this class.</p>
        )}
      </div>
    );
};

export default VideoCallSection;