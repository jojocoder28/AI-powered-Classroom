import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {backend_api} from "../config"; // Replace with your backend URL

const AdminUserPage = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    phoneNumber: '',
    firstName: '',
    lastName: '',
    university: '',
    department: '',
    designation: '',
    fullName: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${backend_api}/api/user/admin/users`, {
        withCredentials: true,
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
      role: user.role || 'Student',
      phoneNumber: user.phoneNumber || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      university: user.university || '',
      department: user.department || '',
      designation: user.designation || '',
      fullName: user.fullName || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${backend_api}/api/user/admin/delete/${id}`, {
          withCredentials: true,
        });
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const payload = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      payload.append(key, val);
    });
    if (profileImage) {
      payload.append("profileImage", profileImage);
    }

    try {
      if (editingUser) {
        await axios.put(`${backend_api}/api/user/admin/update/${editingUser._id}`, payload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${backend_api}/api/user/register`, payload, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      await fetchUsers();
      resetForm();
    } catch (err) {
      console.error("Submission failed:", err);
      setError("Failed to save user");
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'Student',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      university: '',
      department: '',
      designation: '',
      fullName: '',
    });
    setProfileImage(null);
    setError('');
    setShowForm(false);
  };

  return (
    <div className="admin-container">
      <h2>Admin User Management</h2>
      <button onClick={() => { resetForm(); setShowForm(true); }}>Add New User</button>

      {showForm && (
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="user-form">
          <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Username" required />
          <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" required />
          <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Password" />
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password" />

          <select name="role" value={formData.role} onChange={handleInputChange}>
            <option value="Student">Student</option>
            <option value="Teacher">Teacher</option>
            <option value="Admin">Admin</option>
          </select>

          <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="Phone Number" />
          <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" />
          <input type="text" name="university" value={formData.university} onChange={handleInputChange} placeholder="University" />
          <input type="text" name="department" value={formData.department} onChange={handleInputChange} placeholder="Department" />
          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="Designation" />
          <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Full Name" />
          <input type="file" name="profileImage" onChange={handleImageChange} accept="image/*" />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">{editingUser ? 'Update User' : 'Create User'}</button>
        </form>
      )}

      <h3>All Users</h3>
      <table className="user-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Full Name</th>
            <th>University</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.fullName}</td>
              <td>{user.university}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserPage;
