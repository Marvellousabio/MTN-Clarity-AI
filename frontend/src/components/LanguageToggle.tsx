import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageToggleProps {
  current: Language;
  onSelect: (lang: Language) => void;
}

export default function LanguageToggle({ current, onSelect }: LanguageToggleProps) {
  const languages: { id: Language; label: string }[] = [
    { id: 'EN', label: 'English' },
    { id: 'PIDGIN', label: 'Pidgin' },
    { id: 'HA', label: 'Hausa' },
    { id: 'YO', label: 'Yoruba' },
    { id: 'IG', label: 'Igbo' },
  ];

  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
      {languages.map((lang) => (
        <button
          key={lang.id}
          onClick={() => onSelect(lang.id)}
          className={`flex-1 py-2 px-3 text-[10px] font-black rounded-xl transition-all relative z-10 hover:bg-white ${
            current === lang.id ? 'text-mtn-blue' : 'text-slate-400 hover:text-mtn-blue'
          }`}
        >
          {current === lang.id && (
            <motion.div
              layoutId="active-lang"
              className="absolute inset-0 bg-white shadow-sm border border-slate-100 rounded-xl -z-10"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            />
          )}
          {lang.id}
        </button>
      ))}
    </div>
  );
}
