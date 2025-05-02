import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios'; // Import axios

function Profile() {
  const { isAuthenticated, setUser } = useContext(Context);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors
      try {
        const res = await axios.get(`${backend_api}/api/users/profile`, {
          withCredentials: true,
        });
        setProfile(res.data.user);
        setFormData(res.data.user);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setProfile(null); // Ensure profile is null on error
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    } else {
      setLoading(false); // Not authenticated, stop loading
      setError('Please log in to view your profile.');
    }
  }, [isAuthenticated, backend_api, setUser]); // Added setUser to dependencies as it's used indirectly

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
    }
  };

  const handleSave = async () => {
    setMessage(''); // Clear previous messages
    setError('');   // Clear previous errors
    try {
      const formPayload = new FormData();
      let changesMade = false; // Flag to track if any changes are being sent

      // Append changed form data fields
      Object.entries(formData).forEach(([key, val]) => {
        if (profile && val !== profile[key] && val !== undefined && val !== null) {
          formPayload.append(key, val);
          changesMade = true;
        }
      });

      // Append image if selected
      if (imageFile) {
        formPayload.append('profileImage', imageFile);
        changesMade = true;
      }

      // Check if there's anything to update
      if (!changesMade) {
        setMessage('No changes to save.');
        setEditMode(false);
        setPreviewImage(null); // Reset preview if no changes saved
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
      setUser(res.data.user); // Update context user
      setProfile(res.data.user); // Update local profile state
      setFormData(res.data.user); // Reset form data to saved data
      setPreviewImage(null);
      setImageFile(null);
      setEditMode(false);

    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // --- Rendering Logic ---

  if (loading) {
    return <p className="text-center text-gray-700 dark:text-gray-300 p-10">Loading profile...</p>;
  }

  if (!isAuthenticated) {
     // Error state likely already set in useEffect, but double-check
    return <p className="text-center text-red-600 p-10">{error || 'Please log in to view your profile.'}</p>;
  }

  if (error && !profile) {
     // Show error if loading finished but profile is still null
     return <p className="text-center text-red-500 p-10">{error}</p>;
  }

  if (!profile) {
      // Should ideally not be reached if loading/error handled, but as a fallback
      return <p className="text-center text-gray-700 dark:text-gray-300 p-10">Profile data is unavailable.</p>;
  }


  // Define role-specific fields after profile is loaded
  const roleFields = {
    Student: ['firstName', 'lastName', 'university', 'department'],
    Teacher: ['firstName', 'lastName', 'university', 'department', 'designation'],
    Admin: ['fullName'], // Assuming Admin might have 'fullName' - adjust if needed
  };
  const fieldsToShow = roleFields[profile.role] || []; // Get fields based on role

  return (
    <div className="container mx-auto p-6 md:p-10 bg-mint-cream dark:bg-gray-900 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-teal-800 dark:text-mint-cream">User Profile</h1>

      {/* Display messages/errors above profile details */}
      {message && !error && <p className="text-green-600 mb-4 text-center">{message}</p>}
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {/* Ensure profileImageUrl exists before using it */}
          <img
            src={previewImage || profile.profileImageUrl || '/path/to/default/avatar.png'} // Added fallback default image
            alt="Profile"
            className="w-36 h-36 rounded-full object-cover border-4 border-teal-500 shadow-lg"
            onError={(e) => { e.target.onerror = null; e.target.src='/path/to/default/avatar.png'; }} // Handle broken image links
          />
          {editMode && (
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

        {imageFile && editMode && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">New image selected: {imageFile.name}</p>
        )}

        {/* Profile Details Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4 text-gray-800 dark:text-gray-200">
          <div className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
            <strong>Username:</strong> {profile.username || 'N/A'}
          </div>
          <div className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
            <strong>Email:</strong> {profile.email || 'N/A'}
          </div>
          <div className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
            <strong>Role:</strong> {profile.role || 'N/A'}
          </div>
          <div className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
            <strong>Phone:</strong> {profile.phoneNumber || 'N/A'}
          </div>

          {fieldsToShow.map((field) => (
            <div key={field} className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
              {/* Ensure profile[field] exists before accessing */}
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {profile[field] || 'N/A'}
            </div>
          ))}
        </div>

        {/* Edit Mode Form */}
        {editMode && (
          <div className="w-full max-w-lg mt-6 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-800 dark:text-mint-cream">Edit Profile</h2>

            {fieldsToShow.map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 capitalize mb-1">{field.replace(/([A-Z])/g, ' $1')}</label> {/* Add space before caps */}
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
                type="text" // Consider type="tel" for better mobile UX
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                placeholder="Enter phone number" // Add placeholder
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
                  setFormData(profile); // Reset form data to original profile data
                  setPreviewImage(null);
                  setImageFile(null);
                  setError(''); // Clear error on cancel
                  setMessage(''); // Clear message on cancel
                }}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Edit Button */}
        {!editMode && !loading && profile && ( // Only show Edit if not loading and profile exists
          <button
            onClick={() => {
              setFormData(profile); // Ensure form starts with current profile data
              setEditMode(true);
              setMessage(''); // Clear message when entering edit mode
              setError(''); // Clear error when entering edit mode
            }}
            className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;