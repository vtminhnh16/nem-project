"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteExamAction(examId: string) {
    await db.exam.delete({
        where: { id: examId }
    });
    revalidatePath("/admin/exams");
}
