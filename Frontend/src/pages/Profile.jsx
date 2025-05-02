import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios'; // Import axios

function Profile() {
  const { userId } = useParams(); // Get userId from URL
  const { isAuthenticated, user, loading: authLoading, setUser } = useContext(Context); // Get user and authLoading from context
  const navigate = useNavigate(); // Import useNavigate

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Determine if the profile being viewed is the logged-in user's profile
  const isMyProfile = isAuthenticated && user && profile && user._id === profile._id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true); // Start loading
      setError(''); // Clear previous errors
      setMessage(''); // Clear previous messages
      setEditMode(false); // Exit edit mode when fetching a new profile
      setPreviewImage(null); // Clear preview image
      setImageFile(null); // Clear image file
      setFormData({}); // Clear form data
      setProfile(null); // Clear previous profile data

      try {
        let url;
        // If userId is in the URL, fetch that user's profile
        if (userId) {
          url = `${backend_api}/api/users/${userId}`;
        } else if (isAuthenticated) {
          // If no userId and authenticated, fetch the logged-in user's profile
          url = `${backend_api}/api/users/profile`;
        } else {
          // If no userId and not authenticated, redirect to login (or show message)
          setLoading(false);
          setError('Please log in to view your profile.');
          // Optional: navigate('/login');
          return;
        }

        console.log(`Fetching profile from: ${url}`);

        const res = await axios.get(url, {
          withCredentials: true, // Keep this as it's needed for authentication status
        });

        setProfile(res.data.user);
        setFormData(res.data.user); // Initialize form data for potential editing (if it's their profile)

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || 'Failed to load profile');
        setProfile(null); // Ensure profile is null on error
      } finally {
        setLoading(false); // Stop loading regardless of success or error
      }
    };

    // Only fetch if not in authLoading state
    if (!authLoading) {
        fetchProfile();
    }

  }, [isAuthenticated, authLoading, backend_api, userId]); // Added userId and authLoading to dependencies

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
    setMessage(''); // Clear previous messages
    setError('');   // Clear previous errors
    if (!isMyProfile) return; // Prevent saving if not viewing own profile

    try {
      const formPayload = new FormData();
      let changesMade = false; // Flag to track if any changes are being sent

      // Append changed form data fields
      // Ensure profile exists before comparing
      if (profile) {
          Object.entries(formData).forEach(([key, val]) => {
            // Check if value is different and not null/undefined
            if (val !== profile[key] && val !== undefined && val !== null) {
              formPayload.append(key, val);
              changesMade = true;
            }
          });
      }

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

      // Note: This PUT request is only for the logged-in user's profile
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

  // Show main loading indicator while checking auth or fetching data
   if (authLoading || loading) {
    return <p className="text-center text-gray-700 dark:text-gray-300 p-10">Loading profile...</p>;
  }

  // Handle case where user is not logged in and trying to view their own profile path (without userId)
  if (!isAuthenticated && !userId) {
      return (
          <div className="p-4 text-center">
              <p className="mb-4">Please log in to view your profile.</p>
              <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
      );
  }

  // Handle error state if fetching failed
  if (error && !profile) {
     return <p className="text-center text-red-500 p-10">{error}</p>;
  }

   // Handle case where profile data is not available after loading (e.g., user not found)
  if (!profile) {
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
      <h1 className="text-3xl font-bold mb-6 text-teal-800 dark:text-mint-cream">{isMyProfile ? 'My Profile' : `${profile.username}'s Profile`}</h1> {/* Dynamic title */}

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
          {/* Show camera icon only if in edit mode AND it's my profile */}
          {editMode && isMyProfile && (
             <div className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 cursor-pointer shadow-md hover:bg-teal-600 transition duration-300" onClick={() => document.getElementById('profile-image-input')?.click()}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A1 1 0 0011.381 3H8.618a1 1 0 00-.707.293L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                 </svg>
             </div>
          )}
          {/* Input for image upload, only available if it's my profile */} {/* Hidden input regardless, controlled by icon click */}
           <input
              id="profile-image-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
        </div>

        {/* Show image file name only if selected and in edit mode AND it's my profile */}
        {imageFile && editMode && isMyProfile && (
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
          {/* Only show phone number if it's my profile or if it's publicly available (adjust based on backend privacy) */}
          {isMyProfile && profile.phoneNumber && (
             <div className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
                <strong>Phone:</strong> {profile.phoneNumber || 'N/A'}
             </div>
          )}

          {fieldsToShow.map((field) => (
            <div key={field} className="px-4 py-3 rounded-md bg-white dark:bg-gray-700 shadow-sm">
              {/* Ensure profile[field] exists before accessing */}
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {profile[field] || 'N/A'}
            </div>
          ))}
        </div>

        {/* Edit Mode Form - Only show if in edit mode AND it's my profile */}
        {editMode && isMyProfile && (
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

            {/* Phone Number Input - Only show if it's my profile */}
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
                  // Reset form data to currently displayed profile data (could be own or another's)
                  setFormData(profile);
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

        {/* Edit Button - Only show if NOT in edit mode AND it IS my profile AND not loading */}
        {!editMode && !loading && profile && isMyProfile && (
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

         {/* Message when viewing another user's profile */}
        {!isMyProfile && profile && (
             <p className="mt-4 text-gray-700 dark:text-gray-300">You are viewing {profile.username}'s profile.</p>
        )}
      </div>
    </div>
  );
}

export default Profile;