"use client";
import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { saveExamResult } from './actions';
import Link from 'next/link';

// Helper to play a generic "bloop/click" sound when an answer is selected
const playClickSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } catch (e) {}
};

// Helper to play a tiny "Ta-da!" sound at the very end
const playWinSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const playTone = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.3, startTime);
            gain.gain.linearRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        const now = ctx.currentTime;
        playTone(440, now, 0.15); // A4
        playTone(554.37, now + 0.15, 0.15); // C#5
        playTone(659.25, now + 0.3, 0.4); // E5
    } catch (e) {}
};

export default function ExamRunner({ exam, student }: any) {
   const { width, height } = useWindowSize();
   const [currentIndex, setCurrentIndex] = useState(0);
   const [answers, setAnswers] = useState<Record<number, string>>({});
   const [finalScoreState, setFinalScoreState] = useState(0);
   const [isFinished, setIsFinished] = useState(false);
   const [mounted, setMounted] = useState(false);

   useEffect(() => setMounted(true), []);

   const questions = exam.questions;
   const currentQ = questions[currentIndex];

   const handleSelect = (opt: string) => {
       playClickSound();
       setAnswers(prev => ({...prev, [currentIndex]: opt}));
       
       // Optionally auto-advance after short delay to save clicks
       setTimeout(() => {
           if (currentIndex < questions.length - 1) {
               setCurrentIndex(prev => prev + 1);
           }
       }, 400);
   };

   const finishExam = async () => {
       setIsFinished(true);
       playWinSound(); // Play celebratory sound
       
       let finalScore = 0;
       questions.forEach((q: any, i: number) => {
           const userAns = answers[i] || "";
           const correctAns = String(q.correctAnswer).trim().toLowerCase();
           if (String(userAns).trim().toLowerCase() === correctAns) {
               finalScore++;
           }
       });
       setFinalScoreState(finalScore);

       await saveExamResult(student.id, exam.id, finalScore, questions.length, JSON.stringify(answers));
   };

   if (!mounted) return null;

   if (isFinished) {
      const isPerfect = finalScoreState === questions.length;
      return (
          <div className="min-h-screen bg-[#FFFBEB] flex flex-col items-center py-12 px-4 text-center absolute inset-0 z-50 overflow-y-auto">
              {isPerfect && <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />}
              {!isPerfect && <Confetti width={width} height={height} numberOfPieces={100} recycle={false} />}
              <div className="bg-white p-6 md:p-10 rounded-[3xl] shadow-2xl border-b-[12px] border-amber-300 animate-in zoom-in max-w-2xl w-full my-auto">
                  <div className="text-8xl mb-6">{isPerfect ? '🏆' : '⭐'}</div>
                  <h1 className="text-4xl font-black text-amber-500 mb-2">{isPerfect ? 'Xuất Sắc!' : 'Tuyệt Vời!'}</h1>
                  <p className="text-2xl text-slate-700 font-bold mb-8">Bạn làm đúng <span className="text-emerald-500 text-6xl mx-2 font-black">{finalScoreState}/{questions.length}</span> câu</p>
                  
                  <div className="mt-8 mb-10 text-left space-y-4">
                      {questions.map((q: any, i: number) => {
                          const userAns = answers[i] || "";
                          const correctAns = String(q.correctAnswer).trim().toLowerCase();
                          const isCorrect = String(userAns).trim().toLowerCase() === correctAns;

                          return (
                              <div key={i} className={`p-5 rounded-2xl border-[3px] ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                                  <h3 className="font-bold text-slate-800 mb-3 text-lg leading-snug">
                                      <span className="mr-2 opacity-60">Câu {i + 1}:</span> 
                                      {q.questionText}
                                  </h3>
                                  {q.imageUrl && <img src={q.imageUrl} alt="minh hoạ" className="max-h-32 mb-4 rounded-xl shadow-sm border border-slate-200" />}
                                  
                                  <div className="flex flex-col sm:flex-row gap-3">
                                      <div className={`flex-1 px-4 py-3 rounded-xl border-2 ${isCorrect ? 'bg-emerald-100/50 border-emerald-300 text-emerald-800' : 'bg-red-100/50 border-red-300 text-red-800'}`}>
                                          <div className="font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Bạn chọn</div> 
                                          <div className="text-lg font-black break-words">{userAns || "(Bỏ trống)"}</div>
                                      </div>
                                      {!isCorrect && (
                                          <div className="flex-1 px-4 py-3 rounded-xl border-2 bg-emerald-100/50 border-emerald-300 text-emerald-800">
                                              <div className="font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Đáp án đúng</div> 
                                              <div className="text-lg font-black break-words">{q.correctAnswer}</div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          );
                      })}
                  </div>

                  <Link href={`/kids/${student.id}/exams`} className="px-8 py-5 bg-gradient-to-b from-amber-400 to-amber-500 hover:to-amber-400 text-amber-950 font-black text-2xl rounded-2xl block w-full shadow-lg border-b-[6px] border-amber-600 active:border-b-0 active:translate-y-2 transition-all">
                      Thoát! 🎮
                  </Link>
              </div>
          </div>
      )
   }

   const optionsList = currentQ?.options ? JSON.parse(currentQ.options) : [];
   const isFillIn = currentQ?.type === 'FILL_IN' || optionsList.length === 0;

   return (
       <div className="min-h-screen bg-sky-100/50 flex flex-col items-center px-4 py-8 md:p-10 font-sans relative overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
           {/* Top bar */}
           <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-white py-3 px-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-2 border-slate-100 z-10 shrink-0">
               <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-sky-100 text-2xl rounded-full flex items-center justify-center shadow-inner">
                       {student.avatarUrl ? <img src={student.avatarUrl} className="rounded-full" /> : '🐵'}
                   </div>
                   <div className="font-extrabold text-slate-700 text-xl hidden sm:block">{student.name}</div>
               </div>
               <div className="flex gap-1 bg-slate-50 p-2 rounded-full border border-slate-100 overflow-hidden">
                   {questions.map((_: any, i: number) => {
                       const isAnswered = answers[i] !== undefined && answers[i].trim() !== "";
                       let bgClass = "bg-slate-200 w-4 sm:w-6";
                       if (i === currentIndex) bgClass = "bg-sky-500 w-8 sm:w-12 shadow-[0_0_10px_rgba(14,165,233,0.5)]";
                       else if (isAnswered) bgClass = "bg-indigo-400 w-6 sm:w-8";
                       
                       return (
                           <div key={i} className={`h-4 rounded-full transition-all duration-300 ${bgClass}`}></div>
                       );
                   })}
               </div>
               <div className="font-black text-sky-700 bg-sky-100 border-2 border-sky-200 px-5 py-2.5 rounded-full text-lg">
                  {currentIndex + 1} / {questions.length}
               </div>
           </div>

           {/* Main board */}
           <div className="w-full max-w-5xl flex-1 flex flex-col justify-start items-center pb-20 z-10 py-2 md:py-4">
               {/* 100% width, 75vh max height clamp */}
               <div key={`q-${currentIndex}`} className="bg-white rounded-[2rem] p-6 md:p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-b-[10px] border-r-[6px] border-sky-200 text-center mb-8 w-full max-h-[75vh] overflow-y-auto animate-in slide-in-from-right-10 duration-300 relative flex flex-col items-center">
                   
                   {/* Shrink font size appropriately */}
                   <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-800 leading-[1.5] drop-shadow-sm w-full mx-auto">
                       {currentQ.questionText}
                   </h2>
                   
                   {currentQ.imageUrl && (
                       <div className="mt-6 mx-auto inline-block p-1 bg-slate-50 border-[3px] border-slate-100 rounded-[1.5rem] shadow-sm max-w-[90%] shrink-0">
                           <img src={currentQ.imageUrl} alt="minh họa toán học" className="max-h-[15vh] md:max-h-[25vh] w-auto max-w-full object-contain rounded-xl" />
                       </div>
                   )}
               </div>

               {isFillIn ? (
                   <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full max-w-2xl mx-auto">
                       <input 
                           type="text"
                           inputMode="decimal"
                           value={answers[currentIndex] || ""}
                           onChange={(e) => setAnswers(prev => ({...prev, [currentIndex]: e.target.value}))}
                           placeholder="?"
                           className={`w-full sm:w-64 text-center text-6xl font-black p-6 md:p-8 rounded-[3rem] border-[8px] outline-none transition-all shadow-xl border-sky-300 bg-white text-slate-700 focus:border-sky-500`}
                       />
                   </div>
               ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:max-w-[75%] mx-auto">
                       {optionsList.map((opt: string, idx: number) => {
                           const isSelected = answers[currentIndex] === opt;
                           const stateClass = isSelected 
                               ? "bg-sky-400 border-sky-600 text-white translate-y-2 border-b-[2px] opacity-100 shadow-md" 
                               : "bg-white hover:-translate-y-2 hover:shadow-2xl border-slate-200 border-b-[8px] text-slate-700"; 
                           
                           return (
                               <button 
                                 key={idx}
                                 onClick={() => handleSelect(opt)}
                                 className={`p-6 md:p-8 rounded-[2rem] border-2 text-3xl lg:text-4xl font-black transition-all flex items-center justify-center break-words outline-none relative overflow-hidden ${stateClass} active:translate-y-2 active:border-b-[2px] cursor-pointer`}
                               >
                                  {opt}
                               </button>
                           )
                       })}
                   </div>
               )}

               {/* Navigation Buttons */}
               <div className="w-full max-w-4xl flex justify-between items-center mt-12 px-2 sm:px-6">
                   <button 
                       onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                       disabled={currentIndex === 0}
                       className="px-6 sm:px-8 py-4 rounded-3xl font-bold text-xl bg-white text-sky-600 border-b-[6px] border-sky-200 shadow-sm active:translate-y-1 active:border-b-0 disabled:opacity-50 transition-all flex items-center gap-2"
                   >
                       ← Quay lại
                   </button>
                   
                   {currentIndex === questions.length - 1 ? (
                       <button 
                           onClick={() => finishExam()}
                           className="px-8 sm:px-10 py-4 rounded-3xl font-black text-xl bg-emerald-500 hover:bg-emerald-600 text-white border-b-[8px] border-emerald-700 shadow-lg active:translate-y-2 active:border-b-0 transition-all flex items-center gap-2"
                       >
                           Nộp bài 🏆
                       </button>
                   ) : (
                       <button 
                           onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                           className="px-8 sm:px-10 py-4 rounded-3xl font-bold text-xl bg-sky-500 hover:bg-sky-600 text-white border-b-[8px] border-sky-700 shadow-lg active:translate-y-2 active:border-b-0 transition-all flex items-center gap-2"
                       >
                           Tiếp →
                       </button>
                   )}
               </div>
           </div>
       </div>
   )
}
