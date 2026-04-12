"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateExamAction(examId: string, title: string, questions: any[]) {
    // Xóa câu hỏi cơ sở cũ
    await db.question.deleteMany({
        where: { examId }
    });

    // Cập nhật tên đề và nhét danh sách câu trả lời ghi đè mới
    await db.exam.update({
        where: { id: examId },
        data: {
            title,
            questions: {
                create: questions.map(q => ({
                    type: q.type === 'FILL_IN' ? 'FILL_IN' : 'MULTIPLE_CHOICE',
                    questionText: q.questionText,
                    imageUrl: q.imageUrl || null,
                    options: q.options ? (typeof q.options === 'string' ? q.options : JSON.stringify(q.options)) : null,
                    correctAnswer: q.correctAnswer
                }))
            }
        }
    });

    revalidatePath("/admin/exams");
}
