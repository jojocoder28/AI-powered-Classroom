import React from 'react';
import { Link } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Home = () => {
  return (
    <div className="bg-mint-cream dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 md:py-32 flex flex-col md:flex-row items-center">
        {/* Text Content */}
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-teal-800 dark:text-mint-cream">
            Revolutionizing Online
            <br />
            Classrooms with
            <br />
            <span className="text-teal-600 dark:text-teal-400">Emotion-Aware</span>
            <br />
            Intelligence.
          </h1>
          <Link
            to="/register" // Or link to dashboard/classroom if logged in
            className="inline-block bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300 ease-in-out"
          >
            Start Learning
          </Link>
        </div>

        {/* Image Content */}
        <div className="md:w-1/2 flex justify-center relative">
           {/* Placeholder for the background shape */}
           <div className="absolute inset-0 flex justify-center items-center z-0">
             <div className="w-80 h-80 md:w-96 md:h-96 bg-green-200 dark:bg-teal-900 opacity-50 rounded-full blur-3xl"></div>
           </div>
           <div className="relative z-10 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl overflow-hidden w-full max-w-md"> 
             {/* Replace with actual image or component */}
             <img
              src="/placeholder-classroom.jpg" // Replace with your image path
              alt="Online Classroom Environment"
              className="rounded-lg object-cover w-full h-64"
             />
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

          {/* Feature Card 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-teal-600 text-white rounded-full p-5 mb-5 inline-flex shadow-lg">
              <i className="fas fa-chalkboard-teacher fa-2x"></i>
            </div>
            <div className="bg-mint-cream dark:bg-gray-700 p-6 rounded-lg shadow-md w-full">
              <h3 className="text-xl font-semibold mb-3 text-teal-800 dark:text-mint-cream">Your Smartest Classroom Yet.</h3>
              <p className="text-gray-600 dark:text-gray-400">Join live sessions, access resources, and learn your way.</p>
            </div>
          </div>

          {/* Feature Card 2 */}
          <div className="flex flex-col items-center">
             <div className="bg-teal-600 text-white rounded-full p-5 mb-5 inline-flex shadow-lg">
                <i className="fas fa-chart-line fa-2x"></i> {/* Changed icon */}
             </div>
            <div className="bg-mint-cream dark:bg-gray-700 p-6 rounded-lg shadow-md w-full">
              <h3 className="text-xl font-semibold mb-3 text-teal-800 dark:text-mint-cream">Performance visualization</h3>
              <p className="text-gray-600 dark:text-gray-400">Check Your Performance and Track Your Education</p>
            </div>
          </div>

          {/* Feature Card 3 */}
          <div className="flex flex-col items-center">
             <div className="bg-teal-600 text-white rounded-full p-5 mb-5 inline-flex shadow-lg">
                <i className="fas fa-book-reader fa-2x"></i> {/* Changed icon */}
             </div>
            <div className="bg-mint-cream dark:bg-gray-700 p-6 rounded-lg shadow-md w-full">
              <h3 className="text-xl font-semibold mb-3 text-teal-800 dark:text-mint-cream">Don't Just Learn — Connect.</h3>
              <p className="text-gray-600 dark:text-gray-400">Next-Gen Classrooms with Emotion-Aware Learning</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;
