"use client";

import { useState, useEffect } from "react";
import { getTeacherClassesServer } from "@/app/actions/classes";
import { createStudentServer } from "@/app/actions/students";
import { auth } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

export default function AddStudentPage() {
  const [assignedClass, setAssignedClass] = useState<any>(null);
  const [loadingClasses, setLoadingClasses] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
    admissionNumber: "",
    rollNumber: "",
    parentName: "",
    parentPhone: "",
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchClasses = async () => {
      const user = auth.currentUser;
      if (user) {
        const res = await getTeacherClassesServer(user.uid);
        if (res.success && res.data && res.data.length > 0) {
          // For now, default to the first assigned class. 
          // If a teacher has multiple classes, we would provide a dropdown that ONLY lists their assigned classes.
          setAssignedClass(res.data[0]); 
        }
      }
      setLoadingClasses(false);
    };
    
    // Slight delay to ensure auth is ready
    const timer = setTimeout(() => {
      fetchClasses();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedClass) return;
    
    setSubmitting(true);
    setError("");
    setGeneratedPassword("");
    const user = auth.currentUser;
    
    if (user) {
      const res = await createStudentServer(user.uid, {
        ...formData,
        classId: assignedClass.id,
      });

      if (res.success) {
        setGeneratedPassword(res.password || "");
        setFormData({
          name: "", email: "", dateOfBirth: "", gender: "Male",
          admissionNumber: "", rollNumber: "", parentName: "", parentPhone: ""
        });
      } else {
        setError(res.error || "Failed to add student.");
      }
    }
    setSubmitting(false);
  };

  if (loadingClasses) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  if (!assignedClass) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200">
          You are not assigned as a Class Teacher to any class. You cannot add students.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">Add New Student</h2>
        <p className="text-gray-600 mt-2">Enroll a new student directly into your class.</p>
      </header>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}
      {generatedPassword && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl shadow-sm">
          <h3 className="text-green-800 font-bold text-xl text-center">Student Enrolled Successfully!</h3>
          <p className="text-green-700 mt-2 text-center">Please provide the following temporary password to the student so they can log in to the portal:</p>
          <div className="mt-4 p-4 bg-white rounded-lg border border-green-300 font-mono text-3xl text-center text-gray-900 shadow-inner">
            {generatedPassword}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
        
        {/* READ ONLY CLASS INDICATOR */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Assigned Class (Read-Only)</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{assignedClass.grade} - {assignedClass.section}</p>
          <p className="text-sm text-blue-600 mt-1">Students created here will automatically be restricted to this class.</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Student Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address (for login) *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
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
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Parent Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Name</label>
              <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
              <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {submitting ? "Creating Student..." : "Create Student"}
          </button>
        </div>
      </form>
    </div>
  );
}
