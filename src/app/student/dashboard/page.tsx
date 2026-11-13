"use client";

import { useEffect, useState } from "react";
import { auth, supabase } from "@/lib/supabase/client";
import { getTimetableServer, DayTimetable } from "@/app/actions/timetable";
import { getStudentAttendanceStatsServer } from "@/app/actions/attendance";
import { getAnnouncementsServer, Announcement } from "@/app/actions/announcements";
import { getStudentMarksServer } from "@/app/actions/marks";
import { CalendarIcon, Clock, Loader2, CheckCircle, FileText, Megaphone, CheckSquare, Award, User, Settings, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [timetableMap, setTimetableMap] = useState<Record<string, DayTimetable>>({});
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const initialDay = DAYS_OF_WEEK.includes(todayName) ? todayName : "Monday";
  const [selectedDay, setSelectedDay] = useState(initialDay);

  const [attendanceStats, setAttendanceStats] = useState({ percentage: "N/A", asOf: "", present: 0, total: 0 });
  const [marks, setMarks] = useState<any[]>([]);
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
        const { data: userDoc } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (userDoc) {
          setUserName(userDoc.name || "Student");
          const classId = userDoc.class_id || userDoc.classId;
          
          if (classId) {
            const res = await getTimetableServer(classId);
            if (res.success) {
              setTimetableMap(res.data || {});
            }
          }
          
          // Fetch Attendance
          const attRes = await getStudentAttendanceStatsServer(user.uid);
          if (attRes.success && attRes.percentage) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            setAttendanceStats({ 
              percentage: attRes.percentage, 
              asOf: `As on ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`,
              present: attRes.present || 0,
              total: attRes.total || 0
            });
          }

          // Fetch Marks
          const marksRes = await getStudentMarksServer(user.uid);
          if (marksRes.success) {
            setMarks(marksRes.data || []);
          }
          
          // Fetch Announcements
          const annRes = await getAnnouncementsServer("student");
          if (annRes.success) {
            setAnnouncements(annRes.data?.slice(0, 5) || []);
          }
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center min-h-screen items-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  // Sort periods
  const currentSchedule = timetableMap[selectedDay] 
    ? [...timetableMap[selectedDay].periods].sort((a, b) => a.startTime.localeCompare(b.startTime)) 
    : [];

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

          <Link href="/student/timetable" className="flex items-center justify-between w-full py-4 border-t border-gray-50 group hover:bg-gray-50 transition-colors -mx-6 px-6 -mb-6">
            <span className="font-bold text-gray-900">View Schedule</span>
            <ChevronRight className="text-blue-600 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 2. Essentials */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Essentials</h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
          
          {/* Attendance - Green Box */}
          <Link href="/student/attendance" className="bg-[#e6f4ea] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm">
            <div>
              <div className="bg-[#81c995] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <CheckSquare className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">Attendance</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Overall</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">{attendanceStats.percentage}%</span>
              </div>
              <p className="text-[10px] text-gray-500 italic mt-2 line-clamp-1">{attendanceStats.asOf}</p>
            </div>
          </Link>

          {/* Grades - Red Box */}
          <Link href="/student/grades" className="bg-[#fce8e6] rounded-3xl p-5 flex flex-col justify-between aspect-square shadow-sm">
            <div>
              <div className="bg-[#f28b82] w-10 h-10 rounded-xl flex items-center justify-center mb-3">
                <Award className="text-white w-5 h-5" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-4">My Grades</h4>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Exams Recorded</p>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">{marks.length}</span>
              </div>
              <p className="text-[10px] text-gray-500 italic mt-2 line-clamp-1">Latest results available</p>
            </div>
          </Link>

          {/* Announcements - Purple Box */}
          <Link href="/student/announcements" className="bg-[#f3e8fd] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm">
            <div className="bg-[#c58af9] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <Megaphone className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Notice Board</h4>
            <p className="text-xs text-gray-500">{announcements.length} Updates</p>
          </Link>

          {/* Fees/Clubs - Blue Box */}
          <Link href="/student/fees" className="bg-[#e4f7fb] rounded-3xl p-5 flex flex-col justify-between aspect-[16/10] shadow-sm">
            <div className="bg-[#78d9ec] w-10 h-10 rounded-xl flex items-center justify-center mb-2">
              <User className="text-white w-5 h-5" />
            </div>
            <h4 className="font-semibold text-gray-900">Fee Payments</h4>
            <p className="text-xs text-gray-500">Check Dues</p>
          </Link>
        </div>

        {/* 3. Tools */}
        <h3 className="text-xs font-bold text-gray-500 tracking-wider mb-4 uppercase ml-2">Tools</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/student/timetable" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <CalendarIcon className="text-purple-600 w-6 h-6" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Timetable</span>
          </Link>
          
          <Link href="/student/profile" className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm border border-gray-100">
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
            <h2 className="text-3xl font-bold text-gray-900 capitalize">Welcome, {userName}!</h2>
            <p className="text-gray-600 mt-2">Here is your daily schedule, attendance, and overview.</p>
          </div>
        </header>
        
        {/* Overview Cards (Styled with the new pastel coloring) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/student/attendance" className="bg-[#e6f4ea] p-6 rounded-2xl shadow-sm border border-[#cce8d6] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#81c995] p-4 rounded-xl text-white">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Overall Attendance</p>
              <h3 className="text-2xl font-bold text-gray-900">{attendanceStats.percentage}%</h3>
            </div>
          </Link>

          <Link href="/student/grades" className="bg-[#fce8e6] p-6 rounded-2xl shadow-sm border border-[#f9d2ce] flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="bg-[#f28b82] p-4 rounded-xl text-white">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-700 font-medium">Exams Recorded</p>
              <h3 className="text-2xl font-bold text-gray-900">{marks.length}</h3>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Announcements */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-[#f3e8fd] p-1.5 rounded-lg">
                  <Megaphone className="w-4 h-4 text-[#c58af9]" />
                </div>
                Notice Board
              </h3>
            </div>
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No recent announcements.</p>
              ) : (
                announcements.map(ann => (
                  <div key={ann.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <p className="font-bold text-gray-800 line-clamp-1">{ann.title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-1 mt-1">{ann.content}</p>
                    <p className="text-[10px] text-gray-400">By {ann.authorName} • {new Date(ann.timestamp).toLocaleDateString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="text-blue-500" /> My Timetable
              </h3>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedDay === day 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            
            {currentSchedule.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                <p className="text-gray-500">No classes scheduled for {selectedDay}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSchedule.map((period, idx) => (
                  <div key={idx} className="p-4 border border-indigo-100 bg-indigo-50 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Period {period.periodNumber}
                      </span>
                      <span className="text-indigo-800 font-medium text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {period.startTime} - {period.endTime}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-lg">{period.subjectName}</h4>
                    <p className="text-sm text-gray-600 mt-1">Teacher: {period.teacherName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Academic Performance / Marks */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="text-blue-500" /> Academic Performance
            </h3>
            <Link href="/student/grades" className="text-sm text-blue-600 hover:underline">View Detailed Grades</Link>
          </div>
          
          {marks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500">No marks have been posted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                    <th className="p-4">Exam</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4 text-right">Marks Obtained</th>
                    <th className="p-4 text-right">Total Marks</th>
                    <th className="p-4 text-center">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {marks.slice(0, 5).map((m, idx) => {
                    const percentage = m.totalMarks > 0 ? Math.round((m.marksObtained / m.totalMarks) * 100) : 0;
                    return (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-900">{m.examName}</td>
                        <td className="p-4 text-gray-600">{m.subjectName}</td>
                        <td className="p-4 text-right font-medium text-gray-900">{m.marksObtained}</td>
                        <td className="p-4 text-right text-gray-500">{m.totalMarks}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${percentage >= 40 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {percentage}%
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
    </div>
  );
}
