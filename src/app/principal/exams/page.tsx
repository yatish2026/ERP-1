"use client";

import { useState, useEffect } from "react";
import { getClassesServer } from "@/app/actions/classes";
import { getStudentsServer } from "@/app/actions/students";
import { getClassMarksServer } from "@/app/actions/marks";
import { FileText, Loader2, Filter, Award } from "lucide-react";

export default function PrincipalExamsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  
  const [students, setStudents] = useState<any[]>([]);
  const [marksData, setMarksData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  // Derived state
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState("");

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
      if (!selectedClassId) return;
      setFetchingData(true);
      
      const [studentsRes, marksRes] = await Promise.all([
        getStudentsServer(selectedClassId),
        getClassMarksServer(selectedClassId)
      ]);
      
      if (studentsRes.success) setStudents(studentsRes.data || []);
      if (marksRes.success) {
        const marks = marksRes.data || [];
        setMarksData(marks);
        
        // Extract unique exams
        const uniqueExams = Array.from(new Set(marks.map(m => m.examName))) as string[];
        setExams(uniqueExams);
        if (uniqueExams.length > 0 && !uniqueExams.includes(selectedExam)) {
          setSelectedExam(uniqueExams[0]);
        }
      }
      setFetchingData(false);
    };

    fetchClassData();
  }, [selectedClassId]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  // Filter marks by selected exam
  const currentExamMarks = marksData.filter(m => m.examName === selectedExam);
  
  // Extract unique subjects for this exam to build columns
  const subjects = Array.from(new Set(currentExamMarks.map(m => m.subjectName)));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" /> 
          Marks & Exams Overview
        </h2>
        <p className="text-gray-600 mt-2">
          View academic performance across all classes and subjects.
        </p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
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
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4" /> Select Examination
            </label>
            <select 
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
              disabled={exams.length === 0}
            >
              {exams.length === 0 ? (
                <option value="">No exams recorded</option>
              ) : (
                exams.map(e => <option key={e} value={e}>{e}</option>)
              )}
            </select>
          </div>
        </div>
      </div>

      {fetchingData ? (
        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {students.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <p className="text-gray-500 text-lg">No students found in this class.</p>
            </div>
          ) : currentExamMarks.length === 0 ? (
            <div className="text-center py-16 bg-gray-50">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No marks have been recorded for this class yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                    <th className="p-4 font-semibold">Student Name</th>
                    <th className="p-4 font-semibold">Roll No.</th>
                    {subjects.map(sub => (
                      <th key={sub} className="p-4 font-semibold text-center">{sub}</th>
                    ))}
                    <th className="p-4 font-bold text-center border-l border-gray-200 bg-gray-100">Total %</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    let studentTotalMarks = 0;
                    let studentMarksObtained = 0;
                    
                    return (
                      <tr key={student.uid} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                        <td className="p-4 font-medium text-gray-900">{student.name}</td>
                        <td className="p-4 text-gray-500 text-sm">{student.rollNumber || "-"}</td>
                        
                        {subjects.map(sub => {
                          const record = currentExamMarks.find(m => m.studentId === student.uid && m.subjectName === sub);
                          
                          if (record) {
                            studentTotalMarks += record.totalMarks;
                            studentMarksObtained += record.marksObtained;
                          }
                          
                          return (
                            <td key={sub} className="p-4 text-center">
                              {record ? (
                                <span className="font-medium text-gray-900">
                                  {record.marksObtained} <span className="text-xs text-gray-400 font-normal">/ {record.totalMarks}</span>
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                        
                        <td className="p-4 text-center border-l border-gray-100 font-bold">
                          {studentTotalMarks > 0 ? (
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              (studentMarksObtained / studentTotalMarks) * 100 >= 40 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {Math.round((studentMarksObtained / studentTotalMarks) * 100)}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
