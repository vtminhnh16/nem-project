"use server"
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addStudent(formData: FormData) {
  const name = formData.get("name") as string;
  const grade = parseInt(formData.get("grade") as string, 10);
  
  if (!name || !grade) return;
  
  await db.student.create({
    data: { name, grade }
  });
  
  revalidatePath("/admin/students");
  revalidatePath("/");
}

export async function deleteStudent(id: string, formData: FormData) {
  await db.student.delete({ where: { id } });
  revalidatePath("/admin/students");
  revalidatePath("/");
}
