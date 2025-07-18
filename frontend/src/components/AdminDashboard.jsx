import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserShield, FaList, FaPlus, FaSort, FaSearch, FaFilter, FaTrash, FaPencilAlt, FaChartLine } from 'react-icons/fa';

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState('create');
  const [currentProblem, setCurrentProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('problems');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'Easy',
    category: 'Algorithm',
    description: '',
    constraints: '',
    functionName: '',
    functionSignature: '',
    testCases: [{ input: '', output: '' }]
  });
  
  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    // Apply filtering and sorting when problems, search term, or filters change
    let filtered = [...problems];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply difficulty filter
    if (filterDifficulty !== 'All') {
      filtered = filtered.filter(problem => problem.difficulty === filterDifficulty);
    }
    
    // Apply category filter
    if (filterCategory !== 'All') {
      filtered = filtered.filter(problem => problem.category === filterCategory);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredProblems(filtered);
  }, [problems, searchTerm, filterDifficulty, filterCategory, sortBy, sortOrder]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/problems');
      setProblems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch problems');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value
    };
    setFormData({
      ...formData,
      testCases: updatedTestCases
    });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: '', output: '' }]
    });
  };

  const removeTestCase = (index) => {
    const updatedTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      testCases: updatedTestCases
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      difficulty: 'Easy',
      category: 'Algorithm',
      description: '',
      constraints: '',
      functionName: '',
      functionSignature: '',
      testCases: [{ input: '', output: '' }]
    });
    setFormMode('create');
    setCurrentProblem(null);
  };

  const handleEditProblem = (problem) => {
    setCurrentProblem(problem);
    setFormData({
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description,
      constraints: problem.constraints,
      functionName: problem.functionName,
      functionSignature: problem.functionSignature,
      testCases: problem.testCases
    });
    setFormMode('edit');
  };

  const handleDeleteProblem = async (problemId, title) => {
    try {
      await axios.delete(`/api/problems/${problemId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProblems(problems.filter(problem => problem._id !== problemId));
      toast.success(`Problem "${title}" deleted successfully!`);
    } catch (err) {
      toast.error('Failed to delete problem: ' + (err.response?.data?.message || err.message));
      setError('Failed to delete problem');
    }
  };
  
  const confirmDelete = (problemId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      handleDeleteProblem(problemId, title);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (formMode === 'create') {
        const response = await axios.post('/api/problems', formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProblems([...problems, response.data]);
        resetForm();
        toast.success('Problem created successfully!');
        setActiveTab('problems');
      } else {
        const response = await axios.put(`/api/problems/${currentProblem._id}`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProblems(problems.map(p => p._id === currentProblem._id ? response.data : p));
        resetForm();
        toast.success('Problem updated successfully!');
        setActiveTab('problems');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      toast.error(`Failed to ${formMode} problem: ${errorMsg}`);
      setError(`Failed to ${formMode} problem: ${errorMsg}`);
    }
  };

  const handleCreateNew = () => {
    resetForm();
    setActiveTab('create');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center text-blue-400 text-sm">Loading</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto p-4 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-white flex items-center">
              <FaUserShield className="mr-2 text-blue-400" /> Admin Dashboard
            </h1>
            <Link to="/" className="bg-blue-600/80 hover:bg-blue-500/90 text-white px-4 py-2 rounded-lg transition duration-300 flex items-center backdrop-blur-sm shadow-lg hover:shadow-blue-500/20">
              Home
            </Link>
          </div>
          <div className="flex items-center space-x-3 bg-gray-800/50 backdrop-blur-sm p-3 rounded-lg border border-gray-700/50">
            <span className="text-blue-300 font-medium">Welcome, {user?.firstname || 'Admin'}</span>
            {user?.isAdmin && <span className="bg-blue-900/60 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-700/50">Admin</span>}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-900/50 backdrop-blur-sm border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 shadow-lg transform transition-all animate-pulse">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <ul className="flex flex-wrap text-sm font-medium text-center bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
          <li className="flex-1">
            <button
              onClick={() => setActiveTab('problems')}
              className={`inline-block w-full py-4 px-6 transition-all duration-300 ${activeTab === 'problems' 
                ? 'bg-blue-600/50 text-white font-bold' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
            >
              <div className="flex items-center justify-center">
                <FaList className="mr-2" />
                Problem List
              </div>
            </button>
          </li>
          <li className="flex-1">
            <button
              onClick={() => setActiveTab('create')}
              className={`inline-block w-full py-4 px-6 transition-all duration-300 ${activeTab === 'create' 
                ? 'bg-blue-600/50 text-white font-bold' 
                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'}`}
            >
              <div className="flex items-center justify-center">
                <FaPlus className="mr-2" />
                {formMode === 'create' ? 'Create Problem' : 'Edit Problem'}
              </div>
            </button>
          </li>
        </ul>
      </div>
      
      {/* Create/Edit Problem Form */}
      <div className={`mb-8 ${activeTab !== 'create' ? 'hidden' : ''}`}>
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
          {formMode === 'create' ? (
            <>
              <FaPlus className="mr-2 text-blue-400" /> Create New Problem
            </>
          ) : (
            <>
              <FaPencilAlt className="mr-2 text-blue-400" /> Edit Problem
            </>
          )}
        </h2>
        
        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg p-6 transition-all duration-300">
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="Algorithm">Algorithm</option>
              <option value="Data Structure">Data Structure</option>
              <option value="String">String</option>
              <option value="Math">Math</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              rows="6"
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Constraints</label>
            <textarea
              name="constraints"
              value={formData.constraints}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              rows="4"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Function Name</label>
            <input
              type="text"
              name="functionName"
              value={formData.functionName}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Function Signature</label>
            <input
              type="text"
              name="functionSignature"
              value={formData.functionSignature}
              onChange={handleInputChange}
              className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-blue-300 text-sm font-medium mb-2">Test Cases</label>
            {formData.testCases.map((testCase, index) => (
              <div key={index} className="mb-2 p-2 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Test Case #{index + 1}</span>
                  {formData.testCases.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors duration-300"
                    >
                      <FaTrash size={12} /> Remove
                    </button>
                  )}
                </div>
                
                <div className="mb-2">
                  <label className="block text-gray-700 text-sm mb-1">Input</label>
                  <textarea
                    value={testCase.input}
                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                    className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    rows="2"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm mb-1">Expected Output</label>
                  <textarea
                    value={testCase.output}
                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                    className="bg-gray-900/70 shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-2 px-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    rows="2"
                    required
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addTestCase}
              className="mt-2 bg-blue-600/70 hover:bg-blue-500/90 text-white font-bold py-1 px-3 rounded-lg flex items-center gap-1 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-blue-500/20"
            >
              <FaPlus size={12} /> Add Test Case
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              className="bg-blue-600/70 hover:bg-blue-500/90 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-blue-500/20 hover:translate-y-[-2px]"
            >
              {formMode === 'create' ? <><FaPlus /> Create Problem</> : <><FaPencilAlt /> Update Problem</>}
            </button>
            
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-700/70 hover:bg-gray-600/90 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-gray-500/20"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Problem List */}
      <div className={`${activeTab !== 'problems' ? 'hidden' : ''}`}>
        <div className="mb-6 p-4 flex flex-wrap gap-4 items-end bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-blue-300 mb-2 flex items-center gap-1">
              <FaSearch size={14} /> Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full px-3 py-2 bg-gray-900/70 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2 flex items-center gap-1">
              <FaFilter size={14} /> Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="px-3 py-2 bg-gray-900/70 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-300 mb-2 flex items-center gap-1">
              <FaFilter size={14} /> Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-900/70 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            >
              <option value="All">All</option>
              <option value="Algorithm">Algorithm</option>
              <option value="Data Structure">Data Structure</option>
              <option value="String">String</option>
              <option value="Math">Math</option>
              <option value="Dynamic Programming">Dynamic Programming</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <button
            onClick={handleCreateNew}
            className="bg-blue-600/70 hover:bg-blue-500/90 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 ml-auto flex items-center gap-2 shadow-lg backdrop-blur-sm hover:shadow-blue-500/20 hover:translate-y-[-2px]"
          >
            <FaPlus /> Create New Problem
          </button>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 shadow-lg rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900/50">
                <tr>
                  <th 
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 group"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Title
                      <FaSort className="ml-1 opacity-50 group-hover:opacity-100" />
                      {sortBy === 'title' && (
                        <span className="ml-2 text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 group"
                    onClick={() => handleSort('difficulty')}
                  >
                    <div className="flex items-center">
                      Difficulty
                      <FaSort className="ml-1 opacity-50 group-hover:opacity-100" />
                      {sortBy === 'difficulty' && (
                        <span className="ml-2 text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700/50 transition-colors duration-200 group"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      <FaSort className="ml-1 opacity-50 group-hover:opacity-100" />
                      {sortBy === 'category' && (
                        <span className="ml-2 text-blue-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProblems.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-300">
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
                          <span className="ml-3">Loading problems...</span>
                        </div>
                      ) : 'No problems found matching the criteria.'}
                    </td>
                  </tr>
                ) : (
                  filteredProblems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-700/30 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{problem.title}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{problem.description.substring(0, 80)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          problem.difficulty === 'Easy' ? 'bg-green-900/50 text-green-300 border border-green-500/30' : 
                          problem.difficulty === 'Medium' ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30' : 
                          'bg-red-900/50 text-red-300 border border-red-500/30'
                        } backdrop-blur-sm shadow-sm`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/50 text-blue-300 border border-blue-500/30 backdrop-blur-sm shadow-sm">
                          {problem.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              handleEditProblem(problem);
                              setActiveTab('create');
                            }}
                            className="bg-blue-600/40 hover:bg-blue-500/60 text-white py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                          >
                            <FaPencilAlt size={12} /> Edit
                          </button>
                          <button
                            onClick={() => confirmDelete(problem._id, problem.title)}
                            className="bg-red-600/40 hover:bg-red-500/60 text-white py-1 px-3 rounded-lg transition-all duration-300 flex items-center gap-1"
                          >
                            <FaTrash size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
