import { db } from "@/lib/db";
import { Activity, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const results = await db.result.findMany({
    include: {
      student: true,
      exam: true,
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

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-sm">
                <th className="p-4 pl-6">Học Sinh</th>
                <th className="p-4">Đề Thi</th>
                <th className="p-4 text-center">Điểm Số</th>
                <th className="p-4">Ngày Hoàn Thành</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Chưa có kết quả bài thi nào.
                  </td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr key={result.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-slate-800">{result.student.name}</div>
                      <div className="text-xs text-slate-500">Lớp {result.student.grade}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-700">{result.exam.title}</div>
                      <div className="text-xs text-slate-500">{result.exam.subject}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-indigo-50 text-indigo-700">
                        {result.score} / {result.totalQuestions}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(result.completedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
