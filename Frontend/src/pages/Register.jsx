import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Context } from "../main.jsx";
import axios from 'axios';
import { backend_api } from '../config.js'; // Import backend_api instead of server

function Register() {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setError('');
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const submissionData = new FormData();
    submissionData.append('username', formData.username);
    submissionData.append('email', formData.email);
    submissionData.append('password', formData.password);
    submissionData.append('role', formData.role);
    submissionData.append('phoneNumber', formData.phoneNumber);

    if (formData.role === 'Student' || formData.role === 'Teacher') {
      submissionData.append('firstName', formData.firstName);
      submissionData.append('lastName', formData.lastName);
      submissionData.append('university', formData.university);
      submissionData.append('department', formData.department);
    }
    if (formData.role === 'Teacher') {
      submissionData.append('designation', formData.designation);
    }
    if (formData.role === 'Admin') {
      submissionData.append('fullName', formData.fullName);
    }

    if (profileImage) {
      submissionData.append('profileImage', profileImage);
    }

    try {
      const response = await axios.post(
        `${backend_api}/users/register`, // Use backend_api here
        submissionData,
        {
          headers: {},
          withCredentials: true,
        }
      );

      console.log('Registration Success:', response.data);
      setLoading(false);
      navigate('/login');

    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'Student':
        return (
          <>
            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <InputField label="University" name="university" value={formData.university} onChange={handleChange} required />
            <InputField label="Department" name="department" value={formData.department} onChange={handleChange} required />
          </>
        );
      case 'Teacher':
        return (
          <>
            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            <InputField label="University" name="university" value={formData.university} onChange={handleChange} required />
            <InputField label="Department" name="department" value={formData.department} onChange={handleChange} required />
            <InputField label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
          </>
        );
      case 'Admin':
        return (
          <>
            <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 to-orange-300 dark:bg-gradient-to-br dark:from-purple-700 dark:to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <div>
          <div className="flex justify-center">
            <div className="rounded-full bg-gradient-to-tr from-pink-500 to-orange-500 dark:from-purple-400 dark:to-blue-400 h-12 w-12 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900 dark:text-white">
            Create an Account
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           <div>
             <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
             <select id="role" name="role" required value={formData.role} onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md">
               <option value="Student">Student</option>
               <option value="Teacher">Teacher</option>
               <option value="Admin">Admin</option>
             </select>
           </div>
          <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required />
          <InputField label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <InputField label="Phone Number" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          {renderRoleSpecificFields()}
          <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required autoComplete="new-password" />
          <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required autoComplete="new-password"/>
           <div>
             <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Image (Optional)</label>
             <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 dark:file:bg-gray-700 file:text-pink-700 dark:file:text-pink-300 hover:file:bg-pink-100 dark:hover:file:bg-gray-600"/>
           </div>
          <div>
            <button type="submit" disabled={loading} className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-tr from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-pink-600 hover:text-pink-500 dark:text-pink-400 dark:hover:text-pink-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, type = 'text', value, onChange, required = false, autoComplete = 'off' }) => (
  <div>
    <label htmlFor={`register-${name}`} className="sr-only">{label}</label>
    <input id={`register-${name}`} name={name} type={type} autoComplete={autoComplete} required={required} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" placeholder={label} value={value} onChange={onChange}/>
  </div>
);

export default Register;
