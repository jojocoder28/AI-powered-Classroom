import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          image: null,
        });
        setImagePreview(response.data.profileImage);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        image: file,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditToggle = () => {
    setEditMode((prevMode) => !prevMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedFormData = new FormData();
    updatedFormData.append('name', formData.name);
    updatedFormData.append('email', formData.email);
    if (formData.image) {
      updatedFormData.append('image', formData.image);
    }

    try {
      const response = await axios.put('/api/user/profile', updatedFormData);
      setUser(response.data);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-mint-cream to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-16 px-4">
      <div className="container mx-auto">
        {!editMode ? (
          // View Mode Section
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-8 md:space-y-0 md:space-x-12">
            <div className="flex-shrink-0">
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover shadow-lg"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
                {user.name}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">{user.email}</p>
              <div className="mt-6">
                <button
                  onClick={handleEditToggle}
                  className="inline-block bg-teal-500 text-white px-6 py-2 rounded-full font-semibold shadow hover:bg-teal-600 transition"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Edit Mode Section */}
            <div className="w-full max-w-lg mx-auto bg-mint-cream dark:bg-gray-700 p-8 rounded-xl shadow-2xl transition-all duration-300 ease-in-out">
              <h2 className="text-2xl font-bold mb-6 text-teal-800 dark:text-mint-cream text-center">
                Edit Profile
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-teal-200 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring focus:ring-teal-200 dark:bg-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Profile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm dark:bg-gray-600 dark:text-white"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full mt-4 object-cover shadow-md mx-auto"
                    />
                  )}
                </div>
                <div className="flex justify-between mt-6">
                  <button
                    type="submit"
                    className="bg-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-teal-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
