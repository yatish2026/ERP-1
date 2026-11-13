"use client";

import { useState, useEffect } from "react";
import { getClassesServer } from "@/app/actions/classes";
import { getStudentsServer } from "@/app/actions/students";
import { getClassAttendanceServer } from "@/app/actions/attendance";
import { CheckSquare, Loader2, Filter, Calendar as CalendarIcon, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

export default function PrincipalAttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await getClassesServer();
      if (res.success && res.data) {
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClassId(res.data[0].id);
        }
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchClassData = async () => {
      if (!selectedClassId || !selectedDate) return;
      setFetchingData(true);
      
      const [studentsRes, attendanceRes] = await Promise.all([
        getStudentsServer(selectedClassId),
        getClassAttendanceServer(selectedClassId, selectedDate)
      ]);
      
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (attendanceRes.success) setAttendanceRecords(attendanceRes.data || []);
      
      setFetchingData(false);
    };

    fetchClassData();
  }, [selectedClassId, selectedDate]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  // Extract unique periods for the columns
  const periods = Array.from(new Set(attendanceRecords.map(r => r.periodNumber))).sort((a, b) => a - b);

  const handleDownloadAttendance = () => {
    const headers = ["Roll No", "Admission No", "Student Name", "Class", "Date", ...periods.map(p => `Period ${p}`)];
    const rows = students.map(student => {
      const periodStatuses = periods.map(p => {
        const record = attendanceRecords.find(r => r.studentId === student.uid && r.periodNumber === p);
        return record ? record.status : "N/A";
      });
      return [
        student.rollNumber || "",
        student.admissionNumber || "",
        student.name || "",
        selectedClassId,
        selectedDate,
        ...periodStatuses
      ];
    });

    exportToCsv(`Attendance_${selectedClassId}_${selectedDate}`, headers, rows);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckSquare className="text-blue-500 w-8 h-8" /> 
            Attendance Overview
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            View and export daily attendance logs for any class across all recorded periods.
          </p>
        </div>
        {attendanceRecords.length > 0 && (
          <button
            onClick={handleDownloadAttendance}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export Register CSV
          </button>
        )}
      </header>

      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Select Class
            </label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Select Date
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {fetchingData ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
          {students.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <p className="text-gray-500 text-lg">No students found in this class.</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg px-4">No attendance records found for this date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                    <th className="p-4 font-semibold whitespace-nowrap">Student Name</th>
                    <th className="p-4 font-semibold whitespace-nowrap">Roll No.</th>
                    {periods.map(p => (
                      <th key={p} className="p-4 font-semibold text-center whitespace-nowrap">
                        Period {p}
                        {/* Optionally could show subject name here if uniform, but it might vary slightly per student if electives existed. We'll just show Period X */}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.uid} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-medium text-gray-900 whitespace-nowrap">{student.name}</td>
                      <td className="p-4 text-gray-500 text-sm whitespace-nowrap">{student.rollNumber || "-"}</td>
                      
                      {periods.map(p => {
                        const record = attendanceRecords.find(r => r.studentId === student.uid && r.periodNumber === p);
                        
                        return (
                          <td key={p} className="p-4 text-center">
                            {record ? (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                record.status === 'Present' ? 'bg-green-100 text-green-700' :
                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {record.status === 'Present' ? 'P' : record.status === 'Late' ? 'L' : 'A'}
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
