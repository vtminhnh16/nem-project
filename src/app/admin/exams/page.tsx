import { db } from "@/lib/db";
import Link from 'next/link';
import DeleteExamButton from './DeleteExamButton';

export default async function ExamsPage() {
  const exams = await db.exam.findMany({
    include: { questions: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý Đề thi</h1>
        <Link href="/admin/exams/new" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm inline-flex items-center justify-center gap-2">
          <span>Tạo Đề mới (AI)</span>
          <span className="text-xl">✨</span>
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Chưa có đề thi nào!</h2>
          <p className="text-slate-500 mb-6">Hãy sử dụng tính năng tạo đề thi tự động bằng AI để tạo bài tập đầu tiên cho bé nhanh chóng nhé.</p>
          <Link href="/admin/exams/new" className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors">
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 transition-colors group relative">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {exam.subject}
                </span>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
                  Lớp {exam.forGrade}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{exam.questions.length} câu hỏi</p>
              
              <div className="flex items-center gap-2">
                <Link href={`/admin/exams/${exam.id}`} className="flex-1 px-4 py-2 bg-slate-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition-colors text-sm text-center">
                  Xem chi tiết / Sửa đề
                </Link>
                <DeleteExamButton examId={exam.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
