"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Check, 
  Layers, 
  Wand2, 
  FileText, 
  PieChart, 
  Database, 
  Sliders, 
  FileOutput, 
  School, 
  GraduationCap, 
  BookOpen, 
  Landmark, 
  FlaskConical, 
  Microscope,
  Menu,
  X,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Timer,
  Loader2,
  CheckCircle2,
  Users
} from "lucide-react";

// --- Components ---

const AnimatedCountUp = ({ to, decimals = 0 }: { to: number, decimals?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
  
  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const startTime = performance.now();
      
      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        const val = easeOut * to;
        setDisplayValue(Number(val.toFixed(decimals)));
        
        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };
      
      requestAnimationFrame(update);
    }
  }, [to, isInView, decimals]);

  return <span ref={ref}>{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
};

const AnimatedWidthBar = ({ width, colorClass, shadowClass, delay = 0 }: { width: string, colorClass: string, shadowClass?: string, delay?: number }) => {
    return (
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "circOut", delay }}
                className={`h-full ${colorClass} ${shadowClass || ''}`}
            />
        </div>
    );
};

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Simulation State
  const [aiStage, setAiStage] = useState(0);
  const aiStages = [
    { text: "Scanning Syllabus...", icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
    { text: "Structuring Layout...", icon: Layers, color: "text-indigo-600", bg: "bg-indigo-50" },
    { text: "Balancing Difficulty...", icon: Sliders, color: "text-purple-600", bg: "bg-purple-50" },
    { text: "Paper Generated!", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", done: true }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // AI Loop
    const interval = setInterval(() => {
        setAiStage((prev) => (prev + 1) % aiStages.length);
    }, 2500);

    return () => {
        window.removeEventListener("scroll", handleScroll);
        clearInterval(interval);
    };
  }, []);

  const currentAiStage = aiStages[aiStage] || aiStages[0]!;

  return (
    <div className="text-slate-900 bg-white overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 h-[70px] z-50 flex items-center transition-all duration-300 ${isScrolled ? 'bg-white/85 backdrop-blur-md border-b border-slate-200' : 'bg-white/0'}`}>
        <div className="w-full max-w-[1200px] mx-auto px-6 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight text-slate-900">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg grid place-items-center shadow-lg shadow-blue-200">
                    <Layers size={18} strokeWidth={2.5} />
                </div>
                Question Hive
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Features</a>
                <a href="#schools" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">For Schools</a>
                <a href="#pricing" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Pricing</a>
                <a href="#resources" className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">Resources</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
                <Link href="/auth/login" className="text-sm font-semibold text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-full transition-colors">Log In</Link>
                <Link href="/auth/register" className="text-sm font-bold bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-[0_4px_6px_rgba(37,99,235,0.2)] hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[0_8px_15px_rgba(37,99,235,0.25)] transition-all">Start Free</Link>
            </div>

            <button className="md:hidden text-slate-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 text-center relative overflow-hidden bg-white">
        {/* Dot Background - Maximized Visibility */}
        <div className="absolute inset-0 h-full w-full bg-[radial-gradient(#94a3b8_1.5px,transparent_1.5px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black_60%,transparent_100%)] opacity-40 -z-10" />
        {/* Bottom Glow */}
        <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.13)_0,rgba(0,163,255,0)_50%,rgba(0,163,255,0)_100%)]" />

        <div className="container max-w-[1200px] mx-auto px-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-sm font-semibold text-blue-600 mb-8 shadow-sm hover:shadow-md transition-all cursor-pointer">
                    <Sparkles size={14} className="fill-blue-600 animate-pulse" /> New: AI Auto-Generator v2.0
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-[4rem] font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
                    Create Exam Papers<br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-600">in Minutes, Not Hours.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                    Stop fighting with formatting. Question Hive helps teachers generate, format, and export professional question papers instantly using AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <Link href="/auth/register" className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:bg-blue-700 transition-all hover:-translate-y-1">
                        Start Creating for Free
                    </Link>
                </div>
                <p className="text-sm text-slate-400 font-medium flex items-center justify-center gap-4">
                    <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" strokeWidth={3} /> No credit card required</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>14-day free trial</span>
                </p>
            </motion.div>

            {/* Mockup */}
            <motion.div 
                initial={{ opacity: 0, y: 40, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="mt-16 max-w-[1000px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-[0_25px_50px_-12px_rgba(37,99,235,0.25)] overflow-hidden relative group perspective-[1000px]"
            >
                <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="relative">
                    {/* Placeholder Image */}
                    {/* Video Placeholder */}
                    {/* Video Placeholder */}
                    <div className="bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        <video 
                            src="/demo-video.mp4" 
                            className="w-full h-auto" 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                        />
                        {/* Glint Effect */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[length:250%_250%,100%_100%] bg-[position:0_0,0_0] group-hover:bg-[position:100%_100%,0_0] pointer-events-none" />
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="py-12 border-b border-slate-100 bg-white overflow-hidden">
        <div className="container max-w-[1200px] mx-auto px-6 mb-8 text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em]">Trusted by 500+ Innovative Schools</p>
        </div>
        <div className="relative flex overflow-x-hidden group mask-linear-fade">
             <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
             <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
             
             <motion.div 
                className="flex gap-16 whitespace-nowrap py-2"
                animate={{ x: "-50%" }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
             >
                {/* LOGO SET 1 */}
                <div className="flex gap-16 items-center">
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><School /> EduTech High</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><GraduationCap /> Greenwood Academy</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><BookOpen /> BrightPath Tutors</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Landmark /> King's College</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><FlaskConical /> Science Labs Inc</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Microscope /> Future Minds</span>
                </div>
                {/* LOGO SET 2 */}
                <div className="flex gap-16 items-center">
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><School /> EduTech High</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><GraduationCap /> Greenwood Academy</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><BookOpen /> BrightPath Tutors</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Landmark /> King's College</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><FlaskConical /> Science Labs Inc</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Microscope /> Future Minds</span>
                </div>
                {/* LOGO SET 3 */}
                <div className="flex gap-16 items-center">
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><School /> EduTech High</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><GraduationCap /> Greenwood Academy</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><BookOpen /> BrightPath Tutors</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Landmark /> King's College</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><FlaskConical /> Science Labs Inc</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Microscope /> Future Minds</span>
                </div>
                {/* LOGO SET 4 */}
                <div className="flex gap-16 items-center">
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><School /> EduTech High</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><GraduationCap /> Greenwood Academy</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><BookOpen /> BrightPath Tutors</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Landmark /> King's College</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><FlaskConical /> Science Labs Inc</span>
                    <span className="flex items-center gap-2 text-xl font-bold text-slate-400/80"><Microscope /> Future Minds</span>
                </div>
             </motion.div>
        </div>
      </section>

      {/* Features (Bento Grid) */}
      <section className="py-24 bg-slate-50" id="features">
        <div className="container max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Everything you need to<br />run exams smoothly.</h2>
                <p className="text-lg text-slate-500">We combine a massive question bank with smart design tools to give you the ultimate assessment platform.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                
                {/* Card 1: AI Auto-Gen */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="md:row-span-2 bg-blue-600 rounded-3xl p-8 text-white flex flex-col relative overflow-hidden group hover:shadow-xl transition-all"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-xl grid place-items-center mb-6">
                            <Wand2 className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">AI Auto-Gen</h3>
                        <p className="text-blue-100 leading-relaxed">Select your topic, difficulty, and marks. Our AI builds a balanced paper in 3 seconds flat.</p>
                    </div>
                </motion.div>

                {/* Card 2: Perfect PDF */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col md:flex-row justify-between relative overflow-hidden hover:border-blue-200 hover:shadow-lg transition-all"
                >
                     <div className="max-w-xs z-10 relative">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl grid place-items-center mb-6 text-blue-600">
                            <FileOutput />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Perfect PDF Formatting</h3>
                        <p className="text-slate-500 leading-relaxed">Forget MS Word alignment issues. We handle equation rendering (LaTeX), image placement, and watermarks automatically.</p>
                    </div>
                    {/* Visual Placeholder */}
                    <div className="absolute right-0 bottom-0 md:top-10 md:right-10 w-64 h-48 bg-slate-100 rounded-tl-2xl border-l border-t border-slate-200 shadow-sm translate-y-4 translate-x-4"></div>
                </motion.div>

                {/* Card 3: Bloom's Taxonomy */}
                <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl border border-slate-200 p-8 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                     <div className="w-12 h-12 bg-blue-50 rounded-xl grid place-items-center mb-4 text-blue-600">
                        <PieChart />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Bloom's Analytics</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Analyze difficulty distribution and cognitive levels before printing.</p>
                </motion.div>

                {/* Card 4: Question Bank */}
                <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl border border-slate-200 p-8 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                     <div className="w-12 h-12 bg-blue-50 rounded-xl grid place-items-center mb-4 text-blue-600">
                        <Database />
                    </div>
                    <h3 className="text-xl font-bold mb-2"><AnimatedCountUp to={50} />k+ Questions</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">Verified bank for JEE, NEET, and CBSE, or upload your own.</p>
                </motion.div>

            </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-24 bg-[#F8FAFC] relative overflow-hidden">
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
                 <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4">Workflow</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">3 Steps to Your Perfect Paper</h2>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                    Skip the formatting headaches. Question Hive streamlines the chaos into a simple, linear process.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-[2px] bg-[repeating-linear-gradient(to_right,#CBD5E1_0,#CBD5E1_8px,transparent_8px,transparent_16px)] -z-10" />

                {[
                    { title: "Configure & Set", desc: "Define your paper parameters. Select the subject, set the duration (e.g., 3 Hours), and choose total marks.", icon: Sliders },
                    { title: "Generate or Pick", desc: "Toggle between Manual Mode to browse our bank, or hit AI Generate to instantly fill the paper.", icon: Wand2 },
                    { title: "Preview & Export", desc: "See the final layout in real-time. One click exports a formatted PDF with your watermark and logo.", icon: FileOutput }
                ].map((step, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ delay: idx * 0.2 }}
                        className="bg-white border border-slate-200/80 rounded-[24px] p-10 hover:shadow-xl hover:translate-y-[-8px] hover:border-blue-200 transition-all duration-300 group shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_10px_15px_-3px_rgba(0,0,0,0.02)]"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-200/60 grid place-items-center mb-8 relative group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-600 text-slate-400 transition-colors">
                            <step.icon size={28} />
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full grid place-items-center font-bold text-sm border-4 border-white shadow-sm">
                                {idx + 1}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{step.title}</h3>
                        <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section className="py-24 bg-white">
        <div className="container max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Data-Backed Insights</h2>
                <p className="text-lg text-slate-500">Real-time analytics to ensure every assessment is balanced and efficient.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Highest Subjects */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-sm flex flex-col">
                     <div className="mb-8">
                        <h3 className="font-bold text-xl text-slate-900">Highest Subjects</h3>
                        <p className="text-sm text-slate-400 font-medium">Most frequently generated</p>
                    </div>
                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span>Physics</span><span className="text-blue-600">42%</span></div>
                            <AnimatedWidthBar width="42%" colorClass="bg-blue-600" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span>Mathematics</span><span className="text-slate-400">31%</span></div>
                            <AnimatedWidthBar width="31%" colorClass="bg-slate-400" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span>Chemistry</span><span className="text-slate-300">15%</span></div>
                            <AnimatedWidthBar width="15%" colorClass="bg-slate-300" />
                        </div>
                    </div>
                </div>

                {/* Difficulty Weightage */}
                <div className="bg-white border border-slate-200 rounded-[24px] p-10 shadow-sm flex flex-col">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="font-bold text-xl text-slate-900">Weightage</h3>
                            <p className="text-sm text-slate-400 font-medium">Auto-balancing</p>
                        </div>
                        <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase">Balanced</span>
                    </div>
                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span className="text-emerald-600 bg-emerald-50 px-1.5 rounded">Easy</span><span>25%</span></div>
                            <AnimatedWidthBar width="25%" colorClass="bg-emerald-400" shadowClass="shadow-[0_0_10px_rgba(52,211,153,0.3)]" />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span className="text-amber-600 bg-amber-50 px-1.5 rounded">Medium</span><span>55%</span></div>
                            <AnimatedWidthBar width="55%" colorClass="bg-amber-400" shadowClass="shadow-[0_0_10px_rgba(251,191,36,0.3)]" delay={0.1} />
                        </div>
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span className="text-rose-600 bg-rose-50 px-1.5 rounded">Hard</span><span>20%</span></div>
                            <AnimatedWidthBar width="20%" colorClass="bg-rose-500" shadowClass="shadow-[0_0_10px_rgba(244,63,94,0.3)]" delay={0.2} />
                        </div>
                    </div>
                </div>

                {/* Efficiency Index */}
                <div className="bg-slate-900 text-white rounded-[24px] p-10 text-center flex flex-col justify-center shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                     {/* Pulse Circle */}
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full animate-pulse" />
                     
                     <div className="text-4xl mb-4 grayscale group-hover:grayscale-0 transition-all duration-500">⏱️</div>
                     <p className="text-slate-400 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-2">Efficiency Index</p>
                     <h2 className="text-5xl font-black text-indigo-400 mb-1 leading-none"><AnimatedCountUp to={222} /></h2>
                     <p className="text-lg font-bold mb-6">Hours Saved</p>
                     <p className="text-xs text-slate-500 leading-relaxed font-medium">Average time saved per generated paper globally.</p>
                </div>
            </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white" id="about">
        <div className="container max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                 <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                 >
                    <span className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-2 block">Our Mission</span>
                    <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Empowering Teachers to Focus on Teaching</h2>
                    <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                        We started Question Hive because we saw brilliant teachers spending their weekends fighting with formatting tools instead of resting or planning inspiring lessons.
                    </p>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                        Our goal is to give back 10 hours every week to every educator by automating the tedious parts of assessment creation.
                    </p>

                    <div className="flex gap-12 pt-8 border-t border-slate-100">
                        <div>
                            <h4 className="text-4xl font-extrabold text-blue-600 mb-1"><AnimatedCountUp to={500} />+</h4>
                            <p className="font-bold text-slate-500 text-sm">Schools Partnered</p>
                        </div>
                        <div>
                            <h4 className="text-4xl font-extrabold text-blue-600 mb-1"><AnimatedCountUp to={1.2} decimals={1} />M</h4>
                            <p className="font-bold text-slate-500 text-sm">Questions Banked</p>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-slate-100"
                >
                    <div className="absolute inset-0 bg-blue-500/10" />
                     {/* Placeholder for About Image */}
                     <div className="absolute inset-0 grid place-items-center text-slate-300">
                        <Users size={64} />
                     </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Pricing / For Independent Teachers */}
      <section className="py-20 bg-white border-b border-slate-100" id="pricing">
        <div className="container max-w-[1000px] mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 text-center md:text-left">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4">For Tutors</span>
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Teach on your own terms?</h2>
                    <p className="text-lg text-slate-500 mb-6">
                        No subscriptions. No annual contracts. Just buy credits and generate high-quality papers whenever you need them.
                    </p>
                    <ul className="space-y-3 mb-8 inline-block text-left">
                        <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 size={18} className="text-emerald-500" /> Pay-as-you-go convenience
                        </li>
                        <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 size={18} className="text-emerald-500" /> ₹1 per MCQ generation
                        </li>
                         <li className="flex items-center gap-3 text-slate-700 font-medium">
                            <CheckCircle2 size={18} className="text-emerald-500" /> Use strictly when needed
                        </li>
                    </ul>
                </div>
                
                 {/* Pay As You Go Card */}
                <div className="w-full md:w-[400px] bg-emerald-50/50 border border-emerald-100 rounded-3xl p-8 flex flex-col hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Zero Commitment</div>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Individual Credit</h3>
                        <p className="text-sm text-slate-500 mb-6">Buy tokens, generate instantly</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-extrabold text-emerald-600">₹1</span>
                            <span className="text-slate-500 font-medium">/ credit</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 font-medium">1 Credit = 1 MCQ Generation</p>
                    </div>
                     <Link href="/auth/register?plan=individual" className="w-full py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors text-center shadow-lg shadow-emerald-200">
                        Start with 100 Credits
                    </Link>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing / For Schools Section */}
      <section className="py-24 bg-slate-50">
        <div className="container max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="inline-block px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-4" id="schools">For Schools & Institutes</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
                <p className="text-lg text-slate-500">Choose the plan that fits your institute size. Scale up with AI credits as you grow.</p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                {/* Starter Plan */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col hover:shadow-xl transition-all duration-300">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
                        <p className="text-sm text-slate-500 mb-6">For small coaching institutes</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-slate-900">₹20k</span>
                            <span className="text-slate-500 font-medium">/ year</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex-1">
                        <ul className="space-y-4 mb-8">
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Up to 3 Faculty Users
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                MCQ Test Creation
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Standard Exam Templates
                            </li>
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Limited Analytics
                            </li>
                        </ul>
                    </div>
                     <Link href="/auth/register?plan=starter" className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-colors text-center">
                        Get Started
                    </Link>
                </div>

                {/* Growth Plan */}
                <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
                     <div className="mb-6 relative z-10">
                        <h3 className="text-xl font-bold mb-2">Growth</h3>
                        <p className="text-slate-400 text-sm mb-6">For medium sized institutes</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold">₹50k</span>
                            <span className="text-slate-400 font-medium">/ year</span>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-slate-700/50 flex-1 relative z-10">
                        <ul className="space-y-4 mb-8">
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Up to 10 Faculty Users
                            </li>
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                <span><span className="font-bold text-white">Unlimited</span> MCQ Tests</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Advanced Analytics
                            </li>
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-200">
                                <div className="w-5 h-5 rounded-full bg-blue-500 text-white grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Difficulty & PYQ Controls
                            </li>
                        </ul>
                    </div>
                    <Link href="/auth/register?plan=growth" className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-center relative z-10 shadow-lg shadow-blue-900/20">
                        Get Started
                    </Link>
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col hover:shadow-xl transition-all duration-300">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
                        <p className="text-sm text-slate-500 mb-6">For large chains & franchises</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-slate-900">Custom</span>
                        </div>
                         <p className="text-xs text-slate-400 mt-1">₹1L – ₹3L / year</p>
                    </div>
                    <div className="pt-6 border-t border-slate-100 flex-1">
                        <ul className="space-y-4 mb-8">
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                <span><span className="font-bold text-slate-900">Unlimited</span> Faculty Users</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                White-Label Branding
                            </li>
                            <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Dedicated Support
                            </li>
                             <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 grid place-items-center mt-0.5"><Check size={12} strokeWidth={3} /></div>
                                Priority Access (Exam Season)
                            </li>
                        </ul>
                    </div>
                    <Link href="/contact" className="w-full py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all text-center">
                        Contact Sales
                    </Link>
                </div>
            </div>

            {/* AI Credits & White Label Add-ons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Credits */}
                <div className="bg-white rounded-3xl p-8 border border-slate-200">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={18} className="fill-amber-400 text-amber-500" />
                                <h3 className="font-bold text-slate-900 text-lg">AI Credit Top-ups</h3>
                             </div>
                            <p className="text-sm text-slate-500">Optional expansion for heavy usage during exam seasons.</p>
                        </div>
                        <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-lg uppercase">Usage Based</span>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-bold text-slate-700">500 Credits</span>
                             <span className="text-sm font-bold text-slate-900">₹5,000</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 w-[25%] h-full rounded-full" />
                        </div>
                    </div>
                     <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-bold text-slate-700">2,000 Credits</span>
                             <span className="text-sm font-bold text-slate-900">₹15,000</span>
                        </div>
                         <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 w-[50%] h-full rounded-full" />
                        </div>
                    </div>
                     <div className="bg-slate-50 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-sm font-bold text-slate-700">5,000 Credits</span>
                             <span className="text-sm font-bold text-slate-900">₹30,000</span>
                        </div>
                         <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 w-[80%] h-full rounded-full" />
                        </div>
                    </div>
                </div>

                {/* White Labeling */}
                <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl grid place-items-center mb-6">
                            <School className="text-indigo-200" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3">White-Label Licensing</h3>
                        <p className="text-indigo-200 text-sm leading-relaxed mb-8">
                            Make Question Hive your own. We provide custom branding, your own domain url, and a dedicated student test portal under your institute's name.
                        </p>
                        <div className="flex items-center gap-4">
                             <div className="flex-1 py-3 px-4 bg-white/10 rounded-xl border border-white/10">
                                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-1">Pricing</p>
                                <p className="font-bold">₹50k – ₹1L</p>
                             </div>
                              <Link href="/contact" className="px-6 py-4 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                    
                     {/* Decoration */}
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
                </div>
            </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="container max-w-[1200px] mx-auto">
            <div className="bg-slate-900 rounded-[32px] p-16 text-center relative overflow-hidden">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                >
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to save 10 hours this week?</h2>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
                        Join thousands of teachers who have switched to the modern way of setting papers.
                    </p>
                    <Link href="/auth/register" className="inline-flex px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors">
                        Get Started for Free
                    </Link>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C4A6E] text-sky-200 pt-20 pb-8 relative overflow-hidden">
        <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[100%] bg-[radial-gradient(circle,rgba(37,99,235,0.2)_0%,transparent_60%)] pointer-events-none animate-pulse" />
        
        <div className="container max-w-[1200px] mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                <div className="lg:col-span-2">
                    <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white mb-6">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg grid place-items-center text-white shadow-lg">
                            <Layers size={18} strokeWidth={2.5} />
                        </div>
                        Question Hive
                    </Link>
                    <p className="text-sky-100/80 leading-relaxed max-w-sm text-sm">
                        Empowering educators with AI-driven tools to create, manage, and grade assessments in minutes.
                    </p>
                </div>
                
                <div>
                    <h4 className="font-bold text-white mb-6">Product</h4>
                    <ul className="space-y-4">
                        <li><a href="#features" className="hover:text-white transition-colors text-sm">Features</a></li>
                        <li><a href="#schools" className="hover:text-white transition-colors text-sm">For Schools</a></li>
                        <li><a href="#pricing" className="hover:text-white transition-colors text-sm">Pricing</a></li>
                        <li><a href="#resources" className="hover:text-white transition-colors text-sm">Question Bank</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">Company</h4>
                    <ul className="space-y-4">
                        <li><a href="#about" className="hover:text-white transition-colors text-sm">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Contact</a></li>
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Partners</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold text-white mb-6">Legal</h4>
                    <ul className="space-y-4">
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Terms</a></li>
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Privacy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors text-sm">Security</a></li>
                    </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm text-sky-200/60">&copy; 2026 Question Hive Inc. All rights reserved.</p>
                <div className="flex gap-4">
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all grid place-items-center"><Twitter size={18} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all grid place-items-center"><Linkedin size={18} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all grid place-items-center"><Github size={18} /></a>
                    <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-all grid place-items-center"><Instagram size={18} /></a>
                </div>
            </div>
        </div>
      </footer>

    </div>
  );
}