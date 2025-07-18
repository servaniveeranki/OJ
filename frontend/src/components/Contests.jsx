import { useState } from 'react';
import Header from './Header';
import { FaTrophy, FaCalendarAlt, FaClock, FaUsers } from 'react-icons/fa';

const Contests = () => {
  // Sample contests data - in a real app, this would come from an API
  const [contests, setContests] = useState([
    { 
      id: 1, 
      title: 'Weekly Challenge #45', 
      startTime: '2025-07-05T18:00:00', 
      duration: '2 hours', 
      status: 'upcoming',
      participants: 0,
      difficulty: 'Medium'
    },
    { 
      id: 2, 
      title: 'Algorithm Marathon', 
      startTime: '2025-07-10T15:00:00', 
      duration: '3 hours', 
      status: 'upcoming',
      participants: 0,
      difficulty: 'Hard'
    },
    { 
      id: 3, 
      title: 'Beginner Friendly Contest', 
      startTime: '2025-07-15T17:00:00', 
      duration: '1.5 hours', 
      status: 'upcoming',
      participants: 0,
      difficulty: 'Easy'
    },
    { 
      id: 4, 
      title: 'Weekly Challenge #44', 
      startTime: '2025-06-28T18:00:00', 
      duration: '2 hours', 
      status: 'completed',
      participants: 245,
      difficulty: 'Medium'
    },
    { 
      id: 5, 
      title: 'Data Structures Special', 
      startTime: '2025-06-20T16:00:00', 
      duration: '2.5 hours', 
      status: 'completed',
      participants: 189,
      difficulty: 'Medium'
    },
  ]);

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter contests based on selected filter
  const filteredContests = statusFilter === 'all' 
    ? contests 
    : contests.filter(contest => contest.status === statusFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center"><FaTrophy className="text-blue-500 mr-2" /> Contests</h1>
          
          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Contests</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {filteredContests.map((contest) => (
            <div 
              key={contest.id} 
              className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:scale-[1.02]"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">{contest.title}</h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${contest.difficulty === 'Easy' ? 'bg-green-900/60 text-green-300 border border-green-600' : 
                      contest.difficulty === 'Medium' ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-600' : 
                      'bg-red-900/60 text-red-300 border border-red-600'}`}>
                    {contest.difficulty}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-300">
                    <FaCalendarAlt className="h-4 w-4 mr-2 text-blue-400" />
                    <span>{formatDate(contest.startTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-300">
                    <FaClock className="h-4 w-4 mr-2 text-blue-400" />
                    <span>Duration: {contest.duration}</span>
                  </div>
                  
                  {contest.status === 'completed' && (
                    <div className="flex items-center text-sm text-gray-300">
                      <FaUsers className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{contest.participants} participants</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  {contest.status === 'upcoming' ? (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors transform hover:scale-105 border border-blue-500/50">
                      Register
                    </button>
                  ) : (
                    <button className="w-full bg-gray-700/50 text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors border border-gray-600">
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contests;
