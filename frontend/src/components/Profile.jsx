import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component simply redirects to the Dashboard component
// We keep this for backward compatibility with any existing routes
const Profile = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Redirect to dashboard which now contains the profile information
  return <Navigate to="/dashboard" replace />;
};

export default Profile;
