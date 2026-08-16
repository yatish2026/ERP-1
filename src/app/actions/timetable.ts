"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export type Period = {
  id: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
};

export type DayTimetable = {
  classId: string;
  dayOfWeek: string; // e.g., "Monday"
  periods: Period[];
};

export async function getTimetableServer(classId: string) {
  try {
    const snapshot = await adminDb.collection("timetables").where("classId", "==", classId).get();
    const timetables: Record<string, DayTimetable> = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as DayTimetable;
      timetables[data.dayOfWeek] = data;
    });

    return { success: true, data: timetables };
  } catch (error: any) {
    console.error("Error fetching timetable:", error);
    return { success: false, error: "Failed to fetch timetable." };
  }
}

export async function saveDayTimetableServer(actingUid: string, classId: string, dayOfWeek: string, periods: Period[]) {
  try {
    // 1. Check if the user is the class teacher for this class
    const assignmentDocs = await adminDb.collection("teacher_class_assignments")
      .where("teacherId", "==", actingUid)
      .where("classId", "==", classId)
      .where("isClassTeacher", "==", true)
      .get();
      
    if (assignmentDocs.empty) {
      // Principal fallback check
      const userDoc = await adminDb.collection("users").doc(actingUid).get();
      if (!userDoc.exists || userDoc.data()?.role !== "principal") {
        return { success: false, error: "Unauthorized. Only the Class Teacher or Principal can modify the timetable." };
      }
    }

    const docId = `${classId}_${dayOfWeek}`;
    
    await adminDb.collection("timetables").doc(docId).set({
      classId,
      dayOfWeek,
      periods,
      updatedAt: Date.now(),
      updatedBy: actingUid
    });

    revalidatePath("/teacher/timetable");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving timetable:", error);
    return { success: false, error: "Failed to save timetable." };
  }
}

export async function getTeacherScheduleServer(teacherId: string, dayOfWeek: string) {
  try {
    // This is a bit inefficient for NoSQL, but works for our scale.
    // We fetch all timetables for the given day and filter for the teacher.
    const snapshot = await adminDb.collection("timetables")
      .where("dayOfWeek", "==", dayOfWeek)
      .get();
      
    let schedule: { classId: string; period: Period }[] = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data() as DayTimetable;
      data.periods.forEach(p => {
        if (p.teacherId === teacherId) {
          schedule.push({ classId: data.classId, period: p });
        }
      });
    });

    // Sort by start time
    schedule.sort((a, b) => a.period.startTime.localeCompare(b.period.startTime));

    return { success: true, data: schedule };
  } catch (error: any) {
    console.error("Error fetching teacher schedule:", error);
    return { success: false, error: "Failed to fetch schedule." };
  }
}
