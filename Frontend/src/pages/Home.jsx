import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeSwitch from '../components/ThemeSwitch';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen text-gray-900 dark:text-white transition-all duration-500">

      {/* Animated Navbar */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 
        ${scrolled 
          ? 'bg-white dark:bg-gray-900 shadow-lg py-2' 
          : 'bg-white dark:bg-gray-900 py-4'
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-extrabold text-indigo-700 dark:text-white tracking-tight">
          Vidyana
          </div>

          {/* Right: Theme + Auth Buttons */}
          <div className="flex items-center space-x-4">
            <ThemeSwitch />
            <Link to="/login">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition-all duration-300">
                Login
              </button>
            </Link>
            <Link to="/register">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-purple-600 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300">
                Sign Up
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center text-center px-4 pt-20 bg-gradient-to-br from-indigo-300/30 to-purple-300/20 dark:from-indigo-900/30 dark:to-purple-900/30">
        <div className="backdrop-blur-xl bg-white/40 dark:bg-gray-800/60 p-10 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-600">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Discover Your Rights</h1>
          <p className="text-lg md:text-xl max-w-xl mx-auto mb-6">
            Learn about freedom, fairness, and your identity through games and stories.
          </p>
          <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition text-lg font-semibold shadow-md">
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-12">Why EduRights?</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[ 
            { title: 'Interactive Games', desc: 'Quiz & challenges based on real rights.', icon: '🎮' },
            { title: 'Kid-Friendly', desc: 'Simple language, fun visuals, no boring bits.', icon: '👦' },
            { title: 'Free & Private', desc: 'No ads, no tracking, just learning.', icon: '🔒' }
          ].map((item, i) => (
            <div key={i} className="bg-white/30 dark:bg-gray-800/40 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/20 dark:border-gray-600">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white/20 dark:bg-gray-800/40 backdrop-blur-lg py-16 px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">What Kids Say</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {[ 
            ['Rahul, 12', '“I loved the quiz game! I didn’t know I had so many rights.”'],
            ['Rohit, 10', '“Now I know how to be safe online. The game made it easy!”']
          ].map(([name, quote], i) => (
            <div key={i} className="bg-white/40 dark:bg-gray-700/40 rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-600">
              <p className="text-lg italic mb-4">"{quote}"</p>
              <p className="font-semibold">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Start Your Journey</h2>
        <p className="mb-6 text-lg">Your rights matter. Let's explore them together.</p>
        <Link to="/login" className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition text-lg font-semibold">
          Join Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-white/10 dark:bg-gray-900/30 backdrop-blur-md py-6 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-center gap-6 mb-4 text-xl">
          <a href="#" className="hover:text-indigo-500"><FaTwitter /></a>
          <a href="#" className="hover:text-indigo-500"><FaLinkedin /></a>
          <a href="#" className="hover:text-indigo-500"><FaGithub /></a>
        </div>
        <p>© 2025 EduRights. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
