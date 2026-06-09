"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function CreateNews() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isBreaking, setIsBreaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchFormMetaData = async () => {
      const { data: cat } = await supabase.from("categories").select("*");
      const { data: dist } = await supabase.from("districts").select("*");
      if (cat) setCategories(cat);
      if (dist) setDistricts(dist);
    };
    fetchFormMetaData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      alert("শিরোনাম, মূল খবর এবং ক্যাটাগরি অবশ্যই পূরণ করতে হবে!");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("news").insert([
      {
        title,
        content,
        category_id: Number(categoryId),
        district_id: districtId ? Number(districtId) : null,
        image_url: imageUrl || null,
        is_published: isPublished,
        is_breaking: isBreaking,
      }
    ]);

    setSubmitting(false);
    if (!error) {
      alert("সংবাদটি সফলভাবে ডাটাবেজে পাবলিশ হয়েছে! 🎉");
      router.push("/admin/news"); // সফল হলে সংবাদ তালিকায় রিডাইরেক্ট করবে
    } else {
      alert("সংবাদ পোস্ট করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-100/40">
      <h2 className="text-xl font-black text-slate-800 mb-6 border-b border-slate-100 pb-3">🚀 নতুন সংবাদ ক্রিয়েশন ফর্ম</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
        <div className="space-y-1">
          <label className="font-bold text-slate-700">সংবাদের মূল শিরোনাম *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="আকর্ষণীয় শিরোনাম লিখুন..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-semibold text-black" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">ক্যাটাগরি সিলেক্ট করুন *</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-slate-800 cursor-pointer">
              <option value="">নির্বাচন করুন</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name_bn}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">জেলা বা অঞ্চল (ঐচ্ছিক)</label>
            <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-slate-800 cursor-pointer">
              <option value="">সব জেলা / গ্লোবাল</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">থাম্বনেইল ইমেজ URL</label>
          <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-black" />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-700">সংবাদের বিস্তারিত কন্টেন্ট *</label>
          <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="এখানে সংবাদের বিস্তারিত বিবরণ লিখুন..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-black leading-relaxed" />
        </div>

        {/* ⚙️ স্মার্ট চেকবক্স মডিউল */}
        <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
            সরাসরি লাইভ পাবলিশ করুন
          </label>

          <label className="flex items-center gap-2 font-bold text-red-600 cursor-pointer select-none">
            <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
            🔥 এটি ব্রেকিং নিউজ (শিরোনাম স্ক্রল করবে)
          </label>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-slate-900 hover:bg-red-600 text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md disabled:opacity-50 cursor-pointer">
          {submitting ? "সংবাদ ডাটাবেজে সেভ হচ্ছে..." : "🚀 নিশ্চিত করুন ও সংবাদ প্রকাশ করুন"}
        </button>
      </form>
    </div>
  );
}