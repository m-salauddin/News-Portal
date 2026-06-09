"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface FiltersProps {
  onCategoryChange: (id: number | null) => void;
  onDistrictChange: (id: number | null) => void;
  selectedCategory: number | null;
  selectedDistrict: number | null;
}

export default function HomeFilters({
  onCategoryChange,
  onDistrictChange,
  selectedCategory,
  selectedDistrict,
}: FiltersProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(localStorage.getItem("site-lang") || "bn");
    const handleLangChange = () => setLang(localStorage.getItem("site-lang") || "bn");
    window.addEventListener("langChange", handleLangChange);

    const fetchFilters = async () => {
      const { data: catData } = await supabase.from("categories").select("*").order("name_bn", { ascending: true });
      const { data: distData } = await supabase.from("districts").select("*").order("name_bn", { ascending: true });
      if (catData) setCategories(catData);
      if (distData) setDistricts(distData);
    };

    fetchFilters();
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  return (
    <div className="bg-white border-b border-slate-200/60 sticky top-16 z-40 backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 py-2.5 space-y-3">
        
        {/* 🗂️ মডার্ন কাস্টম ক্যাটাগরি বার */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all duration-300 cursor-pointer ${
              selectedCategory === null
                ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-105"
                : "bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200/50"
            }`}
          >
            {lang === "bn" ? "🔥 সব খবর" : "🔥 All News"}
          </button>
          
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-md shadow-red-600/20 scale-105"
                    : "bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200/40"
                }`}
              >
                {lang === "bn" ? cat.name_bn : cat.name_en}
              </button>
            );
          })}
        </div>

        {/* 📍 মডার্ন রিজিওনাল ফিল্টার এবং ট্রেন্ডিং ট্যাগ */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0">📍 {lang === "bn" ? "অঞ্চল:" : "Region:"}</span>
            <select
              value={selectedDistrict || ""}
              onChange={(e) => onDistrictChange(e.target.value ? Number(e.target.value) : null)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-red-500 focus:bg-white transition cursor-pointer text-xs"
            >
              <option value="">{lang === "bn" ? "সব জেলা" : "All Districts"}</option>
              {districts.map((dist) => (
                <option key={dist.id} value={dist.id}>
                  {lang === "bn" ? dist.name_bn : dist.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* 📈 অ্যাডভান্সড ট্রেন্ডিং ব্যাজ (স্মার্ট আইডিয়া) */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider animate-pulse">TRENDING</span>
            <p className="text-slate-400 font-medium text-[11px]">#SavarNews #DhakaCrime #SportsRealtime</p>
          </div>
        </div>

      </div>
    </div>
  );
}