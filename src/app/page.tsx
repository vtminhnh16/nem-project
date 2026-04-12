import { db } from "@/lib/db";
import Link from 'next/link';

export default async function KidsLandingPage() {
  const students = await db.student.findMany();

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-48 h-24 bg-white rounded-full opacity-60 shadow-sm blur-md animate-pulse"></div>
      <div className="absolute top-40 right-20 w-64 h-32 bg-white rounded-full opacity-70 shadow-sm blur-md"></div>
      
      <div className="z-10 text-center max-w-4xl w-full">
        <h1 className="text-5xl md:text-7xl font-extrabold text-emerald-600 mb-6 drop-shadow-md tracking-tight" style={{ WebkitTextStroke: '1px white' }}>
          Ai đang học thế nhỉ? 🌟
        </h1>
        <p className="text-2xl text-emerald-700 font-bold mb-16 drop-shadow-sm">Chọn tên của bạn để bắt đầu thử thách nhé!</p>

        {students.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl shadow-xl shadow-emerald-200 border-4 border-emerald-100 inline-block">
            <h2 className="text-2xl text-slate-700 font-bold mb-6">Ối! Chưa có bạn nhỏ nào cả...</h2>
            <Link href="/admin/students" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-2xl transition-transform hover:scale-105 inline-block shadow-lg">
              Bố/Mẹ hãy vào trang quản trị để thêm nhé!
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {students.map((student) => (
              <Link key={student.id} href={`/kids/${student.id}/exams`}>
                <div className="group bg-white rounded-[2.5rem] w-64 p-8 shadow-xl shadow-emerald-200 border-b-[10px] border-r-8 border-emerald-300 hover:border-emerald-500 hover:-translate-y-3 hover:translate-x-1 active:translate-y-0 active:border-b-4 active:border-r-4 transition-all cursor-pointer flex flex-col items-center">
                  <div className="w-36 h-36 rounded-full overflow-hidden mb-6 bg-[#E0F2FE] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border-4 border-white">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-7xl">👧👦</div>
                    )}
                  </div>
                  <h2 className="text-4xl font-black text-slate-800">{student.name}</h2>
                  <div className="mt-4 px-5 py-2 bg-amber-100 text-amber-600 font-bold rounded-full text-base border-2 border-amber-200">
                    Lớp {student.grade}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Admin access */}
      <Link href="/admin" className="absolute bottom-6 right-6 p-4 opacity-40 hover:opacity-100 text-slate-700 bg-white/80 rounded-full shadow-sm hover:bg-white transition-opacity font-bold z-50">
        🛠️ Quản trị Phụ huynh
      </Link>
    </div>
  );
}
