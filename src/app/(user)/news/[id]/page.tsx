"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface NewsDetail {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image_url: string;
  category_id: number;
  district_id: number | null;
  created_at: string;
  categories?: { name_bn: string; name_en: string; slug: string };
  districts?: { name_bn: string; name_en: string; slug: string };
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = params?.id;

  const [news, setNews] = useState<NewsDetail | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsDetail[]>([]);
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ল্যাঙ্গুয়েজ প্রিফারেন্স লোড
    const savedLang = localStorage.getItem("user_lang") as "bn" | "en";
    if (savedLang) setLang(savedLang);

    // গ্লোবাল ল্যাঙ্গুয়েজ চেঞ্জ ইভেন্ট লিসেনার সিঙ্ক
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLang(customEvent.detail);
    };
    window.addEventListener("userLangChange", handleLangChange);

    if (!newsId) return;

    const fetchNewsDetail = async () => {
      setLoading(true);

      // ১. মূল নিউজের সম্পূর্ণ ডাটা রিলেশনসহ ফেচ করা
      const { data: newsData, error } = await supabase
        .from("news")
        .select(`
          *,
          categories ( name_bn, name_en, slug ),
          districts ( name_bn, name_en, slug )
        `)
        .eq("id", newsId)
        .eq("is_published", true)
        .single();

      if (!error && newsData) {
        setNews(newsData as NewsDetail);

        // ২. একই ক্যাটাগরির অন্যান্য সম্পর্কিত সংবাদ (Related News) ফেচ করা
        const { data: relatedData } = await supabase
          .from("news")
          .select(`
            *,
            categories ( name_bn, name_en, slug ),
            districts ( name_bn, name_en, slug )
          `)
          .eq("category_id", newsData.category_id)
          .eq("is_published", true)
          .not("id", "eq", newsData.id) // বর্তমান নিউজ বাদে
          .order("id", { ascending: false })
          .limit(4);

        if (relatedData) setRelatedNews(relatedData as NewsDetail[]);
      } else {
        alert("সংবাদটি খুঁজে পাওয়া যায়নি অথবা আর্কাইভ করা হয়েছে।");
        router.push("/");
      }

      setLoading(false);
    };

    fetchNewsDetail();

    return () => window.removeEventListener("userLangChange", handleLangChange);
  }, [newsId]);

  // 🌍 মাল্টি-ল্যাঙ্গুয়েজ ডিকশনারী
  const dict = {
    bn: { loading: "খবরটি লোড হচ্ছে...", related: "💡 সম্পর্কিত সংবাদ", share: "শেয়ার করুন", back: "← হোমে ফিরে যান", published: "প্রকাশিত:", location: "স্থান:" },
    en: { loading: "Loading story details...", related: "💡 Related News", share: "Share Story", back: "← Back to Home", published: "Published:", location: "Location:" }
  }[lang];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-xs font-bold tracking-wider">{dict.loading}</p>
      </div>
    );
  }

  if (!news) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-fadeIn">
      
      {/* 📰 বাম পাশ: মূল নিউজের মেগা বডি ভিউ সেকশন (২ কলাম জুড়ে) */}
      <div className="lg:col-span-2 bg-white border border-slate-200/60 p-4 sm:p-8 rounded-3xl shadow-sm space-y-6">
        
        {/* ব্রেডক্রাম্ব ও ব্যাক বাটন */}
        <div className="flex items-center justify-between text-xs font-bold">
          <Link href="/" className="text-slate-400 hover:text-red-600 transition">
            {dict.back}
          </Link>
          <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-red-100">
            {lang === "bn" ? news.categories?.name_bn : news.categories?.name_en}
          </span>
        </div>

        {/* সংবাদের মূল শিরোনাম */}
        <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight">
          {news.title}
        </h1>

        {/* পাবলিশিং মেটা ডাটা বার */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400 border-y border-slate-100 py-3 font-mono">
          <div>
            <span className="text-slate-500 font-sans font-extrabold mr-1">{dict.published}</span>
            {new Date(news.created_at).toLocaleString()}
          </div>
          {news.districts && (
            <>
              <span className="hidden sm:inline text-slate-200">•</span>
              <div>
                <span className="text-slate-500 font-sans font-extrabold mr-1">{dict.location}</span>
                <span className="text-red-600 font-sans font-black">
                  {lang === "bn" ? news.districts.name_bn : news.districts.name_en}
                </span>
              </div>
            </>
          )}
        </div>

        {/* মেগা হাই-রেজোলিউশন ইমেজ ব্যানার */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
          <img 
            src={news.image_url || 'https://placehold.co/800x450/f1f5f9/94a3b8?text=Banshi+Express'} 
            alt={news.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* সংবাদের মূল কন্টেন্ট বিবরণী */}
        <article className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium space-y-4 whitespace-pre-line text-justify">
          {news.content}
        </article>

      </div>

      {/* 💡 ডান পাশ: ক্যাটাগরি ভিত্তিক রিলেটেড নিউজ সাইডবার উইজেট */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-5 lg:sticky top-24">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">
            {dict.related}
          </h3>
        </div>

        {relatedNews.length === 0 ? (
          <p className="text-slate-400 text-xs font-bold text-center py-4">
            {lang === "bn" ? "এই ক্যাটাগরিতে আর কোনো খবর নেই।" : "No other stories in this archive."}
          </p>
        ) : (
          <div className="space-y-4">
            {relatedNews.map((item) => (
              <Link 
                key={item.id} 
                href={`/news/${item.id}`}
                className="group flex gap-3 items-center border-b border-slate-50 pb-3 last:border-0 last:pb-0 block"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img 
                    src={item.image_url || 'https://placehold.co/150x150/f1f5f9/94a3b8?text=News'} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="font-black text-slate-800 text-xs sm:text-sm group-hover:text-red-600 transition line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold font-mono">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}