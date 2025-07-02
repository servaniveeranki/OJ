import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCode, FaTrophy, FaChartBar, FaUser, FaSignOutAlt } from 'react-icons/fa';
import Header from './Header';

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to CodeZen, {user?.firstname}!</h1>
            <p className="text-xl text-gray-600">Your coding journey continues here. What would you like to do today?</p>
          </div>
          
          {/* Three Feature Cards - Arranged Vertically */}
          <div className="flex flex-col gap-8 max-w-3xl mx-auto">
            {/* Problems Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCode className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Coding Problems</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Challenge yourself with our collection of coding problems across various difficulty levels and topics.
                </p>
                <div className="flex justify-center">
                  <Link 
                    to="/problems" 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full text-center"
                  >
                    Explore Problems
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Contests Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="h-16 w-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTrophy className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Coding Contests</h2>
                <p className="text-gray-600 mb-6 text-center">
                  Participate in timed coding competitions and test your skills against other developers.
                </p>
                <div className="flex justify-center">
                  <Link 
                    to="/contests" 
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full text-center"
                  >
                    Join Contests
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Leaderboard Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaChartBar className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Leaderboard</h2>
                <p className="text-gray-600 mb-6 text-center">
                  See how you rank against other coders and track your progress over time.
                </p>
                <div className="flex justify-center">
                  <Link 
                    to="/leaderboard" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors w-full text-center"
                  >
                    View Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
