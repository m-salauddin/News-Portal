"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EditNews() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");

  const [categories, setCategories] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Load categories & districts
      const { data: cats } = await supabase.from("categories").select("*");
      const { data: dists } = await supabase.from("districts").select("*");
      if (cats) setCategories(cats);
      if (dists) setDistricts(dists);

      // Load specific news details
      if (id) {
        const { data: newsData, error } = await supabase
          .from("news")
          .select("*")
          .eq("id", id)
          .single();

        if (newsData) {
          setTitle(newsData.title);
          setContent(newsData.content);
          setImageUrl(newsData.image_url || "");
          setCategoryId(newsData.category_id || "");
          setDistrictId(newsData.district_id || "");
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    const { error } = await supabase
      .from("news")
      .update({
        title,
        content,
        image_url: imageUrl,
        category_id: categoryId ? Number(categoryId) : null,
        district_id: districtId ? Number(districtId) : null,
      })
      .eq("id", id);

    setUpdating(false);

    if (!error) {
      alert("সংবাদটি সফলভাবে আপডেট করা হয়েছে!");
      router.push("/admin"); // Dashboard-e ferat niye jabe
    } else {
      alert("আপডেট করতে সমস্যা হয়েছে!");
      console.error(error);
    }
  };

  if (loading) return <p className="text-center p-10 text-black">লোড হচ্ছে...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-xl font-bold mb-6 border-b pb-2">📰 সংবাদ এডিট করুন</h1>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">শিরোনাম</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">ক্যাটাগরি</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full p-2 border rounded bg-white text-sm"
                required
              >
                <option value="">সিলেক্ট করুন</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name_bn}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">জেলা</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full p-2 border rounded bg-white text-sm"
              >
                <option value="">সারাদেশ (সব জেলা)</option>
                {districts.map((dist) => (
                  <option key={dist.id} value={dist.id}>{dist.name_bn}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">ইমেজ ইউআরএল (Link)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border rounded text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">মূল খবর</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full p-2 border rounded focus:outline-none focus:border-blue-500 text-sm leading-relaxed"
              required
            ></textarea>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm font-semibold transition"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold transition"
            >
              {updating ? "আপডেট হচ্ছে..." : "সংরক্ষণ করুন"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}