import React, { useState, useContext } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Context } from "../main.jsx";
import axios from 'axios';
import { backend_api } from '../config.js';

function Register() {
  const { isAuthenticated, setIsAuthenticated, user, setUser } = useContext(Context);
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
        `${backend_api}/api/users/register`,
        submissionData,
        {
          headers: {'Content-Type': 'multipart/form-data'},
          withCredentials: true,
        }
      );

      console.log('Registration Success:', response.data);
      setLoading(false);
      navigate('/login');

    } catch (err) {
      console.error('Registration Error:', err);
      console.error('Registration Error:', err.message);
      console.error('Full Error:', err.toJSON?.() || err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

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
    <div className="min-h-screen bg-mint-cream dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white dark:bg-gray-700 rounded-2xl shadow-2xl p-10 border border-teal-100 dark:border-teal-800">
        <div>
          <div className="flex justify-center">
            {/* Removed gradient and used solid color */}
            <div className="rounded-full bg-teal-600 dark:bg-teal-800 h-14 w-14 flex items-center justify-center shadow-md">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-teal-200 dark:text-mint-cream">
            Create Your Account
          </h2>
           <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400 dark:hover:text-teal-300">sign in to your existing account</Link>
          </p>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
           <div>
             <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Role</label>
             <select id="role" name="role" required value={formData.role} onChange={handleChange} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm bg-mint-cream dark:bg-gray-800 text-left">
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
             <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">Profile Image (Optional)</label>
             <input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 text-left
               file:mr-4 file:py-2 file:px-4
               file:rounded-full file:border-0
               file:text-sm file:font-semibold
               file:bg-teal-50 dark:file:bg-gray-600
               file:text-teal-700 dark:file:text-teal-200
               hover:file:bg-teal-100 dark:hover:file:bg-gray-500
             "/>
           </div>
          <div>
            {/* Removed gradient and used solid color */}
            <button type="submit" disabled={loading} className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition duration-150 ease-in-out ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

const InputField = ({ label, name, type = 'text', value, onChange, required = false, autoComplete = 'off' }) => (
  <div>
    {/* Added text-left to label */}
    <label htmlFor={`register-${name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 text-left">{label}</label>
    {/* Added text-left to input */}
    <input id={`register-${name}`} name={name} type={type} autoComplete={autoComplete} required={required} className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm bg-mint-cream dark:bg-gray-800 text-left" placeholder={label} value={value} onChange={onChange}/>
  </div>
);

export default Register;
