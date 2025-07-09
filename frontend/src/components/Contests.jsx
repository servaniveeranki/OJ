import { useState } from 'react';
import Header from './Header';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Contests</h1>
          
          <div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Contests</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {/* Contests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.map((contest) => (
            <div 
              key={contest.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">{contest.title}</h2>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                    ${contest.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                      contest.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {contest.difficulty}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(contest.startTime)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Duration: {contest.duration}</span>
                  </div>
                  
                  {contest.status === 'completed' && (
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>{contest.participants} participants</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  {contest.status === 'upcoming' ? (
                    <button className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
                      Register
                    </button>
                  ) : (
                    <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
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
