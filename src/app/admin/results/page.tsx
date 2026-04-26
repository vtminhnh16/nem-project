import { db } from "@/lib/db";
import { Activity, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const results = await db.result.findMany({
    include: {
      student: true,
      exam: {
        include: { questions: true }
      },
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Activity className="text-indigo-500" />
            Chấm Điểm & Báo Cáo
          </h1>
          <p className="text-slate-500">
            Xem kết quả làm bài của học sinh và phân tích phổ điểm.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {results.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 shadow-sm">
            Chưa có kết quả bài thi nào.
          </div>
        ) : (
          results.map((result) => {
             const answers = result.answersJson ? JSON.parse(result.answersJson) : {};
             
             return (
              <details key={result.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                <summary className="flex flex-col md:flex-row md:items-center justify-between p-5 cursor-pointer list-none hover:bg-slate-50 transition-colors gap-4">
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-12 h-12 bg-indigo-100 text-2xl rounded-full flex items-center justify-center shrink-0">
                       {result.student.avatarUrl ? <img src={result.student.avatarUrl} className="rounded-full" /> : '🐵'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{result.student.name}</div>
                      <div className="text-sm text-slate-500 font-medium">Lớp {result.student.grade}</div>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-1/3">
                    <div className="font-bold text-slate-700">{result.exam.title}</div>
                    <div className="text-sm text-slate-500">{result.exam.subject}</div>
                  </div>

                  <div className="w-full md:w-1/3 flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                       <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1 justify-end">
                         <Calendar className="w-3.5 h-3.5" />
                         {new Date(result.completedAt).toLocaleDateString("vi-VN", {
                            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                         })}
                       </div>
                       <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-sm font-black bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Đạt {result.score} / {result.totalQuestions}
                       </div>
                    </div>
                    <div className="text-slate-400 group-open:rotate-180 transition-transform p-2 bg-slate-100 rounded-full">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                  </div>
                </summary>

                <div className="p-5 md:p-8 border-t border-slate-200 bg-slate-50/50">
                   <h3 className="font-bold text-slate-700 mb-6 text-lg">Chi tiết bài làm</h3>
                   {result.exam.questions && result.exam.questions.length > 0 ? (
                       <div className="space-y-4">
                          {result.exam.questions.map((q: any, i: number) => {
                              const userAns = answers[i] || "";
                              const correctAns = String(q.correctAnswer).trim().toLowerCase();
                              const isCorrect = String(userAns).trim().toLowerCase() === correctAns;

                              return (
                                  <div key={q.id} className={`p-5 rounded-2xl border ${isCorrect ? 'bg-white border-emerald-200 shadow-sm' : 'bg-red-50/50 border-red-200 shadow-sm'}`}>
                                      <div className="font-bold text-slate-800 mb-3">
                                          <span className="mr-2 text-slate-500">Câu {i + 1}:</span> 
                                          {q.questionText}
                                      </div>
                                      {q.imageUrl && <img src={q.imageUrl} alt="minh hoạ" className="max-h-24 mb-4 rounded-xl border border-slate-200" />}
                                      
                                      <div className="flex flex-col sm:flex-row gap-3 mt-3">
                                          <div className={`flex-1 px-4 py-3 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-white border-red-200 text-red-800'}`}>
                                              <div className="font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Học sinh chọn</div> 
                                              <div className="text-base font-black break-words">{userAns || "(Bỏ trống)"}</div>
                                          </div>
                                          {!isCorrect && (
                                              <div className="flex-1 px-4 py-3 rounded-xl border bg-emerald-50 border-emerald-100 text-emerald-800">
                                                  <div className="font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Đáp án đúng</div> 
                                                  <div className="text-base font-black break-words">{q.correctAnswer}</div>
                                              </div>
                                          )}
                                      </div>
                                  </div>
                              );
                          })}
                       </div>
                   ) : (
                       <p className="text-slate-500 italic">Không có dữ liệu chi tiết câu hỏi cho bài thi này.</p>
                   )}
                </div>
              </details>
             );
          })
        )}
      </div>
    </div>
  );
}
