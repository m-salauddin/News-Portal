"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface CategoryItem {
  id: number;
  name_bn: string;
  name_en: string; // 🇬🇧 ইংরেজি নামের জন্য টাইপ ডিফাইন
  slug: string;
  created_at: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 📝 ফর্ম স্টেট (তৈরি এবং এডিট উভয়ের জন্য)
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [slug, setSlug] = useState("");
  
  // 🔄 এডিটিং মোড ট্র্যাকিং স্টেট
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setCategories(data as CategoryItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🤖 ইংরেজি নাম ইনপুট দেওয়ার সাথে সাথে অটো স্লাগ জেনারেটর
  const handleNameEnChange = (val: string) => {
    setNameEn(val);
    const generatedSlug = val.trim().toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-");
    setSlug(generatedSlug);
  };

  // 📥 ক্যাটাগরি তৈরি বা এডিট সাবমিট হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameBn || !nameEn || !slug) {
      alert("বাংলা নাম, ইংরেজি নাম এবং স্লাগ ৩টিই বাধ্যতামূলক!");
      return;
    }

    setSubmitting(true);

    if (editingId) {
      // 🔄 এডিট মোড: ডেটাবেজ আপডেট
      const { error } = await supabase
        .from("categories")
        .update({ name_bn: nameBn, name_en: nameEn, slug: slug })
        .eq("id", editingId);

      if (!error) {
        alert("ক্যাটাগরি সফলভাবে আপডেট হয়েছে! 🎯");
        setEditingId(null);
      } else {
        alert("আপডেট করতে সমস্যা হয়েছে। স্লাগটি ইউনিক কিনা চেক করুন।");
      }
    } else {
      // ➕ ক্রিয়েট মোড: নতুন ক্যাটাগরি ইনসার্ট
      const { error } = await supabase
        .from("categories")
        .insert([{ name_bn: nameBn, name_en: nameEn, slug: slug }]);

      if (!error) {
        alert("নতুন ক্যাটাগরি সফলভাবে যুক্ত হয়েছে! 🎉");
      } else {
        alert("ক্যাটাগরি তৈরি করা যায়নি। স্লাগটি হয়তো আগেই ব্যবহার হয়েছে।");
      }
    }

    // ফর্ম রিসেট ও ডাটা রিফ্রেশ
    setNameBn("");
    setNameEn("");
    setSlug("");
    setSubmitting(false);
    fetchCategories();
  };

  // ⚙️ ইনলাইন এডিট মোড অ্যাক্টিভেটর
  const startEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setNameBn(cat.name_bn);
    setNameEn(cat.name_en);
    setSlug(cat.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // ফর্মের দিকে স্মুথ স্ক্রোল
  };

  // ❌ এডিট মোড বাতিল করা
  const cancelEdit = () => {
    setEditingId(null);
    setNameBn("");
    setNameEn("");
    setSlug("");
  };

  // 🗑️ ক্যাটাগরি ডিলিট করা
  const handleDelete = async (id: number) => {
    if (confirm("এই ক্যাটাগরি ডিলিট করতে চান? নিশ্চিত করুন।")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (!error) {
        setCategories(categories.filter(c => c.id !== id));
      } else {
        alert("ডিলিট করা যায়নি। এই ক্যাটাগরির অধীনে হয়তো কোনো নিউজ লাইভ আছে।");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* 📥 ফর্ম উইজেট (ক্রিয়েট ও স্মার্ট এডিট মোড সমন্বিত) */}
      <div className="bg-white border border-slate-200/80 p-5 sm:p-6 rounded-3xl shadow-sm space-y-5 sticky top-24">
        <div>
          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider ${editingId ? 'bg-amber-50 text-amber-600' : 'bg-slate-900 text-white'}`}>
            {editingId ? "Edit Mode Active" : "Creation Studio"}
          </span>
          <h2 className="text-base font-black text-slate-800 tracking-tight mt-2">
            {editingId ? "📝 ক্যাটাগরি এডিট করুন" : "📁 নতুন ক্যাটাগরি তৈরি"}
          </h2>
          <p className="text-slate-400 text-[11px] mt-0.5">মাল্টি-ল্যাঙ্গুয়েজ ও এসইও অপ্টিমাইজড ক্যাটাগরি কন্ট্রোল।</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">ক্যাটাগরি নাম (বাংলা) *</label>
            <input 
              type="text" 
              value={nameBn}
              onChange={(e) => setNameBn(e.target.value)}
              placeholder="উদা: বিনোদন" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 font-semibold text-black" 
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">ক্যাটাগরি নাম (English) *</label>
            <input 
              type="text" 
              value={nameEn}
              onChange={(e) => handleNameEnChange(e.target.value)}
              placeholder="e.g., Entertainment" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 font-semibold text-black" 
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">URL স্লাগ (অটো জেনারেটেড) *</label>
            <input 
              type="text" 
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="entertainment" 
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 font-mono text-black text-xs" 
            />
          </div>

          <div className="space-y-2 pt-2">
            <button 
              type="submit" 
              disabled={submitting}
              className={`w-full text-white font-black py-3 rounded-xl transition duration-300 shadow-sm cursor-pointer text-xs uppercase tracking-wider ${
                editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-950 hover:bg-red-600'
              }`}
            >
              {submitting ? "ডাটা সিঙ্ক হচ্ছে..." : editingId ? "💾 পরিবর্তন সংরক্ষণ করুন" : "📂 ক্যাটাগরি যুক্ত করুন"}
            </button>
            
            {editingId && (
              <button 
                type="button" 
                onClick={cancelEdit}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                বাতিল করুন
              </button>
            )}
          </div>
        </form>
      </div>

      {/* 📊 ডান পাশ: ক্যাটাগরির আল্ট্রা-রেসপন্সিভ লিস্ট */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-black text-slate-800 text-xs tracking-tight uppercase">
            🗂️ সক্রিয় ক্যাটাগরি তালিকা ({categories.length} টি)
          </h2>
        </div>

        {loading ? (
          <div className="py-14 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-400 text-[10px] font-mono font-bold tracking-widest uppercase">Loading Categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-center p-10 text-slate-400 text-xs font-bold">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/40 text-slate-400 font-bold border-b border-slate-100 text-[10px] uppercase tracking-wider">
                  <th className="p-4">নাম (বাংলা)</th>
                  <th className="p-4">Name (English)</th>
                  <th className="p-4">URL Slug</th>
                  <th className="p-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className={`transition-colors ${editingId === cat.id ? 'bg-amber-50/40' : 'hover:bg-slate-50/40'}`}>
                    <td className="p-4 font-black text-slate-800 text-sm">{cat.name_bn}</td>
                    {/* 🇬🇧 ইংরেজি কলাম ভিউ */}
                    <td className="p-4 font-bold text-slate-600 text-xs">{cat.name_en || "---"}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{cat.slug}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1.5">
                        <button 
                          onClick={() => startEdit(cat)}
                          className="bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition border border-slate-200/40 cursor-pointer"
                        >
                          এডিট
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition border border-rose-100 cursor-pointer"
                        >
                          রিমুভ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}