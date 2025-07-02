import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Problems from './components/Problems';
import Contests from './components/Contests';
import Leaderboard from './components/Leaderboard';
import Homepage from './components/Homepage';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/problems" 
            element={
              <ProtectedRoute>
                <Problems />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contests" 
            element={
              <ProtectedRoute>
                <Contests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
