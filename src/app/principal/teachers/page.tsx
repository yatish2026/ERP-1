"use client";

import { useState, useEffect } from "react";
import { getTeachersServer, createTeacherServer, deleteUserServer, updateUserServer } from "@/app/actions/users";
import { getSubjectsServer, Subject } from "@/app/actions/subjects";
import { getClassesServer } from "@/app/actions/classes";
import { auth } from "@/lib/supabase/client";
import { UserPlus, Users, Loader2, Trash2, Edit2, X, Save, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAssignedSubjects, setEditAssignedSubjects] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [assignedSubjects, setAssignedSubjects] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [teachersRes, subjectsRes, classesRes] = await Promise.all([
      getTeachersServer(),
      getSubjectsServer(),
      getClassesServer()
    ]);
    if (teachersRes.success) setTeachers(teachersRes.data || []);
    if (subjectsRes.success) setSubjects(subjectsRes.data || []);
    if (classesRes.success) setClasses(classesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setGeneratedPassword("");
    const user = auth.currentUser;
    if (!user) return;
    
    const res = await createTeacherServer(user.uid, { name, email, assignedSubjects });
    if (res.success) {
      setName("");
      setEmail("");
      setAssignedSubjects([]);
      setGeneratedPassword(res.password || "");
      await fetchData();
    } else {
      setError(res.error || "Failed to create teacher.");
    }
    setCreating(false);
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm("Are you sure you want to permanently delete this teacher?")) return;
    
    setDeletingId(teacherId);
    setError("");
    const user = auth.currentUser;
    if (user) {
      const res = await deleteUserServer(user.uid, teacherId, "teacher");
      if (res.success) {
        await fetchData();
      } else {
        setError(res.error || "Failed to delete teacher.");
      }
    }
    setDeletingId("");
  };

  const handleEditClick = (t: any) => {
    setEditingId(t.uid);
    setEditName(t.name);
    setEditEmail(t.email);
    setEditAssignedSubjects(t.assignedSubjects || []);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    setError("");
    const user = auth.currentUser;
    if (user) {
      const res = await updateUserServer(user.uid, editingId, "teacher", { 
        name: editName, 
        email: editEmail,
        assignedSubjects: editAssignedSubjects 
      });
      if (res.success) {
        setEditingId("");
        await fetchData();
      } else {
        setError(res.error || "Failed to update teacher.");
      }
    }
    setSavingEdit(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;
  }

  const handleDownloadTeachers = () => {
    const headers = ["Faculty Name", "Email Address", "Role / Designation", "Assigned Class", "Assigned Subjects"];
    const rows = teachers.map(t => {
      const assignedSubNames = (t.assignedSubjects || [])
        .map((subId: string) => {
          const sub = subjects.find(s => s.id === subId);
          return sub ? sub.name : subId;
        })
        .join("; ");

      return [
        t.name || "",
        t.email || "",
        t.role === 'class_teacher' ? 'Class Teacher' : 'Subject Professor',
        t.classId || "N/A",
        assignedSubNames || "None"
      ];
    });
    exportToCsv("Faculty_Directory", headers, rows);
  };

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Manage Faculty & Teachers</h2>
          <p className="text-gray-600 mt-2">Create, view, and export all faculty members and teachers in the college.</p>
        </div>
        <button
          onClick={handleDownloadTeachers}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV ({teachers.length})
        </button>
      </header>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {generatedPassword && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-bold text-lg">Teacher Created Successfully!</h3>
          <p className="text-green-700 mt-1">Please provide the following temporary password to the teacher so they can log in:</p>
          <div className="mt-2 p-3 bg-white rounded border border-green-300 font-mono text-xl text-center text-gray-900 shadow-sm">
            {generatedPassword}
          </div>
        </div>
      )}

      {/* Create Teacher Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-xl mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="text-blue-500" /> Register New Faculty Member
        </h3>
        <form onSubmit={handleCreateTeacher} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Dr. Rajesh Sharma" 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (for login)</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="professor@college.edu" 
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Subjects (Optional)</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50">
              {subjects.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">No subjects available. Please create subjects first.</p>
              ) : (
                subjects.map(sub => {
                  const cls = classes.find(c => c.id === sub.classId);
                  return (
                    <label key={sub.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={assignedSubjects.includes(sub.id)}
                        onChange={(e) => {
                          if (e.target.checked) setAssignedSubjects(prev => [...prev, sub.id]);
                          else setAssignedSubjects(prev => prev.filter(id => id !== sub.id));
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                      <span className="text-xs text-gray-500">({cls ? `${cls.grade}-${cls.section}` : sub.classId})</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          <button 
            type="submit" 
            disabled={creating}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center"
          >
            {creating ? <Loader2 className="animate-spin w-5 h-5" /> : "Create Teacher Account"}
          </button>
        </form>
      </div>

      {/* Teacher List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="text-green-500" /> All Teachers
        </h3>
        {teachers.length === 0 ? (
          <p className="text-gray-500">No teachers found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map(t => (
              <div key={t.uid} className="p-4 border border-gray-200 rounded-lg group">
                {editingId === t.uid ? (
                  <div className="space-y-3">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded p-1 text-sm" />
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full border rounded p-1 text-sm" />
                    <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
                      {subjects.map(sub => {
                        const cls = classes.find(c => c.id === sub.classId);
                        return (
                          <label key={sub.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer text-sm">
                            <input 
                              type="checkbox" 
                              checked={editAssignedSubjects.includes(sub.id)}
                              onChange={(e) => {
                                if (e.target.checked) setEditAssignedSubjects(prev => [...prev, sub.id]);
                                else setEditAssignedSubjects(prev => prev.filter(id => id !== sub.id));
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="font-medium text-gray-700">{sub.name}</span>
                            <span className="text-xs text-gray-500">({cls ? `${cls.grade}-${cls.section}` : sub.classId})</span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId("")} className="p-1 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                      <button onClick={handleSaveEdit} disabled={savingEdit} className="p-1 text-blue-600 hover:text-blue-800">
                        {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{t.name}</h4>
                      <p className="text-sm text-gray-500">{t.email}</p>
                      <div className="mt-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${t.role === 'class_teacher' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                          {t.role === 'class_teacher' ? 'Class Teacher' : 'Subject Teacher'}
                        </span>
                      </div>
                      {t.assignedSubjects && t.assignedSubjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.assignedSubjects.map((subId: string) => {
                            const sub = subjects.find(s => s.id === subId);
                            const cls = sub ? classes.find(c => c.id === sub.classId) : null;
                            if (!sub) return null;
                            return (
                              <span key={subId} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                                {sub.name} {cls ? `(${cls.grade}-${cls.section})` : ""}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(t)}
                        className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50"
                        title="Edit Teacher"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeacher(t.uid)}
                        disabled={deletingId === t.uid}
                        className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                        title="Delete Teacher"
                      >
                        {deletingId === t.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
