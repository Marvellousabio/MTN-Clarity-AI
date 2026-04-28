import { motion } from 'motion/react';
import { User, Phone, Mail, Bell, Shield, HelpCircle, LogOut, ChevronRight, Edit3, Check } from 'lucide-react';
import { useState } from 'react';

interface ProfileProps {
  onSignOut: () => void;
  onEditNumber?: () => void;
}

export default function Profile({ onSignOut, onEditNumber }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Phone, label: 'Linked Number', value: '0803 123 4567', action: 'edit' },
        { icon: Mail, label: 'Email', value: 'aisha@example.com', action: 'edit' },
        { icon: User, label: 'Name', value: 'Aisha Ogunleke', action: 'edit' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', toggle: true, value: true },
        { icon: Shield, label: 'Privacy', action: 'view' },
        { icon: HelpCircle, label: 'Help & Support', action: 'view' },
      ],
    },
  ];

  return (
    <div className="p-6 pb-24 space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-mtn-blue to-[#004080] p-8 rounded-[2.5rem] text-white shadow-xl shadow-mtn-blue/20 relative overflow-hidden text-center"
      >
        <div className="relative z-10">
          <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-white/30 mx-auto mb-4 flex items-center justify-center">
            {/* User avatar placeholder */}
            <div className="w-16 h-16 rounded-full bg-mtn-yellow flex items-center justify-center">
              <User className="w-8 h-8 text-mtn-blue" />
            </div>
          </div>
          <h2 className="text-2xl font-black mb-1">Aisha Ogunleke</h2>
          <p className="text-white/70 font-medium">MTN Premium User</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-bold">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Active Now
          </div>
        </div>
        {/* Decorative circles */}
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
                <button
                  key={item.label}
                  onClick={() => item.action === 'edit' && setIsEditing(true)}
                  className={`w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 ${
                    iIndex === 0 ? 'rounded-t-2xl' : ''} ${iIndex === section.items.length - 1 ? 'rounded-b-2xl' : ''}`}
                >
                  <div className="p-2 bg-mtn-yellow/10 rounded-xl">
                    <item.icon className="w-5 h-5 text-mtn-blue" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</div>
                    {item.value && (
                      <div className="text-sm font-bold text-mtn-blue">
                        {typeof item.value === 'boolean' ? (item.value ? 'Enabled' : 'Disabled') : item.value}
                      </div>
                    )}
                  </div>
                  {item.toggle ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle logic would go here
                      }}
                      className={`relative w-12 h-7 rounded-full transition-colors ${
                        item.value ? 'bg-mtn-yellow' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          item.value ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

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

      {/* Version info */}
      <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
        MTN ClarityAI v1.0
      </div>
    </div>
  );
}
