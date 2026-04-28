import { motion } from 'motion/react';
import { ChevronRight, ArrowUpRight, TrendingDown, Zap, HelpCircle, Smartphone } from 'lucide-react';
import { STRINGS, MOCK_USER, PLANS } from '../constants';
import { Language } from '../types';

interface DashboardProps {
  language: Language;
  onAction: (action: string) => void;
}

export default function Dashboard({ language, onAction }: DashboardProps) {
  const currentPlan = PLANS.find(p => p.id === MOCK_USER.currentPlanId) || PLANS[0];
  const t = STRINGS[language];

  const quickActions = [
    { id: 'why-data', text: t.whyMyDataFinish, icon: HelpCircle },
    { id: 'compare', text: t.comparePlans, icon: Zap },
    { id: 'cheaper', text: t.showCheaper, icon: TrendingDown },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h2 className="text-2xl font-black text-mtn-blue tracking-tight">
            {t.welcome} <span className="text-mtn-yellow">{MOCK_USER.name} 👋</span>
          </h2>
          <p className="text-slate-400 text-sm font-medium">MTN ClarityAI Premium</p>
        </div>
         <div 
           onClick={() => onAction('profile')}
           className="w-12 h-12 rounded-2xl bg-mtn-yellow/10 flex items-center justify-center border border-mtn-yellow/20 cursor-pointer hover:bg-mtn-yellow/20 transition-all hover:scale-105 active:scale-95"
         >
           <UserImage />
         </div>
      </motion.header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Savings Card */}
        <motion.div
          whileHover={{ y: -5 }}
          className="md:col-span-2 bg-gradient-to-br from-mtn-blue to-[#004080] p-6 md:p-8 rounded-[2.5rem] text-white shadow-xl shadow-mtn-blue/20 relative overflow-hidden group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                  <TrendingDown className="w-6 h-6 text-green-400" />
                </div>
                <ArrowUpRight className="w-6 h-6 text-white/30 group-hover:text-white transition-colors" />
              </div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">{t.savingsTitle}</p>
              <h3 className="text-2xl md:text-4xl font-black leading-tight mb-8 max-w-sm">{t.savingsValue}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                 <span className="text-xs font-bold text-green-400 uppercase tracking-widest text-[10px]">Monthly Progress</span>
                 <span className="text-sm font-black text-green-400">82%</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '82%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-green-400" 
                  />
                </div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Excellent Status</span>
              </div>
            </div>
          </div>
          {/* Abstract pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        </motion.div>

        <div className="space-y-6">
          {/* Current Plan Card */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onAction('plans')}
            className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm cursor-pointer h-1/2 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 bg-mtn-yellow/10 rounded-2xl">
                <Zap className="w-5 h-5 text-mtn-yellow fill-mtn-yellow" />
              </div>
              <span className="text-[10px] font-black text-mtn-blue px-3 py-1 bg-mtn-yellow rounded-full">{currentPlan.matchScore}% Match</span>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Your Active Plan</p>
              <h4 className="text-xl font-black text-mtn-blue leading-tight">{currentPlan.name}</h4>
            </div>
          </motion.div>

          {/* Data Health Card */}
          <motion.div
             whileHover={{ y: -5 }}
             className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-1/2"
          >
            <div className="flex items-center gap-2 mb-4">
               <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse border-2 border-red-200" />
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.dataHealth}</p>
            </div>
            <p className="text-lg font-bold text-mtn-blue leading-snug">{t.dataHealthDesc}</p>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="space-y-3">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Smarter Actions</h3>
        <div className="space-y-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onAction(action.id)}
              className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-mtn-yellow transition-all group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:border-mtn-yellow transition-colors">
                  <action.icon className="w-5 h-5 text-mtn-blue" />
                </div>
                <span className="font-bold text-sm text-mtn-blue leading-tight pr-4">{action.text}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-mtn-blue transition-colors" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Promotions / Ad banner */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-mtn-yellow p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden"
      >
        <div className="flex-1 relative z-10">
          <h4 className="text-sm font-black text-mtn-blue">BizPlus Starter is Live!</h4>
          <p className="text-[10px] font-bold text-mtn-blue/60">Optimized for your SME growth with 50GB shared data.</p>
        </div>
        <button 
          onClick={() => onAction('plans')}
          className="px-4 py-2 bg-mtn-blue text-white text-[10px] font-bold rounded-xl relative z-10"
        >
          Check am
        </button>
        <div className="absolute top-0 right-0 opacity-10 -translate-y-1/3 translate-x-1/3">
           <Smartphone className="w-24 h-24 stroke-[4px]" />
        </div>
      </motion.div>
    </div>
  );
}

function UserImage() {
  return (
    <svg viewBox="0 0 100 100" className="w-8 h-8 rounded-full overflow-hidden">
      <defs>
        <linearGradient id="user-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCC00" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#user-grad)" />
      <circle cx="50" cy="40" r="20" fill="white" opacity="0.8" />
      <path d="M20 90C20 70 35 60 50 60C65 60 80 70 80 90" fill="white" opacity="0.8" />
    </svg>
  );
}
