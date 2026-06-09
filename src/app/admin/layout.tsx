"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLogin from "@/components/AdminLogin";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // 🌐 গ্লোবাল এডমিন ল্যাঙ্গুয়েজ স্টেট ('bn' = বাংলা, 'en' = English)
  const [lang, setLang] = useState<"bn" | "en">("bn");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // মোবাইল সাইডবার টগল করার ইভেন্ট
  const triggerSidebarToggle = () => {
    window.dispatchEvent(new Event("toggleAdminSidebar"));
  };

  // 🔄 ভাষা পরিবর্তন করার সময় সাইডবারকেও নোটিফাই করার জন্য কাস্টম ইভেন্ট
  const toggleLanguage = () => {
    const nextLang = lang === "bn" ? "en" : "bn";
    setLang(nextLang);
    // কাস্টম ইভেন্ট ফায়ার করা যেন সাইডবার মেনুও অটো-চেঞ্জ হয়
    window.dispatchEvent(new CustomEvent("adminLangChange", { detail: nextLang }));
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs tracking-widest font-mono">
        INITIALIZING SECURE ENGINE...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 w-full h-full fixed inset-0 z-[99999] overflow-y-auto">
        <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
      </div>
    );
  }

  // 📝 ল্যাঙ্গুয়েজ ডিকশনারী (এডমিন কোর লেআউটের জন্য)
  const dict = {
    bn: {
      liveConsole: "লাইভ কন্সোল",
      status: "অবস্থা",
      secure: "সুরক্ষিত",
      footerTitle: "বংশী এক্সপ্রেস কোর সিস্টেম",
      footerSub: "একটি স্বয়ংক্রিয়, নিরাপদ ও আধুনিক সংবাদ নিয়ন্ত্রণ কেন্দ্র।",
      db: "ডেটাবেজ",
      engine: "ইঞ্জিন",
      ssl: "নিরাপত্তা",
      rights: "সর্বস্বত্ব সংরক্ষিত।"
    },
    en: {
      liveConsole: "Live Console",
      status: "Status",
      secure: "Secure",
      footerTitle: "Banshi Express Core System",
      footerSub: "An automated, ultra-secure, and modern news command center.",
      db: "Database",
      engine: "Engine",
      ssl: "SSL",
      rights: "All Rights Reserved."
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      
      {/* গ্লোবাল রেসপন্সিভ সাইডবার */}
      <AdminSidebar />

      {/* মেইন কন্টেন্ট এরিয়া */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen justify-between overflow-x-hidden">
        <div className="w-full">
          
          {/* ⚡ আল্ট্রা-মডার্ন হেডার উইথ ল্যাঙ্গুয়েজ সুইচার */}
          <header className="bg-white/90 border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 backdrop-blur-md">
            
            {/* বাম পাশ: মোবাইল মেনু বাটন এবং লাইভ ইন্ডিকেটর */}
            <div className="flex items-center gap-3">
              <button 
                onClick={triggerSidebarToggle}
                className="md:hidden text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition cursor-pointer text-sm font-bold"
              >
                ☰
              </button>
              
              <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-black uppercase tracking-wider shadow-sm">
                {dict.liveConsole}
              </span>
            </div>
            
            {/* ডান পাশ: ল্যাঙ্গুয়েজ সুইচার এবং সিস্টেম স্টেটাস */}
            <div className="flex items-center gap-3">
              {/* 🌐 প্রিমিয়াম গ্লোবাল ল্যাঙ্গুয়েজ সুইচার বাটন */}
              <button 
                onClick={toggleLanguage}
                className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all duration-300 cursor-pointer uppercase flex items-center gap-1"
              >
                🌍 {lang === "bn" ? "English" : "বাংলা"}
              </button>

              <div className="hidden xs:flex text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl items-center gap-2">
                {dict.status}: <span className="text-emerald-600 font-extrabold">{dict.secure} 200 OK</span>
              </div>
            </div>
          </header>

          {/* 🧩 কন্টেন্ট বডি জোন */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>

        {/* 🏢 ইউজার প্যানেল স্টাইলের লাক্সারি মিনিমালিস্ট ফুটার */}
        <footer className="bg-white border-t border-slate-200/60 pt-10 pb-6 px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* টপ ফুটার গ্রিড */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                  </span>
                  <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                    {dict.footerTitle}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 font-medium max-w-md leading-relaxed">
                  {dict.footerSub}
                </p>
              </div>

              {/* সিস্টেম আর্কিটেকচার মেটা ব্যাজ */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                <span className="bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">{dict.db}: <span className="text-sky-600">Supabase</span></span>
                <span className="bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">{dict.engine}: <span className="text-amber-600">Next.js 14</span></span>
                <span className="bg-emerald-50/60 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl">{dict.ssl}: Active</span>
              </div>
            </div>

            {/* বটম ফুটার: কপিরাইট জোন */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-[10px] font-mono font-bold text-slate-400">
              <p>&copy; {new Date().getFullYear()} CORE CONSOLE. {dict.rights}</p>
              <div className="flex gap-4 text-slate-300">
                <span className="hover:text-red-600 transition cursor-pointer">Security Protocol v3.2</span>
                <span>•</span>
                <span className="hover:text-red-600 transition cursor-pointer">Terminal Log</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </div>
  );
}