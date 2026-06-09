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

  // মোবাইল সাইডবার টগল করার জন্য কাস্টম ইভেন্ট ফায়ার করার ফাংশন
  const triggerSidebarToggle = () => {
    window.dispatchEvent(new Event("toggleAdminSidebar"));
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-xs tracking-widest font-mono">
        INITIALIZING SECURE SHELL...
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      {/* গ্লোবাল রেসপন্সিভ সাইডবার */}
      <AdminSidebar />

      {/* মেইন কন্টেন্ট এরিয়া */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen justify-between overflow-x-hidden">
        <div className="w-full">
          {/* ⚡ গ্লোবাল স্মার্ট হেডার (টগল বাটন সহ) */}
          <header className="bg-white/90 border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30 backdrop-blur-md">
            
            {/* বাম পাশ: মোবাইল মেনু বাটন এবং ব্যাজ */}
            <div className="flex items-center gap-3">
              {/* 🍔 মোবাইল হ্যামবার্গার বাটন (শুধুমাত্র ছোট ডিভাইসে দেখাবে) */}
              <button 
                onClick={triggerSidebarToggle}
                className="md:hidden text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition cursor-pointer text-sm font-bold flex items-center justify-center"
                aria-label="Toggle Sidebar"
              >
                ☰
              </button>
              
              <span className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-black uppercase tracking-wider shadow-sm">
                Live Console
              </span>
            </div>
            
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl flex items-center gap-2">
              Status: <span className="text-emerald-600 font-extrabold">Secure 200 OK</span>
            </div>
          </header>

          {/* 🧩 কন্টেন্ট বডি */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
            {children}
          </main>
        </div>

        {/* 🏢 মেগা মডার্ন কন্সোল ফুটার */}
        <footer className="bg-slate-950 text-slate-500 py-6 px-4 sm:px-6 lg:px-8 border-t border-slate-900 mt-16">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 text-center lg:text-left">
            
            <div className="flex items-center gap-2.5 justify-center lg:justify-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                Banshi Express <span className="text-slate-700">|</span> Core Terminal Active
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 bg-slate-900/40 px-4 py-2 rounded-2xl border border-slate-100/10">
              <p>Database: <span className="text-sky-400">Supabase</span></p>
              <p className="hidden sm:inline">Engine: <span className="text-amber-500">Next.js 14</span></p>
              <p>SSL: <span className="text-emerald-500">Active</span></p>
            </div>

            <p className="text-[10px] font-semibold text-slate-600 tracking-wide font-mono">
              &copy; {new Date().getFullYear()} CORE CONSOLE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}