import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import * as jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decodedToken = jwt_decode.jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decodedToken.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Valid token, fetch user data
            await fetchUserData(token);
          }
        } catch (error) {
          console.error("Invalid token", error);
          logout();
        }
      }
      setLoading(false);
    };
    
    checkAuthStatus();
  }, []);
  
  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user data", error);
      logout();
      throw error;
    }
  };
  
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/auth/register`,
        userData
      );
      
      const { token, user, message } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await axios.post(
        `${API_URL}/auth/login`,
        credentials
      );
      
      const { token, user, message } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      
      return { success: true, message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");
      
      const response = await axios.put(
        `${API_URL}/auth/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setUser(response.data.user);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const changePassword = async (passwordData) => {
    try {
      setError(null);
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) throw new Error("Not authenticated");
      
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to change password";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };
  
  const clearError = () => {
    setError(null);
  };
  
  const token = localStorage.getItem('token');

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
