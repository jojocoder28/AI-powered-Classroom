import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../main';
import { backend_api } from '../config';

function Profile() {
  const { isAuthenticated, setUser } = useContext(Context);
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${backend_api}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setProfile(data.user);
        setFormData(data.user);
      } catch (err) {
        setError(err.message);
      }
    };

    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated]);

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
    try {
      const token = localStorage.getItem('token');
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        if (val !== undefined) formPayload.append(key, val);
      });
      if (imageFile) {
        formPayload.append('profileImage', imageFile);
      }

      const res = await fetch(`${backend_api}/api/users/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formPayload,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');

      setMessage('Profile updated successfully!');
      setUser(data.user);
      setProfile(data.user);
      setPreviewImage(null);
      setImageFile(null);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-center text-red-600">Please log in to view your profile.</p>;
  }

  if (!profile) return <p className="text-center">Loading profile...</p>;

  const roleFields = {
    Student: ['firstName', 'lastName', 'university', 'department'],
    Teacher: ['firstName', 'lastName', 'university', 'department', 'designation'],
    Admin: ['fullName'],
  };

  return (
    <div className="container mx-auto p-6 md:p-10 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">User Profile</h1>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="flex flex-col items-center space-y-4">
        <img
          src={previewImage || profile.profileImageUrl}
          alt="Profile"
          className="w-32 h-32 rounded-full border-2 border-amber-400 shadow-md object-cover"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mt-4">
          <div className="neomorphic-inset px-4 py-3 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700">
            <strong>Username:</strong> {profile.username}
          </div>
          <div className="neomorphic-inset px-4 py-3 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700">
            <strong>Email:</strong> {profile.email}
          </div>
          <div className="neomorphic-inset px-4 py-3 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700">
            <strong>Role:</strong> {profile.role}
          </div>
          <div className="neomorphic-inset px-4 py-3 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700">
            <strong>Phone:</strong> {profile.phoneNumber}
          </div>

          {roleFields[profile.role]?.map((field) => (
            <div key={field} className="neomorphic-inset px-4 py-3 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700">
              <strong>{field.charAt(0).toUpperCase() + field.slice(1)}:</strong> {profile[field] || 'N/A'}
            </div>
          ))}
        </div>

        {editMode && (
          <div className="w-full max-w-lg mt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Edit Profile</h2>

            <div className="mb-4">
              <label className="block text-gray-600 dark:text-gray-300 mb-1">Update Profile Image</label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('profile-image-input')?.click()}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                >
                  Choose Photo
                </button>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imageFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {imageFile.name}
                  </span>
                )}
              </div>
            </div>

            {roleFields[profile.role]?.map((field) => (
              <div key={field} className="mb-4">
                <label className="block text-gray-600 dark:text-gray-300 capitalize mb-1">{field}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                />
              </div>
            ))}

            <div className="mb-4">
              <label className="block text-gray-600 dark:text-gray-300">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setPreviewImage(null);
                  setImageFile(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default Profile;
