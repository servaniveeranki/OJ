import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaTrophy, FaChartBar, FaUserAlt, FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Homepage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="mb-8 flex items-center">
            <FaCode className="text-5xl mr-3" />
            <h1 className="text-5xl font-bold">CodeZen</h1>
          </div>
          <h2 className="text-2xl md:text-3xl font-light mb-6 max-w-3xl">
            Master coding challenges, compete in contests, and climb the ranks in our coding community
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                  <FaSignInAlt className="inline mr-2" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent hover:bg-white/10 border-2 border-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
                >
                  <FaUserPlus className="inline mr-2" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explore CodeZen</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Problems Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:bg-white/20 transform hover:-translate-y-1">
            <div className="h-16 w-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCode className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Coding Problems</h3>
            <p className="text-center mb-6 text-white/80">
              Challenge yourself with our collection of coding problems across various difficulty levels and topics.
            </p>
            <div className="flex justify-center">
              <Link 
                to={user ? "/problems" : "/login"}
                className="bg-white hover:bg-gray-200 text-black font-medium py-2 px-6 rounded-lg transition-colors w-full text-center"
              >
                Explore Problems
              </Link>
            </div>
          </div>
          
          {/* Contests Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:bg-white/20 transform hover:-translate-y-1">
            <div className="h-16 w-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTrophy className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Coding Contests</h3>
            <p className="text-center mb-6 text-white/80">
              Participate in timed coding competitions and test your skills against other developers.
            </p>
            <div className="flex justify-center">
              <Link 
                to={user ? "/contests" : "/login"}
                className="bg-white hover:bg-gray-200 text-black font-medium py-2 px-6 rounded-lg transition-colors w-full text-center"
              >
                Join Contests
              </Link>
            </div>
          </div>
          
          {/* Leaderboard Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-lg hover:shadow-xl transition-all hover:bg-white/20 transform hover:-translate-y-1">
            <div className="h-16 w-16 bg-white/20 text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <FaChartBar className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-center mb-4">Leaderboard</h3>
            <p className="text-center mb-6 text-white/80">
              See how you rank against other coders and track your progress over time.
            </p>
            <div className="flex justify-center">
              <Link 
                to={user ? "/leaderboard" : "/login"}
                className="bg-white hover:bg-gray-200 text-black font-medium py-2 px-6 rounded-lg transition-colors w-full text-center"
              >
                View Rankings
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials/Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-6xl mx-auto border border-white/20">
          <h2 className="text-3xl font-bold text-center mb-8">Why Developers Love CodeZen</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-xl">Coding Problems</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Weekly</div>
              <div className="text-xl">Coding Contests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-xl">Active Developers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800/50 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <FaCode className="text-2xl mr-2" />
            <h2 className="text-2xl font-bold">CodeZen</h2>
          </div>
          <p className="text-white/70 mb-4">Elevate your coding skills with practice, competition, and community.</p>
          <div className="flex justify-center space-x-4">
            <Link to={user ? "/dashboard" : "/login"} className="hover:text-gray-300 transition-colors">Dashboard</Link>
            <Link to={user ? "/profile" : "/login"} className="hover:text-gray-300 transition-colors">Profile</Link>
            <Link to={user ? "/problems" : "/login"} className="hover:text-gray-300 transition-colors">Problems</Link>
            <Link to={user ? "/contests" : "/login"} className="hover:text-gray-300 transition-colors">Contests</Link>
            <Link to={user ? "/leaderboard" : "/login"} className="hover:text-gray-300 transition-colors">Leaderboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
