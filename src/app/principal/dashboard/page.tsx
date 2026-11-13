"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/supabase/client";
import { getStudentsServer } from "@/app/actions/students";
import { getTeachersServer } from "@/app/actions/users";
import { getClassesServer } from "@/app/actions/classes";
import { getAnnouncementsServer, Announcement } from "@/app/actions/announcements";
import { getOverallDailyAttendanceServer } from "@/app/actions/attendance";
import { getSchoolFeesStatsServer } from "@/app/actions/fees";
import { Loader2, ChevronRight, Users, UserSquare2, Megaphone, Calendar as TimetableIcon, Settings, GraduationCap, CheckCircle, IndianRupee } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PrincipalDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Principal");
  const [loading, setLoading] = useState(true);
  
  const [studentsCount, setStudentsCount] = useState(0);
  const [teachersCount, setTeachersCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState("N/A");
  const [totalFees, setTotalFees] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Formatting current date for the greeting
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);
  
  const currentHour = today.getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) greeting = "Good Morning";
  else if (currentHour < 17) greeting = "Good Afternoon";

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || "Principal");

        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const [stRes, thRes, clRes, anRes, attRes, feesRes] = await Promise.all([
          getStudentsServer(""),
          getTeachersServer(),
          getClassesServer(),
          getAnnouncementsServer("all"),
          getOverallDailyAttendanceServer(dateStr),
          getSchoolFeesStatsServer()
        ]);

        if (stRes.success) setStudentsCount(stRes.data?.length || 0);
        if (thRes.success) setTeachersCount(thRes.data?.length || 0);
        if (clRes.success) setClassesCount(clRes.data?.length || 0);
        if (anRes.success) setAnnouncements(anRes.data || []);
        if (attRes.success) setAttendancePercentage(String(attRes.percentage));
        if (feesRes.success) setTotalFees(feesRes.totalCollected || 0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center min-h-screen items-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  return (
    <div className="p-4 md:p-8 bg-[#f8f9fa] min-h-screen pb-24 md:pb-8">
      
      {/* ---------------- MOBILE VIEW (BENTO BOX) ---------------- */}
      <div className="md:hidden">
        {/* 1. Greeting Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Hi {userName},</h2>
              <p className="text-sm text-gray-500 font-medium">{greeting}, {formattedDate}</p>
            </div>
          </div>

          <Link href="/principal/timetable" className="flex items-center justify-between w-full py-4 border-t border-gray-50 group hover:bg-gray-50 transition-colors -mx-6 px-6 -mb-6">
            <span className="font-bold text-gray-900">View College Timetables</span>
            <ChevronRight className="text-blue-600 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2. Essentials */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Metrics</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Attendance - Green Box */}
          <Link href="/principal/attendance" className="bg-[#e6f4ea] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="bg-[#81c995] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <CheckCircle className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">Attendance</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Today's Avg</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">
                  {attendancePercentage.endsWith('%') ? attendancePercentage : `${attendancePercentage}%`}
                </span>
              </div>
            </div>
          </Link>

          {/* Fees - Yellow Box */}
          <Link href="/principal/fees" className="bg-[#fff9e6] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm hover:shadow-md transition-shadow">
            <div>
              <div className="bg-[#ffcc00] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <IndianRupee className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">Total Fees</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Collected</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">₹{totalFees.toLocaleString()}</span>
              </div>
            </div>
          </Link>

          {/* Students - Blue Box */}
          <Link href="/principal/students" className="bg-[#e4f7fb] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#78d9ec] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <Users className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Students</h4>
            <p className="text-xs text-gray-500">{studentsCount} Enrolled</p>
          </Link>
          
          {/* Teachers - Red Box */}
          <Link href="/principal/teachers" className="bg-[#fce8e6] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-[#f28b82] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <UserSquare2 className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Faculty & Staff</h4>
            <p className="text-xs text-gray-500">{teachersCount} Active Staff</p>
          </Link>
        </div>

        {/* 3. Tools */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/principal/classes" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <GraduationCap className="text-purple-600 w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Classes ({classesCount})</span>
          </Link>
          
          <Link href="/principal/profile" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="bg-pink-100 p-3 rounded-2xl">
              <Settings className="text-pink-600 w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">My Profile</span>
          </Link>
        </div>
      </div>

      {/* ---------------- DESKTOP VIEW (DETAILED DASHBOARD) ---------------- */}
      <div className="hidden md:block">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome, Principal / Dean!</h2>
          <p className="text-gray-600 mt-2">Here is the college's high-level overview.</p>
        </header>
        
        {/* Metric Overviews (5 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Attendance */}
          <Link href="/principal/attendance" className="bg-[#e6f4ea] p-6 rounded-2xl shadow-sm border border-[#cce8d6] flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="bg-[#81c995] p-3 rounded-xl text-white group-hover:scale-105 transition-transform">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-medium">Daily Attendance</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {attendancePercentage.endsWith('%') ? attendancePercentage : `${attendancePercentage}%`}
              </h3>
            </div>
          </Link>
          
          {/* Fees */}
          <Link href="/principal/fees" className="bg-[#fff9e6] p-6 rounded-2xl shadow-sm border border-[#ffe680] flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="bg-[#ffcc00] p-3 rounded-xl text-white group-hover:scale-105 transition-transform">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-medium">Fees Collected</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">₹{totalFees.toLocaleString()}</h3>
            </div>
          </Link>

          <Link href="/principal/students" className="bg-[#e4f7fb] p-6 rounded-2xl shadow-sm border border-[#b3ebf5] flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#78d9ec] p-3 rounded-xl text-white">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-medium">Total Students</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{studentsCount}</h3>
            </div>
          </Link>

          <Link href="/principal/teachers" className="bg-[#fce8e6] p-6 rounded-2xl shadow-sm border border-[#f9d2ce] flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#f28b82] p-3 rounded-xl text-white">
              <UserSquare2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-medium">Total Teachers</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{teachersCount}</h3>
            </div>
          </Link>

          <Link href="/principal/classes" className="bg-[#f3e8fd] p-6 rounded-2xl shadow-sm border border-[#e4ccff] flex flex-col items-center justify-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#c58af9] p-3 rounded-xl text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-700 font-medium">Total Classes</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{classesCount}</h3>
            </div>
          </Link>
        </div>

        {/* Recent Announcements */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="bg-[#f3e8fd] p-1.5 rounded-lg">
                <Megaphone className="w-4 h-4 text-[#c58af9]" />
              </div>
              Recent Announcements
            </h3>
            <Link href="/principal/announcements" className="text-sm text-blue-600 hover:underline">Manage All</Link>
          </div>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No announcements found.</p>
            ) : (
              announcements.slice(0, 5).map(ann => (
                <div key={ann.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-800 line-clamp-1">{ann.title}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      ann.targetAudience === 'all' ? 'bg-blue-50 text-blue-700' :
                      ann.targetAudience === 'teachers' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-green-50 text-green-700'
                    }`}>
                      {ann.targetAudience === 'all' ? 'Public' : ann.targetAudience === 'teachers' ? 'Teachers' : 'Students'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-1">{ann.content}</p>
                  <p className="text-[10px] text-gray-400">By {ann.authorName} • {new Date(ann.timestamp).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
