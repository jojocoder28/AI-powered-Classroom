import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios';

function Profile() {
  const { userId } = useParams();
  const { isAuthenticated, user, loading: authLoading, setUser } = useContext(Context);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isMyProfile = isAuthenticated && user && profile && user._id === profile._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      setMessage('');
      setEditMode(false);
      setPreviewImage(null);
      setImageFile(null);
      setFormData({});
      setProfile(null);

      try {
        let url;
        if (userId) {
          url = `${backend_api}/api/users/${userId}`;
        } else if (isAuthenticated) {
          url = `${backend_api}/api/users/profile`;
        } else {
          setLoading(false);
          setError('Please log in to view your profile.');
          return;
        }

        const res = await axios.get(url, {
          withCredentials: true,
        });

        setProfile(res.data.user);
        setFormData(res.data.user);

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        fetchProfile();
    }

  }, [isAuthenticated, authLoading, backend_api, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
        setPreviewImage(null);
        setImageFile(null);
    }
  };

  const handleSave = async () => {
    setMessage('');
    setError('');
    if (!isMyProfile) return;

    try {
      const formPayload = new FormData();
      let changesMade = false;

      if (profile) {
          Object.entries(formData).forEach(([key, val]) => {
            if (val !== profile[key] && val !== undefined && val !== null) {
              formPayload.append(key, val);
              changesMade = true;
            }
          });
      }

      if (imageFile) {
        formPayload.append('profileImage', imageFile);
        changesMade = true;
      }

      if (!changesMade) {
        setMessage('No changes to save.');
        setEditMode(false);
        setPreviewImage(null);
        setImageFile(null);
        return;
      }

      const res = await axios.put(`${backend_api}/api/users/profile`, formPayload, {
        headers: {
          // Content-Type is set automatically for FormData by axios
        },
        withCredentials: true,
      });

      setMessage('Profile updated successfully!');
      setUser(res.data.user);
      setProfile(res.data.user);
      setFormData(res.data.user);
      setPreviewImage(null);
      setImageFile(null);
      setEditMode(false);

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // --- Rendering Logic ---

   if (authLoading || loading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200">
            <p className="text-xl font-medium animate-pulse">Loading profile...</p>
        </div>
    );
  }

  if (!isAuthenticated && !userId) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-gray-200 p-10">
              <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
                  <p className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">Please log in to view your profile.</p>
                  <Link to="/login" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-indigo-700 transition duration-200">Go to Login</Link>
              </div>
          </div>
      );
  }

  if (error && !profile) {
     return (
        <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-red-500 p-10">
            <p className="text-xl">{error}</p>
        </div>
     );
  }

  if (!profile) {
      return (
          <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-700 dark:text-gray-300 p-10">
              <p className="text-xl">Profile data is unavailable.</p>
          </div>
      );
  }

  const roleFields = {
    Student: ['university', 'department'], // Simplified for display as in image
    Teacher: ['university', 'department', 'designation'],
    Admin: [], // Admins might not have these fields
  };
  const fieldsToShow = roleFields[profile.role] || [];

  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-10 px-4 sm:px-6 lg:px-8 text-gray-800 dark:text-gray-200">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-700 dark:to-blue-700">{/* Background color/image placeholder */}</div>

        <div className="p-6 sm:p-8 md:p-10 -mt-20 flex flex-col items-center">

          {/* Profile Image */}
          <div className="relative">
            <img
              src={previewImage || profile.profileImageUrl || 'https://via.placeholder.com/150'} // Placeholder image
              alt="Profile Avatar"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/150'; }} // Error fallback
            />
             {/* Camera Icon for Image Upload in Edit Mode */}
            {editMode && isMyProfile && (
               <div className="absolute bottom-0 right-0 bg-blue-500 dark:bg-blue-600 rounded-full p-2 cursor-pointer shadow-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300" onClick={() => document.getElementById('profile-image-input')?.click()}>
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A1 1 0 0011.381 3H8.618a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                   </svg>
               </div>
            )}
            {/* Hidden file input */}
             <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
          </div>

          {/* Name and Basic Info */}
          <div className="text-center mt-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">{profile.firstName} {profile.lastName} {profile.age && `, ${profile.age}`}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.location || 'Location N/A'}</p>
          </div>

          {/* Stats Section (Placeholder/Example) */}
          <div className="flex justify-center space-x-8 mt-6 py-4 border-y border-gray-200 dark:border-gray-700 w-full max-w-xs">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">N/A</p> {/* Replace with actual data like friends count */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Friends</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">N/A</p> {/* Replace with actual data like photos count */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Photos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800 dark:text-gray-200">N/A</p> {/* Replace with actual data like comments count */}
              <p className="text-sm text-gray-600 dark:text-gray-400">Comments</p>
            </div>
          </div>

          {/* Professional/Educational Details */}
           <div className="text-center mt-6 space-y-2">
              {profile.role === 'Teacher' && profile.designation && (
                   <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">{profile.designation}</p>
              )}
              {profile.university && (
                  <p className="text-md text-gray-600 dark:text-gray-400">{profile.university}</p>
              )}
               {profile.department && (
                  <p className="text-md text-gray-600 dark:text-gray-400">{profile.department}</p>
              )}
           </div>

          {/* Bio/Description Section */}
           {profile.bio && (
               <div className="mt-6 text-center max-w-2xl">
                   <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{profile.bio}</p>
               </div>
           )}

          {/* Messages/Errors */}
           {message && !error && <p className="text-green-600 dark:text-green-400 mt-4 text-center text-sm">{message}</p>}
           {error && <p className="text-red-500 dark:text-red-400 mt-4 text-center text-sm">{error}</p>}

          {/* Action Buttons (Edit/Connect/Message) */}
          <div className="mt-6 flex space-x-4">
              {/* Edit Button - Only show if it IS my profile AND NOT in edit mode */}
              {!editMode && isMyProfile && (
                  <button
                      onClick={() => {
                        setFormData(profile);
                        setEditMode(true);
                        setMessage('');
                        setError('');
                      }}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 font-medium"
                  >
                      Edit Profile
                  </button>
              )}
               {/* Connect/Message Buttons (Placeholders) - Show if viewing another profile */}
              {!isMyProfile && (
                   <>
                       <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>{/* Implement Connect Logic */}
                           Connect
                       </button>
                       <button className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 transition duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>{/* Implement Message Logic */}
                           Message
                       </button>
                   </>
              )}
          </div>

           {/* Edit Mode Form */}
           {editMode && isMyProfile && (
               <div className="w-full max-w-lg mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-inner space-y-4">
                   <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 border-b pb-3 border-gray-200 dark:border-gray-600">Edit Information</h3>
                    {/* Editable fields based on role */}
                   {[ 'firstName', 'lastName', 'phoneNumber', 'university', 'department', ...(profile.role === 'Teacher' ? ['designation'] : []), 'bio', 'location'].map((field) => (
                       <div key={field}>
                           <label htmlFor={field} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1').replace('phone number', 'Phone Number')}</label>
                           {field === 'bio' ? (
                               <textarea
                                   id={field}
                                   name={field}
                                   value={formData[field] || ''}
                                   onChange={handleChange}
                                   rows="4"
                                   className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                                   placeholder={`Enter your ${field}`}
                               />
                           ) : (
                               <input
                                   type={field === 'phoneNumber' ? 'tel' : 'text'}
                                   id={field}
                                   name={field}
                                   value={formData[field] || ''}
                                   onChange={handleChange}
                                   className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
                                    placeholder={`Enter your ${field}`}
                               />
                           )}
                       </div>
                   ))}

                   <div className="flex justify-end space-x-4 mt-6">
                       <button
                           onClick={handleSave}
                           className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 font-medium"
                       >
                           Save Changes
                       </button>
                       <button
                           onClick={() => {
                               setEditMode(false);
                               setFormData(profile);
                               setPreviewImage(null);
                               setImageFile(null);
                               setError('');
                               setMessage('');
                           }}
                           className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 font-medium"
                       >
                           Cancel
                       </button>
                   </div>
               </div>
           )}

        </div>
      </div>
    </div>
  );
}

export default Profile;