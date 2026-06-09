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
  const [excerpt, setExcerpt] = useState(""); // নতুন কনসেপ্ট: সংবাদের সংক্ষিপ্ত রূপ
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

  // 🤖 স্মার্ট অটো-সামারি মেকানিজম কনসেপ্ট
  const generateSmartExcerpt = () => {
    if (!content) {
      alert("আগে মূল খবর কিছু লিখুন, তারপর অটো-সামারি জেনারেট করুন!");
      return;
    }
    // মূল সংবাদের প্রথম ১৫০টি ক্যারেক্টার নিয়ে একটি সুন্দর সামারি তৈরি করবে অটোমেটিক
    const summary = content.substring(0, 150) + "...";
    setExcerpt(summary);
  };

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
        excerpt: excerpt || title.substring(0, 100), // এক্সসার্প্ট সেভ হচ্ছে
        category_id: Number(categoryId),
        district_id: districtId ? Number(districtId) : null,
        image_url: imageUrl || null,
        is_published: isPublished,
        is_breaking: isBreaking,
      }
    ]);

    setSubmitting(false);
    if (!error) {
      alert("সংবাদটি সফলভাবে লাইভ হয়েছে! 🎉");
      router.push("/admin/news");
    } else {
      alert("সংবাদ পোস্ট করতে সমস্যা হয়েছে।");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* 📝 বাম পাশ: মূল নিউজ ফর্ম ইনপুট (২ কলাম জুড়ে থাকবে ডেস্কটপে) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 p-5 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
          <span>🚀 ক্রিয়েশন স্টুডিও</span>
          <span className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase">v3.2 Extended</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">সংবাদের মূল শিরোনাম *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="আকর্ষণীয় ও আই-ক্যাচি শিরোনাম লিখুন..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-semibold text-black" />
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
              <label className="font-bold text-slate-700">অঞ্চল বা জেলা (ঐচ্ছিক)</label>
              <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-slate-800 cursor-pointer">
                <option value="">সব জেলা / গ্লোবাল</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">থাম্বনেইল ইমেজ ওয়েব URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://images.unsplash.com/photo-..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-black text-xs" />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">সংবাদের বিস্তারিত কন্টেন্ট *</label>
            <textarea rows={7} value={content} onChange={(e) => setContent(e.target.value)} placeholder="এখানে সংবাদের মূল বিবরণ বিস্তারিতভাবে লিখুন..." className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-black leading-relaxed" />
          </div>

          {/* 🤖 কনসেপ্ট: স্মার্ট এক্সসার্প্ট মডিউল উইথ অটো জেনারেটর */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">সংক্ষিপ্ত সাব-টাইটেল / মেটা ডেসক্রিপশন (SEO)</label>
              <button type="button" onClick={generateSmartExcerpt} className="text-[10px] bg-slate-900 text-slate-200 font-bold px-2.5 py-1 rounded-lg hover:bg-red-600 hover:text-white transition cursor-pointer">
                ✨ অটো-সামারি জেনারেট করুন
              </button>
            </div>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="সংবাদের সংক্ষিপ্ত মেটা হাইলাইট..." className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 font-medium text-black text-xs" />
          </div>

          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
              সরাসরি লাইভ পাবলিশ
            </label>
            <label className="flex items-center gap-2 font-bold text-red-600 cursor-pointer select-none">
              <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
              🔥 ব্রেকিং নিউজ ফিড
            </label>
          </div>

          <button type="submit" disabled={submitting} className="w-full bg-slate-950 hover:bg-red-600 text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider">
            {submitting ? "সিস্টেম ক্লাউডে ডাটা সিঙ্ক হচ্ছে..." : "🚀 নিশ্চিত করুন ও সংবাদ প্রকাশ করুন"}
          </button>
        </form>
      </div>

      {/* 🎨 ডান পাশ: রিয়েল-টাইম লাইভ কার্ড প্রিভিউ (স্মার্ট কনসেপ্ট উইজেট) */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 lg:sticky top-24">
        <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          লাইভ কার্ড প্রিভিউ (হোম পেজ লুক)
        </h3>
        
        {/* রেন্ডার কার্ড */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm group transition-all">
          <div className="w-full aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Invalid+Image+URL'}} />
            ) : (
              <span className="text-xs font-bold font-mono">থাম্বনেইল প্রিভিউ এরিয়া</span>
            )}
            <span className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
              {categories.find(c => c.id === Number(categoryId))?.name_bn || "ক্যাটাগরি"}
            </span>
          </div>
          
          <div className="p-4 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
              {title || "এখানে সংবাদের আকর্ষণীয় শিরোনামটি রিয়েল-টাইমে শো করবে..."}
            </h4>
            <p className="text-slate-400 text-[11px] font-medium line-clamp-2 leading-relaxed">
              {excerpt || "এখানে মেটা বিবরণ বা খবরের শর্ট সামারি প্রিভিউ দেখা যাবে যা ইউজারের এটেনশন গ্র্যাব করবে..."}
            </p>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
              <span>📅 {new Date().toLocaleDateString('bn-BD')}</span>
              <span className="text-slate-300">বংশী এক্সপ্রেস</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/40 text-[11px] text-slate-500 font-medium leading-relaxed">
          💡 **পরামর্শ:** আপনার রাইটাররা ফর্ম ফিল্ডে যা যা টাইপ করবেন, ইউজাররা হোম পেজে ঠিক কেমন দেখতে পাবেন তা ডানপাশের এই ইন্টারেক্টিভ উইজেটে লাইভ দেখা যাচ্ছে।
        </div>
      </div>

    </div>
  );
}