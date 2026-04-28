import { motion, AnimatePresence } from 'motion/react';
import { User, Phone, Mail, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit3, Check, X, MessageCircle, FileText, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { Language } from '../types';

interface ProfileProps {
  onSignOut: () => void;
  onEditNumber?: () => void;
}

interface AccountData {
  phone: string;
  email: string;
  name: string;
}

type PrivacyKey = 'dataCollection' | 'analytics' | 'marketing' | 'twoFactor';

interface PrivacySettings {
  dataCollection: boolean;
  analytics: boolean;
  marketing: boolean;
  twoFactor: boolean;
}

interface HelpTopic {
  icon: React.ElementType;
  title: string;
  desc: string;
  action: string;
}

const helpTopics: HelpTopic[] = [
  { icon: MessageCircle, title: 'Chat Support', desc: 'Talk to our AI assistant', action: 'chat' },
  { icon: FileText, title: 'Documentation', desc: 'User guides & FAQs', action: 'docs' },
  { icon: Mail, title: 'Send Feedback', desc: 'Suggest improvements', action: 'feedback' },
];

export default function Profile({ onSignOut }: ProfileProps) {
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const { language } = useAppContext();
  const { notifications, clearAllNotifications } = useNotifications();
  
  const [activeModal, setActiveModal] = useState<'privacy' | 'help' | null>(null);
  const [accountData, setAccountData] = useState<AccountData>({
    phone: '0803 123 4567',
    email: 'aisha@example.com',
    name: 'Aisha Ogunleke',
  });
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataCollection: true,
    analytics: true,
    marketing: false,
    twoFactor: false,
  });

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  const handleSaveAccount = () => {
    setIsEditingAccount(false);
    console.log('Saving account data:', accountData);
  };

  const togglePrivacy = (key: PrivacyKey) => {
    setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { 
          icon: Phone, 
          label: 'Linked Number', 
          value: accountData.phone, 
          action: 'edit' as const,
          editable: true,
          field: 'phone'
        },
        { 
          icon: Mail, 
          label: 'Email', 
          value: accountData.email, 
          action: 'edit' as const,
          editable: true,
          field: 'email'
        },
        { 
          icon: User, 
          label: 'Name', 
          value: accountData.name, 
          action: 'edit' as const,
          editable: true,
          field: 'name'
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          hasToggle: true,
          value: notificationEnabled,
          onToggle: () => setNotificationEnabled(!notificationEnabled),
          description: 'Push notifications and alerts',
        },
        { 
          icon: Shield, 
          label: 'Privacy & Security', 
          action: 'view' as const,
          description: 'Data collection, security & permissions',
          badge: privacySettings.analytics ? '2 active' : undefined,
        },
        { 
          icon: HelpCircle, 
          label: 'Help & Support', 
          action: 'view' as const,
          description: 'FAQs, contact support, feedback',
        },
      ],
    },
  ];

  return (
    <div className="p-6 pb-24 space-y-6 relative">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-mtn-blue to-[#004080] p-8 rounded-[2.5rem] text-white shadow-xl shadow-mtn-blue/20 relative overflow-hidden text-center"
      >
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/30 mx-auto mb-4 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-mtn-yellow flex items-center justify-center">
              <User className="w-8 h-8 text-mtn-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-black mb-1">{accountData.name}</h2>
          <p className="text-white/70 font-medium">MTN Premium User</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Active Now
          </div>
        </div>
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-white/5 rounded-full" />
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingsSections.map((section, sIndex) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sIndex * 0.1 }}
          >
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">{section.title}</h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              {section.items.map((item, iIndex) => (
                <div
                  key={item.label}
                  className={`p-4 border-b border-slate-50 last:border-0 ${
                    iIndex === 0 ? 'rounded-t-2xl' : ''} ${iIndex === section.items.length - 1 ? 'rounded-b-2xl' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-mtn-yellow/10 rounded-xl">
                      <item.icon className="w-5 h-5 text-mtn-blue" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">
                            {item.label}
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-slate-400">{item.description}</p>
                          )}
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold text-mtn-blue bg-mtn-yellow/20 px-2 py-1 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.value && !item.hasToggle && (
                        <div className="text-sm font-bold text-mtn-blue mt-1">
                          {typeof item.value === 'boolean' ? (item.value ? 'Enabled' : 'Disabled') : item.value}
                        </div>
                      )}
                    </div>

                    {/* Action area */}
                    <div className="flex items-center gap-2">
                      {item.hasToggle ? (
                        <button
                          onClick={() => item.onToggle && item.onToggle()}
                          className={`relative w-12 h-7 rounded-full transition-colors ${
                            item.value ? 'bg-mtn-yellow' : 'bg-slate-200'
                          }`}
                          aria-label={`Toggle ${item.label}`}
                        >
                          <span
                            className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                              item.value ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      ) : item.action === 'edit' ? (
                        isEditingAccount ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveAccount}
                              className="p-1.5 bg-green-500 text-white rounded-lg"
                              aria-label="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setIsEditingAccount(false);
                                setAccountData({
                                  phone: '0803 123 4567',
                                  email: 'aisha@example.com',
                                  name: 'Aisha Ogunleke',
                                });
                              }}
                              className="p-1.5 bg-red-500 text-white rounded-lg"
                              aria-label="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsEditingAccount(true)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            aria-label={`Edit ${item.label}`}
                          >
                            <Edit3 className="w-4 h-4 text-slate-400 hover:text-mtn-blue" />
                          </button>
                        )
                      ) : item.action === 'view' ? (
                        <button
                          onClick={() => {
                            if (item.label === 'Privacy & Security') setActiveModal('privacy');
                            if (item.label === 'Help & Support') setActiveModal('help');
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                          aria-label={`Open ${item.label}`}
                        >
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Edit mode input */}
                  {isEditingAccount && item.action === 'edit' && 'editable' in item && item.editable && 'field' in item && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <input
                        type={item.field === 'email' ? 'email' : 'text'}
                        value={accountData[item.field as keyof AccountData]}
                        onChange={(e) => setAccountData(prev => ({ ...prev, [item.field]: e.target.value }))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-mtn-blue focus:outline-none focus:ring-2 focus:ring-mtn-blue/20"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Notification Info Card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-50 rounded-[2rem] border border-slate-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-mtn-blue" />
          <h3 className="text-sm font-bold text-mtn-blue">Notification Summary</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total</p>
            <p className="text-2xl font-black text-mtn-blue">{notifications.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Unread</p>
            <p className="text-2xl font-black text-mtn-blue">{notifications.filter(n => !n.read).length}</p>
          </div>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="w-full mt-4 p-3 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            Clear All Notifications
          </button>
        )}
      </motion.div>

      {/* Sign Out Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 font-bold hover:bg-red-100 transition-all active:scale-95"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </motion.button>

      {/* Privacy Modal */}
      <AnimatePresence>
        {activeModal === 'privacy' && (
          <PrivacyModal
            settings={privacySettings}
            onToggle={togglePrivacy}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {activeModal === 'help' && (
          <HelpModal topics={helpTopics} onClose={() => setActiveModal(null)} />
        )}
      </AnimatePresence>

      {/* Version info */}
      <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
        MTN ClarityAI v1.0
      </div>
    </div>
  );
}

// Privacy & Security Modal
function PrivacyModal({ 
  settings, 
  onToggle, 
  onClose 
}: { 
  settings: PrivacySettings;
  onToggle: (key: PrivacyKey) => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[80vh] overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-mtn-blue">Privacy & Security</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  Control your data
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Data Collection */}
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Data & Analytics
              </h3>
              <div className="space-y-3">
                <SettingToggle
                  label="Usage Analytics"
                  desc="Send anonymous usage data to improve recommendations"
                  enabled={settings.analytics}
                  onToggle={() => onToggle('analytics')}
                />
                <SettingToggle
                  label="Data Collection"
                  desc="Allow collection of plan and usage information"
                  enabled={settings.dataCollection}
                  onToggle={() => onToggle('dataCollection')}
                />
                <SettingToggle
                  label="Marketing Communications"
                  desc="Receive offers and promotions from MTN"
                  enabled={settings.marketing}
                  onToggle={() => onToggle('marketing')}
                />
              </div>
            </section>

            {/* Security */}
            <section>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                Security
              </h3>
              <div className="space-y-3">
                <SettingToggle
                  label="Two-Factor Authentication"
                  desc="Add extra security to your account"
                  enabled={settings.twoFactor}
                  onToggle={() => onToggle('twoFactor')}
                />
              </div>
            </section>

            {/* Info box */}
            <div className="bg-mtn-yellow/10 border border-mtn-yellow/20 rounded-xl p-4">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-mtn-blue shrink-0" />
                <div>
                  <p className="text-xs font-bold text-mtn-blue mb-1">Your data is protected</p>
                  <p className="text-[10px] text-slate-500">
                    We use industry-standard encryption and never share your personal information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Help & Support Modal
function HelpModal({ 
  topics, 
  onClose 
}: { 
  topics: HelpTopic[];
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] max-h-[80vh] overflow-y-auto z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-mtn-blue">Help & Support</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  We're here to help
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {topics.map((topic) => (
              <button
                key={topic.title}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-mtn-yellow/5 hover:border-mtn-yellow/20 border border-slate-100 transition-all group"
              >
                <div className="p-3 bg-white shadow-sm rounded-xl border border-slate-100 group-hover:border-mtn-yellow/30">
                  <topic.icon className="w-5 h-5 text-mtn-blue" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-mtn-blue">{topic.title}</p>
                  <p className="text-[10px] text-slate-400">{topic.desc}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-mtn-blue transition-colors" />
              </button>
            ))}
          </div>

          {/* Contact info */}
          <div className="p-6 border-t border-slate-100 bg-slate-50">
            <div className="p-4 bg-mtn-blue/5 rounded-xl border border-mtn-blue/10">
              <p className="text-xs font-bold text-mtn-blue mb-1">Need immediate help?</p>
              <p className="text-sm text-slate-600">
                Chat with our AI assistant or dial *123# from your MTN line
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Reusable Toggle Component
function SettingToggle({ 
  label, 
  desc, 
  enabled, 
  onToggle 
}: { 
  label: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-700">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-7 rounded-full transition-colors ${
          enabled ? 'bg-mtn-yellow' : 'bg-slate-200'
        }`}
        aria-label={`Toggle ${label}`}
      >
        <span
          className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  );
}
