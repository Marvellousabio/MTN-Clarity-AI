import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, Shield, HelpCircle, Moon, Sun, Globe, ChevronRight, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { Language } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { language, setLanguage } = useAppContext();
  const { notifications, clearAllNotifications } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const languages: { code: Language; name: string; native: string }[] = [
    { code: 'EN', name: 'English', native: 'English' },
    { code: 'PIDGIN', name: 'Nigerian Pidgin', native: "Pijin" },
    { code: 'HA', name: 'Hausa', native: 'Hausa' },
    { code: 'YO', name: 'Yoruba', native: 'Yorùbá' },
    { code: 'IG', name: 'Igbo', native: 'Ásụ̀sụ́ Ìgbò' },
  ];

  const settingsSections = [
    {
      title: 'Preferences',
      icon: Globe,
      items: [
        {
          label: 'Language',
          description: 'Choose your preferred language',
          activeValue: languages.find(l => l.code === language)?.native,
          action: 'language',
        },
        {
          label: 'Notifications',
          description: 'Manage notification preferences',
          action: 'notifications',
          hasToggle: true,
          value: true,
        },
      ],
    },
    {
      title: 'Account',
      icon: Shield,
      items: [
        {
          label: 'Privacy & Security',
          description: 'Data usage and security settings',
          action: 'privacy',
        },
        {
          label: 'Help & Support',
          description: 'Get help with ClarityAI',
          action: 'help',
        },
      ],
    },
  ];

  const handleLanguageChange = (langCode: Language) => {
    setLanguage(langCode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl shadow-slate-200/50 z-50 flex flex-col"
            ref={panelRef}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-mtn-blue/5 to-transparent">
              <div>
                <h2 className="text-xl font-black text-mtn-blue">Settings</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  MTN ClarityAI v1.0
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Language Selection */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Language
                </h3>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        language === lang.code
                          ? 'bg-mtn-yellow/10 border-mtn-yellow/30 shadow-sm'
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{lang.native === 'English' ? '🇳🇬' : ''}</span>
                        <div className="text-left">
                          <p className={`text-sm font-bold ${language === lang.code ? 'text-mtn-blue' : 'text-slate-700'}`}>
                            {lang.native}
                          </p>
                          <p className="text-[10px] text-slate-400">{lang.name}</p>
                        </div>
                      </div>
                      {language === lang.code && (
                        <Check className="w-5 h-5 text-mtn-yellow fill-mtn-yellow" />
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Settings Sections */}
              {settingsSections.map((section) => (
                <section key={section.title}>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <section.icon className="w-3.5 h-3.5" />
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.label}
                        className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-mtn-yellow/30 hover:bg-mtn-yellow/5 transition-all"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {item.hasToggle ? (
                            <Bell className="w-5 h-5 text-mtn-blue" />
                          ) : item.action === 'privacy' ? (
                            <Shield className="w-5 h-5 text-mtn-blue" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-mtn-blue" />
                          )}
                          <div>
                            <p className="text-sm font-bold text-slate-700">{item.label}</p>
                            <p className="text-[10px] text-slate-400">{item.description}</p>
                          </div>
                        </div>
                        {item.hasToggle ? (
                          <div
                            className={`w-12 h-7 rounded-full transition-colors ${
                              item.value ? 'bg-mtn-yellow' : 'bg-slate-200'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                                item.value ? 'left-6' : 'left-1'
                              }`}
                            />
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              {/* Notifications Info */}
              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Notifications
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-slate-700">Total</span>
                    <span className="text-sm font-black text-mtn-blue">{notifications.length}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-slate-700">Unread</span>
                    <span className="text-sm font-black text-mtn-blue">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </div>
                  <button
                    onClick={clearAllNotifications}
                    disabled={notifications.length === 0}
                    className="w-full p-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear All Notifications
                  </button>
                </div>
              </section>

              {/* App Info */}
              <section>
                <div className="p-4 bg-gradient-to-br from-mtn-yellow/10 to-mtn-yellow/5 rounded-xl border border-mtn-yellow/20">
                  <h4 className="text-sm font-black text-mtn-blue mb-1">MTN ClarityAI</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    AI-powered plan advisor for smarter data, calls and bundles.
                    Powered by Microsoft AI Foundry.
                  </p>
                  <p className="text-[9px] text-slate-400 mt-2">Version 1.0.0</p>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                © 2026 Team ClarityAI
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
