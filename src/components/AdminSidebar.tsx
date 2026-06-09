"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [adminEmail, setAdminEmail] = useState("Admin Account");
  const [isOpen, setIsOpen] = useState(false);
  
  // 🌐 সাইডবার ল্যাঙ্গুয়েজ স্টেট (হেডারের সাথে সিঙ্কড)
  const [lang, setLang] = useState<"bn" | "en">("bn");

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setAdminEmail(user.email);
    };
    getUserEmail();

    // মোবাইল টগল লিসেনার
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleAdminSidebar", handleToggle);

    // ⚡ হেডার ল্যাঙ্গুয়েজ চেঞ্জ ডিটেকশন ইভেন্ট লিসেনার
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLang(customEvent.detail);
    };
    window.addEventListener("adminLangChange", handleLangChange);

    return () => {
      window.removeEventListener("toggleAdminSidebar", handleToggle);
      window.removeEventListener("adminLangChange", handleLangChange);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    if (confirm(lang === "bn" ? "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?" : "Are you sure you want to logout?")) {
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
  };

  // 📝 মাল্টি-ল্যাঙ্গুয়েজ নেভিগেশন ডিকশনারী
  const menuItems = {
    bn: [
      { name: "📊 ড্যাশবোর্ড ওভারভিউ", path: "/admin", icon: "⚡" },
      { name: "📰 সংবাদ তালিকা", path: "/admin/news", icon: "📝" },
      { name: "🗂️ ক্যাটাগরি প্যানেল", path: "/admin/categories", icon: "📁" },
      { name: "📍 অঞ্চল ও জেলা", path: "/admin/districts", icon: "🌍" },
      { name: "👥 ইউজার ম্যানেজমেন্ট", path: "/admin/users", icon: "👑" },
    ],
    en: [
      { name: "📊 Dashboard Overview", path: "/admin", icon: "⚡" },
      { name: "📰 News Archives", path: "/admin/news", icon: "📝" },
      { name: "🗂️ Category Panel", path: "/admin/categories", icon: "📁" },
      { name: "📍 Regions & Districts", path: "/admin/districts", icon: "🌍" },
      { name: "👥 User Management", path: "/admin/users", icon: "👑" },
    ]
  }[lang];

  return (
    <>
      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen w-68 bg-slate-950 text-slate-400 flex flex-col border-r border-slate-900 shrink-0 z-50 transition-transform duration-300 md:transform-none ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        
        <div className="p-6 border-b border-slate-900 bg-slate-950/80 sticky top-0 backdrop-blur-md z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white text-base font-black shadow-lg">B</div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider uppercase">{lang === "bn" ? "বংশী এক্সপ্রেস" : "Banshi Exp"}</h2>
              <p className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Engine v3.2
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-400 hover:text-white text-lg p-1">✕</button>
        </div>

        {/* 🧭 নেভিগেশন মেনু (ভাষা অনুযায়ী চেঞ্জ হবে) */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase px-3 mb-2">
            {lang === "bn" ? "নেভিগেশন কন্সোল" : "Navigation"}
          </p>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all duration-300 group ${
                  isActive ? "bg-slate-900 text-white shadow-xl border border-slate-800" : "hover:bg-slate-900/40 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-500 to-amber-500"></span>}
              </Link>
            );
          })}
        </nav>

        {/* প্রোফাইল উইজেট */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs uppercase">{adminEmail[0]}</div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-300 truncate">{adminEmail}</p>
              <p className="text-[9px] font-medium text-slate-500 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/40 py-2.5 rounded-xl text-xs font-black transition-all duration-300 cursor-pointer"
          >
            {lang === "bn" ? "সিস্টেম লগআউট 🔓" : "System Logout 🔓"}
          </button>
        </div>
      </aside>
    </>
  );
}