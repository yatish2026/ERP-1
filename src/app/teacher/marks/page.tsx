"use client";

import { useState, useEffect } from "react";
import { getClassesServer } from "@/app/actions/classes";
import { getStudentsServer } from "@/app/actions/students";
import { getMarksServer, saveMarksServer } from "@/app/actions/marks";
import { getTeacherProfileServer } from "@/app/actions/users";
import { getSubjectsServer, Subject } from "@/app/actions/subjects";
import { auth } from "@/lib/firebase/config";
import { Loader2, Save, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function MarksManagerPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeClass, setActiveClass] = useState<any>(null);
  
  // Form State
  const [examName, setExamName] = useState("");
  const [totalMarks, setTotalMarks] = useState(100);
  const [marks, setMarks] = useState<Record<string, number>>({});
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const initData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const [classesRes, subjectsRes, profileRes] = await Promise.all([
        getClassesServer(),
        getSubjectsServer(),
        getTeacherProfileServer(user.uid)
      ]);
      
      if (classesRes.success) setClasses(classesRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (profileRes.success) setTeacherProfile(profileRes.data);
      
      setLoading(false);
    };
    
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) initData();
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch students and existing marks when active subject/exam changes
  useEffect(() => {
    const fetchStudentsAndMarks = async () => {
      if (!activeSubject || !activeClass) {
        setStudents([]);
        return;
      }
      
      const studentsRes = await getStudentsServer();
      if (studentsRes.success) {
        const classStudents = (studentsRes.data || []).filter((s: any) => s.classId === activeClass.id);
        setStudents(classStudents);
      }

      if (examName) {
        const marksRes = await getMarksServer(activeClass.id, activeSubject.name, examName);
        if (marksRes.success && marksRes.data) {
          setMarks(marksRes.data.records);
          setTotalMarks(marksRes.data.totalMarks || 100);
        } else {
          setMarks({});
        }
      }
    };
    
    // Slight debounce for exam typing
    const timer = setTimeout(() => {
      fetchStudentsAndMarks();
    }, 500);
    return () => clearTimeout(timer);
  }, [activeSubject, activeClass, examName]);

  const handleSubjectClick = (sub: Subject) => {
    const cls = classes.find(c => c.id === sub.classId);
    setActiveSubject(sub);
    setActiveClass(cls);
    setExamName("");
    setMarks({});
    setError("");
    setSuccess("");
  };

  const handleMarkChange = (studentId: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num)) {
      setMarks(prev => ({ ...prev, [studentId]: num }));
    } else if (value === "") {
      const newMarks = { ...marks };
      delete newMarks[studentId];
      setMarks(newMarks);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const user = auth.currentUser;
    if (user && activeClass && activeSubject && examName) {
      const res = await saveMarksServer(user.uid, activeClass.id, activeSubject.name, examName, totalMarks, marks);
      if (res.success) {
        setSuccess("Marks saved successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(res.error || "Failed to save marks.");
      }
    } else {
      setError("Please specify an Exam Name.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  // Find assigned subjects objects
  const assignedSubjectIds = teacherProfile?.assignedSubjects || [];
  const teacherSubjects = subjects.filter(s => assignedSubjectIds.includes(s.id));

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="text-blue-500 w-8 h-8" /> 
            Enter Marks & Grades
          </h2>
          <p className="text-gray-600 mt-2">
            Select a subject you teach to enter examination marks.
          </p>
        </div>
      </header>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</div>}

      {!activeSubject ? (
        // Grid of assigned subjects
        <div>
          {teacherSubjects.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg font-medium">No Subjects Assigned</p>
              <p className="text-gray-400 mt-1">You have not been assigned any subjects yet. Please contact the Principal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherSubjects.map(sub => {
                const cls = classes.find(c => c.id === sub.classId);
                return (
                  <button 
                    key={sub.id} 
                    onClick={() => handleSubjectClick(sub)}
                    className="flex flex-col text-left p-6 bg-white border border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{sub.name}</h3>
                    <p className="text-gray-500 font-medium">Class: {cls ? `${cls.grade}-${cls.section}` : sub.classId}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Marks Entry Interface
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-6">
            <button 
              onClick={() => setActiveSubject(null)} 
              className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Subjects
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{activeSubject.name}</h3>
                <p className="text-gray-500 font-medium text-lg">Class: {activeClass ? `${activeClass.grade}-${activeClass.section}` : activeSubject.classId}</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Midterms"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-medium min-w-[200px] focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Max Marks</label>
                  <input 
                    type="number" 
                    value={totalMarks === 0 ? "" : totalMarks}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setTotalMarks(isNaN(val) ? 0 : val);
                    }}
                    className="w-full border border-gray-300 rounded-lg p-2.5 font-medium w-32 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {examName ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {students.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No students found in this class.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                      <th className="p-4 w-32">Roll No</th>
                      <th className="p-4">Student Name</th>
                      <th className="p-4 text-right">Marks Obtained (out of {totalMarks})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      return (
                        <tr key={s.uid} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 text-gray-500 font-medium">{s.rollNumber || "-"}</td>
                          <td className="p-4 font-bold text-gray-900">{s.name}</td>
                          <td className="p-4 text-right">
                            <input 
                              type="number" 
                              max={totalMarks}
                              min={0}
                              value={marks[s.uid] !== undefined ? marks[s.uid] : ""}
                              onChange={(e) => handleMarkChange(s.uid, e.target.value)}
                              className="border border-gray-300 rounded-lg p-2 text-right w-24 font-bold focus:outline-none focus:border-blue-500"
                              placeholder="0"
                            />
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
                    disabled={saving || !examName}
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saving ? "Saving..." : "Save Marks"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 text-center">
              <p className="text-blue-800 font-medium">Please enter an Exam Name to begin entering marks.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
