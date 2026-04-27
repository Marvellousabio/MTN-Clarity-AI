import { motion } from 'motion/react';
import { Smartphone, Zap, ShieldCheck, Globe, MessageCircle } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-6 md:px-12 pt-12 md:pt-24 pb-20 relative overflow-hidden flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full">
        {/* Abstract background glow */}
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-mtn-yellow/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 md:w-72 h-48 md:h-72 bg-mtn-blue/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/2" />

        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-mtn-yellow/10 border border-mtn-yellow/20 rounded-full mb-6 text-mtn-blue font-semibold text-xs tracking-wider uppercase">
              <Zap className="w-3 h-3 fill-mtn-yellow" />
              Hackathon Winner Tech
            </div>

            <h1 className="text-4xl md:text-7xl font-extrabold leading-[1.1] mb-6 text-mtn-blue tracking-tight">
              Understand Your <span className="text-mtn-yellow drop-shadow-sm">MTN Plan.</span> Save More Every Month.
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium max-w-lg">
              AI powered advisor for smarter data, calls and bundles. Optimized for Nigeria's best network. Join thousands saving today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onStart}
                className="px-8 py-4 bg-mtn-blue text-white rounded-2xl font-bold text-lg shadow-lg shadow-mtn-blue/20 hover:bg-mtn-blue/90 transition-all flex items-center justify-center gap-2"
              >
                Launch Assistant
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white border-2 border-slate-100 text-mtn-blue rounded-2xl font-bold text-lg hover:border-mtn-yellow transition-all flex items-center justify-center"
              >
                Try Demo
              </motion.button>
            </div>
            
            <div className="mt-12 flex items-center gap-4 text-slate-400">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white" />
                  ))}
               </div>
               <span className="text-xs font-bold uppercase tracking-widest">50k+ Users Active</span>
            </div>
          </motion.div>

          {/* Animated Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: 'spring' }}
            className="hidden md:flex justify-center relative group"
          >
            <div className="w-[320px] h-[640px] bg-slate-900 rounded-[3.5rem] p-4 shadow-2xl relative border-4 border-slate-800 scale-110">
              {/* Screen */}
              <div className="w-full h-full bg-slate-100 rounded-[2.8rem] overflow-hidden relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-20" />
                
                <div className="p-6 pt-12">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-mtn-yellow animate-pulse shadow-lg shadow-mtn-yellow/20" />
                    <div className="space-y-1.5">
                      <div className="w-24 h-2.5 bg-slate-200 rounded" />
                      <div className="w-16 h-2 bg-slate-200 rounded" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="w-4/5 h-10 bg-mtn-blue/10 rounded-2xl rounded-tl-none animate-bounce" />
                    <div className="w-3/4 h-10 bg-mtn-blue/10 rounded-2xl rounded-tl-none" />
                    <div className="w-1/2 h-10 bg-slate-200 rounded-2xl rounded-tr-none ml-auto" />
                    <div className="w-2/3 h-10 bg-mtn-blue/10 rounded-2xl rounded-tl-none" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -inset-10 bg-mtn-yellow/20 blur-3xl rounded-full -z-10 animate-pulse" />
          </motion.div>
          
          {/* Mobile visible mockup (smaller) */}
          <motion.div className="md:hidden flex justify-center mt-12">
             {/* ...existing mobile mockup logic simplified or reused... */}
             <div className="w-[240px] h-[400px] bg-slate-900 rounded-[2.5rem] p-2 overflow-hidden border-2 border-slate-800">
                <div className="w-full h-full bg-slate-100 rounded-[2.2rem] p-4">
                   <div className="w-8 h-8 rounded-full bg-mtn-yellow mb-4" />
                   <div className="space-y-2">
                      <div className="w-full h-4 bg-slate-200 rounded" />
                      <div className="w-2/3 h-4 bg-slate-200 rounded" />
                   </div>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Features summary */}
      <section className="px-6 md:px-12 py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-black mb-12 text-mtn-blue text-center uppercase tracking-[0.2em] opacity-60">Winning Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: ShieldCheck, title: 'Secure', desc: 'Private bank-grade data encryption' },
              { icon: Globe, title: 'Multi-Lingual', desc: 'Pidgin, Yoruba, Igbo, Hausa' },
              { icon: Zap, title: 'Smart', desc: 'Auto-bundled optimization logic' },
              { icon: MessageCircle, title: 'WhatsApp', desc: 'Conversational AI interface' },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 md:p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200 transition-all group"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-mtn-yellow/20 transition-colors">
                  <feat.icon className="w-6 h-6 text-mtn-yellow" />
                </div>
                <div className="font-black text-lg text-mtn-blue mb-1">{feat.title}</div>
                <div className="text-xs md:text-sm text-slate-500 font-medium">{feat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
