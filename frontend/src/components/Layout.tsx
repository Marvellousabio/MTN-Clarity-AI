import { motion } from 'motion/react';
import { Home, MessageSquare, PieChart, Layers, User } from 'lucide-react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useState } from 'react';
import NotificationCenter from './NotificationCenter';
import SettingsPanel from './SettingsPanel';
import { useAppContext } from '../context/AppContext';

function UserImage() {
  return (
    <svg viewBox="0 0 100 100" className="w-10 h-10 rounded-full overflow-hidden">
      <defs>
        <linearGradient id="user-grad-layout" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFCC00" />
          <stop offset="100%" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#user-grad-layout)" />
      <circle cx="50" cy="40" r="20" fill="white" opacity="0.8" />
      <path d="M20 90C20 70 35 60 50 60C65 60 80 70 80 90" fill="white" opacity="0.8" />
    </svg>
  );
}

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNav: boolean;
  isAuthenticated: boolean;
  onProfileClick: () => void;
}

export default function Layout({ 
  activeTab, 
  onTabChange, 
  showNav, 
  isAuthenticated, 
  onProfileClick 
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAppContext();

  const handleTabChange = (tabId: string) => {
    if (tabId === 'profile') {
      onProfileClick();
    } else {
      navigate(`/app/${tabId}`);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'plans', label: 'Plans', icon: Layers },
    { id: 'insights', label: 'Insights', icon: PieChart },
    ...(isAuthenticated ? [{ id: 'profile', label: 'Profile', icon: User }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-mtn-yellow/30 flex">
      {/* Desktop Sidebar Navigation */}
      {showNav && (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 sticky top-0 h-screen z-50">
          <div className="p-6 mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-mtn-blue flex items-center justify-center shadow-lg shadow-mtn-blue/20">
              <span className="text-mtn-yellow font-black text-xl">C</span>
            </div>
            <span className="font-black text-mtn-blue text-lg uppercase tracking-widest leading-none">ClarityAI</span>
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all relative group ${
                  activeTab === tab.id ? 'text-mtn-blue' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-nav-sidebar"
                    className="absolute inset-0 bg-mtn-yellow/10 rounded-2xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
                <span className="text-sm font-bold">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-mtn-yellow" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-6">
            <div 
               onClick={onProfileClick}
               className="p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-mtn-yellow/5 hover:border-mtn-yellow/30 transition-all"
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Connected as</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-mtn-yellow shadow-sm">
                  <UserImage />
                </div>
                <div>
                  <div className="font-bold text-xs text-mtn-blue">{user?.name || 'Guest User'}</div>
                  <div className="text-[8px] text-slate-400 font-medium">MTN: {user?.phoneNumber || 'No phone number'}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 ${location.pathname.includes('chat') ? 'h-[100dvh]' : 'min-h-[100dvh]'} relative overflow-hidden transition-all duration-300 ${location.pathname.includes('chat') ? 'w-full' : 'md:max-w-7xl mx-auto'}`}>
        {/* Top Bar - shown on all pages except chat */}
        {!location.pathname.includes('chat') && (
          <div className="px-6 py-4 mb-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-20 md:px-0">
            <div className="flex md:hidden items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-mtn-blue flex items-center justify-center">
                <span className="text-mtn-yellow font-black text-sm">C</span>
              </div>
              <span className="font-black text-mtn-blue text-sm uppercase tracking-widest leading-none">ClarityAI</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-black text-mtn-blue capitalize">{activeTab}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MTN ClarityAI v1.0</p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-slate-400 hover:text-mtn-blue transition-colors">
                  <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
                </svg>
              </button>
            </div>
          </div>
        )}
        <div className={`mx-auto h-full ${location.pathname.includes('chat') ? 'w-full' : 'w-full px-0 md:px-8 py-0 md:py-8'}`}>
          <div className={`bg-white min-h-full md:rounded-[3rem] md:shadow-2xl md:shadow-slate-200/50 relative overflow-hidden ${location.pathname.includes('chat') ? 'h-full md:rounded-none' : ''}`}>
            <Outlet />
          </div>
        </div>

        {/* Mobile Spacer for Fixed Nav - Not needed for chat tab as it handles its own padding */}
        {!location.pathname.includes('chat') && (
          <div className="h-20 md:hidden" />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      {showNav && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-8 pt-2 bg-white/80 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`nav-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors relative py-1 px-3 rounded-xl ${
                activeTab === tab.id ? 'text-mtn-blue' : 'text-slate-400'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-nav-mobile"
                  className="absolute inset-0 bg-mtn-yellow/10 rounded-xl -z-10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </motion.nav>
      )}

      <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
