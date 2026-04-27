import { motion, AnimatePresence } from 'motion/react';
import { Home, MessageSquare, PieChart, Layers, User } from 'lucide-react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  showNav: boolean;
}

export default function Layout({ children, activeTab, onTabChange, showNav }: LayoutProps) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'plans', label: 'Plans', icon: Layers },
    { id: 'insights', label: 'Insights', icon: PieChart },
    { id: 'profile', label: 'Profile', icon: User },
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
                onClick={() => onTabChange(tab.id)}
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
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Connected as</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-mtn-yellow/20" />
                <div className="font-bold text-xs text-mtn-blue">Aisha O.</div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 min-h-[100dvh] relative overflow-hidden transition-all duration-300 ${activeTab === 'chat' ? 'w-full' : 'md:max-w-7xl mx-auto'}`}>
        <div className={`mx-auto h-full ${activeTab === 'chat' ? 'w-full' : 'w-full px-0 md:px-8 py-0 md:py-8'}`}>
          <div className={`bg-white min-h-full md:rounded-[3rem] md:shadow-2xl md:shadow-slate-200/50 relative overflow-hidden ${activeTab === 'chat' ? 'h-full md:rounded-none' : ''}`}>
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Spacer for Fixed Nav */}
        <div className="h-20 md:hidden" />
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
    </div>
  );
}
