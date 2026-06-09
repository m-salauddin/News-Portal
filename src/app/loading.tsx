"use html";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 fixed inset-0 z-[999999]">
      {/* মডার্ন স্পিনার স্পিন এলিমেন্ট */}
      <div className="relative w-12 h-12">
        <div className="w-full h-full rounded-full border-[3px] border-slate-800"></div>
        <div className="absolute top-0 left-0 w-full h-full rounded-full border-[3px] border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
      </div>
      <p className="text-slate-400 text-xs font-bold tracking-widest uppercase animate-pulse font-mono">
        Banshi Express Loading...
      </p>
    </div>
  );
}