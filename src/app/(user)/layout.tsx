"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [breakingNews, setBreakingNews] = useState<any[]>([]);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchHeaderData = async () => {
      // ক্যাটাগরি এবং ব্রেকিং নিউজ একসাথে ব্যাকএন্ড থেকে আনা হচ্ছে
      const { data: catData } = await supabase.from("categories").select("*");
      const { data: breakingData } = await supabase
        .from("news")
        .select("id, title")
        .eq("is_breaking", true)
        .eq("is_published", true)
        .order("id", { ascending: false })
        .limit(5);

      if (catData) setCategories(catData);
      if (breakingData) setBreakingNews(breakingData);
    };

    fetchHeaderData();

    // ব্রাউজারের লোকাল স্টোরেজ থেকে ল্যাঙ্গুয়েজ প্রিফারেন্স চেক করা
    const savedLang = localStorage.getItem("user_lang") as "bn" | "en";
    if (savedLang) setLang(savedLang);
  }, []);

  // 🔄 ভাষা পরিবর্তন ও গ্লোবাল স্টেট সিঙ্ক মেকানিজম
  const toggleLanguage = () => {
    const nextLang = lang === "bn" ? "en" : "bn";
    setLang(nextLang);
    localStorage.setItem("user_lang", nextLang);
    // পুরো উইন্ডোকে ইভেন্ট ট্রিগার করা যাতে চাইল্ড পেজগুলো অটো-আপডেট হতে পারে
    window.dispatchEvent(new CustomEvent("userLangChange", { detail: nextLang }));
  };

  const dict = {
    bn: { live: "লাইভ", breaking: "ব্রেকিং নিউজ:", placeholder: "অনুসন্ধান করুন...", rights: "সর্বস্বত্ব সংরক্ষিত।" },
    en: { live: "LIVE", breaking: "Breaking News:", placeholder: "Search news...", rights: "All Rights Reserved." }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
      
      {/* 🏙️ মেগা মাল্টি-লেয়ারড পাবলিক হেডার */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        {/* টপ বার: লোগো, ল্যাঙ্গুয়েজ সুইচার ও ডেট */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* ব্র্যান্ড লোগো */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white text-lg font-black shadow-md shadow-red-600/20">
              B
            </div>
            <div>
              <h1 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                {lang === "bn" ? "বংশী এক্সপ্রেস" : "Banshi Express"}
              </h1>
              <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase -mt-0.5">
                {lang === "bn" ? "সত্যের সন্ধানে অবিরাম" : "The Pulse of Truth"}
              </p>
            </div>
          </Link>

          {/* মিডল সার্চবার (ডেস্কটপ) */}
          <div className="hidden md:block max-w-xs w-full">
            <input 
              type="text" 
              placeholder={dict.placeholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-red-500 text-black"
            />
          </div>

          {/* রাইট অ্যাকশনস */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="bg-slate-900 text-white font-black px-3 py-1.5 rounded-xl text-[10px] tracking-wider uppercase shadow-sm cursor-pointer hover:bg-red-600 transition duration-300"
            >
              🌍 {lang === "bn" ? "English" : "বাংলা"}
            </button>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-slate-100 p-2 rounded-xl text-slate-800 text-sm font-bold"
            >
              ☰
            </button>
          </div>
        </div>

        {/* বটম বার: ক্যাটাগরি লিস্ট নেভিগেশন (ডেস্কটপ) */}
        <div className="hidden md:block border-t border-slate-100 bg-white/50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            <Link href="/" className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 text-white shadow-sm">
              {lang === "bn" ? "হোম" : "Home"}
            </Link>
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                href={`/category/${cat.slug}`}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition whitespace-nowrap"
              >
                {lang === "bn" ? cat.name_bn : cat.name_en}
              </Link>
            ))}
          </nav>
        </div>

        {/* 📱 মোবাইল রেসপন্সিভ ড্রপডাউন মেনু */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white p-4 space-y-3 shadow-inner max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <Link href="/" className="p-2 text-center rounded-xl bg-slate-900 text-white text-xs font-bold">হোম / Home</Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  {lang === "bn" ? cat.name_bn : cat.name_en}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* 🚀 ব্রেকিং নিউজ অ্যানিমেটেড টিকার (যদি ডাটা থাকে) */}
      {breakingNews.length > 0 && (
        <div className="w-full bg-red-600 text-white h-10 flex items-center overflow-hidden shadow-md text-xs sm:text-sm font-bold border-b border-red-700">
          <div className="bg-slate-950 px-4 sm:px-6 h-full flex items-center gap-2 text-[11px] sm:text-xs font-black uppercase tracking-wider shrink-0 z-10 relative shadow-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            {dict.breaking}
          </div>
          <div className="w-full relative overflow-hidden flex items-center">
            <div className="animate-marquee whitespace-nowrap flex gap-12 cursor-pointer hover:[animation-play-state:paused]">
              {breakingNews.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`} className="hover:underline flex items-center gap-2">
                  ⚡ {news.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🧩 কন্টেন্ট প্লেসহোল্ডার যেখানে চাইল্ড পেজগুলো লোড হবে */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* 🏢 আল্ট্রা-লাক্সারি পাবলিক ফুটার */}
      <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-white font-black text-base">{lang === "bn" ? "বংশী এক্সপ্রেস" : "Banshi Express"}</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {lang === "bn" ? "বস্তুনিষ্ঠ ও নির্ভীক সাংবাদিকতার প্রত্যয় নিয়ে আমরা ২৪/৭ লাইভ নিউজ কভার করছি দেশ ও প্রবাসের প্রতিটি কোণ থেকে।" : "Dedicated to brave and authentic journalism, covering real-time global and local news 24/7."}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{lang === "bn" ? "জরুরি লিংক" : "Quick Links"}</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link href="/" className="hover:text-white transition">Home</Link>
                <Link href="/admin" className="hover:text-white transition">Admin System</Link>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{lang === "bn" ? "যোগাযোগ" : "Contact"}</h4>
              <p className="text-xs text-slate-500 font-medium">Email: info@banshiexpress.com<br />Phone: +৮৮০ ১২৩৪-৫৬৭৮৯০</p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono font-bold text-slate-600">
            <p>&copy; {new Date().getFullYear()} BANSHI EXPRESS. {dict.rights}</p>
            <p className="text-slate-700">Engineered with Next.js & Tailwind</p>
          </div>
        </div>
      </footer>

    </div>
  );
}