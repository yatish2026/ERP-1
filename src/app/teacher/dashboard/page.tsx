"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getTeacherClassesServer } from "@/app/actions/classes";
import { getTeacherScheduleServer, Period } from "@/app/actions/timetable";
import { getAnnouncementsServer, Announcement } from "@/app/actions/announcements";
import { Loader2, ChevronRight, CheckSquare, Users, Megaphone, Calendar as TimetableIcon, Settings, GraduationCap, Clock, CalendarIcon, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherDashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Teacher");
  const [loading, setLoading] = useState(true);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classesCount, setClassesCount] = useState(0);
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [schedule, setSchedule] = useState<{classId: string, period: Period}[]>([]);

  // Formatting current date for the greeting
  const todayDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = todayDate.toLocaleDateString("en-US", dateOptions);
  
  const currentHour = todayDate.getHours();
  let greeting = "Good Evening";
  if (currentHour < 12) greeting = "Good Morning";
  else if (currentHour < 17) greeting = "Good Afternoon";

  const today = todayDate.toLocaleDateString("en-US", { weekday: "long" });
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK.includes(today) ? today : "Monday");

  useEffect(() => {
    const fetchScheduleAndAnnouncements = async (uid: string) => {
      const [scheduleRes, annRes] = await Promise.all([
        getTeacherScheduleServer(uid, selectedDay),
        getAnnouncementsServer("teacher")
      ]);
      
      if (scheduleRes.success) {
        setSchedule(scheduleRes.data || []);
      }
      if (annRes.success) {
        setAnnouncements(annRes.data?.slice(0, 5) || []);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || "Teacher");
        const res = await getTeacherClassesServer(user.uid);
        if (res.success && res.data && res.data.length > 0) {
          setIsClassTeacher(true);
          setClassesCount(res.data.length);
        }
        await fetchScheduleAndAnnouncements(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDay]);

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

          {isClassTeacher && (
            <div className="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 text-sm">Class Teacher Mode Active</h3>
            </div>
          )}

          <Link href="/teacher/timetable" className="flex items-center justify-between w-full py-4 border-t border-gray-50 group hover:bg-gray-50 transition-colors -mx-6 px-6 -mb-6">
            <span className="font-bold text-gray-900">View Schedule</span>
            <ChevronRight className="text-blue-600 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2. Essentials */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Essentials</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Classes - Green Box */}
          <Link href="/teacher/classes" className="bg-[#e6f4ea] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm">
            <div>
              <div className="bg-[#81c995] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <GraduationCap className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">My Classes</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Assigned Classes</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">{classesCount}</span>
              </div>
            </div>
          </Link>

          {/* Attendance - Red Box */}
          <Link href="/teacher/attendance" className="bg-[#fce8e6] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm">
            <div>
              <div className="bg-[#f28b82] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <CheckSquare className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">Attendance</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Mark Attendance</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">Open</span>
              </div>
            </div>
          </Link>

          {/* Announcements - Purple Box */}
          <Link href="/teacher/announcements" className="bg-[#f3e8fd] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm">
            <div className="bg-[#c58af9] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <Megaphone className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Notice Board</h4>
            <p className="text-xs text-gray-500">{announcements.length} Updates</p>
          </Link>

          {/* Students - Blue Box */}
          <Link href="/teacher/students" className="bg-[#e4f7fb] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm">
            <div className="bg-[#78d9ec] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <Users className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">My Students</h4>
            <p className="text-xs text-gray-500">Manage directory</p>
          </Link>
        </div>

        {/* 3. Tools */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/teacher/timetable" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <TimetableIcon className="text-purple-600 w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Timetable</span>
          </Link>
          
          <Link href="/teacher/profile" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100">
            <div className="bg-pink-100 p-3 rounded-2xl">
              <Settings className="text-pink-600 w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">My Profile</span>
          </Link>
        </div>
      </div>

      {/* ---------------- DESKTOP VIEW (DETAILED DASHBOARD) ---------------- */}
      <div className="hidden md:block">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h2>
            <p className="text-gray-600 mt-2">Here is your schedule and overview for today.</p>
          </div>
        </header>

        {isClassTeacher && (
          <div className="mb-8 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="font-bold text-indigo-900">Class Teacher Mode Active</h3>
              <p className="text-indigo-700 text-sm">You have administrative access to manage your assigned class.</p>
            </div>
          </div>
        )}

        {/* Weekly Schedule (Subject Teacher View) */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="text-blue-500" /> Weekly Schedule
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedDay === day 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : day === today 
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          
          {schedule.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500">You have no classes scheduled for {selectedDay}.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedule.map((s, idx) => (
                <div key={idx} className="p-4 border border-blue-100 bg-blue-50 rounded-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Period {s.period.periodNumber}
                      </span>
                      <span className="text-blue-800 font-medium text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {s.period.startTime} - {s.period.endTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{s.period.subjectName}</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">Class: {s.classId}</p>
                  </div>
                  
                  <Link 
                    href={`/teacher/attendance?classId=${s.classId}&periodNumber=${s.period.periodNumber}&subjectName=${encodeURIComponent(s.period.subjectName)}&dayOfWeek=${selectedDay}`}
                    className="block text-center w-full py-2 bg-white border border-blue-200 text-blue-700 font-medium rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    Mark Attendance
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Announcements */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-[#f3e8fd] p-1.5 rounded-lg">
                  <Megaphone className="w-4 h-4 text-[#c58af9]" />
                </div>
                Notice Board
              </h3>
              <Link href="/teacher/announcements" className="text-sm text-blue-600 hover:underline">View All</Link>
            </div>
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No recent announcements.</p>
              ) : (
                announcements.map(ann => (
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
    </div>
  );
}
