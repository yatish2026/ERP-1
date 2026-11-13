"use client";

import { useState, useEffect } from "react";
import { getClassesServer, createClassServer } from "@/app/actions/classes";
import { getTeachersServer } from "@/app/actions/users";
import { assignClassTeacherServer } from "@/app/actions/assignments";
import { auth } from "@/lib/supabase/client";
import { GraduationCap, Plus, Users, UserPlus, Loader2 } from "lucide-react";

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Class Form
  const [grade, setGrade] = useState("");
  const [section, setSection] = useState("");
  const [creating, setCreating] = useState(false);

  // Assign Teacher Form
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [classesRes, teachersRes] = await Promise.all([
      getClassesServer(),
      getTeachersServer()
    ]);
    if (classesRes.success) setClasses(classesRes.data || []);
    if (teachersRes.success) setTeachers(teachersRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    const user = auth.currentUser;
    if (!user) return;
    
    const res = await createClassServer(grade, section, user.uid);
    if (res.success) {
      setGrade("");
      setSection("");
      await fetchData();
    } else {
      setError(res.error || "Failed to create class.");
    }
    setCreating(false);
  };

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedTeacher) return;
    setAssigning(true);
    setError("");
    const user = auth.currentUser;
    if (!user) return;

    const res = await assignClassTeacherServer(user.uid, selectedTeacher, selectedClass);
    if (res.success) {
      setSelectedClass("");
      setSelectedTeacher("");
      await fetchData();
    } else {
      setError(res.error || "Failed to assign teacher.");
    }
    setAssigning(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Manage Classes</h2>
        <p className="text-gray-600 mt-2">Create sections and assign Class Teachers.</p>
      </header>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Class Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" /> Create New Class
          </h3>
          <form onSubmit={handleCreateClass} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Grade</label>
                <input 
                  type="text" 
                  value={grade} 
                  onChange={e => setGrade(e.target.value)} 
                  placeholder="e.g., 8" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Section</label>
                <input 
                  type="text" 
                  value={section} 
                  onChange={e => setSection(e.target.value)} 
                  placeholder="e.g., A" 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={creating}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center"
            >
              {creating ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Class"}
            </button>
          </form>
        </div>

        {/* Assign Teacher Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="text-indigo-500" /> Assign Class Teacher
          </h3>
          <form onSubmit={handleAssignTeacher} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Class</label>
              <select 
                value={selectedClass} 
                onChange={e => setSelectedClass(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">-- Choose Class --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Select Teacher</label>
              <select 
                value={selectedTeacher} 
                onChange={e => setSelectedTeacher(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              >
                <option value="">-- Choose Teacher --</option>
                {teachers.map(t => (
                  <option key={t.uid} value={t.uid}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>
            <button 
              type="submit" 
              disabled={assigning}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex justify-center items-center"
            >
              {assigning ? <Loader2 className="animate-spin w-5 h-5" /> : "Assign Class Teacher"}
            </button>
          </form>
        </div>
      </div>

      {/* Class List */}
      <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="text-green-500" /> Existing Classes
        </h3>
        {classes.length === 0 ? (
          <p className="text-gray-500">No classes created yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map(c => (
              <div key={c.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">{c.grade} - {c.section}</h4>
                  <p className="text-sm text-gray-500">ID: {c.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
