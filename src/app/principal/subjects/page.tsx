"use client";

import { useState, useEffect } from "react";
import { getClassesServer } from "@/app/actions/classes";
import { createSubjectServer, getSubjectsServer, deleteSubjectServer, Subject } from "@/app/actions/subjects";
import { BookOpen, Plus, Loader2, Trash2 } from "lucide-react";

export default function SubjectsPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [className, setClassName] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [classesRes, subjectsRes] = await Promise.all([
      getClassesServer(),
      getSubjectsServer()
    ]);
    if (classesRes.success) setClasses(classesRes.data || []);
    if (subjectsRes.success) setSubjects(subjectsRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");

    if (!className || !subjectName) {
      setError("Please fill out all fields.");
      setCreating(false);
      return;
    }

    const res = await createSubjectServer(subjectName, className);
    if (res.success) {
      setSubjectName("");
      await fetchData();
    } else {
      setError(res.error || "Failed to create subject.");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    setDeletingId(id);
    const res = await deleteSubjectServer(id);
    if (res.success) {
      await fetchData();
    }
    setDeletingId("");
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-indigo-500 w-8 h-8" /> 
          Manage Subjects
        </h2>
        <p className="text-gray-600 mt-2">
          Create and assign subjects to specific classes.
        </p>
      </header>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Subject Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="text-blue-500 w-5 h-5" /> Add New Subject
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Class *</label>
                <select 
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                <input 
                  type="text" 
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={creating}
                className="w-full bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 font-medium flex justify-center items-center gap-2 transition-colors mt-6 shadow-sm"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
                {creating ? "Adding..." : "Add Subject"}
              </button>
            </form>
          </div>
        </div>

        {/* Subjects List grouped by Class */}
        <div className="lg:col-span-2">
          {classes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500">No classes exist yet. Please create classes first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {classes.map(c => {
                const classSubjects = subjects.filter(s => s.classId === c.id);
                return (
                  <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                      <h4 className="font-bold text-gray-900 text-lg">Class {c.grade}-{c.section}</h4>
                    </div>
                    <div className="p-6">
                      {classSubjects.length === 0 ? (
                        <p className="text-gray-400 text-sm italic">No subjects added to this class yet.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {classSubjects.map(sub => (
                            <div key={sub.id} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all group">
                              <span className="font-medium text-gray-800">{sub.name}</span>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                disabled={deletingId === sub.id}
                                className="text-gray-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              >
                                {deletingId === sub.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
