import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import Header from './Header';
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaCode, FaChevronDown } from 'react-icons/fa';

const ProblemList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [categories, setCategories] = useState([]);

  // Fetch all problems
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/problems');
        console.log("RESPONSE:",response);
        setProblems(response.data);
        
        // Extract unique categories for filtering
        const uniqueCategories = [...new Set(response.data.map(problem => problem.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Failed to load problems');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Handle sort toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter and sort problems
  const filteredAndSortedProblems = problems
    .filter(problem => 
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDifficulty === '' || problem.difficulty === filterDifficulty) &&
      (filterCategory === '' || problem.category === filterCategory)
    )
    .sort((a, b) => {
      if (sortField === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortField === 'difficulty') {
        const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        return sortDirection === 'asc'
          ? difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          : difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
      }
      return 0;
    });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterDifficulty('');
    setFilterCategory('');
    setSortField('title');
    setSortDirection('asc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-900/50 backdrop-blur-sm border border-red-700 text-red-100 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm shadow-xl rounded-xl p-6 border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
            <FaCode className="text-blue-500 mr-2" />
            Coding Problems
          </h1>
          
          {/* Search and Filter */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search problems..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="pl-10 w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="pl-10 w-full bg-gray-900/50 border border-gray-600 text-white rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={resetFilters}
              className="bg-gray-700/50 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-all border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset Filters
            </button>
          </div>
          
          {/* Problems Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/70">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Problem
                      {sortField === 'title' && (
                        sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('difficulty')}
                  >
                    <div className="flex items-center">
                      Difficulty
                      {sortField === 'difficulty' && (
                        sortDirection === 'asc' ? <FaSortAmountUp className="ml-1" /> : <FaSortAmountDown className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAndSortedProblems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-300">
                      No problems found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedProblems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{problem.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${problem.difficulty === 'Easy' ? 'bg-green-900/60 text-green-300 border border-green-600' : 
                            problem.difficulty === 'Medium' ? 'bg-yellow-900/60 text-yellow-300 border border-yellow-600' : 
                            'bg-red-900/60 text-red-300 border border-red-600'}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{problem.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link 
                          to={`/problems/${problem._id}`} 
                          className="text-blue-400 hover:text-blue-300 bg-blue-900/40 hover:bg-blue-800/60 px-4 py-2 rounded-lg transition-colors border border-blue-700/50"
                        >
                          Solve
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Stats */}
          <div className="mt-6 flex justify-between text-sm text-gray-300">
            <div>
              Showing {filteredAndSortedProblems.length} of {problems.length} problems
            </div>
            <div>
              <span className="inline-block mr-3">
                <span className="w-3 h-3 inline-block bg-green-500 rounded-full mr-1"></span> Easy: {problems.filter(p => p.difficulty === 'Easy').length}
              </span>
              <span className="inline-block mr-3">
                <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full mr-1"></span> Medium: {problems.filter(p => p.difficulty === 'Medium').length}
              </span>
              <span className="inline-block">
                <span className="w-3 h-3 inline-block bg-red-500 rounded-full mr-1"></span> Hard: {problems.filter(p => p.difficulty === 'Hard').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemList;