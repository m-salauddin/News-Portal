"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function BreakingNews() {
  const [breakingList, setBreakingList] = useState<any[]>([]);
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(localStorage.getItem("site-lang") || "bn");
    const handleLangChange = () => setLang(localStorage.getItem("site-lang") || "bn");
    window.addEventListener("langChange", handleLangChange);

    // শুধুমাত্র ব্রেকিং নিউজগুলো ডাটাবেজ থেকে ফিল্টার করে আনা হচ্ছে
    const fetchBreakingNews = async () => {
      const { data } = await supabase
        .from("news")
        .select("id, title")
        .eq("is_published", true)
        .eq("is_breaking", true) // ব্রেকিং নিউজ ফিল্টার
        .order("created_at", { ascending: false })
        .limit(5); // লেটেস্ট ৫টি সংবাদ স্ক্রল করবে

      if (data) setBreakingList(data);
    };

    fetchBreakingNews();
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  if (breakingList.length === 0) return null; // ব্রেকিং নিউজ না থাকলে সেকশনটি হাইড থাকবে

  return (
    <div className="bg-red-600 text-white h-11 flex items-center overflow-hidden border-b border-red-700 shadow-sm z-40 relative">
      {/* লাল ফিক্সড ট্যাগ */}
      <div className="bg-black text-white h-full px-4 md:px-6 flex items-center font-black text-xs md:text-sm tracking-wider uppercase z-10 shrink-0 relative after:content-[''] after:absolute after:top-0 after:-right-3 after:border-y-[22px] after:border-y-transparent after:border-l-[12px] after:border-l-black">
        <span className="animate-pulse flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
          {lang === "bn" ? "সংবাদ শিরোনাম :" : "Breaking :"}
        </span>
      </div>

      {/* টেক্সট স্ক্রলার এরিয়া */}
      <div className="w-full overflow-hidden relative flex items-center h-full">
        <div className="flex whitespace-nowrap gap-24 animate-marquee font-bold text-xs md:text-sm cursor-pointer hover:[animation-play-state:paused]">
          {breakingList.map((item, index) => (
            <Link key={item.id} href={`/news/${item.id}`} className="hover:underline flex items-center gap-2">
              <span className="text-yellow-300 font-extrabold">[{index + 1}]</span>
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}