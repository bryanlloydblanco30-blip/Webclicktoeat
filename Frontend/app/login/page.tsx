'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../services/api';
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 Login attempt:', formData.username);

    try {
      const response = await login(formData.username, formData.password);
      console.log('✅ Login response:', response);
      
      if (response.success && response.user) {
        const userData = response.user;
        console.log('💾 User data received:', userData);
        console.log('🎭 User role (exact):', userData.role);
        console.log('🎭 Role type:', typeof userData.role);
        
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', 'authenticated-' + Date.now());
        
        // Log the ENTIRE user object to see what we're getting
        console.log('📦 FULL USER OBJECT:', JSON.stringify(userData, null, 2));
        
        // Normalize role to lowercase for comparison
        const userRole = userData.role?.toLowerCase().trim();
        console.log('🎭 Normalized role:', userRole);
        console.log('🏢 Food Partner:', userData.food_partner);
        
        // Redirect based on role
        if (userRole === 'admin') {
          console.log('→ Admin role detected - Redirecting to admin dashboard');
          router.push('/admin');
          
        } else if (userRole === 'staff' || userRole === 'owner' || userRole === 'food_partner') {
          console.log('→ Staff/Owner role detected - Redirecting to food partner page');
          if (userData.food_partner) {
            localStorage.setItem('food_partner', userData.food_partner);
            console.log('✅ Stored food_partner in localStorage:', userData.food_partner);
          }
          
          // Force navigation with window.location as fallback
          console.log('🚀 Attempting navigation to /admin/owneradmin');
          
          // Try router.push first
          router.push('/admin/owneradmin');
          
          // If that doesn't work after 1 second, force with window.location
          setTimeout(() => {
            if (window.location.pathname !== '/admin/owneradmin') {
              console.log('⚠️ Router.push failed, forcing with window.location');
              window.location.href = '/admin/owneradmin';
            }
          }, 1000);
          
        } else {
          // Member/client role - stay in client app
          console.log('→ Member/Default role - Redirecting to client home');
          router.push('/');
        }
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)' }}>
      {/* Animated Flying Circles Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Wave patterns */}
        <div className="absolute top-0 left-0 w-full h-full" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.05) 0%, transparent 50%)',
        }}></div>
        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,100 Q250,50 500,100 T1000,100 L1000,0 L0,0 Z" fill="rgba(255,255,255,0.03)" />
          <path d="M0,200 Q300,150 600,200 T1200,200 L1200,0 L0,0 Z" fill="rgba(255,255,255,0.02)" />
        </svg>

        {/* Flying Circles */}
        <style jsx>{`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(100px, -50px) scale(1.1); }
            50% { transform: translate(200px, 50px) scale(0.9); }
            75% { transform: translate(50px, 100px) scale(1.05); }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-150px, 80px) scale(1.15); }
            66% { transform: translate(-50px, -100px) scale(0.85); }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            20% { transform: translate(120px, 100px) scale(0.95); }
            40% { transform: translate(-80px, 50px) scale(1.1); }
            60% { transform: translate(150px, -80px) scale(0.9); }
            80% { transform: translate(-100px, -50px) scale(1.05); }
          }
          @keyframes float4 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            25% { transform: translate(-100px, -80px) scale(1.2) rotate(90deg); }
            50% { transform: translate(80px, 60px) scale(0.8) rotate(180deg); }
            75% { transform: translate(-120px, 100px) scale(1.1) rotate(270deg); }
          }
          @keyframes float5 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(180px, -120px) scale(1.3); }
          }
          
          .circle1 { animation: float1 25s ease-in-out infinite; }
          .circle2 { animation: float2 30s ease-in-out infinite; }
          .circle3 { animation: float3 35s ease-in-out infinite; }
          .circle4 { animation: float4 28s ease-in-out infinite; }
          .circle5 { animation: float5 32s ease-in-out infinite; }
          .circle6 { animation: float1 40s ease-in-out infinite reverse; }
          .circle7 { animation: float2 38s ease-in-out infinite reverse; }
          .circle8 { animation: float3 45s ease-in-out infinite reverse; }
        `}</style>

        {/* Large circles */}
        <div className="circle1 absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-white/5 blur-2xl"></div>
        <div className="circle2 absolute top-[60%] left-[15%] w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="circle3 absolute top-[20%] right-[10%] w-80 h-80 rounded-full bg-white/7 blur-2xl"></div>
        <div className="circle4 absolute bottom-[15%] right-[20%] w-72 h-72 rounded-full bg-white/8 blur-3xl"></div>
        
        {/* Medium circles */}
        <div className="circle5 absolute top-[40%] left-[40%] w-48 h-48 rounded-full bg-white/6 blur-xl"></div>
        <div className="circle6 absolute top-[70%] right-[40%] w-56 h-56 rounded-full bg-white/5 blur-2xl"></div>
        
        {/* Small circles */}
        <div className="circle7 absolute top-[30%] left-[70%] w-32 h-32 rounded-full bg-white/8 blur-xl"></div>
        <div className="circle8 absolute bottom-[40%] left-[25%] w-40 h-40 rounded-full bg-white/7 blur-xl"></div>
        
        {/* Extra small floating circles */}
        <div className="circle1 absolute top-[15%] right-[25%] w-24 h-24 rounded-full bg-white/10 blur-lg"></div>
        <div className="circle3 absolute bottom-[25%] left-[50%] w-28 h-28 rounded-full bg-white/9 blur-lg"></div>
      </div>

      <div className="max-w-7xl w-full px-8 flex items-center justify-center lg:justify-between relative z-10">
        {/* LEFT SIDE - Logo and Title */}
        <div className="hidden lg:flex flex-col items-start text-white max-w-xl">
          {/* Logo in Slanted Rounded Rectangle */}
          <div className="relative mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 transform -rotate-3 border-4 border-white/20 shadow-2xl">
              <img 
                src="/logo.png" 
                alt="Click to Eat Logo" 
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-6xl font-black leading-tight mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            FOOD<br/>
            MANAGEMENT<br/>
            SYSTEM
          </h2>
          <p className="text-xl text-red-100 font-medium">
            Order, Track, and Enjoy Your Favorite Meals
          </p>
        </div>

        {/* RIGHT SIDE - Login Form Card */}
        <div className="w-full lg:w-auto lg:min-w-[480px]">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white/50">
            {/* Header - RED THEME */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-center relative">
              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
                  <Mail className="w-5 h-5 text-white" />
                </button>
              </div>
              <h3 className="text-3xl font-black text-white tracking-wide">SIGN IN</h3>
            </div>

            {/* Form Body */}
            <div className="p-10">
              {/* Mobile Logo - In Slanted Rounded Rectangle */}
              <div className="lg:hidden text-center mb-8">
                <div className="bg-red-100/50 backdrop-blur-sm rounded-3xl p-6 transform -rotate-2 border-4 border-red-200/50 shadow-xl inline-block mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Click to Eat Logo" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <h1 className="text-4xl font-black text-red-700">CLICK TO EAT</h1>
                <p className="text-gray-500 text-sm font-bold">FOOD MANAGEMENT SYSTEM</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700 peer"
                    placeholder="Enter your username"
                    required
                  />
                  {/* Validation tooltip */}
                  <div className="hidden peer-invalid:peer-focus:block absolute -top-12 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Please fill out this field</span>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 transform rotate-45"></div>
                  </div>
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700 peer"
                    placeholder="••••••••"
                    required
                  />
                  {/* Validation tooltip */}
                  <div className="hidden peer-invalid:peer-focus:block absolute -top-12 left-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold animate-bounce">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Please fill out this field</span>
                    </div>
                    {/* Arrow pointing down */}
                    <div className="absolute -bottom-2 left-8 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 transform rotate-45"></div>
                  </div>
                </div>

                {/* Login Button - RED THEME */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg uppercase tracking-widest text-base"
                >
                  {loading ? 'SIGNING IN...' : 'LOG IN'}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 text-center space-y-2">
                <div className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link href="/signup" className="text-red-600 hover:text-red-700 font-bold">
                    Sign up
                  </Link>
                </div>
              </div>

              {/* Continue as Guest */}
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                  Continue as guest →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Counter Badge (Bottom Right) */}
    </div>
  );
}