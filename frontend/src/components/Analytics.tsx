import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingDown, Smartphone, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAppContext } from '../context/AppContext';

export default function Analytics() {
  const { userId } = useAppContext();
  const [usageStats, setUsageStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      api.get('/usage/current', { params: { userId } })
        .then(res => {
          if (res.data && res.data.usageByCategory) {
            setUsageStats(res.data.usageByCategory);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Loading insights...</div>;
  }

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h2 className="text-2xl font-black text-mtn-blue mb-2 text-mtn-blue">Usage Insights</h2>
        <p className="text-slate-400 text-sm font-medium">Where your data goes every month.</p>
      </header>

      {/* Main Chart */}
      <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 shadow-sm mb-6 flex flex-col md:flex-row items-center gap-12">
        <div className="h-64 w-full md:w-1/2 relative">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie
                data={usageStats}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="percentage"
                stroke="none"
              >
                {usageStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                itemStyle={{ fontWeight: '900', fontSize: '14px' }}
              />
            </RePieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-black text-mtn-blue">
              {usageStats.length > 0 ? usageStats[0].percentage + '%' : '0%'}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-x-8 gap-y-6 w-full md:w-1/2 mt-4">
          {usageStats.map((stat) => (
            <div key={stat.category} className="flex items-center gap-4 group">
              <div className="w-4 h-4 rounded-full group-hover:scale-125 transition-transform" style={{ backgroundColor: stat.color }} />
              <div className="flex-1">
                <div className="flex justify-between items-end mb-1">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.category}</div>
                  <div className="text-sm font-black text-mtn-blue">{stat.percentage}%</div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.percentage}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: stat.color }}
                   />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-mtn-blue p-6 rounded-[2rem] text-white shadow-xl shadow-mtn-blue/20 relative overflow-hidden"
      >
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
            <Smartphone className="w-6 h-6 text-mtn-yellow" />
          </div>
          <div>
            <h4 className="text-lg font-black mb-2">Smart Insight</h4>
            <p className="text-white/70 text-sm leading-relaxed font-semibold">
              You use social apps heavily. MTN social bundle can reduce your data cost by <span className="text-mtn-yellow">40%</span> compared to your current plan.
            </p>
          </div>
        </div>
        {/* Decorative circle */}
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full" />
      </motion.div>

      {/* Weekly Trend (Simulated) */}
      <div className="mt-8 space-y-4">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Weekly Data Burn</h3>
         <div className="flex items-end justify-between h-20 gap-2 px-2">
            {[40, 65, 30, 85, 45, 90, 70].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={`flex-1 rounded-t-lg ${h > 75 ? 'bg-mtn-yellow' : 'bg-slate-200'}`}
              />
            ))}
         </div>
         <div className="flex justify-between px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
         </div>
      </div>
    </div>
  );
}
