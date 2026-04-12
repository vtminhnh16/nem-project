import { db } from "@/lib/db";
import { addStudent, deleteStudent } from "./actions";

export default async function StudentsPage() {
  const students = await db.student.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Quản lý Học sinh</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 h-fit">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Thêm học sinh mới</h2>
          <form action={addStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tên của bé</label>
              <input name="name" type="text" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="VD: Gấu, Nem..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lớp mấy?</label>
              <select name="grade" required className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white">
                <option value="1">Lớp 1</option>
                <option value="2">Lớp 2</option>
                <option value="3">Lớp 3</option>
                <option value="4">Lớp 4</option>
                <option value="5">Lớp 5</option>
              </select>
            </div>
            <button type="submit" className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm">
              Thêm học sinh
            </button>
          </form>
        </div>
        {/* List */}
        <div className="lg:col-span-2">
          {students.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center">
              <span className="text-4xl mb-4">👨‍👩‍👧‍👦</span>
              <p className="text-slate-500 font-medium text-lg mb-2">Chưa có học sinh nào</p>
              <p className="text-slate-400 text-sm">Hãy thêm thông tin của bé ở biểu mẫu bên cạnh để bắt đầu.</p>
            </div>
          ) : (
             <div className="space-y-4">
               {students.map(s => (
                 <div key={s.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-2xl border-4 border-indigo-100">
                        {s.name[0]}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{s.name}</h3>
                        <div className="mt-1 inline-block px-3 py-1 bg-slate-100 text-slate-600 font-medium rounded-full text-xs">
                          Lớp {s.grade}
                        </div>
                      </div>
                   </div>
                   <form action={deleteStudent.bind(null, s.id)}>
                     <button type="submit" className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold rounded-xl transition-colors">
                       Xóa
                     </button>
                   </form>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
