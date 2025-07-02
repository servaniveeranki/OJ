import { useState } from 'react';
import Header from './Header';

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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Leaderboard</h1>
          
          <div>
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all-time">All Time</option>
              <option value="monthly">This Month</option>
              <option value="weekly">This Week</option>
              <option value="daily">Today</option>
            </select>
          </div>
        </div>
        
        {/* Leaderboard Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problems Solved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contests</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center">
                      {user.rank <= 3 ? (
                        <span className={`mr-2 text-lg 
                          ${user.rank === 1 ? 'text-yellow-500' : 
                            user.rank === 2 ? 'text-gray-400' : 
                            'text-amber-700'}`}>
                          {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                        </span>
                      ) : null}
                      <span className={user.rank <= 3 ? 'font-bold' : ''}>{user.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{user.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.problemsSolved}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.contests}</td>
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
