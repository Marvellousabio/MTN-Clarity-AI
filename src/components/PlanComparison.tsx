import { motion, AnimatePresence } from 'motion/react';
import { Check, X, TrendingUp, ChevronDown } from 'lucide-react';
import { PLANS } from '../constants';
import { useState } from 'react';
import { Plan } from '../types';

interface PlanComparisonProps {
  currentPlanId: string;
  recommendedPlanId: string;
  onSwitch: () => void;
}

export default function PlanComparison({ currentPlanId, recommendedPlanId, onSwitch }: PlanComparisonProps) {
  const [leftPlanId, setLeftPlanId] = useState(currentPlanId);
  const [rightPlanId, setRightPlanId] = useState(recommendedPlanId);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  const leftPlan = PLANS.find(p => p.id === leftPlanId) || PLANS[0];
  const rightPlan = PLANS.find(p => p.id === rightPlanId) || PLANS[1];

  const rows = [
    { label: 'Monthly Cost', key: 'monthlyCost', formatter: (val: number) => `₦${val.toLocaleString()}` },
    { label: 'Data (GB)', key: 'dataGB', formatter: (val: number) => `${val}GB` },
    { label: 'Call Minutes', key: 'callMinutes', formatter: (val: number) => `${val.toLocaleString()} min` },
    { label: 'SMS Count', key: 'smsCount', formatter: (val: number) => val.toLocaleString() },
    { label: 'Validity', key: 'validityDays', formatter: (val: number) => `${val} Days` },
    { label: 'Activation', key: 'activationCode' },
  ];

  const savings = leftPlan.monthlyCost - rightPlan.monthlyCost;

  const PlanSelector = ({ 
    selected, 
    onSelect, 
    isOpen, 
    setIsOpen, 
    label, 
    highlightColor 
  }: { 
    selected: Plan, 
    onSelect: (id: string) => void, 
    isOpen: boolean, 
    setIsOpen: (o: boolean) => void,
    label: string,
    highlightColor: string
  }) => (
    <div className="relative group/sel">
      <div className={`text-[10px] font-black ${highlightColor} uppercase tracking-widest mb-2`}>{label}</div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between group hover:border-mtn-yellow transition-all"
      >
        <span className="font-black text-mtn-blue text-sm md:text-lg">{selected.name}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-mtn-blue transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-20" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 overflow-hidden"
            >
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelect(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-5 py-3 text-sm font-bold hover:bg-mtn-yellow/5 transition-colors border-b border-slate-50 last:border-0 ${selected.id === p.id ? 'text-mtn-blue bg-mtn-yellow/5' : 'text-slate-400'}`}
                >
                  {p.name}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="p-6 pb-24">
      <header className="mb-0 md:mb-8">
        <h2 className="text-2xl font-black text-mtn-blue mb-2">Plan Marketplace</h2>
        <p className="text-slate-400 text-sm font-medium">Compare any MTN tarrif against your current usage.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:gap-12 relative max-w-4xl mx-auto mb-12 mt-8">
        <PlanSelector 
          selected={leftPlan} 
          onSelect={setLeftPlanId} 
          isOpen={isLeftOpen} 
          setIsOpen={setIsLeftOpen}
          label="Option A"
          highlightColor="text-slate-400"
        />
        <PlanSelector 
          selected={rightPlan} 
          onSelect={setRightPlanId} 
          isOpen={isRightOpen} 
          setIsOpen={setIsRightOpen}
          label="Option B"
          highlightColor="text-mtn-yellow"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-12 relative max-w-4xl mx-auto">
        {/* Divider */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-slate-100" />

        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="col-span-2 py-6 border-b border-slate-50 flex flex-col gap-2 group hover:bg-slate-50/50 transition-colors rounded-2xl px-4"
          >
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-1 group-hover:text-mtn-blue transition-colors">{row.label}</div>
            <div className="grid grid-cols-2 gap-4 md:gap-12 text-center">
               <div className="text-sm md:text-base font-bold text-slate-500">
                  {row.formatter ? row.formatter((leftPlan as any)[row.key]) : (leftPlan as any)[row.key]}
               </div>
               <div className="text-sm md:text-base font-black text-mtn-blue scale-110">
                  {row.formatter ? row.formatter((rightPlan as any)[row.key]) : (rightPlan as any)[row.key]}
               </div>
            </div>
          </motion.div>
        ))}

        {/* Savings Highlight */}
        <motion.div
          key={`savings-${leftPlan.id}-${rightPlan.id}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`col-span-2 ${savings >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border p-6 md:p-8 rounded-[2.5rem] flex items-center justify-between mt-8`}
        >
          <div className="flex items-center gap-4">
             <div className={`p-3 md:p-4 ${savings >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-2xl shadow-lg shadow-black/5`}>
               <TrendingUp className="w-6 h-6 text-white" />
             </div>
             <div>
               <p className={`text-[10px] md:text-xs font-black ${savings >= 0 ? 'text-green-700' : 'text-red-700'} uppercase tracking-widest mb-1`}>Cost Difference</p>
               <p className={`text-2xl md:text-4xl font-black ${savings >= 0 ? 'text-green-700' : 'text-red-700'} tracking-tight`}>
                {savings >= 0 ? `₦${savings.toLocaleString()}` : `+₦${Math.abs(savings).toLocaleString()}`}
                <span className="text-xs ml-2 opacity-60"> {savings >= 0 ? 'SAVINGS' : 'INCREASE'}</span>
               </p>
             </div>
          </div>
          <div className="hidden md:block">
             <div className={`text-[10px] font-black ${savings >= 0 ? 'text-green-700' : 'text-red-700'} uppercase tracking-widest text-right opacity-60`}>Efficiency Rating</div>
             <div className={`text-xl font-black ${savings >= 0 ? 'text-green-700' : 'text-red-700'} text-right`}>
                {rightPlan.matchScore}%
             </div>
          </div>
        </motion.div>

        <div className="col-span-2 pt-12 max-w-md mx-auto w-full">
           <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onSwitch}
              className="w-full py-5 bg-mtn-blue text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-mtn-blue/20 flex items-center justify-center gap-3 hover:bg-slate-800 transition-all"
           >
             Switch to {rightPlan.name} (*312#)
           </motion.button>
           <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-[0.2em]">Dial the code to confirm activation</p>
        </div>
      </div>
    </div>
  );
}
