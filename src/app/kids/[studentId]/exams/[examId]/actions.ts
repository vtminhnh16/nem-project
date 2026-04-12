"use server"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function saveExamResult(studentId: string, examId: string, score: number, totalQuestions: number) {
    await db.result.create({
        data: {
             studentId,
             examId,
             score,
             totalQuestions
        }
    });
    
    // revalidate the parent pages so the stars update
    revalidatePath(`/kids/${studentId}/exams`);
    revalidatePath(`/admin/results`);
}
