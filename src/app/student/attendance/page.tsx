"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/supabase/client";
import { getStudentDetailedAttendanceServer, getStudentAttendanceStatsServer } from "@/app/actions/attendance";
import { CheckSquare, Loader2, CheckCircle, XCircle, Clock, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

export default function StudentAttendancePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<any[]>([]);
  const [stats, setStats] = useState({ percentage: "0%", total: 0, present: 0 });

  useEffect(() => {
    const fetchData = async (uid: string) => {
      const [statsRes, detailsRes] = await Promise.all([
        getStudentAttendanceStatsServer(uid),
        getStudentDetailedAttendanceServer(uid)
      ]);

      if (statsRes.success) {
        setStats({ 
          percentage: statsRes.percentage || "0%", 
          total: statsRes.total || 0, 
          present: statsRes.present || 0 
        });
      }

      if (detailsRes.success && detailsRes.data) {
        setRecords(detailsRes.data);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchData(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  const handleDownloadLog = () => {
    const headers = ["Date", "Period #", "Subject Name", "Status", "Class"];
    const rows = records.map(r => [
      r.date || "",
      r.periodNumber || "",
      r.subjectName || "",
      r.status || "",
      r.classId || ""
    ]);

    exportToCsv("My_Attendance_Report", headers, rows);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckSquare className="text-blue-500 w-8 h-8" /> 
            My Attendance Record
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">View and export your overall attendance percentage and detailed daily logs.</p>
        </div>
        {records.length > 0 && (
          <button
            onClick={handleDownloadLog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export Attendance CSV
          </button>
        )}
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-4 rounded-xl text-blue-600">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Overall Attendance</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.percentage}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-4 rounded-xl text-green-600">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Periods Present</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.present} <span className="text-sm text-gray-500 font-normal">/ {stats.total}</span></h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-red-100 p-4 rounded-xl text-red-600">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Periods Absent</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.total - stats.present}</h3>
          </div>
        </div>
      </div>

      {/* Detailed Log Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">Detailed Timeline</h3>
        </div>
        
        {records.length === 0 ? (
          <div className="text-center py-12 bg-gray-50">
            <p className="text-gray-500">No attendance records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Period</th>
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="p-4 text-gray-600">Period {r.periodNumber}</td>
                    <td className="p-4 font-medium text-gray-900">{r.subjectName}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        r.status === 'Present' ? 'bg-green-100 text-green-700' :
                        r.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
