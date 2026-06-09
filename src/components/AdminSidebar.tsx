"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState("Admin Account");
  const [isOpen, setIsOpen] = useState(false); // মোবাইল সাইডবার টগল স্টেট

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setAdminEmail(user.email);
    };
    getUserEmail();

    // মোবাইল হেডারের বাটনের সাথে সিঙ্ক করার জন্য কাস্টম ইভেন্ট লিসেনার
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleAdminSidebar", handleToggle);
    return () => window.removeEventListener("toggleAdminSidebar", handleToggle);
  }, []);

  // পেজ চেঞ্জ হলে মোবাইলে সাইডবার অটোমেটিক বন্ধ হবে
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  const menuItems = [
    { name: "📊 ড্যাশবোর্ড ওভারভিউ", path: "/admin", icon: "⚡" },
    { name: "📰 সংবাদ তালিকা", path: "/admin/news", icon: "📝" },
    { name: "🗂️ ক্যাটাগরি প্যানেল", path: "/admin/categories", icon: "📁" },
    { name: "📍 অঞ্চল ও জেলা", path: "/admin/districts", icon: "🌍" },
    { name: "👥 ইউজার ম্যানেজমেন্ট", path: "/admin/users", icon: "👑" },
  ];

  return (
    <>
      {/* 🌫️ মোবাইল ওভারলে ব্লার ব্যাকড্রপ (সাইডবার ওপেন থাকলে কন্টেন্ট ব্লার করবে) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-68 bg-slate-950 text-slate-400 flex flex-col border-r border-slate-900 shrink-0 z-50 transition-transform duration-300 md:transform-none ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* 👑 প্রফেশনাল ব্র্যান্ড লোগো এরিয়া */}
        <div className="p-6 border-b border-slate-900 bg-slate-950/80 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white text-base font-black shadow-lg shadow-red-600/20">
              B
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider uppercase">বংশী এক্সপ্রেস</h2>
              <p className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Engine v3.0
              </p>
            </div>
          </div>
          
          {/* মোবাইলের জন্য ক্লোজ বাটন */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white text-lg p-1 cursor-pointer">
            ✕
          </button>
        </div>

        {/* 🧭 নেভিগেশন মেনু */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase px-3 mb-2">NAVIGATION</p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 group ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xl shadow-black/40 border border-slate-800"
                    : "hover:bg-slate-900/40 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 👤 প্রোফাইল উইজেট এবং সিস্টেম শাটডাউন */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs uppercase">
              {adminEmail[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-300 truncate">{adminEmail}</p>
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer"
          >
            সিস্টেম লগআউট 🔓
          </button>
        </div>
      </aside>
    </>
  );
}