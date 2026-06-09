"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function ManageCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [editId, setEditId] = useState<number | null>(null); // Edit tracking state
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("id", { ascending: false });
    if (data) setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (editId) {
      // Update existing category
      const { error } = await supabase
        .from("categories")
        .update({ name_bn: nameBn, name_en: nameEn })
        .eq("id", editId);

      if (!error) {
        alert("ক্যাটাগরি আপডেট হয়েছে!");
        setEditId(null);
      }
    } else {
      // Add new category
      const { error } = await supabase
        .from("categories")
        .insert([{ name_bn: nameBn, name_en: nameEn }]);

      if (!error) alert("ক্যাটাগরি সফলভাবে যোগ হয়েছে!");
    }

    setNameBn("");
    setNameEn("");
    fetchCategories();
    setLoading(false);
  };

  const handleEditClick = (cat: any) => {
    setEditId(cat.id);
    setNameBn(cat.name_bn);
    setNameEn(cat.name_en);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 text-black">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="text-sm font-semibold text-blue-600 hover:underline mb-4 inline-block">← ড্যাশবোর্ডে ফিরুন</Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Area */}
          <div className="bg-white p-5 rounded-xl shadow-sm border h-fit">
            <h2 className="font-bold text-lg mb-4">{editId ? "📝 ক্যাটাগরি এডিট" : "➕ নতুন ক্যাটাগরি যোগ"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">বাংলা নাম</label>
                <input type="text" value={nameBn} onChange={(e) => setNameBn(e.target.value)} className="w-full p-2 border rounded text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ইংরেজি নাম</label>
                <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="w-full p-2 border rounded text-sm" required />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-sm font-bold transition">
                  {loading ? "কাজ হচ্ছে..." : editId ? "আপডেট" : "যোগ করুন"}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setNameBn(""); setNameEn(""); }} className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm transition">
                    বাতিল
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Area */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-bold text-lg mb-4">সব ক্যাটাগরির তালিকা ({categories.length})</h2>
            <div className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="font-bold text-sm text-gray-800">{cat.name_bn}</p>
                    <p className="text-xs text-gray-400">{cat.name_en}</p>
                  </div>
                  <button onClick={() => handleEditClick(cat)} className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded transition">
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