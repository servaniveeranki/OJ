import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaKey, FaEnvelope, FaCalendarAlt, FaUserEdit, FaCheck, FaTrophy, FaMedal, FaStar, 
         FaCode, FaGraduationCap, FaLightbulb, FaGem, FaAward } from 'react-icons/fa';
import Header from './Header';

const Profile = () => {
  const { user, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  
  // Form state
  const [profileData, setProfileData] = useState({
    firstname: '',
    lastname: '',
    profilePicture: '',
    bio: ''
  });
  
  // Badges state (example data - would normally come from API)
  const [badges, setBadges] = useState([
    { id: 1, name: 'Problem Solver', icon: <FaCode />, description: 'Solved 10 problems', earned: true, color: 'blue' },
    { id: 2, name: 'Quick Thinker', icon: <FaLightbulb />, description: 'Solved a hard problem in under 10 minutes', earned: true, color: 'yellow' },
    { id: 3, name: 'Consistent Coder', icon: <FaCalendarAlt />, description: '7-day coding streak', earned: true, color: 'green' },
    { id: 4, name: 'Algorithm Master', icon: <FaGraduationCap />, description: 'Completed all algorithm challenges', earned: false, color: 'purple' },
    { id: 5, name: 'Contest Winner', icon: <FaTrophy />, description: 'Won a coding contest', earned: false, color: 'gold' },
    { id: 6, name: 'Bug Crusher', icon: <FaAward />, description: 'Fixed 5 critical bugs', earned: true, color: 'red' }
  ]);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setProfileData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        profilePicture: user.profilePicture || '',
        bio: user.bio || ''
      });
    }
  }, [user, loading, navigate]);
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateProfileForm = () => {
    const errors = {};
    if (!profileData.firstname.trim()) {
      errors.firstname = 'First name is required';
    }
    if (!profileData.lastname.trim()) {
      errors.lastname = 'Last name is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    
    try {
      // Call the updateProfile function from AuthContext
      const result = await updateProfile(profileData);
      
      if (result.success) {
        setSuccessMessage('Profile updated successfully');
        setEditMode(false);
        setError('');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };
  
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;
    
    try {
      // Simulating API call - replace with actual API call
      // await updatePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccessMessage('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl animate-pulse-slow animation-delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full bg-indigo-500/15 blur-3xl animate-pulse-slow animation-delay-2000"></div>
      
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="backdrop-blur-xl bg-gray-800/70 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
            <div className="md:flex">
              {/* Sidebar */}
              <div className="md:w-1/3 bg-black/90 p-6 text-white">
                <div className="flex flex-col items-center mb-8">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 overflow-hidden">
                    <div className="h-full w-full rounded-full overflow-hidden bg-gray-900 flex items-center justify-center text-3xl font-bold text-blue-500">
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
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    {user.firstname} {user.lastname}
                  </h2>
                  <p className="text-blue-300 mt-1">{user.email}</p>
                </div>
                
                <nav className="mt-8 space-y-2">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-800 text-white'}`}
                  >
                    <FaUser className="mr-3" />
                    Profile Information
                  </button>
                  <button 
                    onClick={() => setActiveTab('badges')} 
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'badges' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-800 text-white'}`}
                  >
                    <FaMedal className="mr-3" />
                    Coding Badges
                  </button>
                  <button 
                    onClick={() => setActiveTab('security')} 
                    className={`flex items-center w-full px-4 py-3 rounded-lg transition-all ${activeTab === 'security' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-800 text-white'}`}
                  >
                    <FaKey className="mr-3" />
                    Security Settings
                  </button>
                </nav>

              </div>
              
              {/* Main Content */}
              <div className="md:w-2/3 bg-black/40 p-6 text-white">
                {successMessage && (
                  <div className="mb-4 bg-green-900/30 border border-green-500 p-4 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center">
                      <FaCheck className="text-green-400 mr-2" />
                      <p className="text-sm text-green-300">{successMessage}</p>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="mb-4 bg-red-900/30 border border-red-500 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}
                
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Profile Information</h2>
                      {!editMode && (
                        <button 
                          onClick={() => setEditMode(true)} 
                          className="flex items-center text-sm bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-4 py-2 rounded-lg transition-all border border-blue-500/30 hover:border-blue-400 backdrop-blur-sm hover:scale-105"
                        >
                          <FaUserEdit className="mr-2" />
                          Edit Profile
                        </button>
                      )}
                    </div>
                    
                    {editMode ? (
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div>
                          <label htmlFor="firstname" className="block text-sm font-medium text-blue-300">First Name</label>
                          <input
                            id="firstname"
                            name="firstname"
                            type="text"
                            value={profileData.firstname}
                            onChange={handleProfileChange}
                            className={`mt-1 block w-full px-3 py-2 bg-gray-800/50 border ${formErrors.firstname ? 'border-red-500' : 'border-blue-500/50'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white`}
                          />
                          {formErrors.firstname && <p className="mt-1 text-sm text-red-400">{formErrors.firstname}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="lastname" className="block text-sm font-medium text-blue-300">Last Name</label>
                          <input
                            id="lastname"
                            name="lastname"
                            type="text"
                            value={profileData.lastname}
                            onChange={handleProfileChange}
                            className={`mt-1 block w-full px-3 py-2 bg-gray-800/50 border ${formErrors.lastname ? 'border-red-500' : 'border-blue-500/50'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white`}
                          />
                          {formErrors.lastname && <p className="mt-1 text-sm text-red-400">{formErrors.lastname}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="profilePicture" className="block text-sm font-medium text-blue-300">Profile Picture URL (optional)</label>
                          <input
                            id="profilePicture"
                            name="profilePicture"
                            type="text"
                            value={profileData.profilePicture}
                            onChange={handleProfileChange}
                            placeholder="https://example.com/your-image.jpg"
                            className="mt-1 block w-full px-3 py-2 bg-gray-800/50 border border-blue-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-blue-300">Bio (optional)</label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows="3"
                            value={profileData.bio}
                            onChange={handleProfileChange}
                            placeholder="Tell us about yourself..."
                            className="mt-1 block w-full px-3 py-2 bg-gray-800/50 border border-blue-500/50 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white resize-none"
                          />
                        </div>
                        
                        <div className="flex space-x-4 pt-4">
                          <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 transition-all hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center"
                          >
                            <FaCheck className="mr-2" /> Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditMode(false);
                              setProfileData({
                                firstname: user.firstname || '',
                                lastname: user.lastname || '',
                                profilePicture: user.profilePicture || '',
                                bio: user.bio || ''
                              });
                            }}
                            className="bg-gray-800/70 hover:bg-gray-700/80 text-gray-300 font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500/30 focus:ring-offset-1 border border-gray-700 transition-all hover:border-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-blue-500/20 p-6 space-y-6">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-300">Name</p>
                          <p className="text-lg text-white">{user.firstname} {user.lastname}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-300">Email Address</p>
                          <p className="text-lg text-white flex items-center">
                            <FaEnvelope className="text-blue-400 mr-2" /> {user.email}
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-blue-300">Member Since</p>
                          <p className="text-lg text-white flex items-center">
                            <FaCalendarAlt className="text-blue-400 mr-2" /> {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {profileData.bio && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-blue-300">Bio</p>
                            <p className="text-lg text-gray-300">{profileData.bio}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'badges' && (
                  <div>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">Coding Badges</h2>
                      <p className="text-gray-300">Showcase your achievements and skills with these special badges.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {badges.map(badge => (
                        <div 
                          key={badge.id} 
                          className={`relative overflow-hidden rounded-lg p-4 border ${badge.earned ? 'bg-gray-800/60 border-blue-500/30' : 'bg-gray-900/60 border-gray-700/30'} backdrop-blur-sm transition-all hover:scale-[1.02] group`}
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-xl"></div>
                          <div className="flex items-start space-x-4">
                            <div className={`flex-shrink-0 rounded-full p-3 ${badge.earned ? `text-${badge.color === 'gold' ? 'yellow' : badge.color}-400 bg-${badge.color === 'gold' ? 'yellow' : badge.color}-500/20` : 'text-gray-400 bg-gray-700/30'}`}>
                              {badge.icon}
                            </div>
                            <div>
                              <h3 className={`font-semibold text-lg ${badge.earned ? 'text-white' : 'text-gray-400'}`}>{badge.name}</h3>
                              <p className={`text-sm ${badge.earned ? 'text-gray-300' : 'text-gray-500'}`}>{badge.description}</p>
                              <div className="mt-2">
                                {badge.earned ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                    <FaCheck className="mr-1" /> Earned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700/50 text-gray-400 border border-gray-600/50">
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Security Settings</h2>
                    </div>
                    
                    <form onSubmit={handlePasswordSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-xl border border-blue-500/20 p-6 space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-blue-300">Current Password</label>
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className={`mt-1 block w-full px-3 py-2 bg-gray-800/50 border ${formErrors.currentPassword ? 'border-red-500' : 'border-blue-500/50'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white`}
                        />
                        {formErrors.currentPassword && <p className="mt-1 text-sm text-red-400">{formErrors.currentPassword}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-blue-300">New Password</label>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className={`mt-1 block w-full px-3 py-2 bg-gray-800/50 border ${formErrors.newPassword ? 'border-red-500' : 'border-blue-500/50'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white`}
                        />
                        {formErrors.newPassword && <p className="mt-1 text-sm text-red-400">{formErrors.newPassword}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-300">Confirm New Password</label>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className={`mt-1 block w-full px-3 py-2 bg-gray-800/50 border ${formErrors.confirmPassword ? 'border-red-500' : 'border-blue-500/50'} rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm text-white`}
                        />
                        {formErrors.confirmPassword && <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>}
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 transition-all hover:scale-105 shadow-lg shadow-blue-500/20 flex items-center"
                        >
                          <FaKey className="mr-2" /> Update Password
                        </button>
                      </div>
                    </form>
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

export default Profile;
