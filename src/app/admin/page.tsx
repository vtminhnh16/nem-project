import { db } from "@/lib/db";
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default async function AdminDashboard() {
  const stats = {
    exams: await db.exam.count(),
    students: await db.student.count(),
    results: await db.result.count(),
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Tổng quan Hệ thống</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium tracking-wide text-sm uppercase">Tổng Đề thi</h3>
          <p className="text-4xl font-extrabold text-indigo-600 mt-2">{stats.exams}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium tracking-wide text-sm uppercase">Học sinh</h3>
          <p className="text-4xl font-extrabold text-emerald-600 mt-2">{stats.students}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 font-medium tracking-wide text-sm uppercase">Lượt làm bài</h3>
          <p className="text-4xl font-extrabold text-amber-500 mt-2">{stats.results}</p>
        </div>
      </div>
      
      {/* Call to action for Gemini */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 lg:p-10 text-white shadow-lg">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-2">
              <Sparkles className="text-yellow-300 w-8 h-8" /> Tự động hóa tạo đề thi
            </h2>
            <p className="text-indigo-100 text-lg">
              Tải lên một đề mẫu (Toán, Tiếng Việt,...), Google Gemini sẽ giúp bạn phân tích và tự động sinh ra bộ đề tương tự kèm đáp án chi tiết dành riêng cho độ tuổi của bé.
            </p>
          </div>
          <Link href="/admin/exams/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-indigo-700 hover:bg-slate-50 font-bold rounded-2xl transition-all shadow-md group whitespace-nowrap">
            Thử AI Generator ngay
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-purple-500 opacity-20 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
      </div>
    </div>
  );
}
