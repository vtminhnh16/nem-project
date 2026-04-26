"use client";

import { useState, useRef } from "react";
import { generateExamFromImageAction, extractOriginalExamFromImageAction } from "./actions";
import { saveExamAction } from "./save-action";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function NewAIExamPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [grade, setGrade] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
  const [title, setTitle] = useState("Đề thi Toán luyện tập");
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
       setError("Dung lượng ảnh quá lớn (>5MB). Hệ thống khuyên dùng ảnh được chụp rõ nét dưới 5MB.");
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
      setGeneratedQuestions([]); // reset if new image
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      setError("Vui lòng tải ảnh đề mẫu lên.");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
       const result = await generateExamFromImageAction(imagePreview, grade);
       setGeneratedQuestions(result);
    } catch (err: any) {
       setError(err.message || "Có lỗi bất ngờ khi sinh đề.");
    } finally {
       setLoading(false);
    }
  };

  const handleExtractOriginal = async () => {
    if (!imagePreview) {
      setError("Vui lòng tải ảnh đề mẫu lên.");
      return;
    }
    setError("");
    setLoading(true);
    
    try {
       const result = await extractOriginalExamFromImageAction(imagePreview, grade);
       setGeneratedQuestions(result);
       setTitle("Đề thi gốc");
    } catch (err: any) {
       setError(err.message || "Có lỗi bất ngờ khi trích xuất.");
    } finally {
       setLoading(false);
    }
  };

  const handlePastePerQuestion = (e: React.ClipboardEvent, index: number) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = event.target?.result as string;
                    setGeneratedQuestions(prev => {
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
          setGeneratedQuestions(prev => {
              const newArr = [...prev];
              newArr[index] = {...newArr[index], imageUrl: result};
              return newArr;
          });
      };
      reader.readAsDataURL(file);
  };

  const handleRemovePerQuestionImage = (index: number) => {
      setGeneratedQuestions(prev => {
          const newArr = [...prev];
          const { imageUrl, ...rest } = newArr[index];
          newArr[index] = rest;
          return newArr;
      });
  };

  const handleEditQuestionText = (index: number, newText: string) => {
      setGeneratedQuestions(prev => {
          const newArr = [...prev];
          newArr[index] = {...newArr[index], questionText: newText};
          return newArr;
      });
  };

  const handleEditCorrectAnswer = (index: number, newAnswer: string) => {
      setGeneratedQuestions(prev => {
          const newArr = [...prev];
          newArr[index] = {...newArr[index], correctAnswer: newAnswer};
          return newArr;
      });
  };

  const handleEditOption = (qIndex: number, optIndex: number, newOptionText: string) => {
      setGeneratedQuestions(prev => {
          const newArr = [...prev];
          const newOptions = [...newArr[qIndex].options];
          const oldOptionText = newOptions[optIndex];
          
          newOptions[optIndex] = newOptionText;
          
          let newCorrectAnswer = newArr[qIndex].correctAnswer;
          if (oldOptionText === newCorrectAnswer) {
              newCorrectAnswer = newOptionText;
          }

          newArr[qIndex] = {
              ...newArr[qIndex], 
              options: newOptions,
              correctAnswer: newCorrectAnswer
          };
          return newArr;
      });
  };

  const handleSelectCorrectOption = (qIndex: number, optionText: string) => {
      setGeneratedQuestions(prev => {
          const newArr = [...prev];
          newArr[qIndex] = {...newArr[qIndex], correctAnswer: optionText};
          return newArr;
      });
  };

  const handleSave = async () => {
    if (generatedQuestions.length === 0) return;
    setLoading(true);
    try {
        await saveExamAction(title, "Toán học", grade, generatedQuestions);
        router.push("/admin/exams");
        router.refresh();
    } catch (err: any) {
        setError("Lỗi lưu đề thi: " + err.message);
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
       <div className="mb-8">
           <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
             Tạo Đề Tự Động <Sparkles className="text-amber-500" />
           </h1>
           <p className="text-slate-500">Gemini sẽ phân tích ảnh được quét, và tạo ra 5 bài toán mới với độ khó và kiến trúc câu hỏi tương tự.</p>
       </div>

       {error && (
         <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-medium">
           {error}
         </div>
       )}

       {!generatedQuestions.length ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Trai: Upload */}
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-1 border-dashed">
                   <h3 className="text-lg font-bold text-slate-800 mb-4">1. Đề mẫu (Giấy / PDF Screenshot)</h3>
                   <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="h-64 border-2 border-dashed border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
                   >
                     {imagePreview ? (
                        imagePreview.startsWith("data:application/pdf") ? (
                           <embed src={imagePreview} type="application/pdf" className="w-full h-full rounded-2xl" />
                        ) : (
                           <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                        )
                     ) : (
                        <div className="text-center p-6">
                            <UploadCloud className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                            <p className="text-indigo-600 font-medium font-medium mb-1">Click để tải file lên</p>
                            <p className="text-slate-400 text-sm">PNG, JPG, PDF (Max 5MB)</p>
                        </div>
                     )}
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*,application/pdf" onChange={handleImageUpload} />
                   
                   {imagePreview && (
                     <button onClick={() => {setImagePreview(null); setGeneratedQuestions([])}} className="mt-3 text-red-500 text-sm font-medium w-full text-center hover:text-red-600">
                         Xóa ảnh
                     </button>
                   )}
               </div>

               {/* Phai: Options */}
               <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                   <div>
                       <h3 className="text-lg font-bold text-slate-800 mb-4">2. Cấu hình độ khó</h3>
                       
                       <label className="block text-sm font-medium text-slate-700 mb-2">Tạo đề thi cho:</label>
                       <div className="grid grid-cols-2 gap-3 mb-6">
                           <div 
                              onClick={() => setGrade(1)} 
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${grade === 1 ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                           >
                              <div className="font-bold text-slate-800 mb-1">Học sinh Lớp 1</div>
                              <div className="text-xs text-slate-500">Phép tính đến 20</div>
                           </div>
                           <div 
                              onClick={() => setGrade(3)} 
                              className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${grade === 3 ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'}`}
                           >
                              <div className="font-bold text-slate-800 mb-1">Học sinh Lớp 3</div>
                              <div className="text-xs text-slate-500">Toán có lời văn & Phép chia</div>
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                       <button 
                         onClick={handleExtractOriginal} 
                         disabled={loading || !imagePreview}
                         className="w-full py-3 bg-emerald-600 disabled:bg-slate-300 hover:bg-emerald-700 text-white rounded-xl font-bold text-base flex justify-center items-center gap-2 transition-all shadow-sm"
                       >
                         {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                         {loading ? "Đang xử lý..." : "1. Trích xuất Đề Gốc"}
                       </button>
                       <button 
                         onClick={handleGenerate} 
                         disabled={loading || !imagePreview}
                         className="w-full py-3 bg-indigo-600 disabled:bg-slate-300 hover:bg-indigo-700 text-white rounded-xl font-bold text-base flex justify-center items-center gap-2 transition-all shadow-sm"
                       >
                         {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                         {loading ? "Đang xử lý..." : "2. AI Sinh Đề Mới"}
                       </button>
                   </div>
               </div>
           </div>
       ) : (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                   <div>
                       <h2 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
                         <CheckCircle2 className="text-emerald-500" /> AI Đã Xong! 
                       </h2>
                       <p className="text-slate-500 text-sm">Vui lòng kiểm tra lại 5 câu hỏi dưới đây. Nếu tất cả đều đúng, hãy đặt Tên và Lưu.</p>
                   </div>
                   <div className="mt-4 md:mt-0 flex flex-col gap-2 min-w-[250px]">
                       <input 
                         type="text" 
                         value={title} 
                         onChange={e => setTitle(e.target.value)} 
                         placeholder="Tên bài thi (VD: Luyện tập T2)..." 
                         className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                       />
                       <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex justify-center items-center rounded-lg shadow-sm">
                         {loading ? "Đang lưu..." : "Lưu vào Kho Đề"}
                       </button>
                   </div>
               </div>

               <div className="space-y-4">
                   {generatedQuestions.map((q, i) => (
                       <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
// Using explicit multi_replace isn't needed here if I match accurately.
// Replace the block from absolute div to the end of the image dropzone.
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
                                      <div className="flex flex-col items-center gap-2 text-slate-500 pointer-events-none">
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
                               <div className="pl-4 mt-2 flex items-center gap-3">
                                  <span className="font-bold text-slate-700 whitespace-nowrap">Đáp án:</span>
                                  <input 
                                     value={q.correctAnswer}
                                     onChange={(e) => handleEditCorrectAnswer(i, e.target.value)}
                                     className="px-4 py-2 rounded-xl border-2 border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-emerald-700 font-bold bg-emerald-50 text-xl outline-none transition-all w-full md:w-1/2"
                                     placeholder="Nhập đáp án đúng..."
                                  />
                               </div>
                           ) : (
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                                   {q.options.map((opt: string, optIdx: number) => (
                                       <div key={optIdx} className={`px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${opt === q.correctAnswer ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'border-slate-300 bg-slate-50 text-slate-600 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100'}`}>
                                           <div className="flex-shrink-0 flex items-center">
                                               <input 
                                                  type="radio" 
                                                  name={`correct-answer-${i}`}
                                                  checked={opt === q.correctAnswer}
                                                  onChange={() => handleSelectCorrectOption(i, opt)}
                                                  className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                                                  title="Chọn làm đáp án đúng"
                                               />
                                           </div>
                                           <span className="font-bold text-lg">{String.fromCharCode(65 + optIdx)}.</span>
                                           <input 
                                              value={opt}
                                              onChange={(e) => handleEditOption(i, optIdx, e.target.value)}
                                              className={`w-full bg-transparent outline-none ${opt === q.correctAnswer ? 'font-bold' : ''}`}
                                              placeholder={`Nhập lựa chọn ${String.fromCharCode(65 + optIdx)}...`}
                                           />
                                       </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   ))}
               </div>

               <button onClick={() => setGeneratedQuestions([])} className="mt-8 text-slate-500 text-sm hover:underline">
                  &larr; Không ưng ý? Làm lại từ đầu
               </button>
           </div>
       )}
    </div>
  )
}
