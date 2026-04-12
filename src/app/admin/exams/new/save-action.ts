"use server"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveExamAction(title: string, subject: string, forGrade: number, questions: any[]) {
    const newExam = await db.exam.create({
        data: {
             title,
             subject,
             forGrade,
             questions: {
                 create: questions.map(q => ({
                     type: q.type === 'FILL_IN' ? 'FILL_IN' : 'MULTIPLE_CHOICE',
                     questionText: q.questionText,
                     imageUrl: q.imageUrl || null,
                     options: JSON.stringify(q.options),
                     correctAnswer: q.correctAnswer
                 }))
             }
        }
    });

    revalidatePath("/admin/exams");
    revalidatePath("/");
    return newExam.id;
}
