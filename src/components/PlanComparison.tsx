import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ShieldAlert, Zap, TrendingUp } from 'lucide-react';
import { PLANS } from '../constants';

interface PlanComparisonProps {
  currentPlanId: string;
  recommendedPlanId: string;
  onSwitch: () => void;
}

export default function PlanComparison({ currentPlanId, recommendedPlanId, onSwitch }: PlanComparisonProps) {
  const current = PLANS.find(p => p.id === currentPlanId) || PLANS[0];
  const recommended = PLANS.find(p => p.id === recommendedPlanId) || PLANS[1];

  const rows = [
    { label: 'Monthly Cost', key: 'monthlyCost', formatter: (val: number) => `₦${val.toLocaleString()}` },
    { label: 'Data Volume', key: 'dataVolume' },
    { label: 'Night Browsing', key: 'nightBrowsing' },
    { label: 'Call Bonus', key: 'callBonus' },
    { label: 'Validity', key: 'validity' },
    { label: 'Rollover', key: 'rollover', isBool: true },
  ];

  const savings = current.monthlyCost - recommended.monthlyCost;

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-mtn-blue mb-2">Plan Comparison</h2>
        <p className="text-slate-400 text-sm font-medium">Side-by-side breakdown of your options.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:gap-12 relative max-w-4xl mx-auto">
        <div className="text-center pb-4">
           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current</div>
           <h3 className="text-xl md:text-2xl font-black text-mtn-blue">{current.name}</h3>
        </div>
        <div className="text-center pb-4">
           <div className="text-[10px] font-black text-mtn-yellow uppercase tracking-widest mb-2">Recommended</div>
           <h3 className="text-xl md:text-2xl font-black text-mtn-blue">{recommended.name}</h3>
        </div>

        {/* Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-100 mt-6" />

        {rows.map((row, i) => (
          <AnimatePresence key={row.label}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="col-span-2 py-6 border-b border-slate-50 flex flex-col gap-2 group hover:bg-slate-50/50 transition-colors rounded-2xl px-4"
            >
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1 group-hover:text-mtn-blue transition-colors">{row.label}</div>
              <div className="grid grid-cols-2 gap-4 md:gap-12 text-center">
                 <div className="text-sm md:text-base font-bold text-slate-500">
                    {row.isBool ? (
                      (current as any)[row.key] ? <Check className="w-5 h-5 mx-auto text-green-500" /> : <X className="w-5 h-5 mx-auto text-red-500" />
                    ) : (
                      row.formatter ? row.formatter((current as any)[row.key]) : (current as any)[row.key]
                    )}
                 </div>
                 <div className="text-sm md:text-base font-black text-mtn-blue scale-110">
                    {row.isBool ? (
                      (recommended as any)[row.key] ? <Check className="w-6 h-6 mx-auto text-green-500" /> : <X className="w-6 h-6 mx-auto text-red-500" />
                    ) : (
                      row.formatter ? row.formatter((recommended as any)[row.key]) : (recommended as any)[row.key]
                    )}
                 </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}

        {/* Savings Highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="col-span-2 bg-green-500/10 border border-green-500/20 p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between mt-8"
        >
          <div className="flex items-center gap-4">
             <div className="p-3 md:p-4 bg-green-500 rounded-2xl shadow-lg shadow-green-500/20">
               <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <div>
               <p className="text-[10px] md:text-xs font-black text-green-700 uppercase tracking-widest mb-1">Guaranteed Monthly Savings</p>
               <p className="text-2xl md:text-4xl font-black text-green-700 tracking-tight">₦{savings.toLocaleString()} / Month</p>
             </div>
          </div>
          <div className="hidden md:block">
             <div className="text-[10px] font-black text-green-700 uppercase tracking-widest text-right opacity-60">Success Rate</div>
             <div className="text-xl font-black text-green-700 text-right">99.8%</div>
          </div>
        </motion.div>

        <div className="col-span-2 pt-12 max-w-md mx-auto w-full">
           <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSwitch}
              className="w-full py-5 bg-mtn-blue text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-mtn-blue/20 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
           >
             Switch Now (*312#)
           </motion.button>
           <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-[0.2em]">Dial the code to confirm activation</p>
        </div>
      </div>
    </div>
  );
}
