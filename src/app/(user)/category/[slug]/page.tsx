"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  image_url: string;
  created_at: string;
  categories: { name_bn: string; name_en: string };
}

export default function CategoryArchivePage() {
  const params = useParams();
  const router = useRouter();
  const categorySlug = params?.slug;

  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [categoryName, setCategoryName] = useState({ bn: "", en: "" });
  const [lang, setLang] = useState<"bn" | "en">("bn");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // লোকাল স্টোরেজ থেকে ল্যাঙ্গুয়েজ লোড
    const savedLang = localStorage.getItem("user_lang") as "bn" | "en";
    if (savedLang) setLang(savedLang);

    // গ্লোবাল ল্যাঙ্গুয়েজ চেঞ্জ ইভেন্ট লিসেনার সিঙ্ক
    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setLang(customEvent.detail);
    };
    window.addEventListener("userLangChange", handleLangChange);

    if (!categorySlug) return;

    const fetchCategoryNews = async () => {
      setLoading(true);

      // ১. প্রথমে স্লাগ অনুযায়ী ক্যাটাগরি ডাটা বের করা
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("id, name_bn, name_en")
        .eq("slug", categorySlug)
        .single();

      if (!catError && catData) {
        setCategoryName({ bn: catData.name_bn, en: catData.name_en });

        // ২. ঐ ক্যাটাগরি আইডি'র অধীনে থাকা সমস্ত পাবলিশড নিউজ তুলে আনা
        const { data: newsData } = await supabase
          .from("news")
          .select(`
            id, title, excerpt, image_url, created_at,
            categories ( name_bn, name_en )
          `)
          .eq("category_id", catData.id)
          .eq("is_published", true)
          .order("id", { ascending: false });

        if (newsData) setNewsList(newsData as unknown as NewsItem[]);
      } else {
        alert("ক্যাটাগরি খুঁজে পাওয়া যায়নি!");
        router.push("/");
      }

      setLoading(false);
    };

    fetchCategoryNews();

    return () => window.removeEventListener("userLangChange", handleLangChange);
  }, [categorySlug]);

  const dict = {
    bn: { loading: "ক্যাটাগরি আর্কাইভ লোড হচ্ছে...", readMore: "বিস্তারিত পড়ুন", back: "← হোমে ফিরে যান", noNews: "এই ক্যাটাগরিতে বর্তমানে কোনো সংবাদ নেই।" },
    en: { loading: "Loading category archive...", readMore: "Read More", back: "← Back to Home", noNews: "No news items available in this category." }
  }[lang];

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-400 text-xs font-bold tracking-wider">{dict.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 🏷️ ক্যাটাগরি হেডার টাইটেল */}
      <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600">Category Feed</p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase">
            {lang === "bn" ? categoryName.bn : categoryName.en}
          </h2>
        </div>
        <Link href="/" className="text-xs font-bold text-slate-400 hover:text-red-600 transition">
          {dict.back}
        </Link>
      </div>

      {/* 📰 নিউজ গ্রিড ফিড */}
      {newsList.length === 0 ? (
        <p className="text-center py-16 text-slate-400 text-sm font-bold bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          {dict.noNews}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((news) => (
            <Link 
              key={news.id} 
              href={`/news/${news.id}`} 
              className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                  <img 
                    src={news.image_url || 'https://placehold.co/400x250/f1f5f9/94a3b8?text=Banshi+Express'} 
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-black text-slate-800 text-sm group-hover:text-red-600 transition leading-snug line-clamp-2">
                    {news.title}
                  </h4>
                  <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">
                    {news.excerpt}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{new Date(news.created_at).toLocaleDateString()}</span>
                <span className="text-red-600 group-hover:underline">{dict.readMore} →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}