import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaChartBar, FaUserAlt, FaSignInAlt, FaUserPlus, FaLaptopCode, FaBrain, FaRocket, FaGraduationCap } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiCodeforces } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import './LandingPage.css';

const Landingpage = () => {
  const { user } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-2 shadow-lg' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaCode className="text-3xl text-blue-500 mr-2" />
            <Link to="/" className="hover:text-blue-400 transition-colors">CodeZen</Link> 
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/problems" className="hover:text-blue-400 transition-colors">Problems</Link>
            <Link to="/contests" className="hover:text-blue-400 transition-colors">Contests</Link>
            <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <Link
                to="/profile"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <FaUserAlt className="mr-1" /> Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <FaSignInAlt className="mr-1" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <FaUserPlus className="mr-1" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-16">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl md:text-3xl font-light mb-6 max-w-3xl">
              Master coding challenges, compete in contests, and climb the ranks in our coding community
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {user ? (
                <Link
                  to="/codezen"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Let's Track our Progress
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <FaSignInAlt className="inline mr-2" /> Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-3 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <FaUserPlus className="inline mr-2" /> Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore <span className="text-blue-500">CodeZen</span></h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Challenge yourself with our comprehensive platform</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Problems Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center mb-6">
                <FaCode className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Coding Problems</h3>
              <p className="text-gray-300 mb-6">
                Challenge yourself with our collection of coding problems across various difficulty levels and topics.
              </p>
              <div className="flex justify-center">
                <Link 
                  to={user ? "/problems" : "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-center"
                >
                  Explore Problems
                </Link>
              </div>
            </div>
            
            {/* Contests Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-purple-600/20 text-purple-500 rounded-lg flex items-center justify-center mb-6">
                <FaTrophy className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Coding Contests</h3>
              <p className="text-gray-300 mb-6">
                Participate in timed coding competitions and test your skills against other developers.
              </p>
              <div className="flex justify-center">
                <Link 
                  to={user ? "/contests" : "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-center"
                >
                  Join Contests
                </Link>
              </div>
            </div>
            
            {/* Leaderboard Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-green-600/20 text-green-500 rounded-lg flex items-center justify-center mb-6">
                <FaChartBar className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
              <p className="text-gray-300 mb-6">
                See how you rank against other coders and track your progress over time consistently.
              </p>
              <div className="flex justify-center">
                <Link 
                  to={user ? "/leaderboard" : "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors w-full text-center"
                >
                  View Rankings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Developers <span className="text-blue-500">Love CodeZen</span></h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Join our growing community of passionate coders</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">1,000+</div>
              <div className="text-lg text-gray-300">Coding Problems</div>
            </div>
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">Weekly</div>
              <div className="text-lg text-gray-300">Coding Contests</div>
            </div>
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10,000+</div>
              <div className="text-lg text-gray-300">Active Developers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <FaCode className="text-3xl text-blue-500 mr-2" />
                <span className="text-2xl font-bold">CodeZen</span>
              </div>
              <p className="text-gray-400 mb-4">
                Elevate your coding skills with practice, competition, and community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiLeetcode />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiHackerrank />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiCodeforces />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/problems" className="text-gray-400 hover:text-white">Problems</Link></li>
                <li><Link to="/contests" className="text-gray-400 hover:text-white">Contests</Link></li>
                <li><Link to="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
                <li><Link to={user ? "/codezen" : "/login"} className="text-gray-400 hover:text-white">Dashboard</Link></li>
                {user && <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CodeZen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landingpage;