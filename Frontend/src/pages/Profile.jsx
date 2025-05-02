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

        console.log(`Fetching profile from: ${url}`);

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

   if (authLoading || loading) {
    return <p className="text-center text-gray-700 dark:text-gray-300 p-10">Loading profile...</p>;
  }

  if (!isAuthenticated && !userId) {
      return (
          <div className="p-4 text-center">
              <p className="mb-4">Please log in to view your profile.</p>
              <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
      );
  }

  if (error && !profile) {
     return <p className="text-center text-red-500 p-10">{error}</p>;
  }

  if (!profile) {
      return <p className="text-center text-gray-700 dark:text-gray-300 p-10">Profile data is unavailable.</p>;
  }

  const roleFields = {
    Student: ['firstName', 'lastName', 'university', 'department'],
    Teacher: ['firstName', 'lastName', 'university', 'department', 'designation'],
    Admin: ['fullName'],
  };
  const fieldsToShow = roleFields[profile.role] || [];

  return (
    <div className="container mx-auto p-6 md:p-10 bg-mint-cream dark:bg-gray-900 rounded-xl shadow-lg min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-teal-800 dark:text-mint-cream text-center">{isMyProfile ? 'My Profile' : `${profile.username}'s Profile`}</h1>

      {message && !error && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      {/* Profile Card */}
      <div className="max-w-sm mx-auto bg-gray-800 dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl my-8">
        <div className="md:flex">
          <div className="md:flex-shrink-0 p-4 flex items-center justify-center">
            <div className="relative w-36 h-36">
              <img
                src={previewImage || profile.profileImageUrl || '/path/to/default/avatar.png'}
                alt="Profile"
                className="h-full w-full object-cover rounded-full border-4 border-teal-500"
                onError={(e) => { e.target.onerror = null; e.target.src='/path/to/default/avatar.png'; }}
              />
               {editMode && isMyProfile && (
                 <div className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 cursor-pointer shadow-md hover:bg-teal-600 transition duration-300" onClick={() => document.getElementById('profile-image-input')?.click()}>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A1 1 0 0011.381 3H8.618a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                     </svg>
                 </div>
              )}
               <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
            </div>
          </div>
          <div className="p-8 flex-grow">
            <div className="uppercase tracking-wide text-sm text-teal-400 dark:text-teal-400 font-semibold">{profile.role || 'User'}</div>
            <h2 className="block mt-1 text-2xl leading-tight font-medium text-mint-cream dark:text-mint-cream">{profile.username || 'N/A'}</h2>
            {profile.role === 'Teacher' && profile.designation && (
                 <p className="mt-2 text-gray-400 dark:text-gray-400">{profile.designation}</p>
             )}

            {/* Stats/Details Section */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 dark:text-gray-300">
              <div className="flex flex-col">
                <span className="font-semibold text-teal-400 dark:text-teal-400">Email:</span>
                <span>{profile.email || 'N/A'}</span>
              </div>
               {isMyProfile && profile.phoneNumber && (
                 <div className="flex flex-col">
                    <span className="font-semibold text-teal-400 dark:text-teal-400">Phone:</span>
                    <span>{profile.phoneNumber || 'N/A'}</span>
                 </div>
              )}
              {profile.university && (
                 <div className="flex flex-col">
                    <span className="font-semibold text-teal-400 dark:text-teal-400">University:</span>
                    <span>{profile.university || 'N/A'}</span>
                 </div>
              )}
              {profile.department && (
                 <div className="flex flex-col">
                    <span className="font-semibold text-teal-400 dark:text-teal-400">Department:</span>
                    <span>{profile.department || 'N/A'}</span>
                 </div>
              )}
            </div>

             {/* Buttons Section */}
            <div className="mt-8 flex space-x-4">
                {!isMyProfile && (
                    <button
                        onClick={() => { /* Handle Chat Action */ console.log('Chat button clicked'); /* Add chat logic here */ }}
                        className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                        CHAT
                    </button>
                )}
                 {/* Edit Button - Only show if NOT in edit mode AND it IS my profile AND not loading */}
                {!editMode && !loading && profile && isMyProfile && (
                  <button
                    onClick={() => {
                      setFormData(profile);
                      setEditMode(true);
                      setMessage('');
                      setError('');
                    }}
                    className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
                  >
                    Edit Profile
                  </button>
                )}
            </div>

             {!isMyProfile && profile && (
                 <p className="mt-4 text-gray-400 dark:text-gray-400">You are viewing {profile.username}'s profile.</p>
             )}
          </div>
        </div>
      </div>

      {/* Edit Mode Form - Only show if in edit mode AND it's my profile */}
      {editMode && isMyProfile && (
        <div className="w-full max-w-lg mx-auto mt-6 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-teal-800 dark:text-mint-cream">Edit Profile</h2>

          {fieldsToShow.map((field) => (
            <div key={field} className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 capitalize mb-1">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                type="text"
                name={field}
                value={formData[field] || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-mint-cream dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900 dark:text-gray-100"
              />
            </div>
          ))}

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300">Phone Number</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full px-4 py-2 rounded-md bg-mint-cream dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex space-x-4 justify-end mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
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
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;