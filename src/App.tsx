/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Layout from './components/Layout';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import PlanComparison from './components/PlanComparison';
import Analytics from './components/Analytics';
import LanguageToggle from './components/LanguageToggle';
import { Language } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Bell, Globe } from 'lucide-react';

export default function App() {
  const [screen, setScreen] = useState<'landing' | 'app'>('landing');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [language, setLanguage] = useState<Language>('EN');
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();

  const handleStart = () => {
    setScreen('app');
  };

  const handleDashboardAction = (action: string) => {
    if (action === 'why-data' || action === 'cheaper') {
      const msgs: Record<string, string> = {
        'why-data': 'Why my data finish fast?',
        'cheaper': 'Show cheaper bundles'
      };
      setChatInitialMessage(msgs[action]);
      setActiveTab('chat');
    } else if (action === 'compare') {
      setActiveTab('plans');
    } else if (action === 'plans') {
      setActiveTab('plans');
    }
  };

  if (screen === 'landing') {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} showNav={activeTab !== 'chat'}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="min-h-screen pt-4"
        >
          {/* Top Bar for App */}
          {activeTab !== 'chat' && (
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
                 <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors relative">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                 </button>
                 <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <Settings className="w-5 h-5 text-slate-400" />
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <div className="px-6 mb-6">
                <LanguageToggle current={language} onSelect={setLanguage} />
              </div>
              <Dashboard language={language} onAction={handleDashboardAction} />
            </>
          )}

          {activeTab === 'chat' && (
            <ChatAssistant 
              language={language} 
              onBack={() => {
                setActiveTab('dashboard');
                setChatInitialMessage(undefined);
              }} 
              initialMessage={chatInitialMessage}
            />
          )}

          {activeTab === 'plans' && (
            <PlanComparison 
              currentPlanId="pulse" 
              recommendedPlanId="pulse-flexi" 
              onSwitch={() => alert('Switching plan successful! USSD: *312# sent.')} 
            />
          )}

          {activeTab === 'insights' && (
            <Analytics />
          )}

          {activeTab === 'profile' && (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh]">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                 <Globe className="w-12 h-12 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-mtn-blue mb-2">Profile Settings</h3>
              <p className="text-slate-400 font-medium mb-8">Customize your MTN ClarityAI experience.</p>
              <div className="w-full space-y-3">
                 <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-mtn-blue">Linked Number: 0803XXXXXXX</button>
                 <button className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-mtn-blue text-red-500">Sign Out</button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}
