import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ExamEditor from "./ExamEditor";

export default async function EditExamPage({ params }: { params: Promise<{ examId: string }> }) {
    const { examId } = await params;
    
    const exam = await db.exam.findUnique({
        where: { id: examId },
        include: { questions: true }
    });

    if (!exam) return notFound();

    return <ExamEditor exam={exam} />;
}
