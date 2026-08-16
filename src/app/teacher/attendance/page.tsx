"use client";

import { useState, useEffect, Suspense } from "react";
import { getStudentsServer } from "@/app/actions/students";
import { getAttendanceByPeriodServer, markAttendanceServer } from "@/app/actions/attendance";
import { auth } from "@/lib/firebase/config";
import { Loader2, Save, Users, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function AttendanceManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const classId = searchParams.get("classId");
  const periodStr = searchParams.get("periodNumber");
  const periodNumber = periodStr ? parseInt(periodStr) : 0;
  const subjectName = searchParams.get("subjectName");

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const todayStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const initData = async () => {
      const user = auth.currentUser;
      if (user && classId) {
        // Fetch all students and filter by classId
        const studentsRes = await getStudentsServer();
        if (studentsRes.success) {
          const classStudents = (studentsRes.data || []).filter((s: any) => s.classId === classId);
          setStudents(classStudents);
        }
      }
      setLoading(false);
    };
    
    const timer = setTimeout(() => { initData(); }, 500);
    return () => clearTimeout(timer);
  }, [classId]);

  // Fetch attendance when date changes
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!classId || !periodNumber) return;
      const res = await getAttendanceByPeriodServer(classId, selectedDate, periodNumber);
      if (res.success && res.data) {
        setAttendance(res.data);
      } else {
        setAttendance({});
      }
    };
    fetchAttendance();
  }, [classId, selectedDate, periodNumber]);

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: string) => {
    const newAtt: Record<string, string> = {};
    students.forEach(s => {
      newAtt[s.uid] = status;
    });
    setAttendance(newAtt);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const user = auth.currentUser;
    if (user && classId && periodNumber && subjectName) {
      // Ensure all students are marked
      const missing = students.filter(s => !attendance[s.uid]);
      if (missing.length > 0) {
        setError(`Please mark attendance for all students. Missing: ${missing.length} students.`);
        setSaving(false);
        return;
      }

      const dayOfWeek = searchParams.get("dayOfWeek") || new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long" });

      const res = await markAttendanceServer(user.uid, classId, selectedDate, periodNumber, subjectName, dayOfWeek, attendance);
      if (res.success) {
        setSuccess("Attendance saved successfully!");
        setTimeout(() => {
          setSuccess("");
          router.push("/teacher/dashboard"); // Redirect back to dashboard on success
        }, 2000);
      } else {
        setError(res.error || "Failed to save attendance.");
      }
    } else {
      setError("Missing class, period, or subject information.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  if (!classId || !periodNumber || !subjectName) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200">
          <h2 className="text-xl font-bold mb-2">Invalid Parameters</h2>
          <p>Please launch this page from your Dashboard schedule.</p>
          <Link href="/teacher/dashboard" className="mt-4 inline-flex items-center gap-2 text-blue-600 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-4">
        <Link href="/teacher/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Schedule
        </Link>
      </div>

      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users className="text-blue-500 w-8 h-8" /> 
          Mark Attendance
        </h2>
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-500 font-bold uppercase block mb-1">Class</span>
            <span className="font-bold">{classId}</span>
          </div>
          <div className="bg-indigo-50 text-indigo-800 px-4 py-2 rounded-lg border border-indigo-100">
            <span className="text-xs text-indigo-500 font-bold uppercase block mb-1">Period</span>
            <span className="font-bold">{periodNumber}</span>
          </div>
          <div className="bg-purple-50 text-purple-800 px-4 py-2 rounded-lg border border-purple-100">
            <span className="text-xs text-purple-500 font-bold uppercase block mb-1">Subject</span>
            <span className="font-bold">{subjectName}</span>
          </div>
        </div>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input 
            type="date" 
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 font-medium focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">Select the date for this period's attendance.</p>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => handleMarkAll("Present")} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm transition-colors border border-green-200">Mark All Present</button>
          <button onClick={() => handleMarkAll("Absent")} className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium text-sm transition-colors border border-red-200">Mark All Absent</button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">{success}</div>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {students.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No students found in this class.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 w-24">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const status = attendance[s.uid];
                return (
                  <tr key={s.uid} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="p-4 text-gray-500 font-medium">{s.rollNumber || "-"}</td>
                    <td className="p-4 font-bold text-gray-900">{s.name}</td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleStatusChange(s.uid, "Present")}
                          className={`flex flex-col items-center p-2 rounded-lg border w-24 transition-colors ${
                            status === "Present" ? "bg-green-100 border-green-500 text-green-800" : "bg-white border-gray-200 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          }`}
                        >
                          <CheckCircle className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">Present</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(s.uid, "Absent")}
                          className={`flex flex-col items-center p-2 rounded-lg border w-24 transition-colors ${
                            status === "Absent" ? "bg-red-100 border-red-500 text-red-800" : "bg-white border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <XCircle className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">Absent</span>
                        </button>
                        
                        <button
                          onClick={() => handleStatusChange(s.uid, "Late")}
                          className={`flex flex-col items-center p-2 rounded-lg border w-24 transition-colors ${
                            status === "Late" ? "bg-yellow-100 border-yellow-500 text-yellow-800" : "bg-white border-gray-200 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                          }`}
                        >
                          <Clock className="w-5 h-5 mb-1" />
                          <span className="text-xs font-bold">Late</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        {students.length > 0 && (
          <div className="p-4 bg-gray-50 border-t flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttendanceManagerPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>}>
      <AttendanceManager />
    </Suspense>
  );
}
