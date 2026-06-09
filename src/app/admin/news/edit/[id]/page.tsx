"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function EditNews() {
  const router = useRouter();
  const params = useParams();
  const newsId = params?.id; // URL থেকে ডাইনামিক আইডি নেওয়া হচ্ছে

  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  // 📝 ফর্ম স্টেট
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isBreaking, setIsBreaking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!newsId) return;

    const fetchFormMetaDataAndNews = async () => {
      setLoading(true);
      
      // ১. মেটা ডাটা (ক্যাটাগরি ও জেলা) লোড
      const { data: cat } = await supabase.from("categories").select("*");
      const { data: dist } = await supabase.from("districts").select("*");
      if (cat) setCategories(cat);
      if (dist) setDistricts(dist);

      // ২. নির্দিষ্ট নিউজের এক্সিস্টিং ডাটা লোড
      const { data: news, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", newsId)
        .single();

      if (!error && news) {
        setTitle(news.title || "");
        setContent(news.content || "");
        setExcerpt(news.excerpt || "");
        setCategoryId(news.category_id ? String(news.category_id) : "");
        setDistrictId(news.district_id ? String(news.district_id) : "");
        setImageUrl(news.image_url || "");
        setIsPublished(news.is_published);
        setIsBreaking(news.is_breaking || false);
      } else {
        alert("সংবাদটি খুঁজে পাওয়া যায়নি অথবা ডাটাবেজ এরর!");
        router.push("/admin/news");
      }
      setLoading(false);
    };

    fetchFormMetaDataAndNews();
  }, [newsId]);

  // 🤖 স্মার্ট অটো-সামারি জেনারেটর
  const generateSmartExcerpt = () => {
    if (!content) return;
    setExcerpt(content.substring(0, 150) + "...");
  };

  // 📥 আপডেট হ্যান্ডলার
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !categoryId) {
      alert("শিরোনাম, মূল খবর এবং ক্যাটাগরি অবশ্যই দিতে হবে!");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from("news")
      .update({
        title,
        content,
        excerpt: excerpt || title.substring(0, 100),
        category_id: Number(categoryId),
        district_id: districtId ? Number(districtId) : null,
        image_url: imageUrl || null,
        is_published: isPublished,
        is_breaking: isBreaking,
      })
      .eq("id", newsId);

    setSubmitting(false);
    if (!error) {
      alert("সংবাদটি সফলভাবে আপডেট ও রি-পাবলিশ হয়েছে! 🎯");
      router.push("/admin/news");
    } else {
      alert("আপডেট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-7xl mx-auto">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-xs font-mono font-bold tracking-widest uppercase">Fetching Document Source...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
      
      {/* 📝 বাম পাশ: ডাটা মডিফিকেশন স্টুডিও */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 p-5 sm:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <span>📝 সংবাদ এডিট প্যানেল</span>
          </h2>
          <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-xl border border-amber-100 font-mono">
            Document ID: #{newsId}
          </span>
        </div>
        
        <form onSubmit={handleUpdate} className="space-y-5 text-xs sm:text-sm">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">সংবাদের শিরোনাম সংশোধন করুন</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-semibold text-black" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">ক্যাটাগরি পরিবর্তন</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-slate-800 cursor-pointer">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_bn}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700">অঞ্চল পরিবর্তন (জেলা)</label>
              <select value={districtId} onChange={(e) => setDistrictId(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:outline-none focus:border-red-500 font-bold text-slate-800 cursor-pointer">
                <option value="">সব জেলা / গ্লোবাল</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name_bn}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">থাম্বনেইল ইমেজ URL</label>
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-mono text-black text-xs" />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">মূল সংবাদ বিবরণী</label>
            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 font-medium text-black leading-relaxed" />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-700">সংক্ষিপ্ত মেটা সাব-টাইটেল (SEO)</label>
              <button type="button" onClick={generateSmartExcerpt} className="text-[10px] bg-slate-900 text-slate-200 font-bold px-2.5 py-1 rounded-lg hover:bg-red-600 hover:text-white transition cursor-pointer">
                ✨ সামারি আপডেট করুন
              </button>
            </div>
            <textarea rows={2} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-red-500 font-medium text-black text-xs" />
          </div>

          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer select-none">
              <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
              সংবাদটি লাইভ রাখুন (Published)
            </label>
            <label className="flex items-center gap-2 font-bold text-red-600 cursor-pointer select-none">
              <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} className="w-4 h-4 accent-red-600 rounded cursor-pointer" />
              🔥 ব্রেকিং নিউজ হিসেবে প্রদর্শন করুন
            </label>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push("/admin/news")} className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-center transition cursor-pointer text-xs uppercase tracking-wider">
              ফিরে যান
            </button>
            <button type="submit" disabled={submitting} className="w-2/3 bg-slate-950 hover:bg-amber-500 hover:text-white text-white font-black py-3.5 rounded-2xl transition duration-300 shadow-md disabled:opacity-50 cursor-pointer text-xs uppercase tracking-wider">
              {submitting ? "ক্লাউডে সেভ হচ্ছে..." : "💾 পরিবর্তন নিশ্চিত ও সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      </div>

      {/* 🎨 ডান পাশ: রিয়েল-টাইম এডিট প্রিভিউ মডিউল */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 lg:sticky top-24">
        <h3 className="text-xs font-black text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          লাইভ মডিফিকেশন প্রিভিউ
        </h3>
        
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
          <div className="w-full aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center text-slate-300">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Not+Found'}} />
            ) : (
              <span className="text-xs font-bold font-mono">থাম্বনেইল প্রিভিউ</span>
            )}
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
              {categories.find(c => c.id === Number(categoryId))?.name_bn || "ক্যাটাগরি"}
            </span>
          </div>
          
          <div className="p-4 space-y-2">
            <h4 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
              {title || "শিরোনাম..."}
            </h4>
            <p className="text-slate-400 text-[11px] font-medium line-clamp-2 leading-relaxed">
              {excerpt || "কন্টেন্ট সামারি..."}
            </p>
            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-mono font-bold">
              <span className="text-emerald-600 font-black">{isPublished ? "🟢 LIVE" : "🟠 ARCHIVED"}</span>
              <span className="text-slate-400">বংশী এক্সপ্রেস</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/40 text-[11px] text-slate-500 font-medium leading-relaxed">
          ⚡ **সিস্টেম নোট:** এখানে যেকোনো পরিবর্তন করার সাথে সাথে ডাটাবেজে সাবমিট করার পূর্বেই আপনি রিয়েল-টাইম ভিজ্যুয়াল আপডেটটি দেখতে পাচ্ছেন।
        </div>
      </div>

    </div>
  );
}