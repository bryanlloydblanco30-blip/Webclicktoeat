'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signup } from '../services/api';
import { UserPlus } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    sr_code: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.full_name || !formData.sr_code) {
      setError('All fields are required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const srCodePattern = /^\d{2}-\d{5}$/;
    if (!srCodePattern.test(formData.sr_code)) {
      setError('SR Code must be in format: XX-XXXXX (e.g., 24-12345)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await signup(
        formData.username,
        formData.email,
        formData.password,
        'member',
        '',
        formData.full_name,
        formData.sr_code
      );

      if (response.success) {
        localStorage.setItem('user', JSON.stringify(response.user));
        router.push('/');
      }
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)' }}>
      {/* Animated Flying Circles Background */}
      <div className="absolute inset-0 overflow-hidden">
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
          
          .circle1 { animation: float1 25s ease-in-out infinite; }
          .circle2 { animation: float2 30s ease-in-out infinite; }
          .circle3 { animation: float3 35s ease-in-out infinite; }
          .circle4 { animation: float1 40s ease-in-out infinite reverse; }
          .circle5 { animation: float2 38s ease-in-out infinite reverse; }
        `}</style>

        <div className="circle1 absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-white/5 blur-2xl"></div>
        <div className="circle2 absolute top-[60%] left-[15%] w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="circle3 absolute top-[20%] right-[10%] w-80 h-80 rounded-full bg-white/7 blur-2xl"></div>
        <div className="circle4 absolute bottom-[15%] right-[20%] w-72 h-72 rounded-full bg-white/8 blur-3xl"></div>
        <div className="circle5 absolute top-[40%] left-[40%] w-48 h-48 rounded-full bg-white/6 blur-xl"></div>
      </div>

      <div className="max-w-7xl w-full px-8 flex items-center justify-center lg:justify-between relative z-10">
        {/* LEFT SIDE - Logo and Title */}
        <div className="hidden lg:flex flex-col items-start text-white max-w-xl">
          <div className="relative mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 transform -rotate-3 border-4 border-white/20 shadow-2xl">
              <img 
                src="/logo.png" 
                alt="Click to Eat Logo" 
                className="w-64 h-64 object-contain"
              />
            </div>
          </div>

          <h2 className="text-6xl font-black leading-tight mb-4" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            JOIN OUR<br/>
            FOOD<br/>
            COMMUNITY
          </h2>
          <p className="text-xl text-red-100 font-medium">
            Create your account and start ordering today
          </p>
        </div>

        {/* RIGHT SIDE - Signup Form Card */}
        <div className="w-full lg:w-auto lg:min-w-[480px] lg:max-w-[520px]">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-white/50">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-6 text-center relative">
              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition">
                  <UserPlus className="w-5 h-5 text-white" />
                </button>
              </div>
              <h3 className="text-3xl font-black text-white tracking-wide">SIGN UP</h3>
            </div>

            {/* Form Body */}
            <div className="p-10 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-8">
                <div className="bg-red-100/50 backdrop-blur-sm rounded-3xl p-6 transform -rotate-2 border-4 border-red-200/50 shadow-xl inline-block mb-4">
                  <img 
                    src="/logo.png" 
                    alt="Click to Eat Logo" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <h1 className="text-4xl font-black text-red-700">CLICK TO EAT</h1>
                <p className="text-gray-500 text-sm font-bold">JOIN US TODAY</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="Juan Dela Cruz"
                  />
                </div>

                {/* SR Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    SR Code
                  </label>
                  <input
                    type="text"
                    name="sr_code"
                    value={formData.sr_code}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="24-12345"
                  />
                  <p className="mt-1 text-xs text-gray-500">Format: XX-XXXXX (e.g., 23-12345)</p>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="Choose a username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="At least 6 characters"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:bg-white transition font-medium text-gray-700"
                    placeholder="Re-enter password"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-4 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg uppercase tracking-widest text-base"
                >
                  {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-2">
                <div className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-red-600 hover:text-red-700 font-bold">
                    Sign in
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


    </div>
  );
}