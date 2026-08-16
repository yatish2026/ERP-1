"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  IndianRupee, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  Award,
  Menu,
  X,
  User
} from "lucide-react";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";

const principalNavItems = [
  { name: "Dashboard", href: "/principal/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/principal/students", icon: Users },
  { name: "Teachers", href: "/principal/teachers", icon: UserSquare2 },
  { name: "Classes", href: "/principal/classes", icon: GraduationCap },
  { name: "Subjects", href: "/principal/subjects", icon: BookOpen },
  { name: "Attendance", href: "/principal/attendance", icon: CheckSquare },
  { name: "Marks & Exams", href: "/principal/exams", icon: FileText },
  { name: "Fees", href: "/principal/fees", icon: IndianRupee },
  { name: "Timetable", href: "/principal/timetable", icon: Calendar },
  { name: "Announcements", href: "/principal/announcements", icon: Bell },
  { name: "Settings", href: "/principal/settings", icon: Settings },
  { name: "My Profile", href: "/principal/profile", icon: User },
];

const teacherNavItems = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
  { name: "My Students", href: "/teacher/students", icon: Users },
  { name: "My Classes", href: "/teacher/classes", icon: GraduationCap },
  { name: "Class Groups", href: "/teacher/groups", icon: BookOpen },
  { name: "Attendance", href: "/teacher/attendance", icon: CheckSquare },
  { name: "Marks & Grades", href: "/teacher/marks", icon: FileText },
  { name: "Timetable", href: "/teacher/timetable", icon: Calendar },
  { name: "Announcements", href: "/teacher/announcements", icon: Bell },
  { name: "My Profile", href: "/teacher/profile", icon: User },
];

const studentNavItems = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Grades", href: "/student/grades", icon: Award },
  { name: "Class Group", href: "/student/group", icon: BookOpen },
  { name: "Attendance", href: "/student/attendance", icon: CheckSquare },
  { name: "Timetable", href: "/student/timetable", icon: Calendar },
  { name: "Fees", href: "/student/fees", icon: IndianRupee },
  { name: "Announcements", href: "/student/announcements", icon: Bell },
  { name: "My Profile", href: "/student/profile", icon: User },
];

export default function Sidebar({ role }: { role: "principal" | "teacher" | "student" | "parent" }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  let navItems = principalNavItems;
  if (role === "teacher") navItems = teacherNavItems;
  if (role === "student") navItems = studentNavItems;

  // Define Bottom Nav Items (First 4 from the main list, 5th is Menu)
  const bottomNavItems = navItems.slice(0, 4);

  return (
    <>
      {/* 1. DESKTOP SIDEBAR */}
      <div className="hidden md:flex flex-col w-64 bg-gray-900 h-screen text-white fixed left-0 top-0 z-50">
        <div className="flex items-center justify-center h-20 border-b border-gray-800 shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <GraduationCap className="text-blue-500" /> School ERP
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5 text-gray-400" />
            Logout
          </button>
        </div>
      </div>

      {/* 2. MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-center z-40 px-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="text-blue-600 w-6 h-6" /> School ERP
        </h1>
      </div>

      {/* 3. MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex justify-around items-center z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href && !mobileMenuOpen;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "fill-blue-100 stroke-2" : "stroke-[1.5px]"}`} />
              <span className="text-[10px] font-medium truncate px-1 w-full text-center">
                {item.name.split(" ")[0]}
              </span>
            </Link>
          );
        })}
        
        {/* The 5th Button: Menu */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
            mobileMenuOpen ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
          }`}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 stroke-2" />
          ) : (
            <User className="w-5 h-5 stroke-[1.5px]" />
          )}
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>

      {/* 4. MOBILE FULL SCREEN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bottom-16 bg-white z-30 overflow-y-auto animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">All Features</h3>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`mr-4 p-2 rounded-lg ${isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 border-t border-gray-100 pt-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-3.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
              >
                <div className="mr-4 p-2 rounded-lg bg-red-100 text-red-600">
                  <LogOut className="h-5 w-5" />
                </div>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
