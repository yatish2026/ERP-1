"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase/config";
import { getTeacherGroupsServer } from "@/app/actions/groups";
import { Loader2, Users, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TeacherGroupsList() {
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<string[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const res = await getTeacherGroupsServer(user.uid);
        if (res.success && res.data) {
          setClasses(res.data.sort());
        } else {
          setError(res.error || "Failed to load classes.");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
          <BookOpen className="text-blue-500 w-8 h-8" />
          My Class Groups
        </h2>
        <p className="text-gray-600 mt-2">Access your assigned classes to post assignments, homework, and notes.</p>
      </header>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 font-medium">
          {error}
        </div>
      )}

      {classes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-gray-400 w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Classes Assigned</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            You are not currently assigned to any classes in the timetable. Once the Principal assigns you to a class, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classId => (
            <Link 
              key={classId} 
              href={`/teacher/groups/${classId}`}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all group block"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="bg-blue-50 p-4 rounded-2xl">
                  <Users className="text-blue-600 w-8 h-8" />
                </div>
                <div className="bg-gray-50 p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                  <ChevronRight className="text-gray-400 group-hover:text-blue-600 w-5 h-5 transition-colors" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Class {classId}</h3>
              <p className="text-sm text-gray-500 font-medium">Post assignments & updates</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
