"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ManageDistricts() {
  const router = useRouter();
  
  // সিকিউরিটি ও অথেন্টিকেশন স্টেট
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  // বিজনেস লজিক স্টেট
  const [districts, setDistricts] = useState<any[]>([]);
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [editId, setEditId] = useState<number | null>(null); // এডিট ট্র্যাকিং স্টেট
  const [loading, setLoading] = useState(false);

  // ১. রাউট প্রোটেকশন ও সেশন চেক
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // লগইন সেশন না থাকলে মেইন এডমিন লগইন ইউআই-তে রিডাইরেক্ট করবে
        router.push("/admin"); 
      } else {
        setIsAllowed(true);
        fetchDistricts();
      }
    };
    checkAuth();
  }, [router]);

  // ডাটাবেজ থেকে জেলা নিয়ে আসার ফাংশন
  const fetchDistricts = async () => {
    const { data } = await supabase.from("districts").select("*").order("name_bn", { ascending: true });
    if (data) setDistricts(data);
  };

  // ফর্ম সাবমিট (যোগ বা এডিট) হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editId) {
      // জেলা আপডেট করা
      const { error } = await supabase
        .from("districts")
        .update({ name_bn: nameBn, name_en: nameEn })
        .eq("id", editId);

      if (!error) {
        alert("জেলার নাম সফলভাবে আপডেট হয়েছে!");
        setEditId(null);
      } else {
        alert("আপডেট করতে সমস্যা হয়েছে!");
      }
    } else {
      // নতুন জেলা যোগ করা
      const { error } = await supabase
        .from("districts")
        .insert([{ name_bn: nameBn, name_en: nameEn }]);

      if (!error) alert("জেলা সফলভাবে যোগ হয়েছে!");
    }

    setNameBn("");
    setNameEn("");
    fetchDistricts();
    setLoading(false);
  };

  // এডিট বাটনে ক্লিকের হ্যান্ডলার
  const handleEditClick = (dist: any) => {
    setEditId(dist.id);
    setNameBn(dist.name_bn);
    setNameEn(dist.name_en);
  };

  // সেশন ভেরিফাই হওয়ার আগ পর্যন্ত একটি নিরাপদ ব্ল্যাঙ্ক বা লোডিং স্ক্রিন
  if (isAllowed === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-sm tracking-widest font-semibold">
        VERIFYING PERMISSIONS...
      </div>
    );
  }

  // শুধুমাত্র অনুমতি থাকলে নিচের লেআউট এবং ডাটা রেন্ডার হবে
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm font-semibold text-blue-600 hover:underline mb-4 inline-block">
          ← ড্যাশবোর্ডে ফিরুন
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ফর্ম এরিয়া */}
          <div className="bg-white p-5 rounded-xl shadow-sm border h-fit">
            <h2 className="font-bold text-lg mb-4">
              {editId ? "📝 জেলা এডিট করুন" : "➕ নতুন জেলা যোগ"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">বাংলা নাম</label>
                <input 
                  type="text" 
                  value={nameBn} 
                  onChange={(e) => setNameBn(e.target.value)} 
                  className="w-full p-2 border rounded text-sm bg-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ইংরেজি নাম</label>
                <input 
                  type="text" 
                  value={nameEn} 
                  onChange={(e) => setNameEn(e.target.value)} 
                  className="w-full p-2 border rounded text-sm bg-white" 
                  required 
                />
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2 rounded text-sm font-bold transition disabled:opacity-50"
                >
                  {loading ? "কাজ হচ্ছে..." : editId ? "আপডেট" : "যোগ করুন"}
                </button>
                {editId && (
                  <button 
                    type="button" 
                    onClick={() => { setEditId(null); setNameBn(""); setNameEn(""); }} 
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm transition text-gray-700 font-medium"
                  >
                    বাতিল
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* তালিকা এরিয়া */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-bold text-lg mb-4">সব জেলার তালিকা ({districts.length})</h2>
            <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto pr-2">
              {districts.map((dist) => (
                <div key={dist.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{dist.name_bn}</p>
                    <p className="text-xs text-gray-400">{dist.name_en}</p>
                  </div>
                  <button 
                    onClick={() => handleEditClick(dist)} 
                    className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded transition"
                  >
                    এডিট করুন
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}