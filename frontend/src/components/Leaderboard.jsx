import { useState } from 'react';
import Header from './Header';
import { FaTrophy, FaAward, FaMedal, FaCrown } from 'react-icons/fa';

const Leaderboard = () => {
  // Sample leaderboard data - in a real app, this would come from an API
  const [users, setUsers] = useState([
    { id: 1, username: 'codemaster', rank: 1, score: 9850, problemsSolved: 142, contests: 15 },
    { id: 2, username: 'algorithmguru', rank: 2, score: 9720, problemsSolved: 138, contests: 14 },
    { id: 3, username: 'devninja', rank: 3, score: 9510, problemsSolved: 135, contests: 13 },
    { id: 4, username: 'bytewizard', rank: 4, score: 9350, problemsSolved: 130, contests: 12 },
    { id: 5, username: 'codehacker', rank: 5, score: 9200, problemsSolved: 128, contests: 14 },
    { id: 6, username: 'pythonista', rank: 6, score: 8950, problemsSolved: 125, contests: 10 },
    { id: 7, username: 'javascripter', rank: 7, score: 8800, problemsSolved: 122, contests: 11 },
    { id: 8, username: 'datastructurer', rank: 8, score: 8650, problemsSolved: 120, contests: 9 },
    { id: 9, username: 'algopro', rank: 9, score: 8500, problemsSolved: 118, contests: 10 },
    { id: 10, username: 'codeartist', rank: 10, score: 8350, problemsSolved: 115, contests: 8 },
  ]);

  // Filter state
  const [timeFilter, setTimeFilter] = useState('all-time');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center"><FaTrophy className="text-yellow-500 mr-2" /> Leaderboard</h1>
          
          <div>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-gray-900/50 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all-time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
              <option value="daily">Today</option>
            </select>
          </div>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-xl rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Problems Solved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      {user.rank <= 3 ? (
                        <span className={`mr-2 text-lg 
                          ${user.rank === 1 ? 'text-yellow-500' : 
                            user.rank === 2 ? 'text-gray-400' : 
                            'text-amber-700'}`}>
                          {user.rank === 1 ? <FaCrown className="text-yellow-500" /> : user.rank === 2 ? <FaMedal className="text-gray-400" /> : <FaMedal className="text-amber-700" />}
                        </span>
                      ) : null}
                      <span className={user.rank <= 3 ? 'font-bold' : ''}>{user.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">{user.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.problemsSolved}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.contests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
