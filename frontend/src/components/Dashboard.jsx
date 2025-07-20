import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCode, FaTrophy, FaChartBar, FaUser, FaSignOutAlt, FaCalendarAlt, FaCheck, FaJava, FaPython, FaJs, FaDatabase, FaEye, FaTerminal, FaUsers, FaHome, FaCog, FaList, FaChevronDown } from 'react-icons/fa';
import { SiCplusplus, SiCsharp, SiRuby, SiPhp, SiGo } from 'react-icons/si';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import './Dashboard.css'; // Calendar styling
import './codezen.css'; // New professional styling

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSolutionModal, setShowSolutionModal] = useState(false);
  
  // State for user statistics
  const [problemStats, setProblemStats] = useState({
    totalProblems: 0,
    solvedProblems: 0,
    easyProblems: { total: 0, solved: 0 },
    mediumProblems: { total: 0, solved: 0 },
    hardProblems: { total: 0, solved: 0 },
    languages: [],
    streakDays: 0,
    longestStreak: 0,
    totalSubmissions: 0,
    acceptedSubmissions: 0,
  });
  
  // State for activity calendar data
  const [activityData, setActivityData] = useState({});
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Function to refresh dashboard data
  const refreshDashboardData = async () => {
    if (!user || !user._id) return;
    
    setStatsLoading(true);
    try {
      console.log('Refreshing dashboard data for user:', user._id);
      
      // Fetch user statistics
      const statsResponse = await axios.get(`/api/users/stats/${user._id}`);
      const statsData = statsResponse.data;
      
      console.log('Received stats data:', statsData);
      
      // Fetch recent submissions
      const submissionsResponse = await axios.get(`/api/users/submissions/${user._id}`);
      setRecentSubmissions(submissionsResponse.data);
      
      // Get total problems count
      const problemsResponse = await axios.get('/api/problems');
      const totalProblems = problemsResponse.data.length;
        
        // Map language codes to icons
        const languageIcons = {
          'javascript': FaJs,
          'js': FaJs,
          'python': FaPython,
          'py': FaPython,
          'java': FaJava,
          'cpp': SiCplusplus,
          'c++': SiCplusplus,
          'csharp': SiCsharp,
          'c#': SiCsharp,
          'ruby': SiRuby,
          'php': SiPhp,
          'go': SiGo,
          'sql': FaDatabase
        };
        
        // Format language distribution data
        const languageDistribution = statsData.languageDistribution.map(lang => ({
          name: lang.language.charAt(0).toUpperCase() + lang.language.slice(1),
          count: lang.count,
          icon: languageIcons[lang.language.toLowerCase()] || FaCode
        }));
        
        // Update problem stats
        setProblemStats({
          totalProblems,
          solvedProblems: statsData.problemsSolved,
          easyProblems: { 
            total: Math.round(totalProblems * 0.4), // Estimate
            solved: statsData.difficultyDistribution.Easy || 0
          },
          mediumProblems: { 
            total: Math.round(totalProblems * 0.4), // Estimate
            solved: statsData.difficultyDistribution.Medium || 0
          },
          hardProblems: { 
            total: Math.round(totalProblems * 0.2), // Estimate
            solved: statsData.difficultyDistribution.Hard || 0
          },
          languages: languageDistribution,
          streakDays: statsData.streak?.current || 0,
          longestStreak: statsData.streak?.longest || 0,
          totalSubmissions: statsData.totalSubmissions,
          acceptedSubmissions: statsData.submissionStats?.accepted || 0
        });
        
        // Format activity data for the calendar
        if (statsData.dailyActivity) {
          setActivityData(statsData.dailyActivity);
          console.log('Activity data set:', Object.keys(statsData.dailyActivity).length, 'days');
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load your statistics');
      } finally {
        setStatsLoading(false);
      }
    };
  
  // Fetch user statistics and submissions
  useEffect(() => {
    refreshDashboardData();
  }, [user]);
  
  // Add a function to manually refresh data (can be called after submissions)
  const handleRefresh = () => {
    refreshDashboardData();
    toast.success('Dashboard refreshed!');
  };
  
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-2 shadow-lg' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaCode className="text-3xl text-blue-500 mr-2" />
            <span className="text-2xl font-bold">CodeZen</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-blue-400 transition-colors nav-link"><FaHome className="inline mr-1" /> Home</Link>
            <Link to="/problems" className="hover:text-blue-400 transition-colors nav-link"><FaList className="inline mr-1" /> Problems</Link>
            <Link to="/contests" className="hover:text-blue-400 transition-colors nav-link"><FaTrophy className="inline mr-1" /> Contests</Link>
            <Link to="/leaderboard" className="hover:text-blue-400 transition-colors nav-link"><FaChartBar className="inline mr-1" /> Leaderboard</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center">
              <FaUser className="mr-1" /> Profile
            </Link>
            <button 
              onClick={handleLogout}
              className="hover:text-blue-400 transition-colors flex items-center"
            >
              <FaSignOutAlt className="mr-1" /> Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-600/20 border-l-4 border-green-500 p-4 rounded glass">
              <p className="text-green-400">{successMessage}</p>
            </div>
          )}
          
          {/* Welcome Section */}
          <div className="mb-10">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-black/90 p-8 shadow-xl glass border-glow">
              <div className="absolute top-0 right-0 -mt-20 -mr-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-40 w-40 rounded-full bg-black90/90 blur-3xl"></div>
              
              <div className="relative flex flex-col md:flex-row justify-between items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Welcome back, <span className="text-black/70">{user?.firstname}</span>!</h1>
                  <p className="text-xl text-gray-500 mb-4">Your coding journey continues here. Let's track your progress.</p>
                  
                  <div className="flex items-center space-x-4 mt-4">
                    <Link to="/problems" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center">
                      <FaCode className="mr-2" /> Solve Problems
                    </Link>
                    <Link to="/contests" className="bg-transparent hover:bg-white/10 border border-white/20 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center">
                      <FaTrophy className="mr-2" /> Join Contest
                    </Link>
                  </div>
                </div>
                
                <div className="mt-6 md:mt-0 flex items-center bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                  <div className="text-center px-6">
                    <div className="text-4xl font-bold text-blue-400">{problemStats.streakDays}</div>
                    <div className="text-sm text-gray-300">Day Streak</div>
                  </div>
                  <div className="h-12 w-px bg-gray-700"></div>
                  <div className="text-center px-6">
                    <div className="text-4xl font-bold text-blue-400">{problemStats.solvedProblems}</div>
                    <div className="text-sm text-gray-300">Problems Solved</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dashboard Header with Refresh Button */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold">Your <span className="text-blue-500">Progress</span></h2>
              <button
                onClick={handleRefresh}
                disabled={statsLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className={`w-4 h-4 ${statsLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {statsLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          {/* Stats Overview */}
          <div className="mb-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Problems Solved */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 card-hover">
                <div className="h-12 w-12 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center mb-4">
                  <FaCode className="text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">{problemStats.solvedProblems}</div>
                <div className="text-sm text-gray-400 mb-3">Problems Solved</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 stat-bar" style={{"--percent": `${(problemStats.solvedProblems / problemStats.totalProblems) * 100}%`}}>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {Math.round((problemStats.solvedProblems / problemStats.totalProblems) * 100)}% of {problemStats.totalProblems} problems
                </div>
              </div>
              
              {/* Current Streak */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 card-hover">
                <div className="h-12 w-12 bg-purple-600/20 text-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <FaCalendarAlt className="text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">{problemStats.streakDays}</div>
                <div className="text-sm text-gray-400 mb-3">Day Streak</div>
                <div className="flex items-center">
                  <div className="flex-1 h-1 bg-gray-700">
                    <div className="h-1 bg-purple-500" style={{ width: `${(problemStats.streakDays / Math.max(problemStats.longestStreak, 1)) * 100}%` }}></div>
                  </div>
                  <div className="text-xs text-gray-500 ml-2">
                    Best: {problemStats.longestStreak} days
                  </div>
                </div>
              </div>
              
              {/* Acceptance Rate */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 card-hover">
                <div className="h-12 w-12 bg-green-600/20 text-green-500 rounded-lg flex items-center justify-center mb-4">
                  <FaCheck className="text-2xl" />
                </div>
                <div className="text-3xl font-bold mb-2">
                  {problemStats.totalSubmissions ? Math.round((problemStats.acceptedSubmissions / problemStats.totalSubmissions) * 100) : 0}%
                </div>
                <div className="text-sm text-gray-400 mb-3">Acceptance Rate</div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 stat-bar" style={{"--percent": `${problemStats.totalSubmissions ? (problemStats.acceptedSubmissions / problemStats.totalSubmissions) * 100 : 0}%`}}>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {problemStats.acceptedSubmissions} / {problemStats.totalSubmissions} submissions
                </div>
              </div>
              
              {/* Difficulty Distribution */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-700 card-hover">
                <div className="h-12 w-12 bg-yellow-600/20 text-yellow-500 rounded-lg flex items-center justify-center mb-4">
                  <FaChartBar className="text-2xl" />
                </div>
                <div className="text-xl font-bold mb-3">Difficulty Breakdown</div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-green-400">Easy</span>
                      <span className="text-gray-400">{problemStats.easyProblems.solved}/{problemStats.easyProblems.total}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(problemStats.easyProblems.solved / Math.max(problemStats.easyProblems.total, 1)) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((problemStats.easyProblems.solved / Math.max(problemStats.easyProblems.total, 1)) * 100)}% completed
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-yellow-400">Medium</span>
                      <span className="text-gray-400">{problemStats.mediumProblems.solved}/{problemStats.mediumProblems.total}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(problemStats.mediumProblems.solved / Math.max(problemStats.mediumProblems.total, 1)) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((problemStats.mediumProblems.solved / Math.max(problemStats.mediumProblems.total, 1)) * 100)}% completed
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-red-400">Hard</span>
                      <span className="text-gray-400">{problemStats.hardProblems.solved}/{problemStats.hardProblems.total}</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${(problemStats.hardProblems.solved / Math.max(problemStats.hardProblems.total, 1)) * 100}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((problemStats.hardProblems.solved / Math.max(problemStats.hardProblems.total, 1)) * 100)}% completed
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <div className="text-sm font-medium mb-2">Total Progress</div>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                      <div className="flex h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500" 
                          style={{ width: `${(problemStats.easyProblems.solved / problemStats.totalProblems) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-yellow-500" 
                          style={{ width: `${(problemStats.mediumProblems.solved / problemStats.totalProblems) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-red-500" 
                          style={{ width: `${(problemStats.hardProblems.solved / problemStats.totalProblems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{problemStats.solvedProblems} solved</span>
                    <span>{Math.round((problemStats.solvedProblems / problemStats.totalProblems) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Activity Calendar */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaCalendarAlt className="mr-2" /> Activity Calendar
              </h3>
              <div className="bg-white/5 p-6 rounded-lg shadow-lg border border-gray-700">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Calendar visualization */}
                  <div className="flex-grow calendar-container overflow-x-auto">
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
                        {Array.from({ length: 180 }).map((_, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (180 - index));
                          const dateString = date.toISOString().split('T')[0];
                          const dayData = activityData[dateString] || { submissions: 0, accepted: 0 };
                          const submissions = typeof dayData === 'object' ? dayData.submissions : 0;
                          const accepted = typeof dayData === 'object' ? dayData.accepted : 0;
                          
                          // Determine color based on submissions
                          let bgColorClass = 'bg-gray-800'; // No submissions
                          if (submissions === 1) bgColorClass = 'bg-green-900';
                          if (submissions === 2) bgColorClass = 'bg-green-700';
                          if (submissions === 3) bgColorClass = 'bg-green-600';
                          if (submissions === 4) bgColorClass = 'bg-green-500';
                          if (submissions >= 5) bgColorClass = 'bg-green-400';
                          
                          // Add border for today's date
                          const isToday = new Date().toISOString().split('T')[0] === dateString;
                          const todayClass = isToday ? 'ring-2 ring-blue-500' : '';
                          
                          return (
                            <div
                              key={index}
                              className={`w-3 h-3 rounded-sm ${bgColorClass} ${todayClass} hover:transform hover:scale-150 transition-transform cursor-pointer`}
                              title={`${dateString}: ${submissions} submissions, ${accepted} accepted`}
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
                  
                  {/* Activity Stats */}
                  <div className="md:w-64 bg-white/5 rounded-lg p-4 border border-gray-700/50">
                    <h4 className="text-sm font-semibold mb-3 pb-2 border-b border-gray-700">Activity Summary</h4>
                    
                    {/* Calculate activity stats */}
                    {(() => {
                      // Calculate total submissions in the last week, month, and year
                      const now = new Date();
                      const oneWeekAgo = new Date(now);
                      oneWeekAgo.setDate(now.getDate() - 7);
                      const oneMonthAgo = new Date(now);
                      oneMonthAgo.setMonth(now.getMonth() - 1);
                      
                      let weeklySubmissions = 0;
                      let monthlySubmissions = 0;
                      let totalAccepted = 0;
                      let mostActiveDay = { date: '', count: 0 };
                      
                      // Process activity data
                      Object.entries(activityData).forEach(([dateStr, data]) => {
                        const date = new Date(dateStr);
                        const submissions = data.submissions || 0;
                        const accepted = data.accepted || 0;
                        
                        // Update most active day
                        if (submissions > mostActiveDay.count) {
                          mostActiveDay = { date: dateStr, count: submissions };
                        }
                        
                        // Count weekly and monthly submissions
                        if (date >= oneWeekAgo) {
                          weeklySubmissions += submissions;
                        }
                        if (date >= oneMonthAgo) {
                          monthlySubmissions += submissions;
                        }
                        
                        // Count total accepted
                        totalAccepted += accepted;
                      });
                      
                      // Format most active day
                      const formatDate = (dateStr) => {
                        if (!dateStr) return 'N/A';
                        const date = new Date(dateStr);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      };
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Last 7 days</div>
                            <div className="text-xl font-bold">{weeklySubmissions} submissions</div>
                            <div className="w-full bg-gray-700/50 rounded-full h-1 mt-1">
                              <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, weeklySubmissions * 5)}%` }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Last 30 days</div>
                            <div className="text-xl font-bold">{monthlySubmissions} submissions</div>
                            <div className="w-full bg-gray-700/50 rounded-full h-1 mt-1">
                              <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${Math.min(100, monthlySubmissions * 2)}%` }}></div>
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                              <div className="text-xs text-gray-400">Most active day</div>
                              <div className="text-xs font-medium">{mostActiveDay.count} submissions</div>
                            </div>
                            <div className="text-sm">{formatDate(mostActiveDay.date)}</div>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-700">
                            <div className="flex justify-between">
                              <div className="text-xs text-gray-400">Acceptance rate</div>
                              <div className="text-xs font-medium">
                                {problemStats.totalSubmissions ? 
                                  Math.round((totalAccepted / problemStats.totalSubmissions) * 100) : 0}%
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()} 
                  </div>
                </div>
              </div>
            </div>
            
            {/* Language Distribution */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <FaCode className="mr-2" /> Language Distribution
              </h3>
              <div className="bg-white/5 p-6 rounded-lg shadow-lg border border-gray-700">
                {problemStats.languages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FaCode className="text-4xl mx-auto mb-3 opacity-30" />
                    <p>No submissions yet. Start solving problems to see your language distribution!</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                      {problemStats.languages.map(language => (
                        <div key={language.name} className="flex flex-col items-center p-4 bg-white/5 rounded-lg border border-gray-700/50 hover:border-blue-500/50 transition-all transform hover:scale-105 hover:shadow-lg">
                          <language.icon className="text-3xl mb-2" />
                          <div className="font-medium">{language.name}</div>
                          <div className="text-2xl font-bold">{language.count}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {Math.round((language.count / Math.max(problemStats.solvedProblems, 1)) * 100)}% of solutions
                          </div>
                          <div className="w-full bg-gray-700/50 rounded-full h-1 mt-2">
                            <div 
                              className="bg-blue-500 h-1 rounded-full" 
                              style={{ width: `${(language.count / Math.max(problemStats.solvedProblems, 1)) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Language distribution chart */}
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h4 className="text-sm font-medium mb-3">Comparative Usage</h4>
                      <div className="flex h-8 w-full rounded-md overflow-hidden">
                        {problemStats.languages.map((language, index) => {
                          // Generate a color based on index
                          const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
                          const colorClass = colors[index % colors.length];
                          
                          return (
                            <div 
                              key={language.name}
                              className={`${colorClass} h-full flex items-center justify-center text-xs font-bold`}
                              style={{ width: `${(language.count / Math.max(problemStats.solvedProblems, 1)) * 100}%` }}
                              title={`${language.name}: ${language.count} (${Math.round((language.count / Math.max(problemStats.solvedProblems, 1)) * 100)}%)`}
                            >
                              {(language.count / Math.max(problemStats.solvedProblems, 1)) * 100 > 10 ? 
                                `${language.name} ${Math.round((language.count / Math.max(problemStats.solvedProblems, 1)) * 100)}%` : ''}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="flex flex-wrap mt-3 gap-2">
                        {problemStats.languages.map((language, index) => {
                          const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'];
                          const colorClass = colors[index % colors.length];
                          
                          return (
                            <div key={language.name} className="flex items-center text-xs">
                              <div className={`w-3 h-3 ${colorClass} rounded-sm mr-1`}></div>
                              <span>{language.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Recent Submissions */}
          <div className="mb-12 bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Recent Submissions</h2>
            
            {statsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : recentSubmissions.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No submissions yet. Start solving problems!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Problem</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Language</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>

                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {recentSubmissions.map((submission) => {
                      const submissionDate = new Date(submission.createdAt);
                      const formattedDate = submissionDate.toLocaleDateString();
                      const formattedTime = submissionDate.toLocaleTimeString();
                      
                      return (
                        <tr key={submission._id} className="hover:bg-white/5">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Link to={`/problems/${submission.problem._id}`} className="text-blue-400 hover:text-blue-300">
                              {submission.problem.title}
                            </Link>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              submission.problem.difficulty === 'Easy' ? 'bg-green-900 text-green-300' :
                              submission.problem.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {submission.problem.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {submission.language.toUpperCase()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full ${
                              submission.status === 'Accepted' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {submission.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {submission.executionTime} ms
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setShowSolutionModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 flex items-center"
                            >
                              <FaEye className="mr-1" /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {/* Solution Modal */}
          {showSolutionModal && selectedSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">
                      Solution: {selectedSubmission.problem.title}
                    </h3>
                    <button
                      onClick={() => setShowSolutionModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Status</p>
                      <p className={`text-lg ${
                        selectedSubmission.status === 'Accepted' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {selectedSubmission.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Language</p>
                      <p className="text-lg">{selectedSubmission.language.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Execution Time</p>
                      <p className="text-lg">{selectedSubmission.executionTime} ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Submitted</p>
                      <p className="text-lg">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">Code</p>
                    <div className="bg-gray-900 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
                        <code>{selectedSubmission.code}</code>
                      </pre>
                    </div>
                  </div>
                  
                  {selectedSubmission.testResults && selectedSubmission.testResults.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Test Results</p>
                      <div className="space-y-2">
                        {selectedSubmission.testResults.map((test, index) => (
                          <div key={index} className={`p-3 rounded-md ${
                            test.passed ? 'bg-green-900/30' : 'bg-red-900/30'
                          }`}>
                            <div className="flex justify-between">
                              <span className="font-medium">Test Case {index + 1}</span>
                              <span className={test.passed ? 'text-green-400' : 'text-red-400'}>
                                {test.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-2">
                              <div>
                                <p className="text-xs text-gray-400">Input</p>
                                <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-x-auto">{test.input}</pre>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Expected</p>
                                <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-x-auto">{test.expected}</pre>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Output</p>
                                <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-x-auto">{test.output}</pre>
                              </div>
                              {test.error && (
                                <div>
                                  <p className="text-xs text-red-400">Error</p>
                                  <pre className="text-xs bg-black/30 p-2 rounded mt-1 overflow-x-auto text-red-300">{test.error}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setShowSolutionModal(false)}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
