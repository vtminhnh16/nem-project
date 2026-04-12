import { db } from "@/lib/db";
import ExamRunner from "./ExamRunner";

export default async function ExamPage({ params }: { params: Promise<{ studentId: string, examId: string }> }) {
    const { studentId, examId } = await params;
    const student = await db.student.findUnique({ where: { id: studentId } });
    const exam = await db.exam.findUnique({ 
        where: { id: examId },
        include: {
            questions: true
        }
    });

    if (!student || !exam) return <div className="p-20 text-center text-4xl font-bold">Không tìm thấy 🙈</div>;

    if (exam.questions.length === 0) return <div className="p-20 text-center text-4xl font-bold">Đề này chưa có câu hỏi nào 🙈</div>;

    return <ExamRunner student={student} exam={exam} />
}
