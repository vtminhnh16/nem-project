"use client";

import { useState } from "react";
import { updateExamAction } from "./update-action";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function ExamEditor({ exam }: { exam: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(exam.title);
  
  // Initialize with database questions
  const [questions, setQuestions] = useState<any[]>(exam.questions.map((q: any) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : []
  })));

  const handlePastePerQuestion = (e: React.ClipboardEvent, index: number) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    setQuestions(prev => {
                        const newArr = [...prev];
                        newArr[index] = {...newArr[index], imageUrl: result};
                        return newArr;
                    });
                };
                reader.readAsDataURL(file);
            }
            break;
        }
    }
  };

  const handleUploadPerQuestion = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
          const result = event.target?.result as string;
          setQuestions(prev => {
              const newArr = [...prev];
              newArr[index] = {...newArr[index], imageUrl: result};
              return newArr;
          });
      };
      reader.readAsDataURL(file);
  };

  const handleRemovePerQuestionImage = (index: number) => {
      setQuestions(prev => {
          const newArr = [...prev];
          newArr[index] = { ...newArr[index], imageUrl: null };
          return newArr;
      });
  };

  const handleEditQuestionText = (index: number, newText: string) => {
      setQuestions(prev => {
          const newArr = [...prev];
          newArr[index] = {...newArr[index], questionText: newText};
          return newArr;
      });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
        await updateExamAction(exam.id, title, questions);
        router.push("/admin/exams");
        router.refresh();
    } catch (err: any) {
        setError("Lỗi cập nhật đề thi: " + err.message);
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
            <Link href="/admin/exams" className="p-2 bg-white rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Chi tiết Đề thi</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
            <div className="flex-1 w-full mr-0 md:mr-8 mb-4 md:mb-0">
                <label className="block text-sm font-bold text-slate-500 mb-1 uppercase tracking-wider">Tên bài thi</label>
                <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-indigo-400 focus:bg-white transition-colors"
                />
            </div>
            <button onClick={handleSave} disabled={loading} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold inline-flex justify-center items-center gap-2 rounded-xl shadow-md shrink-0">
                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Đang cập nhật..." : "Lưu Cập Nhật"}
            </button>
        </div>

        <div className="space-y-6">
            {questions.map((q, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-3 h-full bg-indigo-500 rounded-l-2xl"></div>
                    
                    {/* Khu vực chỉnh sửa văn bản đề bài */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4 pl-6 pr-4 mt-2">
                        <span className="font-bold text-lg text-indigo-800 whitespace-nowrap mt-2 bg-indigo-100 px-3 py-1 rounded-lg">Câu {i + 1}:</span>
                        <textarea 
                            value={q.questionText}
                            onChange={(e) => handleEditQuestionText(i, e.target.value)}
                            className="w-full text-lg text-slate-800 font-medium border-[3px] border-slate-200 rounded-xl p-3 bg-slate-50 hover:bg-white focus:bg-white focus:border-indigo-400 focus:shadow-md outline-none transition-all resize-y min-h-[90px]"
                        />
                    </div>
                    
                    {/* Khu vực đính kèm ảnh thủ công */}
                    <div className="pl-6 mt-2 mb-6 pr-4">
                        {q.imageUrl ? (
                            <div className="relative inline-block border-4 border-indigo-100 rounded-2xl p-2 bg-indigo-50/50 shadow-sm">
                                <img src={q.imageUrl} alt="minh hoa" className="max-h-56 object-contain rounded-xl" />
                                <button onClick={() => handleRemovePerQuestionImage(i)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white hover:bg-red-600 hover:scale-110 transition-transform">×</button>
                            </div>
                        ) : (
                            <div 
                                className="border-[3px] border-dashed border-slate-300 rounded-2xl p-6 bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-400 focus:bg-indigo-100 focus:border-indigo-500 transition-all cursor-pointer flex flex-col items-center justify-center outline-none focus:ring-4 focus:ring-indigo-500/20 shadow-sm"
                                tabIndex={0}
                                onClick={(e) => e.currentTarget.focus()}
                                onPaste={(e) => {
                                e.preventDefault();
                                handlePastePerQuestion(e, i);
                                }}
                            >
                                <div className="flex flex-col items-center gap-2 text-slate-500 pointer-events-none text-center">
                                    <div className="text-4xl mb-1 drop-shadow-sm">🗂️</div>
                                    <div className="text-[15px] font-bold text-slate-700">Click bao quanh hộp này cho sáng lên</div>
                                    <div className="text-sm">Rồi bấm phím <kbd className="bg-slate-200 border-b-2 border-slate-300 px-2 py-1 rounded text-slate-800 font-bold mx-1">Ctrl + V</kbd> để dán ảnh bảng biểu trực tiếp</div>
                                </div>
                                <label className="mt-5 px-5 py-2.5 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 text-slate-600 text-sm font-bold rounded-xl cursor-pointer transition-colors shadow-sm" onClick={e => e.stopPropagation()}>
                                    Hoặc tải file ảnh lên
                                    <input type="file" accept="image/*" onChange={(e) => handleUploadPerQuestion(e, i)} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    {q.type === 'FILL_IN' || (!q.options || q.options.length === 0) ? (
                        <div className="pl-4 mt-2">
                            <div className="inline-block px-6 py-3 rounded-xl border-2 border-slate-300 border-dashed text-emerald-700 font-bold bg-emerald-50 text-xl">
                                Đáp án: {q.correctAnswer}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                            {q.options.map((opt: string, optIdx: number) => (
                                <div key={optIdx} className={`px-4 py-3 rounded-xl border ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                                    {String.fromCharCode(65 + optIdx)}. {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
  )
}
