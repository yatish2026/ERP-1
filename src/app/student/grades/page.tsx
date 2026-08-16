"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getStudentMarksServer } from "@/app/actions/marks";
import { FileText, Loader2, Award } from "lucide-react";

export default function StudentGradesPage() {
  const [loading, setLoading] = useState(true);
  const [marks, setMarks] = useState<any[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");

  useEffect(() => {
    const fetchMarks = async (uid: string) => {
      const res = await getStudentMarksServer(uid);
      if (res.success && res.data) {
        setMarks(res.data);
        
        // Extract unique exams
        const uniqueExams = Array.from(new Set(res.data.map((m: any) => m.examName))) as string[];
        setExams(uniqueExams);
        if (uniqueExams.length > 0) {
          setSelectedExam(uniqueExams[0]);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchMarks(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  const currentExamMarks = marks.filter(m => m.examName === selectedExam);

  // Calculate totals for the selected exam
  let totalMarksObtained = 0;
  let totalMaxMarks = 0;
  currentExamMarks.forEach(m => {
    totalMarksObtained += m.marksObtained;
    totalMaxMarks += m.totalMarks;
  });
  
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="text-blue-500 w-8 h-8" /> 
          My Grades & Performance
        </h2>
        <p className="text-gray-600 mt-2">View your academic performance across all examinations.</p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="w-full md:w-1/3">
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

          {currentExamMarks.length > 0 && (
            <div className="flex gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100 w-full md:w-auto justify-between md:justify-start">
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Total Score</p>
                <p className="text-2xl font-black text-gray-900">{totalMarksObtained} <span className="text-sm font-medium text-gray-500">/ {totalMaxMarks}</span></p>
              </div>
              <div className="w-px bg-blue-200"></div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Percentage</p>
                <p className={`text-2xl font-black ${overallPercentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                  {overallPercentage}%
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {marks.length === 0 ? (
          <div className="text-center py-16 bg-gray-50">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No grades have been posted yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 text-sm">
                  <th className="p-4 font-semibold">Subject</th>
                  <th className="p-4 font-semibold text-right">Marks Obtained</th>
                  <th className="p-4 font-semibold text-right">Total Marks</th>
                  <th className="p-4 font-semibold text-center">Score %</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentExamMarks.map((m, idx) => {
                  const percentage = m.totalMarks > 0 ? Math.round((m.marksObtained / m.totalMarks) * 100) : 0;
                  const isPass = percentage >= 40;
                  return (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{m.subjectName}</td>
                      <td className="p-4 text-right font-medium text-gray-900">{m.marksObtained}</td>
                      <td className="p-4 text-right text-gray-500">{m.totalMarks}</td>
                      <td className="p-4 text-center font-bold">
                        {percentage}%
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${isPass ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                          {isPass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
