"use client";

import { useState } from "react";
import { deleteExamAction } from "./actions";

export default function DeleteExamButton({ examId }: { examId: string }) {
   const [loading, setLoading] = useState(false);

   const handleDelete = async () => {
       if (window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đề thi này không?")) {
           setLoading(true);
           try {
               await deleteExamAction(examId);
           } catch (e) {
               console.error(e);
               setLoading(false);
           }
       }
   };

   return (
       <button 
           onClick={handleDelete}
           disabled={loading}
           title="Xóa đề thi"
           className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
       >
           {loading ? "⌛" : "🗑️"}
       </button>
   );
}
