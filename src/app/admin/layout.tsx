import Link from 'next/link';
import { BookOpen, Users, Settings, Home, Activity } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 shadow-sm">
        <div className="p-6">
          <Link href="/admin" className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Nem Admin
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
            <BookOpen className="w-5 h-5" /> Quản lý Đề thi
          </Link>
          <Link href="/admin/students" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
            <Users className="w-5 h-5" /> Quản lý Học sinh
          </Link>
          <Link href="/admin/results" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
            <Activity className="w-5 h-5" /> Chấm điểm & Báo cáo
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-colors">
            <Settings className="w-5 h-5" /> Cài đặt API
          </Link>
        </nav>
      </aside>
      
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
