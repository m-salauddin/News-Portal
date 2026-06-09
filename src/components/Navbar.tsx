"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Supabase ক্লায়েন্ট ইমপোর্ট করা হলো

export default function Navbar() {
  const [lang, setLang] = useState("bn");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // লগইন স্টেট ট্র্যাকিং

  useEffect(() => {
    // ল্যাঙ্গুয়েজ সেটআপ
    const savedLang = localStorage.getItem("site-lang");
    if (savedLang) {
      setLang(savedLang);
      window.dispatchEvent(new Event("langChange"));
    }

    // 🔐 ডাটাবেজ থেকে ইউজারের রোল চেক করার লজিক
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // user_roles টেবিল থেকে এই ইউজারের রোল চেক করা হচ্ছে
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", user.id)
          .single();
          
        if (roleData && roleData.role === "admin") {
          setIsLoggedIn(true); // শুধুমাত্র রোল 'admin' হলেই বাটন চেঞ্জ হবে
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    checkUserRole();

    // সেশন পরিবর্তনের লাইভ লিসেনার (যাতে লগআউট বা লগইন করলে বাটন সাথে সাথে আপডেট হয়)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("id", session.user.id)
          .single();
          
        if (roleData && roleData.role === "admin") {
          setIsLoggedIn(true);
          return;
        }
      }
      setIsLoggedIn(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleLanguage = (selectedLang: string) => {
    setLang(selectedLang);
    localStorage.setItem("site-lang", selectedLang);
    window.dispatchEvent(new Event("langChange"));
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
        {/* লোগো */}
        <Link href="/" className="text-xl md:text-2xl font-black text-red-600 tracking-wider whitespace-nowrap">
          {lang === "bn" ? "বংশী এক্সপ্রেস" : "BANSHI EXPRESS"}
        </Link>

        {/* সার্চ বার এবং ল্যাঙ্গুয়েজ সুইচার */}
        <div className="flex items-center space-x-2 md:space-x-6">
          {/* সার্চ ইনপুট (শুধু বড় স্ক্রিনে দেখাবে) */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder={lang === "bn" ? "সার্চ করুন..." : "Search..."}
              className="w-48 xl:w-60 pl-4 pr-10 py-1.5 bg-gray-100 border border-transparent rounded-full text-sm text-black focus:outline-none focus:bg-white focus:border-gray-300"
            />
          </div>

          {/* ল্যাঙ্গুয়েজ টগল বোতাম */}
          <div className="flex items-center bg-gray-200 rounded-full p-1 border border-gray-300 shadow-inner shrink-0">
            <button
              onClick={() => toggleLanguage("bn")}
              className={`px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded-full transition-all duration-200 ${
                lang === "bn"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              BN
            </button>
            <button
              onClick={() => toggleLanguage("en")}
              className={`px-2.5 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs font-bold rounded-full transition-all duration-200 ${
                lang === "en"
                  ? "bg-green-600 text-white shadow-md"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              EN
            </button>
          </div>

          {/* 🔄 ডায়নামিক বাটন - লগইন থাকার ওপর ভিত্তি করে বাটন ও রাউট চেঞ্জ হবে */}
          {isLoggedIn ? (
            <Link 
              href="/admin" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded text-xs md:text-sm font-semibold transition shrink-0 shadow-sm"
            >
              {lang === "bn" ? "💼 ড্যাশবোর্ড" : "💼 Dashboard"}
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded text-xs md:text-sm font-semibold transition shrink-0 shadow-sm"
            >
              {lang === "bn" ? "🔒 লগ-ইন" : "🔒 Log-in"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}