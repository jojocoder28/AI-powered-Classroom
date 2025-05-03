import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import axios from 'axios';
import {backend_api} from '../config';

const VideoPage = (ref) => {
  const roomId = ref.roomId;
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
    const container = document.getElementById('zego-container');

    zp.joinRoom({
      container: container,
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

    const captureInterval = setInterval(() => {
      const video = container?.querySelector('video');
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

            axios.post('http://localhost:5000/detect', formData)
              .then((res) => {
                const data = res.data;
                if (data.detections && data.detections.length > 0) {
                  const detectedEmotion = data.detections[0].class_name;
                  const timestamp = new Date().toISOString();

                  console.log('Detected Emotion:', detectedEmotion);

                  axios.post(`${backend_api}/api/studentactivity/emotion`, {
                    emotion: detectedEmotion,
                    timestamp: timestamp,
                  }, {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                  })
                    .then((res) => {
                      console.log('Emotion saved to backend:', res.data);
                    })
                    .catch((err) => {
                      console.error('Error saving emotion:', err);
                    });
                }
              })
              .catch((err) => {
                console.error('Detection error:', err);
              });
          }
        }, 'image/jpeg');
      }
    }, 2000);

    return () => clearInterval(captureInterval);
  }, [roomID]);

  return <div id="zego-container" className='w-full h-full' />;
};

export default VideoPage;