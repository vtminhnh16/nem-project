import { db } from "@/lib/db";
import Link from 'next/link';

export default async function KidExamsPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const student = await db.student.findUnique({ where: { id: studentId } });
  if (!student) return <div>Không tìm thấy dữ liệu vui lòng quay lại trang chủ</div>;

  const exams = await db.exam.findMany({
      where: { forGrade: student.grade },
      include: {
          questions: true,
          results: {
              where: { studentId: student.id }
          }
      }
  });

  return (
    <div className="min-h-screen bg-[#FDF4FF] p-6 lg:p-12 font-sans relative overflow-hidden">
       {/* Background decorations */}
       <div className="absolute -top-20 -right-20 w-80 h-80 bg-fuchsia-200 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
       <div className="absolute bottom-10 left-10 w-60 h-60 bg-amber-200 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

       <div className="max-w-5xl mx-auto relative z-10">
           <div className="flex justify-between items-center mb-12">
               <div>
                   <h1 className="text-4xl md:text-5xl font-black text-fuchsia-600 mb-2 drop-shadow-sm">
                     Chào mừng {student.name}! 👋
                   </h1>
                   <p className="text-xl text-fuchsia-800 font-bold">Hãy chọn một nhiệm vụ để chinh phục nhé.</p>
               </div>
               <Link href="/" className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-2xl shadow-sm border border-slate-200 transition-colors">
                 Thoát
               </Link>
           </div>

           {exams.length === 0 ? (
               <div className="bg-white p-10 rounded-[2.5rem] shadow-xl text-center border-[6px] border-fuchsia-100">
                   <div className="text-6xl mb-4">🎈</div>
                   <h2 className="text-2xl font-bold text-slate-700">Chưa có nhiệm vụ nào cho lớp {student.grade} cả!</h2>
                   <p className="text-slate-500 mt-2">Bé bảo bố mẹ tạo đề thi trải nghiệm nhé.</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {exams.map(exam => {
                       const bestResult = exam.results.length > 0 
                                      ? Math.max(...exam.results.map(r => r.score)) 
                                      : null;

                       return (
                           <Link key={exam.id} href={`/kids/${student.id}/exams/${exam.id}`}>
                               <div className="group bg-white rounded-[2rem] p-6 shadow-xl shadow-fuchsia-100/50 border-b-8 border-fuchsia-200 hover:border-fuchsia-400 hover:-translate-y-2 transition-all cursor-pointer h-full flex flex-col relative overflow-hidden">
                                   
                                   {/* Tags */}
                                   <div className="flex gap-2 mb-4">
                                       <span className="bg-blue-100 text-blue-700 text-xs font-black uppercase px-3 py-1.5 rounded-full">Toán Học</span>
                                       <span className="bg-slate-100 text-slate-600 text-xs font-black uppercase px-3 py-1.5 rounded-full">{exam.questions.length} CÂU</span>
                                   </div>

                                   <h3 className="text-2xl font-black text-slate-800 mb-6 group-hover:text-fuchsia-600 transition-colors">{exam.title}</h3>
                                   
                                   <div className="mt-auto pt-4 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                                       {bestResult !== null ? (
                                           <div className="flex items-center gap-2">
                                              <span className="text-3xl">⭐</span>
                                              <span className="font-bold text-amber-500">Đã xong! ({bestResult}/{exam.questions.length})</span>
                                           </div>
                                       ) : (
                                           <div className="flex items-center gap-2">
                                              <span className="text-3xl opacity-50 grayscale">🎯</span>
                                              <span className="font-bold text-slate-400">Chưa bắt đầu</span>
                                           </div>
                                       )}
                                       <div className="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-full flex justify-center items-center font-bold font-black group-hover:bg-fuchsia-600 group-hover:text-white transition-colors">
                                            &rarr;
                                       </div>
                                   </div>
                               </div>
                           </Link>
                       )
                   })}
               </div>
           )}
       </div>
    </div>
  )
}
