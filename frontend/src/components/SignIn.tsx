import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

interface SignInProps {
  onSignIn: () => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignIn({ onSignIn, onBack, onSwitchToSignIn }: SignInProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { setIsAuthenticated, setUser } = useAppContext();
  const [error, setError] = useState('');

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', {
        email: phone,
        password: password
      });
      
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      onSignIn();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMTNLogin = () => {
    // Simulate MTN direct login
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignIn();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2 text-slate-600 hover:text-mtn-blue"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold">Back</span>
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-mtn-blue flex items-center justify-center shadow-xl shadow-mtn-blue/30">
              <span className="text-mtn-yellow font-black text-2xl">C</span>
            </div>
            <span className="text-2xl font-black text-mtn-blue uppercase tracking-widest">ClarityAI</span>
          </div>

          <h1 className="text-3xl font-black text-mtn-blue mb-2 text-center">Welcome Back</h1>
          <p className="text-slate-400 text-center mb-8 font-medium">Sign in to access your MTN plan insights</p>

          {/* MTN Quick Login */}
          <button
            onClick={handleMTNLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-yellow-400 hover:bg-yellow-500 text-mtn-blue rounded-2xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 mb-6"
          >
            <Phone className="w-5 h-5" />
            {isLoading ? 'Signing in...' : 'Continue with MTN'}
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number or email"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-mtn-blue"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-200" />
                Remember me
              </label>
              <button type="button" className="text-mtn-blue font-bold hover:underline">
                Forgot password?
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !phone || !password}
              className="w-full py-4 bg-mtn-blue text-white rounded-2xl font-bold text-lg shadow-xl shadow-mtn-blue/30 hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none transition-all"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-mtn-blue font-bold hover:underline"
            >
              Sign up
            </button>
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-mtn-yellow/5 to-transparent pointer-events-none" />
    </div>
  );
}
