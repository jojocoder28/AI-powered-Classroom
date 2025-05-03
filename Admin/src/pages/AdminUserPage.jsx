import React, { useState, useEffect } from "react";
// import { v4 as uuidv4 } from "uuid";
import { useParams, Link, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import { Context } from '../main';
import { backend_api } from '../config';
import axios from 'axios';


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
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setUsers([
      { id: uuidv4(), username: 'alice123', email: "alice@example.com", role: 'Student', firstName: 'Alice', lastName: 'Johnson' },
      { id: uuidv4(), username: 'bob321', email: "bob@example.com", role: 'Instructor', firstName: 'Bob', lastName: 'Smith' },
    ]);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? { ...editingUser, ...formData } : u)));
      setEditingUser(null);
    } else {
      setUsers([...users, { id: uuidv4(), ...formData }]);
    }

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

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      confirmPassword: '',
      role: user.role,
      phoneNumber: user.phoneNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      university: user.university,
      department: user.department,
      designation: user.designation,
      fullName: user.fullName,
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#101828] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-[#101828]">Manage Users</h1>
          <button
            onClick={() => {
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
              setShowForm(true);
            }}
            className="bg-white text-[#101828] hover:bg-gray-100 py-2 px-6 rounded-full text-lg transition"
          >
            + Add New User
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="phoneNumber"
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="university"
              placeholder="University"
              value={formData.university}
              onChange={handleChange}
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <input
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
              <option value="Admin">Admin</option>
            </select>
            
            {formData.role === 'Instructor' && (
              <input
                name="designation"
                placeholder="Designation"
                value={formData.designation}
                onChange={handleChange}
                className="px-4 py-3 border-2 border-[#101828] rounded-lg focus:ring-2 focus:ring-[#101828] focus:outline-none text-lg"
              />
            )}

            <button
              type="submit"
              className="col-span-1 md:col-span-2 w-full bg-[#101828] hover:bg-[#1A2A3A] text-white font-medium py-3 rounded-lg transition"
            >
              {editingUser ? "Update User" : "Add User"}
            </button>
          </form>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-[#101828] mb-4">User List</h2>

          {users.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No users found.</p>
          ) : (
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="text-[#101828] border-b border-[#101828]">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="bg-gray-50 hover:bg-[#1A2A3A] transition">
                    <td className="py-3 px-4 border-b">{user.firstName} {user.lastName}</td>
                    <td className="py-3 px-4 border-b">{user.email}</td>
                    <td className="py-3 px-4 border-b">{user.role}</td>
                    <td className="py-3 px-4 border-b">{user.role === 'Instructor' ? user.designation : '-'}</td>
                    <td className="py-3 px-4 text-center border-b space-x-4">
                      <button
                        onClick={() => handleEdit(user)}
                        className="inline-flex items-center text-[#101828] hover:text-[#1A2A3A] font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="inline-flex items-center text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserPage;
