import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import AuthContext from '../context/AuthContext';
import axios from '../api/axios';

// Code editor components
import MonacoEditor from '@monaco-editor/react';
import { FaPlay, FaCheck, FaSave, FaUndo, FaRedo, FaExpandAlt, FaCompressAlt, FaTrophy, FaClock, FaCode } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProblemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [editorTheme, setEditorTheme] = useState('vs-dark');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [savedCode, setSavedCode] = useState('');
  const [fontSize, setFontSize] = useState(14);
  const [customInput, setCustomInput] = useState('');
  const [customOutput, setCustomOutput] = useState(null);
  const [runningCustom, setRunningCustom] = useState(false);
  const [activeTab, setActiveTab] = useState('testcases');
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [executionStats, setExecutionStats] = useState({
    time: 0,
    memory: 0,
    passed: 0,
    total: 0
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [solutionTime, setSolutionTime] = useState(0);
  const editorRef = useRef(null);

  // Language options
  const languages = [
    { value: 'cpp', label: 'C++', editorLanguage: 'cpp' },
    { value: 'java', label: 'Java', editorLanguage: 'java' },
    { value: 'python', label: 'Python', editorLanguage: 'python' }
  ];

  // Fetch problem details
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/problems/${id}`);
        setProblem(response.data);
        // Set initial code based on the selected language
        setCode(response.data.sampleCode[language]);
      } catch (err) {
        setError('Failed to load problem details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  // Update code when language changes
  useEffect(() => {
    if (problem && problem.sampleCode) {
      // Check if there's saved code in localStorage
      const savedCode = localStorage.getItem(`code-${id}-${language}`);
      if (savedCode) {
        setCode(savedCode);
      } else if (problem.sampleCode[language]) {
        setCode(problem.sampleCode[language]);
      }
      
      // Reset active test case when problem changes
      setActiveTestCase(0);
      setConsoleOutput('');
      setExecutionStats({
        time: 0,
        memory: 0,
        passed: 0,
        total: problem.testCases ? problem.testCases.filter(tc => !tc.isHidden).length : 0
      });
    }
  }, [language, problem, id]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCode();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      formatCode();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      handleSubmit();
    });
  };
  
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
      toast.info('Code formatted');
    }
  };
  
  const saveCode = () => {
    setSavedCode(code);
    // Store in localStorage with problem ID to persist between sessions
    localStorage.setItem(`code-${id}-${language}`, code);
    toast.success('Code saved');
  };
  
  const resetCode = () => {
    if (problem && problem.sampleCode && problem.sampleCode[language]) {
      setCode(problem.sampleCode[language]);
      toast.info('Code reset to default template');
    }
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setResult(null);
    toast.info('Submitting solution...');
    const startTime = Date.now();

    try {
      // Submit the solution to be judged against all test cases
      const response = await axios.post(`/api/problems/${id}/submit`, {
        code,
        language,
        userId: user?._id || 'anonymous' // Fallback to anonymous if user context is not available
      });
      
      setResult(response.data);
      const submissionTime = Date.now() - startTime;
      setSolutionTime(submissionTime);
      
      if (response.data.status === 'Accepted') {
        // Save the successful code
        localStorage.setItem(`accepted-code-${id}-${language}`, code);
        
        // Show success dialog instead of toast
        setShowSuccessDialog(true);
        
        // Track successful submission in user stats
        if (user?._id) {
          try {
            await axios.post('/api/users/track-submission', {
              userId: user._id,
              problemId: id,
              status: 'Accepted'
            });
          } catch (statsErr) {
            console.error('Failed to update user stats:', statsErr);
            // Don't show error to user as this is non-critical
          }
        }
      } else if (response.data.status === 'Compilation Error') {
        toast.error('❌ Compilation error in your solution!');
      } else if (response.data.status === 'Runtime Error') {
        toast.error('❌ Runtime error in your solution!');
      } else {
        toast.warning('⚠ Solution not accepted. Some test cases failed.');
      }
    } catch (err) {
      setError('Failed to submit solution');
      toast.error('Failed to submit: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunCode = async () => {
    setRunning(true);
    setResult(null);
    setConsoleOutput('');
    setIsConsoleOpen(true);
  
    const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);
    const problemID = problem._id;
    let passedCount = 0;
  
    try {
      const startTime = Date.now();
  
      const response = await axios.post(`/api/problems/run-test`, {
        code,
        language,
        problem: {
          ...problem,
          testCases: visibleTestCases // Only send visible test cases
        }
      });
  
      const testResults = response.data.results || [];
  
      const consoleLines = testResults.map((result, index) => {
        if (result.passed) passedCount++;
  
        return `Test Case ${index + 1}: ${result.passed ? 'Accepted' : 'Wrong Answer'}
  Input: ${result.input}
  Expected: ${result.expected}
  Got: ${result.output || 'N/A'}
  ${result.error ? `Error: ${result.error}` : ''}`;
      });
  
      setConsoleOutput(consoleLines.join('\n\n'));
  
      const executionTime = Date.now() - startTime;
  
      setExecutionStats({
        time: executionTime,
        memory: Math.floor(Math.random() * 10000), // simulate memory
        passed: passedCount,
        total: visibleTestCases.length
      });
  
      const finalStatus = passedCount === visibleTestCases.length ? 'Accepted' : 'Wrong Answer';
  
      setResult({
        status: finalStatus,
        testResults,
        executionTime
      });
  
      if (finalStatus === 'Accepted') {
        toast.success(`✅ All ${passedCount} test cases passed!`);
      } else {
        toast.warning(`⚠ ${passedCount}/${visibleTestCases.length} test cases passed.`);
      }
  
    } catch (err) {
      setError('Failed to run code');
      toast.error('Failed to run code: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setRunning(false);
    }
  };
  


const handleRunCustomInput = async () => {
  setRunningCustom(true);
  setCustomOutput(null);
  toast.info('🔄 Running code with custom input...');


    try {
      const response = await axios.post('/api/problems/run-custom', {
        code,
        language,
        input: customInput,
        problemId: id // Include the problem ID from URL params
      });
      
      setCustomOutput({
        status: response.data.status,
        output: response.data.output,
        error: response.data.error,
        executionTime: response.data.executionTime
      });
      
      if (response.data.status === 'Success') {
        toast.success('✅ Code executed successfully!');
      } else if (response.data.status === 'Compilation Error') {
        toast.error('❌ Compilation error!');
      } else if (response.data.status === 'Runtime Error') {
        toast.error('❌ Runtime error!');
      } else if (response.data.error) {
        toast.error(`❌ Execution error: ${response.data.error}`);
      }
    } catch (err) {
      setCustomOutput({
        status: 'Error',
        error: err.response?.data?.message || 'Failed to run code with custom input'
      });
      toast.error('Failed to run code: ' + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setRunningCustom(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || 'Problem not found'}
          </div>
        </div>
      </div>
    );
  }

  // Function to display user stats
  const renderUserStats = () => {
    if (!user) return null;
    
    return (
      <div className="bg-indigo-50 p-3 rounded-lg mb-4 flex justify-between items-center">
        <div>
          <span className="font-medium text-indigo-800">Your Stats:</span>
          <span className="ml-2 text-sm text-indigo-600">
            {user.problemsSolved || 0} Problems Solved
          </span>
        </div>
        <div>
          <span className="text-sm text-indigo-600">
            {user.totalSubmissions || 0} Total Submissions
          </span>
        </div>
      </div>
    );
  };

  // Success Dialog Component
  const SuccessDialog = () => {
    if (!showSuccessDialog) return null;
    
    // Format solution time
    const formatTime = (ms) => {
      if (ms < 1000) return `${ms}ms`;
      const seconds = Math.floor(ms / 1000);
      const remainingMs = ms % 1000;
      return `${seconds}.${remainingMs}s`;
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full mx-4 transform transition-all animate-fade-in-up">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <FaTrophy className="h-10 w-10 text-green-600" />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Solution Accepted!</h3>
            <p className="text-lg text-gray-600 mb-6">Congratulations! All test cases passed successfully.</p>
            
            <div className="flex flex-col space-y-4 mb-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaClock className="text-indigo-500 mr-3" />
                  <span className="text-gray-700 font-medium">Time to Solve:</span>
                </div>
                <span className="text-xl font-bold text-indigo-600">{formatTime(solutionTime)}</span>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FaCode className="text-indigo-500 mr-3" />
                  <span className="text-gray-700 font-medium">Language:</span>
                </div>
                <span className="text-xl font-bold text-indigo-600">
                  {languages.find(lang => lang.value === language)?.label || language}
                </span>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowSuccessDialog(false)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                Continue Coding
              </button>
              <button
                onClick={() => navigate('/problems')}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                Back to Problems
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SuccessDialog />
      
      <div className="container mx-auto px-4 py-8">
        {user && renderUserStats()}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Description */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.title}</h1>
            
            <div className="flex items-center mb-4">
              <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                ${problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : 
                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'}`}>
                {problem.difficulty}
              </span>
              <span className="ml-2 text-sm text-gray-500">{problem.category}</span>
            </div>
            
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: problem.description }} />
            </div>
            
            {problem.constraints && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Constraints:</h2>
                <div className="bg-gray-50 p-3 rounded">
                  <pre className="whitespace-pre-wrap">{problem.constraints}</pre>
                </div>
              </div>
            )}
            
            {problem.testCases && problem.testCases.some(tc => !tc.isHidden) && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Examples:</h2>
                {problem.testCases
                  .filter(tc => !tc.isHidden)
                  .map((testCase, index) => (
                    <div key={index} className="mb-4 bg-gray-50 p-3 rounded">
                      <div className="mb-2">
                        <span className="font-medium">Input:</span>
                        <pre className="mt-1 bg-gray-100 p-2 rounded">{testCase.input}</pre>
                      </div>
                      <div>
                        <span className="font-medium">Output:</span>
                        <pre className="mt-1 bg-gray-100 p-2 rounded">{testCase.output}</pre>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Code Editor */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language:</label>
                <select
                  id="language"
                  value={language}
                  onChange={handleLanguageChange}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme:</label>
                <select
                  id="theme"
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
            </div>
            
            <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : 'h-96'} border border-gray-300 rounded-md overflow-hidden`}>
              <div className="bg-gray-100 p-2 flex items-center justify-between border-b border-gray-300">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={resetCode}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                    title="Reset to default code"
                  >
                    <FaUndo size={16} />
                  </button>
                  <button 
                    onClick={saveCode}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                    title="Save code (Ctrl+S)"
                  >
                    <FaSave size={16} />
                  </button>
                  <button 
                    onClick={formatCode}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                    title="Format code (Ctrl+F)"
                  >
                    <FaRedo size={16} />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <label htmlFor="fontSize" className="text-sm text-gray-600">Font Size:</label>
                  <input
                    id="fontSize"
                    type="number"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-12 p-1 text-sm border border-gray-300 rounded"
                  />
                  <button 
                    onClick={toggleFullScreen}
                    className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                    title="Toggle fullscreen"
                  >
                    {isFullScreen ? <FaCompressAlt size={16} /> : <FaExpandAlt size={16} />}
                  </button>
                </div>
              </div>
              <MonacoEditor
                height={isFullScreen ? "calc(100% - 40px)" : "calc(100% - 40px)"}
                language={languages.find(lang => lang.value === language).editorLanguage}
                theme={editorTheme}
                value={code}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: fontSize,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true
                }}
              />
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              <div className="text-xs text-gray-500 flex items-center mr-auto">
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded mr-1">Ctrl+Enter</kbd> Run Code
                <span className="mx-2">|</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded mr-1">Ctrl+Shift+Enter</kbd> Submit
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
              >
                <FaCheck className="mr-2" size={14} />
                {submitting && result === null ? 'Submitting...' : 'Submit Solution'}
              </button>
            </div>
            
            {/* Test Cases / Custom Input Tabs */}
            <div className="mt-4">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex">
                  <button
                    onClick={() => setActiveTab('testcases')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'testcases' 
                      ? 'border-b-2 border-indigo-500 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => setActiveTab('custom')}
                    className={`py-2 px-4 text-sm font-medium ${activeTab === 'custom' 
                      ? 'border-b-2 border-indigo-500 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Custom Input
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="mt-4">
                {activeTab === 'testcases' ? (
                  /* Test Cases Tab */
                  <div>
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleRunCode}
                        disabled={submitting}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
                      >
                        <FaPlay className="mr-2" size={14} />
                        {running ? 'Running...' : 'Run Tests'}
                      </button>
                    </div>
                    
                    {/* Execution Stats */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Time:</span>{' '}
                        <span className="font-medium">{executionStats.time}ms</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Memory:</span>{' '}
                        <span className="font-medium">{(executionStats.memory / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Test Cases:</span>{' '}
                        <span className="font-medium">
                          {executionStats.passed}/{executionStats.total} passed
                        </span>
                      </div>
                    </div>

                    {/* Test Case Tabs */}
                    <div className="flex space-x-2 mb-4 overflow-x-auto">
                      {problem.testCases
                        .filter(tc => !tc.isHidden)
                        .map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveTestCase(index)}
                            className={`px-3 py-1 text-sm rounded-md ${
                              activeTestCase === index
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            Case {index + 1}
                          </button>
                        ))}
                    </div>

                    {/* Test Case Details */}
                    {problem.testCases.filter(tc => !tc.isHidden).length > 0 && (
  <div className="mb-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">Input</h4>
        <div className="bg-gray-800 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
          {(() => {
            const testCase = problem.testCases.filter(tc => !tc.isHidden)[activeTestCase];
            if (!testCase) return 'No input';
            try {
              // Try to parse if it's a JSON string, otherwise display as is
              const input = typeof testCase.input === 'string' 
                ? JSON.parse(testCase.input) 
                : testCase.input;
              return JSON.stringify(input, null, 2);
            } catch (e) {
              return String(testCase.input);
            }
          })()}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">Expected Output</h4>
        <div className="bg-gray-800 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
          {(() => {
            const testCase = problem.testCases.filter(tc => !tc.isHidden)[activeTestCase];
            if (!testCase) return 'No output';
            try {
              // Try to parse if it's a JSON string, otherwise display as is
              const output = typeof testCase.output === 'string' 
                ? JSON.parse(testCase.output) 
                : testCase.output;
              return JSON.stringify(output, null, 2);
            } catch (e) {
              return String(testCase.output);
            }
          })()}
        </div>
      </div>
    </div>
  </div>
)}

                    {/* Console Output */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Console</h4>
                        <button 
                          onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {isConsoleOpen ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {isConsoleOpen && (
                        <div className="bg-gray-900 text-green-400 p-3 rounded-md font-mono text-sm h-40 overflow-y-auto whitespace-pre-wrap">
                          {consoleOutput || 'Run your code to see output here...'}
                        </div>
                      )}
                    </div>

                    {/* Results Summary */}
                    {result && (
                      <div className={`mt-4 p-4 rounded-md ${
                        result.status === 'Accepted' ? 'bg-green-50 border border-green-200' :
                        result.status === 'Compilation Error' ? 'bg-red-50 border border-red-200' :
                        'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <h3 className={`text-lg font-semibold ${
                          result.status === 'Accepted' ? 'text-green-700' :
                          result.status === 'Compilation Error' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {result.status}
                        </h3>
                        
                        {result.executionTime > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Execution Time: {result.executionTime.toFixed(2)} ms
                          </p>
                        )}
                        
                        {result.error && (
                          <div className="mt-2 p-2 bg-red-50 rounded">
                            <pre className="text-red-700 text-sm whitespace-pre-wrap">{result.error}</pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Custom Input Tab */
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input:</label>
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter your custom input here..."
                        className="w-full h-32 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                    
                    <div className="flex justify-end mb-4">
                      <button
                        onClick={handleRunCustomInput}
                        disabled={runningCustom}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
                      >
                        <FaPlay className="mr-2" size={14} />
                        {runningCustom ? 'Running...' : 'Run with Custom Input'}
                      </button>
                    </div>
                    
                    {/* Custom Output */}
                    {customOutput && (
                      <div className={`p-4 rounded-md ${
                        customOutput.status === 'Success' ? 'bg-green-50 border border-green-200' :
                        customOutput.status === 'Compilation Error' ? 'bg-red-50 border border-red-200' :
                        'bg-yellow-50 border border-yellow-200'
                      }`}>
                        <h3 className={`text-lg font-semibold ${
                          customOutput.status === 'Success' ? 'text-green-700' :
                          customOutput.status === 'Compilation Error' ? 'text-red-700' :
                          'text-yellow-700'
                        }`}>
                          {customOutput.status}
                        </h3>
                        
                        {customOutput.executionTime > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Execution Time: {customOutput.executionTime.toFixed(2)} ms
                          </p>
                        )}
                        
                        {customOutput.error && (
                          <div className="mt-3">
                            <h4 className="font-medium text-red-700 mb-1">Error:</h4>
                            <pre className="bg-red-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                              {customOutput.error}
                            </pre>
                          </div>
                        )}
                        
                        {customOutput.output && (
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-700 mb-1">Output:</h4>
                            <pre className="bg-gray-50 p-2 rounded text-sm font-mono whitespace-pre-wrap">
                              {customOutput.output}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;