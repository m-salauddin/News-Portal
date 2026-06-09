"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function NewsDetailPage() {
  const { id } = useParams(); // ইউআরএল থেকে নিউজের আইডি নেওয়া হচ্ছে
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ভাষা পরিবর্তনের ইভেন্ট লিসেনার
  useEffect(() => {
    const handleLangChange = () => {
      const savedLang = localStorage.getItem("site-lang") || "bn";
      setLang(savedLang);
    };

    handleLangChange();
    window.addEventListener("langChange", handleLangChange);
    return () => window.removeEventListener("langChange", handleLangChange);
  }, []);

  // ডাটাবেজ থেকে নির্দিষ্ট আইডি'র নিউজ নিয়ে আসা
  useEffect(() => {
    const fetchNewsDetails = async () => {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("news")
        .select("*, categories(name_bn, name_en)")
        .eq("id", id)
        .single(); // শুধু একটি নির্দিষ্ট রো আনার জন্য

      if (error || !data) {
        console.error("নিউজ পাওয়া যায়নি:", error);
        setNews(null);
      } else {
        setNews(data);
      }
      setLoading(false);
    };

    fetchNewsDetails();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* পেছনে যাওয়ার বাটন */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-sm font-semibold text-blue-600 hover:underline gap-1 animate-none"
        >
          {lang === "bn" ? "← পেছনে যান" : "← Back"}
        </button>

        {loading ? (
          <p className="text-center text-gray-500 py-10">
            {lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}
          </p>
        ) : !news ? (
          <div className="text-center py-20 text-gray-500">
            {lang === "bn" ? "দুঃখিত, খবরটি খুঁজে পাওয়া যায়নি।" : "Sorry, the news was not found."}
          </div>
        ) : (
          <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-8">
            {/* ক্যাটাগরি ট্যাগ */}
            <span className="inline-block bg-red-100 text-red-700 text-xs md:text-sm font-bold px-3 py-1 rounded mb-4">
              {lang === "bn" ? news.categories?.name_bn : news.categories?.name_en}
            </span>

            {/* খবরের শিরোনাম */}
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight mb-4 text-left">
              {news.title}
            </h1>

            {/* তারিখ ও সময় (এখানেই আপনার ট্যাগের ভুলটি ছিল, এখন ফিক্সড) */}
            <div className="text-xs md:text-sm text-gray-500 pb-6 border-b border-gray-100 mb-6">
              <span className="font-medium text-gray-700">
                {lang === "bn" ? "প্রকাশিত:" : "Published:"}
              </span>{" "}
              {new Date(news.created_at).toLocaleString(lang === "bn" ? "bn-BD" : "en-US", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </div>

            {/* খবরের মূল বড় ছবি */}
            {news.image_url && (
              <div className="w-full max-h-[450px] overflow-hidden rounded-lg mb-8 bg-gray-100">
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* খবরের বিস্তারিত বিবরণী */}
            <div className="text-gray-800 text-base md:text-lg leading-relaxed whitespace-pre-line text-justify">
              {news.content}
            </div>
          </article>
        )}
      </main>
    </div>
  );
}