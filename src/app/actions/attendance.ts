"use server";

import { adminDb } from "@/lib/firebase/admin";
import { revalidatePath } from "next/cache";

export async function markAttendanceServer(
  actingUid: string, 
  classId: string, 
  date: string, 
  periodNumber: number,
  subjectName: string,
  dayOfWeek: string,
  attendanceMap: Record<string, string>
) {
  try {
    // 1. Verify that the actingUid is assigned to this period in the timetable for this day
    const timetableDoc = await adminDb.collection("timetables").doc(`${classId}_${dayOfWeek}`).get();
    
    let isAuthorized = false;
    
    if (timetableDoc.exists) {
      const data = timetableDoc.data();
      const period = data?.periods?.find((p: any) => p.periodNumber === periodNumber);
      if (period && period.teacherId === actingUid) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      // Principal fallback check
      const userDoc = await adminDb.collection("users").doc(actingUid).get();
      if (!userDoc.exists || userDoc.data()?.role !== "principal") {
        return { success: false, error: "Unauthorized. You are not assigned to this period." };
      }
    }

    const batch = adminDb.batch();

    for (const [studentId, status] of Object.entries(attendanceMap)) {
      const docId = `${classId}_${date}_p${periodNumber}_${studentId}`;
      const docRef = adminDb.collection("attendance_records").doc(docId);
      batch.set(docRef, {
        classId,
        date,
        periodNumber,
        subjectName,
        studentId,
        status,
        markedBy: actingUid,
        timestamp: Date.now()
      });
    }

    await batch.commit();

    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error marking attendance:", error);
    return { success: false, error: "Failed to mark attendance." };
  }
}

export async function getSchoolAttendanceStatsServer() {
  // For the dashboard metric, in a real large-scale app we would run a scheduled Cloud Function
  // to aggregate this nightly. For now, we return a mock high-level metric.
  return { success: true, percentage: 94 };
}


export async function getAttendanceByPeriodServer(classId: string, date: string, periodNumber: number) {
  try {
    const snapshot = await adminDb.collection("attendance_records")
      .where("classId", "==", classId)
      .where("date", "==", date)
      .where("periodNumber", "==", periodNumber)
      .get();
      
    const records: Record<string, string> = {};
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      records[data.studentId] = data.status;
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return { success: false, error: "Failed to fetch attendance." };
  }
}

export async function getClassAttendanceServer(classId: string, date: string) {
  try {
    const snapshot = await adminDb.collection("attendance_records")
      .where("classId", "==", classId)
      .where("date", "==", date)
      .get();
      
    const records: any[] = [];
    snapshot.docs.forEach(doc => {
      records.push(doc.data());
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching class attendance:", error);
    return { success: false, error: "Failed to fetch class attendance." };
  }
}

export async function getStudentDetailedAttendanceServer(studentId: string) {
  try {
    const snapshot = await adminDb.collection("attendance_records")
      .where("studentId", "==", studentId)
      .orderBy("timestamp", "desc")
      .get();
      
    const records: any[] = [];
    snapshot.docs.forEach(doc => {
      records.push(doc.data());
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error fetching detailed attendance:", error);
    return { success: false, error: "Failed to fetch detailed attendance." };
  }
}

export async function getStudentAttendanceStatsServer(studentId: string) {
  try {
    const snapshot = await adminDb.collection("attendance_records")
      .where("studentId", "==", studentId)
      .get();
      
    let totalPeriods = 0;
    let presentPeriods = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      totalPeriods++;
      if (data.status === "Present" || data.status === "Late") {
        presentPeriods++;
      }
    });

    if (totalPeriods === 0) return { success: true, percentage: "N/A", total: totalPeriods, present: presentPeriods };

    const percentage = Math.round((presentPeriods / totalPeriods) * 100).toString();
    return { success: true, percentage, total: totalPeriods, present: presentPeriods };
  } catch (error: any) {
    console.error("Error fetching student attendance stats:", error);
    return { success: false, error: "Failed to fetch stats." };
  }
}

export async function getOverallDailyAttendanceServer(date: string) {
  try {
    const snapshot = await adminDb.collection("attendance_records")
      .where("date", "==", date)
      .get();
      
    let total = 0;
    let present = 0;
    snapshot.docs.forEach(doc => {
      const status = doc.data().status;
      total++;
      if (status === "Present" || status === "Late") present++;
    });

    if (total === 0) return { success: true, percentage: "N/A" };
    return { success: true, percentage: Math.round((present / total) * 100) + "%" };
  } catch (error: any) {
    console.error("Error fetching daily attendance:", error);
    return { success: false, error: "Failed to fetch daily attendance." };
  }
}
