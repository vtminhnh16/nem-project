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
   const [score, setScore] = useState(0);
   const [isFinished, setIsFinished] = useState(false);
   const [selectedOption, setSelectedOption] = useState<string | null>(null);
   const [inputValue, setInputValue] = useState("");
   const [mounted, setMounted] = useState(false);

   useEffect(() => setMounted(true), []);

   const questions = exam.questions;
   const currentQ = questions[currentIndex];

   const processAnswer = (opt: string) => {
       if (selectedOption !== null) return; // already answered
       setSelectedOption(opt);
       playClickSound();
       
       // Calculate correctness in background (hide from user)
       const correct = String(opt).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
       if (correct) {
           setScore(prev => prev + 1);
       }

       // Move to next rapidly after selection since we don't show feedback
       setTimeout(() => {
           if (currentIndex < questions.length - 1) {
               setCurrentIndex(prev => prev + 1);
               setSelectedOption(null);
               setInputValue("");
           } else {
               finishExam(score + (correct ? 1 : 0));
           }
       }, 600); // 0.6 second delay
   };

   const handleSelect = (opt: string) => processAnswer(opt);
   const handleFillInSubmit = () => processAnswer(inputValue);

   const finishExam = async (finalScore: number) => {
       setIsFinished(true);
       playWinSound(); // Play celebratory sound
       await saveExamResult(student.id, exam.id, finalScore, questions.length);
   };

   if (!mounted) return null;

   if (isFinished) {
      const isPerfect = score === questions.length;
      return (
          <div className="min-h-screen bg-[#FFFBEB] flex flex-col items-center justify-center p-6 text-center absolute inset-0 z-50">
              {isPerfect && <Confetti width={width} height={height} numberOfPieces={400} recycle={false} />}
              {!isPerfect && <Confetti width={width} height={height} numberOfPieces={100} recycle={false} />}
              <div className="bg-white p-12 rounded-[3xl] shadow-2xl border-b-[12px] border-amber-300 animate-in zoom-in max-w-lg w-full">
                  <div className="text-8xl mb-6">{isPerfect ? '🏆' : '⭐'}</div>
                  <h1 className="text-4xl font-black text-amber-500 mb-2">{isPerfect ? 'Xuất Sắc!' : 'Tuyệt Vời!'}</h1>
                  <p className="text-2xl text-slate-700 font-bold mb-8">Bạn làm đúng <span className="text-emerald-500 text-6xl mx-2 font-black">{score}/{questions.length}</span> câu</p>
                  
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
                   {questions.map((_: any, i: number) => (
                       <div key={i} className={`h-4 rounded-full transition-all duration-300 ${i < currentIndex ? 'bg-indigo-400 w-6 sm:w-8' : i === currentIndex ? 'bg-sky-500 w-8 sm:w-12 shadow-[0_0_10px_rgba(14,165,233,0.5)]' : 'bg-slate-200 w-4 sm:w-6'}`}></div>
                   ))}
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
                           value={inputValue}
                           onChange={(e) => setInputValue(e.target.value)}
                           disabled={selectedOption !== null}
                           placeholder="?"
                           className={`w-full sm:w-64 text-center text-6xl font-black p-6 md:p-8 rounded-[3rem] border-[8px] outline-none transition-all shadow-xl ${
                               selectedOption !== null 
                                 ? 'border-sky-500 bg-sky-100 text-sky-700'
                                 : 'border-sky-300 bg-white text-slate-700 focus:border-sky-500'
                           }`}
                       />
                       <button 
                          onClick={handleFillInSubmit}
                          disabled={selectedOption !== null || !inputValue.trim()}
                          className="w-full sm:w-auto h-32 md:h-36 px-12 rounded-[3rem] bg-indigo-500 hover:bg-indigo-600 active:translate-y-3 border-b-[12px] active:border-b-0 border-indigo-700 text-white font-black text-4xl md:text-5xl transition-all disabled:opacity-50 disabled:active:translate-y-0 disabled:border-b-[12px] flex items-center justify-center cursor-pointer shadow-xl"
                       >
                          GỬI
                       </button>
                   </div>
               ) : (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full md:max-w-[75%] mx-auto">
                       {optionsList.map((opt: string, idx: number) => {
                           let stateClass = "bg-white hover:-translate-y-2 hover:shadow-2xl border-slate-200 border-b-[8px] text-slate-700"; 
                           
                           if (selectedOption !== null) {
                               if (opt === selectedOption) {
                                   stateClass = "bg-sky-400 border-sky-600 text-white translate-y-2 border-b-[2px] opacity-100 shadow-md"; 
                               } else {
                                   stateClass = "bg-white border-slate-200 text-slate-400 opacity-40 translate-y-1 border-b-[4px]";
                               }
                           }

                           return (
                               <button 
                                 key={idx}
                                 disabled={selectedOption !== null}
                                 onClick={() => handleSelect(opt)}
                                 className={`p-6 md:p-8 rounded-[2rem] border-2 text-3xl lg:text-4xl font-black transition-all flex items-center justify-center break-words outline-none relative overflow-hidden ${stateClass} active:translate-y-2 active:border-b-[2px] cursor-pointer`}
                               >
                                  {opt}
                               </button>
                           )
                       })}
                   </div>
               )}
           </div>
       </div>
   )
}
