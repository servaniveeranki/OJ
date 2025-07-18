import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Problems from './components/Problems';
import ProblemDetail from './components/ProblemDetail';
import Contests from './components/Contests';
import Leaderboard from './components/Leaderboard';
import Homepage from './components/Homepage';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './components/AdminDashboard';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/codezen" 
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
            path="/problems/:id" 
            element={
              <ProtectedRoute>
                <ProblemDetail />
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
          <Route path="/dashboard" element={<LandingPage />} />
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route path="/unauthorized" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Unauthorized Access</h1><p className="mt-4">You don't have permission to access this page.</p></div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
