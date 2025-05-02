import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

const VideoPage = (ref) => {
  const roomId = ref.roomId;
  const containerRef = useRef(null);
  const roomID = roomId;

  useEffect(() => {
    const appID = 1097934302;
    const serverSecret = "be54dd9f65284705e25a9f2907b977ec";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      Date.now().toString(),
      "Tanisha"
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zp.joinRoom({
      container: containerRef.current,
      sharedLinks: [
        {
          name: 'Copy link',
          url:
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname +
            '?roomID=' +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });

    // After some time, start frame capturing
    const captureInterval = setInterval(() => {
      const video = containerRef.current?.querySelector('video');
      if (video && video.readyState >= 2) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append('frame', blob);

            fetch('http://localhost:5000/detect', {
              method: 'POST',
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => {
                console.log('Detections:', data.detections);
                if (data.detections && data.detections.length > 0) {
                  console.log('Top class:', data.detections[0].class_name);
                }
              })
              .catch((err) => {
                console.error('Detection error:', err);
              });
          }
        }, 'image/jpeg');
      }
    }, 2000); // every 2 seconds

    return () => clearInterval(captureInterval);
  }, [roomID]);

  return <div ref={containerRef} style={{ zIndex:100, width: '100%', height: '100vh' }} />;
};

export default VideoPage;