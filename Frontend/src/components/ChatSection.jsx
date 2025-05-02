import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../main';
import { backend_api } from '../config';

const ChatSection = ({ classroomId }) => {
  const { isAuthenticated } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch messages (Placeholder/Actual)
  useEffect(() => {
    if (!classroomId || !isAuthenticated) return;
    // TODO: Implement actual message fetching using token from context/cookie
    console.log(`Chat: Fetching messages for classroom ${classroomId}`);
    setMessages([
      { id: 1, user: 'Alice', text: 'Hello everyone!' },
      { id: 2, user: 'Bob', text: 'Hi Alice!' }
    ]);
  }, [classroomId, isAuthenticated]);

  // Send message (Placeholder/Actual)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated) return;
    console.log(`Chat: Sending message to classroom ${classroomId}: ${newMessage}`);
    // TODO: Implement actual message sending using token
    // Optimistic update:
    setMessages([...messages, { id: Date.now(), user: 'You', text: newMessage }]);
    setNewMessage('');
  };

  if (!isAuthenticated) {
    return <div className="border rounded p-4 mt-4 text-yellow-600">Log in to use the chat.</div>;
  }

  return (
    <div className="border rounded p-4 mt-4 h-96 flex flex-col">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div className="flex-grow overflow-y-auto mb-2 border-b pb-2">
        {/* Message display logic */}
        {messages.length > 0 ? (
            messages.map(msg => (
              <p key={msg.id}><strong>{msg.user}:</strong> {msg.text}</p>
            ))
          ) : (
            <p className="text-gray-500 italic">No messages yet.</p>
          )}
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow border rounded-l px-2 py-1 input-style" // Added input-style potentially
          disabled={!isAuthenticated} // Disable if not logged in
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-1 rounded-r hover:bg-blue-600 disabled:opacity-50" disabled={!isAuthenticated || !newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatSection;