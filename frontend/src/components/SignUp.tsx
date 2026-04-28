import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Phone, User, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

interface SignUpProps {
  onSignUp: () => void;
  onBack: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUp({ onSignUp, onBack, onSwitchToSignIn }: SignUpProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please accept the terms and conditions');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onSignUp();
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-mtn-blue flex items-center justify-center shadow-xl shadow-mtn-blue/30">
              <span className="text-mtn-yellow font-black text-2xl">C</span>
            </div>
            <span className="text-2xl font-black text-mtn-blue uppercase tracking-widest">ClarityAI</span>
          </div>

          <h1 className="text-3xl font-black text-mtn-blue mb-2 text-center">Create Account</h1>
          <p className="text-slate-400 text-center mb-8 font-medium">Join MTN ClarityAI and start saving today</p>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="MTN phone number"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-mtn-blue placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-mtn-yellow focus:bg-white transition-all"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-mtn-blue"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-200 text-mtn-blue focus:ring-mtn-yellow"
              />
              <span className="text-sm text-slate-500 leading-tight">
                I agree to the{' '}
                <button type="button" className="text-mtn-blue font-bold hover:underline">Terms of Service</button>
                {' '}and{' '}
                <button type="button" className="text-mtn-blue font-bold hover:underline">Privacy Policy</button>
              </span>
            </label>

            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !name || !phone || !email || !password || !agreedToTerms}
              className="w-full py-4 bg-mtn-blue text-white rounded-2xl font-bold text-lg shadow-xl shadow-mtn-blue/30 hover:bg-slate-800 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <button
              onClick={onSwitchToSignIn}
              className="text-mtn-blue font-bold hover:underline"
            >
              Sign in
            </button>
          </p>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-mtn-yellow/5 to-transparent pointer-events-none" />
    </div>
  );
}
