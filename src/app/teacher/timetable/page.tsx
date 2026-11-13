"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/supabase/client";
import { getTeacherClassesServer } from "@/app/actions/classes";
import { getSubjectsServer, Subject } from "@/app/actions/subjects";
import { getTeachersServer } from "@/app/actions/users";
import { getTimetableServer, saveDayTimetableServer, Period, DayTimetable } from "@/app/actions/timetable";
import { CalendarIcon, Loader2, Save, Plus, Trash2, Clock, User, BookOpen, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportUtils";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherTimetableBuilderPage() {
  const [loading, setLoading] = useState(true);
  
  // Data
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  // Selections
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  
  // Builder State
  const [periods, setPeriods] = useState<Period[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchInitialData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const [classesRes, subjectsRes, teachersRes] = await Promise.all([
        getTeacherClassesServer(user.uid),
        getSubjectsServer(),
        getTeachersServer()
      ]);

      if (classesRes.success && classesRes.data) {
        setClasses(classesRes.data);
        if (classesRes.data && classesRes.data.length > 0) {
          setSelectedClassId(classesRes.data?.[0]?.id || "");
        }
      }
      
      if (subjectsRes.success) setSubjects(subjectsRes.data || []);
      if (teachersRes.success) setTeachers(teachersRes.data || []);
      
      setLoading(false);
    };

    fetchInitialData();
  }, []);

  // Fetch timetable when class or day changes
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClassId) return;
      
      const res = await getTimetableServer(selectedClassId);
      if (res.success && res.data && res.data[selectedDay]) {
        // Sort periods before setting
        const sortedPeriods = [...res.data[selectedDay].periods].sort((a, b) => a.periodNumber - b.periodNumber);
        setPeriods(sortedPeriods);
      } else {
        setPeriods([]);
      }
    };

    fetchTimetable();
  }, [selectedClassId, selectedDay]);

  const handleAddPeriod = () => {
    const nextPeriodNum = periods.length > 0 ? Math.max(...periods.map(p => p.periodNumber)) + 1 : 1;
    setPeriods([...periods, {
      id: Math.random().toString(36).substring(7),
      periodNumber: nextPeriodNum,
      startTime: "",
      endTime: "",
      subjectName: "",
      teacherId: "",
      teacherName: ""
    }]);
  };

  const handleRemovePeriod = (id: string) => {
    setPeriods(periods.filter(p => p.id !== id));
  };

  const handleUpdatePeriod = (id: string, field: keyof Period, value: string | number) => {
    setPeriods(periods.map(p => {
      if (p.id === id) {
        const updated = { ...p, [field]: value };
        // Auto-fill teacherName if teacherId changes
        if (field === "teacherId") {
          const teacher = teachers.find(t => t.uid === value);
          if (teacher) updated.teacherName = teacher.name;
        }
        return updated;
      }
      return p;
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    
    // Validate
    if (periods.some(p => !p.startTime || !p.endTime || !p.subjectName || !p.teacherId)) {
      setMessage({ text: "Please fill in all fields for all periods.", type: "error" });
      setSaving(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const res = await saveDayTimetableServer(user.uid, selectedClassId, selectedDay, periods);
    if (res.success) {
      setMessage({ text: "Timetable saved successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } else {
      setMessage({ text: res.error || "Failed to save timetable.", type: "error" });
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-600 w-8 h-8" /></div>;
  }

  if (classes.length === 0) {
    return (
      <div className="p-8">
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">You are not assigned as a Class Teacher for any class.</p>
          <p className="text-gray-400 mt-1">Only Class Teachers can build timetables.</p>
        </div>
      </div>
    );
  }

  // Filter subjects for the selected class (or allow global subjects)
  const availableSubjects = subjects.filter(s => s.classId === selectedClassId || !s.classId);

  const handleDownloadTimetable = () => {
    const headers = ["Class", "Day of Week", "Period #", "Timing", "Subject Name", "Faculty / Teacher"];
    const rows = periods.map(p => {
      const teacherObj = teachers.find(t => t.uid === p.teacherId);
      return [
        selectedClassId,
        selectedDay,
        p.periodNumber,
        `${p.startTime} - ${p.endTime}`,
        p.subjectName,
        teacherObj ? teacherObj.name : p.teacherName || "Faculty"
      ];
    });
    exportToCsv(`Schedule_${selectedClassId}_${selectedDay}`, headers, rows);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="text-blue-500 w-8 h-8" /> 
            Timetable Builder
          </h2>
          <p className="text-gray-600 mt-2">
            Construct, manage, and export the weekly timetable for your class.
          </p>
        </div>
        {periods.length > 0 && (
          <button
            onClick={handleDownloadTimetable}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" /> Export Day Schedule CSV
          </button>
        )}
      </header>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select 
                value={selectedClassId} 
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors w-48"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.grade} - {c.section}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? "Saving..." : "Save Timetable"}
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 border-b border-gray-100">
          {DAYS_OF_WEEK.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-t-lg font-medium whitespace-nowrap transition-colors relative ${
                selectedDay === day 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {day}
              {selectedDay === day && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>

        {/* Periods Builder */}
        <div className="space-y-4">
          {periods.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500 mb-4">No periods configured for {selectedDay}.</p>
              <button 
                onClick={handleAddPeriod}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add First Period
              </button>
            </div>
          ) : (
            <>
              {periods.map((period, idx) => (
                <div key={period.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 group hover:border-blue-100 transition-colors relative">
                  <div className="bg-blue-600 text-white font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                    {period.periodNumber}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 w-full">
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input 
                        type="time" 
                        value={period.startTime}
                        onChange={(e) => handleUpdatePeriod(period.id, "startTime", e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-sm font-medium text-gray-900" 
                      />
                    </div>
                    
                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                      <Clock className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <input 
                        type="time" 
                        value={period.endTime}
                        onChange={(e) => handleUpdatePeriod(period.id, "endTime", e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-sm font-medium text-gray-900" 
                      />
                    </div>

                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                      <BookOpen className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <select 
                        value={period.subjectName}
                        onChange={(e) => handleUpdatePeriod(period.id, "subjectName", e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-sm font-medium text-gray-900"
                      >
                        <option value="">Select Subject</option>
                        {availableSubjects.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2">
                      <User className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                      <select 
                        value={period.teacherId}
                        onChange={(e) => handleUpdatePeriod(period.id, "teacherId", e.target.value)}
                        className="w-full bg-transparent focus:outline-none text-sm font-medium text-gray-900"
                      >
                        <option value="">Assign Teacher</option>
                        {teachers.map(t => (
                          <option key={t.uid} value={t.uid}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemovePeriod(period.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors md:opacity-0 group-hover:opacity-100"
                    title="Remove Period"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <div className="pt-2">
                <button 
                  onClick={handleAddPeriod}
                  className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline px-2 py-1"
                >
                  <Plus className="w-4 h-4" /> Add Another Period
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
