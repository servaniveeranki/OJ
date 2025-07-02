import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { FaUser, FaKey, FaSignOutAlt, FaChartBar } from 'react-icons/fa';

const Header = () => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Website Logo/Name */}
        <Link to="/dashboard" className="text-2xl font-bold">CodeZen</Link>
        
        {/* Navigation Links */}
        <nav className="hidden md:flex space-x-6">
          <Link to="/problems" className="hover:text-indigo-200 transition-colors">Problems</Link>
          <Link to="/contests" className="hover:text-indigo-200 transition-colors">Contests</Link>
          <Link to="/leaderboard" className="hover:text-indigo-200 transition-colors">Leaderboard</Link>
        </nav>
        
        {/* User Avatar and Dropdown */}
        {user && (
          <div className="relative">
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 focus:outline-none"
              aria-label="User menu"
              aria-expanded={showDropdown}
            >
              <div className="h-8 w-8 rounded-full bg-white text-indigo-600 flex items-center justify-center text-sm font-bold overflow-hidden">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.firstname?.charAt(0).toUpperCase() + user.lastname?.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden md:inline">{user.firstname}</span>
            </button>
            
            {/* Enhanced Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-10 text-gray-800">
                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.firstname} {user.lastname}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                
                {/* Profile Link */}
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <FaUser className="mr-2 text-indigo-600" />
                  My Profile
                </Link>
                
    
                
                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>
                
                {/* Logout Button */}
                <button 
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }} 
                  className="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                >
                  <FaSignOutAlt className="mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Mobile Menu Button - Can be expanded in the future */}
        <button className="md:hidden text-white focus:outline-none">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;
