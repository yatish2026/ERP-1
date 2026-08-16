"use client";

import { useState, useEffect } from "react";
import { getClassesServer } from "@/app/actions/classes";
import { getTimetableServer, Period, DayTimetable } from "@/app/actions/timetable";
import { CalendarIcon, Loader2, Clock, User, BookOpen } from "lucide-react";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function PrincipalTimetablePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const initialDay = DAYS_OF_WEEK.includes(todayName) ? todayName : "Monday";
  const [selectedDay, setSelectedDay] = useState(initialDay);
  
  const [loading, setLoading] = useState(true);
  const [timetableMap, setTimetableMap] = useState<Record<string, DayTimetable>>({});

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await getClassesServer();
      if (res.success && res.data) {
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClassId(res.data[0].id);
        }
      }
      setLoading(false);
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClassId) return;
      const res = await getTimetableServer(selectedClassId);
      if (res.success) {
        setTimetableMap(res.data || {});
      }
    };
    fetchTimetable();
  }, [selectedClassId]);

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  // Sort periods for the selected day
  const currentSchedule = timetableMap[selectedDay] 
    ? [...timetableMap[selectedDay].periods].sort((a, b) => a.periodNumber - b.periodNumber)
    : [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="text-blue-500 w-8 h-8" /> 
          Class Timetables
        </h2>
        <p className="text-gray-600 mt-2">
          View the weekly schedule for any class across the school.
        </p>
      </header>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors"
            >
              {classes.length === 0 ? (
                <option value="">No classes found</option>
              ) : (
                classes.map(c => (
                  <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>
                ))
              )}
            </select>
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedDay === day 
                    ? "bg-blue-600 text-white shadow-sm" 
                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {currentSchedule.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
            <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No classes scheduled for {selectedDay}.</p>
            <p className="text-gray-400 mt-1">The Class Teacher has not configured the timetable for this day.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentSchedule.map((period, idx) => (
              <div key={idx} className="p-6 border border-indigo-100 bg-indigo-50/50 rounded-2xl hover:bg-indigo-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-lg shadow-sm">
                    Period {period.periodNumber}
                  </span>
                  <span className="text-indigo-800 font-bold text-sm flex items-center gap-1.5 bg-indigo-100 px-3 py-1 rounded-lg">
                    <Clock className="w-4 h-4" /> {period.startTime} - {period.endTime}
                  </span>
                </div>
                <h4 className="font-extrabold text-gray-900 text-2xl mb-2">{period.subjectName}</h4>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-indigo-100/50">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {period.teacherName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider">Teacher</p>
                    <p className="text-sm font-semibold text-gray-700">{period.teacherName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
