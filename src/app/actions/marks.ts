"use server";

import { adminDb } from "@/lib/firebase/admin";
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
    const userDoc = await adminDb.collection("users").doc(actingUid).get();
    if (!userDoc.exists || (userDoc.data()?.role !== "teacher" && userDoc.data()?.role !== "class_teacher" && userDoc.data()?.role !== "principal")) {
      return { success: false, error: "Unauthorized." };
    }

    const batch = adminDb.batch();

    for (const [studentId, marksObtained] of Object.entries(marksMap)) {
      const docId = `${classId}_${subjectName.replace(/\s+/g, '')}_${examName.replace(/\s+/g, '')}_${studentId}`;
      const docRef = adminDb.collection("marks_records").doc(docId);
      
      batch.set(docRef, {
        classId,
        subjectName,
        examName,
        studentId,
        marksObtained,
        totalMarks,
        gradedBy: actingUid,
        timestamp: Date.now()
      });
    }

    await batch.commit();

    revalidatePath("/teacher/marks");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving marks:", error);
    return { success: false, error: "Failed to save marks." };
  }
}

export async function getMarksServer(classId: string, subjectName: string, examName: string) {
  try {
    const snapshot = await adminDb.collection("marks_records")
      .where("classId", "==", classId)
      .where("subjectName", "==", subjectName)
      .where("examName", "==", examName)
      .get();
      
    const records: Record<string, number> = {};
    let totalMarks = 100;
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      records[data.studentId] = data.marksObtained;
      if (data.totalMarks) totalMarks = data.totalMarks;
    });

    return { success: true, data: { records, totalMarks } };
  } catch (error: any) {
    console.error("Error fetching marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}

export async function getStudentMarksServer(studentId: string) {
  try {
    const snapshot = await adminDb.collection("marks_records")
      .where("studentId", "==", studentId)
      .get();
      
    const records: any[] = [];
    snapshot.docs.forEach(doc => {
      records.push(doc.data());
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching student marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}

export async function getClassMarksServer(classId: string) {
  try {
    const snapshot = await adminDb.collection("marks_records")
      .where("classId", "==", classId)
      .get();
      
    const records: any[] = [];
    snapshot.docs.forEach(doc => {
      records.push(doc.data());
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching class marks:", error);
    return { success: false, error: "Failed to fetch marks." };
  }
}
