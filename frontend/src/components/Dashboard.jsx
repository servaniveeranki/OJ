import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCode, FaTrophy, FaChartBar, FaUser, FaSignOutAlt, FaCalendarAlt, FaCheck, FaJava, FaPython, FaJs, FaDatabase } from 'react-icons/fa';
import { SiCplusplus, SiCsharp, SiRuby, SiPhp, SiGo } from 'react-icons/si';
import Header from './Header';
import './Dashboard.css'; // We'll create this CSS file later for calendar styling

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  
  // Sample data for problem statistics - in a real app, this would come from an API
  const [problemStats, setProblemStats] = useState({
    totalProblems: 1000,
    solvedProblems: 157,
    easyProblems: { total: 400, solved: 89 },
    mediumProblems: { total: 450, solved: 56 },
    hardProblems: { total: 150, solved: 12 },
    languages: [
      { name: 'JavaScript', count: 62, icon: FaJs },
      { name: 'Python', count: 43, icon: FaPython },
      { name: 'Java', count: 21, icon: FaJava },
      { name: 'C++', count: 18, icon: SiCplusplus },
      { name: 'SQL', count: 5, icon: FaDatabase },
    ],
    streakDays: 7,
    longestStreak: 14,
    totalSubmissions: 289,
    acceptedSubmissions: 157,
  });
  
  // Generate activity data for the last 6 months
  const [activityData, setActivityData] = useState(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);
    
    const data = {};
    let currentDate = new Date(sixMonthsAgo);
    
    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split('T')[0];
      // Random number of submissions (0-5) with higher probability of 0
      const randomValue = Math.random();
      let submissions = 0;
      
      if (randomValue > 0.7) submissions = 1;
      if (randomValue > 0.85) submissions = 2;
      if (randomValue > 0.92) submissions = 3;
      if (randomValue > 0.97) submissions = 4;
      if (randomValue > 0.99) submissions = 5;
      
      data[dateString] = submissions;
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  });
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-900 border-l-4 border-green-500 p-4 rounded">
              <p className="text-sm text-green-400">{successMessage}</p>
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to CodeZen, {user?.firstname}!</h1>
            <p className="text-xl text-gray-300">Your coding journey continues here. Lets track our daily progress here!!</p>
          </div>
          
          {/* Stats Overview */}
          <div className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Problems Solved */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-2">{problemStats.solvedProblems}</div>
                <div className="text-sm text-gray-400">Problems Solved</div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${(problemStats.solvedProblems / problemStats.totalProblems) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((problemStats.solvedProblems / problemStats.totalProblems) * 100)}% of {problemStats.totalProblems} problems
                </div>
              </div>
              
              {/* Current Streak */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-2">{problemStats.streakDays}</div>
                <div className="text-sm text-gray-400">Day Streak</div>
                <div className="text-xs text-gray-500 mt-3">
                  Longest streak: {problemStats.longestStreak} days
                </div>
              </div>
              
              {/* Acceptance Rate */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-2">
                  {Math.round((problemStats.acceptedSubmissions / problemStats.totalSubmissions) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Acceptance Rate</div>
                <div className="text-xs text-gray-500 mt-3">
                  {problemStats.acceptedSubmissions} / {problemStats.totalSubmissions} submissions
                </div>
              </div>
              
              {/* Difficulty Distribution */}
              <div className="bg-white/5 rounded-lg p-4 flex flex-col items-center justify-center">
                <div className="flex justify-between w-full mb-2">
                  <div className="text-xs">
                    <span className="text-green-500 font-bold">Easy:</span> {problemStats.easyProblems.solved}/{problemStats.easyProblems.total}
                  </div>
                  <div className="text-xs">
                    <span className="text-yellow-500 font-bold">Medium:</span> {problemStats.mediumProblems.solved}/{problemStats.mediumProblems.total}
                  </div>
                  <div className="text-xs">
                    <span className="text-red-500 font-bold">Hard:</span> {problemStats.hardProblems.solved}/{problemStats.hardProblems.total}
                  </div>
                </div>
                <div className="w-full flex h-4 rounded-md overflow-hidden">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${(problemStats.easyProblems.solved / problemStats.solvedProblems) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-500 h-full" 
                    style={{ width: `${(problemStats.mediumProblems.solved / problemStats.solvedProblems) * 100}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${(problemStats.hardProblems.solved / problemStats.solvedProblems) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">Difficulty breakdown</div>
              </div>
            </div>
            
            {/* Activity Calendar */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaCalendarAlt className="mr-2" /> Activity Calendar
              </h3>
              <div className="calendar-container bg-white/5 p-4 rounded-lg overflow-x-auto">
                <div className="calendar-wrapper min-w-[900px]">
                  <div className="flex justify-between mb-2">
                    {Array.from({ length: 7 }).map((_, index) => {
                      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index];
                      return (
                        <div key={day} className="text-xs text-gray-500 w-8 text-center">{day}</div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Object.entries(activityData).map(([date, count]) => {
                      const dayOfWeek = new Date(date).getDay();
                      let bgColorClass = 'bg-gray-800';
                      
                      if (count === 1) bgColorClass = 'bg-green-900';
                      if (count === 2) bgColorClass = 'bg-green-700';
                      if (count === 3) bgColorClass = 'bg-green-600';
                      if (count === 4) bgColorClass = 'bg-green-500';
                      if (count >= 5) bgColorClass = 'bg-green-400';
                      
                      return (
                        <div 
                          key={date} 
                          className={`w-8 h-8 rounded-sm ${bgColorClass} cursor-pointer transition-all hover:transform hover:scale-110`}
                          title={`${date}: ${count} submissions`}
                        ></div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex justify-end mt-2 items-center">
                  <div className="text-xs text-gray-500 mr-2">Less</div>
                  <div className="w-3 h-3 bg-gray-800 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-900 rounded-sm mx-1"></div>
                  <div className="w-3 h-3 bg-green-700 rounded-sm mx-1"></div>
                  <div className="w-3 h-3 bg-green-600 rounded-sm mx-1"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-sm mx-1"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="text-xs text-gray-500 ml-2">More</div>
                </div>
              </div>
            </div>
            
            {/* Language Distribution */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Language Distribution</h3>
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {problemStats.languages.map(language => (
                    <div key={language.name} className="flex flex-col items-center p-3 bg-white/5 rounded-lg">
                      <language.icon className="text-3xl mb-2" />
                      <div className="font-medium">{language.name}</div>
                      <div className="text-2xl font-bold">{language.count}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((language.count / problemStats.solvedProblems) * 100)}%
                      </div>
                    </div>
                  ))}
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
