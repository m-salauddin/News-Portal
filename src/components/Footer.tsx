"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Footer() {
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(localStorage.getItem("site-lang") || "bn");
    const handleLangChange = () => setLang(localStorage.getItem("site-lang") || "bn");
    window.addEventListener("langChange", handleLangChange);
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm pt-12 pb-6 border-t-4 border-red-600">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        
        {/* ব্র্যান্ডিং পার্ট */}
        <div className="space-y-3">
          <h3 className="text-xl font-black text-white tracking-wider">
            {lang === "bn" ? "বংশী এক্সপ্রেস" : "BANSHI EXPRESS"}
          </h3>
          <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
            {lang === "bn" 
              ? "সত্যের সন্ধানে অবিরাম পথ চলা। বংশী এক্সপ্রেস আপনাকে দেয় ২৪/৭ সর্বশেষ বস্তুনিষ্ঠ সংবাদ ও বিশ্লেষণ।"
              : "Continuous journey in search of truth. Banshi Express provides you with 24/7 objective latest news and analysis."}
          </p>
        </div>

        {/* কুইক লিঙ্কস */}
        <div className="space-y-2">
          <h4 className="text-white font-black text-sm uppercase tracking-wide border-l-2 border-red-600 pl-2">
            {lang === "bn" ? "গুরুত্বপূর্ণ লিঙ্ক" : "Quick Links"}
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link href="/" className="hover:text-white transition">🏠 {lang === "bn" ? "প্রচ্ছদ" : "Home"}</Link>
            <Link href="/about" className="hover:text-white transition">ℹ️ {lang === "bn" ? "আমাদের সম্পর্কে" : "About Us"}</Link>
            <Link href="/privacy" className="hover:text-white transition">🛡️ {lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}</Link>
            <Link href="/contact" className="hover:text-white transition">📞 {lang === "bn" ? "যোগাযোগ" : "Contact"}</Link>
          </div>
        </div>

        {/* অফিস এড্রেস ও সোশ্যাল */}
        <div className="space-y-2 text-xs">
          <h4 className="text-white font-black text-sm uppercase tracking-wide border-l-2 border-red-600 pl-2">
            {lang === "bn" ? "যোগাযোগ কার্যালয়" : "Contact Office"}
          </h4>
          <p className="leading-relaxed">
            📬 {lang === "bn" ? "সাভার, ঢাকা, বাংলাদেশ।" : "Savar, Dhaka, Bangladesh."} <br />
            📧 info@banshiexpress.com <br />
            📞 +৮৮০১XXXXXXXXX
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} {lang === "bn" ? "বংশী এক্সপ্রেস। সর্বস্বত্ব সংরক্ষিত।" : "Banshi Express. All rights reserved."}</p>
        <p className="text-[10px] tracking-wider uppercase">Developed with Advanced Architecture</p>
      </div>
    </footer>
  );
}