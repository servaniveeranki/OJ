
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaLaptopCode, FaBrain, FaRocket, FaGraduationCap, FaSignInAlt, FaUserPlus, FaChevronDown, 
         FaTrophy, FaChartBar, FaUsers, FaServer, FaShieldAlt, FaCheckCircle, FaArrowRight, 
         FaJs, FaPython, FaJava, FaReact, FaTerminal, FaClock, FaCoffee, FaKeyboard } from 'react-icons/fa';
import { SiLeetcode, SiHackerrank, SiCodeforces, SiJavascript, SiCplusplus, SiPython, SiTypescript } from 'react-icons/si';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from './ParticleBackground';
import './LandingPage.css';

const HomePage = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleSection, setVisibleSection] = useState('');
  const [typedText, setTypedText] = useState('');
  const [counterAnimated, setCounterAnimated] = useState(false);
  
  // Refs for sections to observe
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const testimonialsRef = useRef(null);
  
  // Code examples for typing animation
  const codeExamples = [
    'function solve(n) { return n > 0 ? n + solve(n-1) : 0; }',
    'const binarySearch = (arr, target) => { let left = 0; let right = arr.length - 1; /* ... */ };',
    'class Solution { public int maxSubArray(int[] nums) { /* ... */ } }'
  ];
  const [currentCodeExample, setCurrentCodeExample] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      
      // Check which section is currently visible
      const scrollPosition = window.scrollY + window.innerHeight / 2;
      
      if (featuresRef.current && scrollPosition >= featuresRef.current.offsetTop) {
        setVisibleSection('features');
      }
      
      if (statsRef.current && scrollPosition >= statsRef.current.offsetTop) {
        setVisibleSection('stats');
        if (!counterAnimated) {
          setCounterAnimated(true);
        }
      }
      
      if (testimonialsRef.current && scrollPosition >= testimonialsRef.current.offsetTop) {
        setVisibleSection('testimonials');
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [counterAnimated]);
  
  // Typing animation effect
  useEffect(() => {
    const example = codeExamples[currentCodeExample];
    let charIndex = 0;
    let timer;
    
    const type = () => {
      if (charIndex < example.length) {
        setTypedText(example.substring(0, charIndex + 1));
        charIndex++;
        timer = setTimeout(type, Math.random() * 70 + 30);
      } else {
        // Move to next code example after a pause
        setTimeout(() => {
          setTypedText('');
          setCurrentCodeExample((prev) => (prev + 1) % codeExamples.length);
        }, 3000);
      }
    };
    
    timer = setTimeout(type, 1000);
    return () => clearTimeout(timer);
  }, [currentCodeExample]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-2 shadow-lg' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaCode className="text-3xl text-blue-500 mr-2" />
            <span className="text-2xl font-bold">CodeZen</span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
           
            <Link to="/problems" className="hover:text-blue-400 transition-colors">Problems</Link>
            <Link to="/contests" className="hover:text-blue-400 transition-colors">Contests</Link>
            <Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <FaUsers className="mr-1" /> Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-blue-400 transition-colors flex items-center"
                >
                  <FaSignInAlt className="mr-1" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                >
                  <FaUserPlus className="mr-1" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center">
        {/* Particle Background */}
        <ParticleBackground />
        
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
          
          {/* Code Snippets Background with Typing Effect */}
          <div className="absolute inset-0 opacity-10">
            <pre className="text-xs md:text-sm text-left overflow-hidden h-full code-cursor">
              {typedText}
            </pre>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Master <span className="text-blue-500 shine">Coding Challenges</span>, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">Elevate Your Skills</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 opacity-0 animate-fadeIn" style={{ animationDelay: '0.5s', animationDuration: '1s', animationFillMode: 'forwards' }}>
              Join our community of developers to practice, compete, and grow your programming expertise
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4 mt-12">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg pulse shine flex items-center justify-center gap-2 group"
                  >
                    <span>Go to Dashboard</span>
                    <FaArrowRight className="transform group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/problems"
                    className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group backdrop-blur-sm"
                  >
                    <span>Explore Problems</span>
                    <FaRocket className="transform group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg pulse shine flex items-center justify-center gap-2 group"
                  >
                    <span>Start Coding Now</span>
                    <FaKeyboard className="transform group-hover:translate-y-[-2px] transition-transform duration-300" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 group backdrop-blur-sm"
                  >
                    <span>Sign In</span>
                    <FaSignInAlt className="transform group-hover:translate-x-2 transition-transform duration-300" />
                  </Link>
                </>
              )}
            </div>
            
            {/* Floating programming language tags */}
            <div className="mt-16 flex justify-center gap-4 flex-wrap">
              <span className="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-gray-700 flex items-center gap-2 floating-tag tag-delay-1">
                <SiJavascript className="text-yellow-400" /> JavaScript
              </span>
              <span className="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-gray-700 flex items-center gap-2 floating-tag tag-delay-2">
                <SiPython className="text-blue-400" /> Python
              </span>
              <span className="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-gray-700 flex items-center gap-2 floating-tag tag-delay-3">
                <SiCplusplus className="text-blue-500" /> C++
              </span>
              <span className="bg-gray-800/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm border border-gray-700 flex items-center gap-2 floating-tag tag-delay-4">
                <SiTypescript className="text-blue-600" /> TypeScript
              </span>
            </div>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <FaChevronDown className="text-2xl text-gray-400" />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose <span className="text-blue-500">CodeZen</span>?</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Our platform offers everything you need to master coding skills and prepare for technical interviews</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center mb-6">
                <FaLaptopCode className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Interactive Coding Environment</h3>
              <p className="text-gray-300 mb-6">
                Write, compile, and execute code in 10+ programming languages with our powerful online IDE.
              </p>
              <Link to="/problems" className="text-blue-400 hover:text-blue-300 flex items-center">
                Try it now <FaArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-purple-600/20 text-purple-500 rounded-lg flex items-center justify-center mb-6">
                <FaBrain className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">1000+ Coding Problems</h3>
              <p className="text-gray-300 mb-6">
                Practice with our extensive library of problems across all difficulty levels and categories.
              </p>
              <Link to="/problems" className="text-blue-400 hover:text-blue-300 flex items-center">
                Browse problems <FaArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-green-600/20 text-green-500 rounded-lg flex items-center justify-center mb-6">
                <FaTrophy className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Weekly Coding Contests</h3>
              <p className="text-gray-300 mb-6">
                Participate in regular competitions to test your skills against other developers.
              </p>
              <Link to="/contests" className="text-blue-400 hover:text-blue-300 flex items-center">
                Join contests <FaArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-red-600/20 text-red-500 rounded-lg flex items-center justify-center mb-6">
                <FaChartBar className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Performance Analytics</h3>
              <p className="text-gray-300 mb-6">
                Track your progress with detailed statistics and visualizations of your coding journey.
              </p>
              <Link to="/codezen" className="text-blue-400 hover:text-blue-300 flex items-center">
                View dashboard <FaArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-yellow-600/20 text-yellow-500 rounded-lg flex items-center justify-center mb-6">
                <FaUsers className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Global Leaderboard</h3>
              <p className="text-gray-300 mb-6">
                Compete with coders worldwide and see where you stand in our global rankings.
              </p>
              <Link to="/leaderboard" className="text-blue-400 hover:text-blue-300 flex items-center">
                Check rankings <FaArrowRight className="ml-2" />
              </Link>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-700 feature-card glow">
              <div className="h-14 w-14 bg-indigo-600/20 text-indigo-500 rounded-lg flex items-center justify-center mb-6">
                <FaGraduationCap className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold mb-4">Interview Preparation</h3>
              <p className="text-gray-300 mb-6">
                Prepare for technical interviews with problems categorized by top tech companies.
              </p>
              <Link to="/problems" className="text-blue-400 hover:text-blue-300 flex items-center">
                Start preparing <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 gradient-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">CodeZen by the Numbers</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Join thousands of developers who trust our platform</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">1,000+</div>
              <div className="text-lg text-gray-300">Coding Problems</div>
            </div>
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">50K+</div>
              <div className="text-lg text-gray-300">Active Users</div>
            </div>
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">10M+</div>
              <div className="text-lg text-gray-300">Code Submissions</div>
            </div>
            <div className="text-center counter">
              <div className="text-4xl md:text-5xl font-bold text-blue-400 mb-2">200+</div>
              <div className="text-lg text-gray-300">Weekly Contests</div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Supported Languages</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Practice in your preferred programming language</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 max-w-4xl mx-auto">
            <div className="text-center">
              <FaPython className="text-5xl md:text-6xl text-blue-400 mx-auto mb-4" />
              <div className="text-lg">Python</div>
            </div>
            <div className="text-center">
              <FaJava className="text-5xl md:text-6xl text-orange-500 mx-auto mb-4" />
              <div className="text-lg">Java</div>
            </div>
            <div className="text-center">
              <FaTerminal className="text-5xl md:text-6xl text-blue-600 mx-auto mb-4" />
              <div className="text-lg">C++</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">Hear from developers who improved their skills with CodeZen</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-600">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold mr-4">S</div>
                <div>
                  <h4 className="font-bold">Sarah Johnson</h4>
                  <p className="text-gray-400 text-sm">Software Engineer at Google</p>
                </div>
              </div>
              <p className="text-gray-300">
                "CodeZen helped me prepare for my technical interviews. The variety of problems and the detailed solutions were invaluable. I landed my dream job thanks to this platform!"
              </p>
              <div className="flex text-yellow-400 mt-4">
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-600">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-xl font-bold mr-4">M</div>
                <div>
                  <h4 className="font-bold">Michael Chen</h4>
                  <p className="text-gray-400 text-sm">CS Student at MIT</p>
                </div>
              </div>
              <p className="text-gray-300">
                "The weekly contests on CodeZen have significantly improved my problem-solving skills. The competitive environment pushes me to think faster and more efficiently."
              </p>
              <div className="flex text-yellow-400 mt-4">
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="bg-gray-700/50 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-gray-600">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-xl font-bold mr-4">A</div>
                <div>
                  <h4 className="font-bold">Aisha Patel</h4>
                  <p className="text-gray-400 text-sm">Senior Developer at Amazon</p>
                </div>
              </div>
              <p className="text-gray-300">
                "I use CodeZen to keep my coding skills sharp. The analytics help me identify my weak areas, and the diverse problem set ensures I'm always learning something new."
              </p>
              <div className="flex text-yellow-400 mt-4">
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
                <FaCheckCircle />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-900/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Level Up Your Coding Skills?</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">Join CodeZen today and start your journey to becoming a better programmer</p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  View Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/login"
                  className="bg-transparent hover:bg-white/10 border-2 border-white px-8 py-4 rounded-lg text-lg font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <FaCode className="text-3xl text-blue-500 mr-2" />
                <span className="text-2xl font-bold">CodeZen</span>
              </div>
              <p className="text-gray-400 mb-4">
                Elevate your coding skills with practice, competition, and community.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">
                  <FaUsers />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiLeetcode />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiHackerrank />
                </a>
                <a href="#" className="text-gray-400 hover:text-white">
                  <SiCodeforces />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/problems" className="text-gray-400 hover:text-white">Problems</Link></li>
                <li><Link to="/contests" className="text-gray-400 hover:text-white">Contests</Link></li>
                <li><Link to="/leaderboard" className="text-gray-400 hover:text-white">Leaderboard</Link></li>
                <li><Link to={user ? "/dashboard" : "/login"} className="text-gray-400 hover:text-white">Dashboard</Link></li>
                {user && <li><Link to="/profile" className="text-gray-400 hover:text-white">Profile</Link></li>}
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CodeZen. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
