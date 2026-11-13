"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function saveMarksServer(
  actingUid: string, 
  classId: string, 
  subjectName: string, 
  examName: string, 
  totalMarks: number,
  marksMap: Record<string, number>
) {
  try {
    const { data: userDoc } = await supabaseAdmin.from("users").select("role").eq("id", actingUid).maybeSingle();
    if (!userDoc || !["teacher", "class_teacher", "principal"].includes(userDoc.role)) {
      return { success: false, error: "Unauthorized." };
    }

    const rows = Object.entries(marksMap).map(([studentId, marksObtained]) => ({
      id: `${classId}_${subjectName.replace(/\s+/g, '')}_${examName.replace(/\s+/g, '')}_${studentId}`,
      class_id: classId,
      subject_name: subjectName,
      exam_name: examName,
      student_id: studentId,
      marks_obtained: marksObtained,
      total_marks: totalMarks,
      graded_by: actingUid,
      timestamp: Date.now()
    }));

    if (rows.length > 0) {
      const { error: upsertError } = await supabaseAdmin
        .from("marks_records")
        .upsert(rows);
      if (upsertError) throw upsertError;
    }

    revalidatePath("/teacher/marks");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving marks:", error);
    return { success: false, error: "Failed to save marks." };
  }
}

export async function getMarksServer(classId: string, subjectName: string, examName: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("marks_records")
      .select("*")
      .eq("class_id", classId)
      .eq("subject_name", subjectName)
      .eq("exam_name", examName);

    if (error) throw error;
      
    const records: Record<string, number> = {};
    let totalMarks = 100;
    
    (data || []).forEach((row: any) => {
      records[row.student_id] = row.marks_obtained;
      if (row.total_marks) totalMarks = row.total_marks;
    });

    return { success: true, data: { records, totalMarks } };
  } catch (error: any) {
    console.error("Error fetching marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}

export async function getStudentMarksServer(studentId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("marks_records")
      .select("*")
      .eq("student_id", studentId);

    if (error) throw error;

    return { 
      success: true, 
      data: (data || []).map((row: any) => ({
        classId: row.class_id,
        subjectName: row.subject_name,
        examName: row.exam_name,
        studentId: row.student_id,
        marksObtained: row.marks_obtained,
        totalMarks: row.total_marks,
        gradedBy: row.graded_by,
        timestamp: row.timestamp
      }))
    };
  } catch (error: any) {
    console.error("Error fetching student marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}

export async function getClassMarksServer(classId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("marks_records")
      .select("*")
      .eq("class_id", classId);

    if (error) throw error;

    return { 
      success: true, 
      data: (data || []).map((row: any) => ({
        classId: row.class_id,
        subjectName: row.subject_name,
        examName: row.exam_name,
        studentId: row.student_id,
        marksObtained: row.marks_obtained,
        totalMarks: row.total_marks,
        gradedBy: row.graded_by,
        timestamp: row.timestamp
      }))
    };
  } catch (error: any) {
    console.error("Error fetching class marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}
