"use client";

import { useState, useEffect } from "react";
import { getStudentsServer, createStudentServer } from "@/app/actions/students";
import { getTeacherClassesServer } from "@/app/actions/classes";
import { deleteUserServer, updateUserServer } from "@/app/actions/users";
import { auth } from "@/lib/supabase/client";
import { UserPlus, Users, Loader2, Trash2, Edit2, X, Save, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  
  // Edit State
  const [editingId, setEditingId] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
    admissionNumber: "",
    rollNumber: "",
    parentName: "",
    parentPhone: "",
    classId: "",
  });

  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    
    const classesRes = await getTeacherClassesServer(user.uid);
    if (classesRes.success) {
      setClasses(classesRes.data || []);
      
      // Fetch students for these classes
      const allStudentsRes = await getStudentsServer();
      if (allStudentsRes.success && classesRes.data) {
        const myClassIds = classesRes.data.map((c: any) => c.id);
        const myStudents = (allStudentsRes.data || []).filter((s: any) => myClassIds.includes(s.classId));
        setStudents(myStudents);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setGeneratedPassword("");
    const user = auth.currentUser;
    if (!user) return;
    
    if (!formData.classId) {
      setError("Please select a class for the student.");
      setCreating(false);
      return;
    }

    const res = await createStudentServer(user.uid, formData);
    if (res.success) {
      setFormData({
        name: "", email: "", dateOfBirth: "", gender: "Male",
        admissionNumber: "", rollNumber: "", parentName: "", parentPhone: "", classId: ""
      });
      setGeneratedPassword(res.password || "");
      await fetchData();
    } else {
      setError(res.error || "Failed to create student.");
    }
    setCreating(false);
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to permanently delete this student?")) return;
    
    setDeletingId(studentId);
    setError("");
    const user = auth.currentUser;
    if (user) {
      const res = await deleteUserServer(user.uid, studentId, "student");
      if (res.success) {
        await fetchData();
      } else {
        setError(res.error || "Failed to delete student.");
      }
    }
    setDeletingId("");
  };

  const handleEditClick = (s: any) => {
    setEditingId(s.uid);
    setEditName(s.name);
    setEditEmail(s.email);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    setError("");
    const user = auth.currentUser;
    if (user) {
      const res = await updateUserServer(user.uid, editingId, "student", { name: editName, email: editEmail });
      if (res.success) {
        setEditingId("");
        await fetchData();
      } else {
        setError(res.error || "Failed to update student.");
      }
    }
    setSavingEdit(false);
  };

  const [filterClassId, setFilterClassId] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = filterClassId 
    ? students.filter(s => s.classId === filterClassId)
    : students;

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Manage My Students</h2>
        <p className="text-gray-600 mt-2">Manage students for the classes you are a Class Teacher of.</p>
      </header>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {generatedPassword && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-bold text-lg">Student Enrolled Successfully!</h3>
          <p className="text-green-700 mt-1">Please provide the following temporary password to the student so they can log in:</p>
          <div className="mt-2 p-3 bg-white rounded border border-green-300 font-mono text-xl text-center text-gray-900 shadow-sm">
            {generatedPassword}
          </div>
        </div>
      )}

      {/* Create Student Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <UserPlus className="text-blue-500" /> Enroll New Student
        </h3>
        <form onSubmit={handleCreateStudent} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <select name="classId" value={formData.classId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required>
                <option value="">-- Select Class --</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admission Number</label>
              <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Roll Number</label>
              <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Name</label>
              <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
              <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex justify-center items-center gap-2"
            >
              {creating ? <Loader2 className="animate-spin w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {creating ? "Creating Student..." : "Enroll Student"}
            </button>
          </div>
        </form>
      </div>

      {/* Students List */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Users className="text-green-500" /> All Students
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Filter by Class:</label>
              <select 
                value={filterClassId} 
                onChange={e => setFilterClassId(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>)}
              </select>
            </div>
            <button
              onClick={() => {
                const headers = ["Admission No", "Roll No", "Full Name", "Email", "Class", "Gender", "Date of Birth", "Parent Name", "Parent Phone"];
                const rows = filteredStudents.map(s => [
                  s.admissionNumber || "",
                  s.rollNumber || "",
                  s.name || "",
                  s.email || "",
                  s.classId || "",
                  s.gender || "",
                  s.dateOfBirth || "",
                  s.parentName || "",
                  s.parentPhone || ""
                ]);
                exportToCsv(filterClassId ? `Students_${filterClassId}` : "My_Students_Roster", headers, rows);
              }}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        </div>
        {filteredStudents.length === 0 ? (
          <p className="text-gray-500">No students found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-3">Adm No.</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Roll No.</th>
                  <th className="p-3">Parent</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.uid} className="border-b border-gray-50 hover:bg-gray-50 group">
                    {editingId === s.uid ? (
                      <>
                        <td className="p-3 font-medium text-gray-900">{s.admissionNumber}</td>
                        <td className="p-3">
                          <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full border rounded p-1 text-sm" />
                        </td>
                        <td className="p-3 text-indigo-600 font-medium">{s.classId}</td>
                        <td className="p-3">{s.rollNumber}</td>
                        <td className="p-3">{s.parentName}</td>
                        <td className="p-3 text-sm text-gray-500">
                          <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full border rounded p-1 text-sm" />
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => setEditingId("")} className="p-1 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                            <button onClick={handleSaveEdit} disabled={savingEdit} className="p-1 text-blue-600 hover:text-blue-800">
                              {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-medium text-gray-900">{s.admissionNumber}</td>
                        <td className="p-3 text-gray-900 font-medium">{s.name}</td>
                        <td className="p-3 text-indigo-600 font-bold">{s.classId}</td>
                        <td className="p-3 text-gray-900">{s.rollNumber}</td>
                        <td className="p-3 text-gray-900">{s.parentName}</td>
                        <td className="p-3 text-sm text-gray-500">{s.email}</td>
                        <td className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleEditClick(s)}
                              className="text-gray-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50"
                              title="Edit Student"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStudent(s.uid)}
                              disabled={deletingId === s.uid}
                              className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
                              title="Delete Student"
                            >
                              {deletingId === s.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
