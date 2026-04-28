import { motion } from 'motion/react';
import { Smartphone, Zap, ShieldCheck, Globe, MessageCircle, Cpu, Database, Binary, Users, ArrowRight, Quote } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onSignIn: () => void;
  onSignUp: () => void;
}

export default function LandingPage({ onStart, onSignIn, onSignUp }: LandingPageProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-12 md:pt-32 pb-20 relative overflow-hidden flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-mtn-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 md:w-72 h-48 md:h-72 bg-mtn-blue/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/2" />

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 bg-mtn-yellow/10 border border-mtn-yellow/20 rounded-full mb-6 text-mtn-blue font-semibold text-xs tracking-wider uppercase">
              <Zap className="w-3 h-3 fill-mtn-yellow" />
              MTN Nigeria Hackathon 2026
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-mtn-blue tracking-tight">
              Understand Your <span className="text-mtn-yellow drop-shadow-sm">MTN Plan.</span> Save More Every Month.
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-lg">
              The AI-powered advisor for smarter data, calls and bundles. Powered by <span className="text-mtn-blue font-bold">Microsoft AI Foundry</span> for the best network.
            </motion.p>

             <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
               <motion.button
                 whileTap={{ scale: 0.95 }}
                 onClick={onStart}
                 className="px-8 py-4 bg-mtn-blue text-white rounded-2xl font-bold text-lg shadow-xl shadow-mtn-blue/30 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                 Launch Assistant <ArrowRight className="w-5 h-5" />
               </motion.button>
               <motion.button
                 whileTap={{ scale: 0.95 }}
                 onClick={onSignIn}
                 className="px-8 py-4 bg-white border-2 border-slate-100 text-mtn-blue rounded-2xl font-bold text-lg hover:border-mtn-yellow hover:bg-mtn-yellow/5 transition-all flex items-center justify-center"
               >
                 Sign In
               </motion.button>
             </motion.div>
            
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-4 text-slate-400">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`w-10 h-10 rounded-full bg-slate-200 border-4 border-white overflow-hidden flex items-center justify-center text-[10px] font-black text-slate-400 ${i % 2 === 0 ? 'bg-mtn-yellow/20' : 'bg-mtn-blue/20'}`}>
                      {['M', 'A', 'S', 'E'][i-1]}
                    </div>
                  ))}
               </div>
               <span className="text-xs font-black uppercase tracking-widest">Built by Team ClarityAI</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            className="hidden md:flex justify-center relative group"
          >
            <div className="w-[320px] h-[640px] bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl relative border-4 border-slate-800 scale-100 lg:scale-110 text-white">
              <div className="w-full h-full bg-slate-100 rounded-[2.8rem] overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-20" />
                <div className="p-6 pt-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-mtn-yellow shadow-lg shadow-mtn-yellow/20 flex items-center justify-center">
                       <span className="font-black text-mtn-blue">C</span>
                    </div>
                    <div className="space-y-1">
                      <div className="w-24 h-2.5 bg-slate-200 rounded" />
                      <div className="w-16 h-2 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-4/5 h-10 bg-mtn-blue text-white p-3 rounded-2xl rounded-tl-none text-[8px] font-bold">Why my data finish fast?</div>
                    <div className="w-3/4 h-16 bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-sm">
                      <div className="w-full h-2 bg-slate-100 rounded mb-2" />
                      <div className="w-2/3 h-2 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-10 bg-mtn-yellow/10 blur-3xl rounded-full -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Tech Architecture Section */}
      <section className="px-6 md:px-12 py-24 bg-slate-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-xs font-black text-mtn-blue uppercase tracking-[0.3em] mb-4">Technical Architecture</h2>
            <h3 className="text-3xl md:text-5xl font-black text-mtn-blue">Powered by <span className="text-mtn-yellow">Semantic Kernel</span></h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: Cpu, 
                title: 'Plan Intelligence', 
                desc: 'Semantic Kernel PlanPlugin manages activation codes, tarrif lookups, and Pidgin-language conversion logic.',
                color: 'bg-blue-500'
              },
              { 
                icon: Binary, 
                title: 'Recommendation Engine', 
                desc: 'A 4-factor scoring algorithm analyzing Data Fit (35%), Cost (30%), Segment (20%), and Features (15%).',
                color: 'bg-mtn-yellow'
              },
              { 
                icon: Database, 
                title: 'Memory Persistence', 
                desc: 'UserMemoryPlugin remembers names, budget constraints, and previous queries between session restarts.',
                color: 'bg-green-500'
              }
            ].map((tech, i) => (
              <motion.div
                key={tech.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
              >
                <div className={`w-14 h-14 ${tech.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/5`}>
                  <tech.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-black text-mtn-blue mb-3">{tech.title}</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

       {/* Demo Scenarios / Use Cases */}
       <section className="px-6 md:px-12 py-24">
         <div className="max-w-7xl mx-auto">
           <div className="mb-16">
             <h2 className="text-xs font-black text-mtn-blue uppercase tracking-[0.3em] mb-4">Real World Scenarios</h2>
             <h3 className="text-3xl md:text-5xl font-black text-mtn-blue leading-tight mb-8">Built for <span className="text-mtn-yellow">Every Nigerian.</span></h3>
           </div>

           <div className="space-y-6">
             {[
               {
                 tag: 'PIDGIN SUPPORT',
                 title: 'The Confused Subscriber',
                 quote: 'Abeg explain this MTN BizPlus for me, e be like I dey lose money.',
                 result: 'ClarityAI detects the sentiment, switches to Pidgin register, and simplifies the value proposition.'
               },
               {
                 tag: 'USER MEMORY',
                 title: 'The Returning User',
                 quote: 'Hi, I am back. Did you find anything better for me?',
                 result: 'Kernel memory recalls the users name and previous interest in Pulse Flexi to offer a ₦1,200/mo saving.'
               },
               {
                 tag: 'SME GROWTH',
                 title: 'The SME Owner',
                 quote: 'I run a small business, 5 staff, 40GB usage, budget is ₦25,000.',
                 result: 'Automated Scoring Engine ranks BizPlus Pro as the 88% match for your business scale.'
               },
             ].map((scenario, i) => (
               <motion.div
                 key={scenario.title}
                 initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row gap-8 items-center"
               >
                 <div className="flex-1">
                   <div className="inline-block px-3 py-1 bg-mtn-blue text-white text-[9px] font-black rounded-full mb-4 tracking-widest">{scenario.tag}</div>
                   <h4 className="text-2xl font-black text-mtn-blue mb-4">{scenario.title}</h4>
                   <div className="flex gap-3 mb-6">
                     <Quote className="w-8 h-8 text-mtn-yellow shrink-0 rotate-180" />
                     <p className="text-xl font-bold text-slate-400 italic leading-snug">{scenario.quote}</p>
                   </div>
                   <p className="text-sm font-bold text-mtn-blue bg-white p-4 rounded-2xl border border-slate-200">
                     <span className="text-mtn-yellow">AI Response:</span> {scenario.result}
                   </p>
                 </div>
                 <div className="w-full md:w-64 h-48 bg-slate-200 rounded-[2rem] flex items-center justify-center">
                    <Users className="w-16 h-16 text-slate-300" />
                 </div>
               </motion.div>
             ))}
           </div>
         </div>
       </section>

       {/* Plan Comparator Section */}
       <section className="px-6 md:px-12 py-24 bg-slate-50 relative overflow-hidden">
         <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16">
             <h2 className="text-xs font-black text-mtn-blue uppercase tracking-[0.3em] mb-4">Plan Comparator</h2>
             <h3 className="text-3xl md:text-5xl font-black text-mtn-blue leading-tight mb-4">Compare <span className="text-mtn-yellow">MTN Plans</span> Side by Side</h3>
             <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">See exactly what each plan offers and find your perfect match in seconds.</p>
           </div>

           {/* Mobile dropdown selectors */}
           <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 md:hidden">
             <select className="bg-white border border-slate-200 p-4 rounded-2xl font-bold text-mtn-blue focus:outline-none focus:ring-2 focus:ring-mtn-yellow">
               <option>MTN Pulse Flexi</option>
               <option>MTN Pulse Plus</option>
               <option>MTN XtraValue</option>
               <option>MTN BizPlus Starter</option>
               <option>MTN BizPlus Pro</option>
               <option>MTN BizPlus Enterprise</option>
               <option>MTN Daily 5x5</option>
             </select>
             <select className="bg-white border border-slate-200 p-4 rounded-2xl font-bold text-mtn-blue focus:outline-none focus:ring-2 focus:ring-mtn-yellow">
               <option>MTN Pulse Plus</option>
               <option>MTN Pulse Flexi</option>
               <option>MTN XtraValue</option>
               <option>MTN BizPlus Starter</option>
               <option>MTN BizPlus Pro</option>
               <option>MTN BizPlus Enterprise</option>
               <option>MTN Daily 5x5</option>
             </select>
           </div>

           {/* Desktop comparison table */}
           <div className="hidden md:block overflow-x-auto">
             <div className="min-w-[800px] bg-white rounded-[2.5rem] border border-slate-200 shadow-lg overflow-hidden">
               {/* Table Header */}
               <div className="grid grid-cols-3 bg-mtn-blue text-white">
                 <div className="p-6 text-center font-black text-sm uppercase tracking-widest opacity-50">Feature</div>
                 <div className="p-6 text-center font-black text-lg">MTN Pulse Flexi</div>
                 <div className="p-6 text-center font-black text-lg bg-mtn-yellow/20 border-l border-white/10">MTN Pulse Plus</div>
               </div>

               {/* Table Rows */}
               <div className="divide-y divide-slate-100">
                 {[
                   { label: 'Monthly Cost', left: '₦2,000', right: '₦3,500', highlight: false },
                   { label: 'Data Allowance', left: '7GB', right: '15GB', highlight: true },
                   { label: 'Call Minutes', left: '200 min', right: '400 min', highlight: false },
                   { label: 'SMS Count', left: '100', right: '200', highlight: false },
                   { label: 'Validity', left: '30 Days', right: '30 Days', highlight: false },
                   { label: 'Night Data', left: '2GB (12AM-6AM)', right: '3GB (12AM-6AM)', highlight: true },
                   { label: 'Social Bonus', left: 'None', right: 'WhatsApp & Instagram (1GB/day)', highlight: true },
                                           { label: 'Data Rollover', left: '✓ Yes', right: '✓ Yes', highlight: false },
                   { label: 'Activation Code', left: '*406#', right: '*406*2#', highlight: false },
                 ].map((row, i) => (
                   <motion.div
                     key={row.label}
                     initial={{ opacity: 0, x: -10 }}
                     whileInView={{ opacity: 1, x: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.05 }}
                     className={`grid grid-cols-3 ${row.highlight ? 'bg-mtn-yellow/5' : 'bg-white'} hover:bg-mtn-yellow/10 transition-colors`}
                   >
                     <div className="p-5 text-center border-r border-slate-100 text-sm font-bold text-slate-500 flex items-center justify-center">{row.label}</div>
                     <div className="p-5 text-center text-mtn-blue font-semibold flex items-center justify-center">{row.left}</div>
                     <div className="p-5 text-center font-black text-mtn-blue bg-mtn-yellow/5 border-l border-slate-100 flex items-center justify-center">{row.right}</div>
                   </motion.div>
                 ))}
               </div>

               {/* Savings callout */}
               <motion.div
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="mt-6 bg-gradient-to-r from-mtn-yellow/10 to-mtn-yellow/5 border-2 border-mtn-yellow/30 p-6 md:p-8 rounded-[2rem] text-center"
               >
                 <div className="flex items-center justify-center gap-4 flex-wrap">
                   <div className="w-12 h-12 bg-mtn-yellow rounded-2xl flex items-center justify-center shadow-lg">
                     <svg className="w-6 h-6 text-mtn-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                   </div>
                   <div>
                     <p className="text-xs font-black text-mtn-blue uppercase tracking-widest mb-1">Better Value</p>
                     <p className="text-2xl md:text-3xl font-black text-mtn-blue">Pulse Plus gives you 114% more data for just ₦1,500 extra</p>
                   </div>
                 </div>
               </motion.div>
             </div>
           </div>

           {/* Mobile stacked comparison (visible only on mobile) */}
           <div className="md:hidden space-y-6">
             {/* Pulse Flexi Card */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-white rounded-[2rem] border-2 border-slate-200 p-6"
             >
               <h4 className="text-xl font-black text-mtn-blue mb-4">MTN Pulse Flexi</h4>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Monthly Cost</span>
                   <span className="font-black text-mtn-blue">₦2,000</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Data</span>
                   <span className="font-black text-mtn-blue">7GB</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Calls</span>
                   <span className="font-black text-mtn-blue">200 min</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">SMS</span>
                   <span className="font-black text-mtn-blue">100</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Activation</span>
                   <span className="font-black text-mtn-blue text-sm">*406#</span>
                 </div>
                  <button 
                    onClick={() => onStart()}
                    className="w-full mt-4 py-3 bg-mtn-blue text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                  >
                    Learn More
                  </button>
               </div>
             </motion.div>

             {/* Pulse Plus Card */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: 0.1 }}
               className="bg-white rounded-[2rem] border-2 border-mtn-yellow p-6 shadow-xl relative overflow-hidden"
             >
               <div className="absolute top-0 right-0 bg-mtn-yellow text-mtn-blue text-[10px] font-black px-3 py-1 rounded-bl-2xl">RECOMMENDED</div>
               <h4 className="text-xl font-black text-mtn-blue mb-4">MTN Pulse Plus</h4>
               <div className="space-y-4">
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Monthly Cost</span>
                   <span className="font-black text-mtn-blue">₦3,500</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Data</span>
                   <span className="font-black text-mtn-blue">15GB</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Calls</span>
                   <span className="font-black text-mtn-blue">400 min</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">SMS</span>
                   <span className="font-black text-mtn-blue">200</span>
                 </div>
                 <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                   <span className="text-slate-500 font-medium">Activation</span>
                   <span className="font-black text-mtn-blue text-sm">*406*2#</span>
                 </div>
                  <button 
                    onClick={() => onStart()}
                    className="w-full mt-4 py-3 bg-mtn-yellow text-mtn-blue rounded-xl font-bold hover:bg-mtn-blue hover:text-white transition-colors"
                  >
                    Get This Plan
                  </button>
               </div>
             </motion.div>
           </div>

           <p className="text-center text-sm text-slate-400 mt-10 font-medium">
             Compare all 7 available plans in the chat assistant for personalized recommendations.
           </p>
         </div>
       </section>

      {/* Final CTA */}
      <section className="px-6 md:px-12 py-24 bg-mtn-blue text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-6xl font-black mb-8 leading-[1.1]">Ready to save on your <span className="text-mtn-yellow">MTN lifestyle?</span></h2>
          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto font-medium">
            Join the elite subscribers using AI to optimize every kobo.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSignUp}
            className="px-12 py-5 bg-mtn-yellow text-mtn-blue rounded-[2.5rem] font-black text-xl shadow-2xl shadow-black/20"
          >
            Start Your Journey
          </motion.button>
        </div>
        
        {/* Visual elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex flex-wrap gap-20 p-20">
           {Array.from({length: 20}).map((_, i) => (
             <Cpu key={i} className="w-12 h-12" />
           ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-mtn-blue flex items-center justify-center">
                 <span className="text-mtn-yellow font-black text-sm">C</span>
              </div>
              <span className="font-black text-mtn-blue uppercase tracking-widest text-sm">MTN ClarityAI</span>
           </div>
           <div className="flex gap-8 text-[10px] font-black text-slate-400 tracking-[0.2em]">
              <a href="#" className="hover:text-mtn-blue transition-colors">PRIVACY</a>
              <a href="#" className="hover:text-mtn-blue transition-colors">TERMS</a>
              <a href="#" className="hover:text-mtn-blue transition-colors">MTN OFFICIAL</a>
           </div>
           <div className="text-[10px] font-bold text-slate-400">© 2026 Team ClarityAI. Powered by Microsoft AI Foundry.</div>
        </div>
      </footer>
    </div>
  );
}
