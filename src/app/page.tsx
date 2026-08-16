import Link from 'next/link';
import { 
  ArrowRight, CheckCircle2, GraduationCap, Users, LayoutDashboard, 
  Calendar as CalendarIcon, FileText, CheckSquare, IndianRupee, Megaphone, 
  Settings, PhoneCall, ShieldCheck, Clock, BrainCircuit, Loader2
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-100 text-gray-900">
      
      {/* SECTION 1 — NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-xl text-white">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-gray-900">SchoolERP</span>
                <span className="hidden sm:block text-[10px] uppercase tracking-wider text-blue-600 font-bold">Smart School Management</span>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#ai-calling" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">AI Calling</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <a 
                href="https://wa.me/917989479005" 
                target="_blank" 
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 flex items-center gap-2"
              >
                Book a Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* UNIFIED HERO SECTION (Asymmetric) */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden relative">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/60 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-purple-100/40 to-transparent rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/4"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
          
          {/* Left Column: Text & CTA */}
          <div className="text-left pr-0 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 text-xs font-bold uppercase tracking-wider mb-8">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Live Operations
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1] relative">
              <span className="absolute -left-6 top-0 text-blue-100 -z-10">✦</span>
              Run Your Entire School From <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">One Smart Platform.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
              From student management to attendance, exams, fees and communication — everything your school needs, connected in one powerful interface.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 mb-10">
              <a 
                href="https://wa.me/917989479005"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-medium transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
              >
                Book a Demo <ArrowRight className="w-5 h-5" />
              </a>
              <Link 
                href="/login" 
                className="w-full sm:w-auto bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 px-8 py-4 rounded-full font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-lg"
              >
                Login to ERP
              </Link>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Setup in minutes</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Secure Cloud Data</div>
            </div>
          </div>

          {/* Right Column: Premium Dashboard Visual */}
          <div className="relative mt-12 lg:mt-0 lg:ml-10">
            {/* The Main Mockup */}
            <div className="rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-white/60 bg-white/40 backdrop-blur-xl p-3 transform perspective-1000 rotate-y-[-2deg] rotate-x-[1deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm relative">
                
                {/* Header */}
                <div className="h-14 border-b border-gray-100 bg-white flex items-center justify-between px-6">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-8 bg-gray-50 rounded-full border border-gray-100 flex items-center px-3">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200"></div>
                  </div>
                </div>
                
                {/* Body */}
                <div className="flex h-[550px]">
                  {/* Sidebar */}
                  <div className="hidden sm:block w-56 border-r border-gray-100 bg-gray-50/50 p-4">
                    <div className="flex items-center gap-2 mb-8 px-2">
                      <GraduationCap className="w-6 h-6 text-blue-600" />
                      <span className="font-bold text-gray-900 tracking-tight">SchoolERP</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-sm rounded-lg px-3 py-2.5 text-blue-700 font-semibold text-sm">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </div>
                      <div className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2.5 text-gray-600 font-medium text-sm transition-colors">
                        <Users className="w-4 h-4" /> Students
                      </div>
                      <div className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2.5 text-gray-600 font-medium text-sm transition-colors">
                        <CheckSquare className="w-4 h-4" /> Attendance
                      </div>
                      <div className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2.5 text-gray-600 font-medium text-sm transition-colors">
                        <IndianRupee className="w-4 h-4" /> Fee Collection
                      </div>
                      <div className="flex items-center gap-3 hover:bg-gray-100 rounded-lg px-3 py-2.5 text-gray-600 font-medium text-sm transition-colors">
                        <FileText className="w-4 h-4" /> Exams
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content Area */}
                  <div className="flex-1 bg-[#fdfdfd] p-6 overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Overview</h2>
                    
                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <p className="text-xs text-gray-500 font-medium mb-1">Total Students</p>
                        <p className="text-xl font-bold text-gray-900">1,248</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <p className="text-xs text-gray-500 font-medium mb-1">Teachers</p>
                        <p className="text-xl font-bold text-gray-900">42</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <p className="text-xs text-gray-500 font-medium mb-1">Attendance</p>
                        <p className="text-xl font-bold text-green-600">98.4%</p>
                      </div>
                      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <p className="text-xs text-gray-500 font-medium mb-1">Fees Collected</p>
                        <p className="text-xl font-bold text-gray-900">₹4.8L</p>
                      </div>
                    </div>

                    {/* Complex Data Area */}
                    <div className="grid grid-cols-3 gap-6">
                      
                      {/* Attendance Chart Mockup */}
                      <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] h-56 flex flex-col justify-between">
                        <p className="text-sm font-bold text-gray-800 mb-4">Weekly Attendance Trend</p>
                        <div className="flex items-end justify-between h-full gap-2 px-2 pb-2">
                          <div className="w-1/6 bg-blue-100 hover:bg-blue-200 rounded-t-md h-[70%] transition-colors relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 hover:opacity-100">92%</div></div>
                          <div className="w-1/6 bg-blue-500 hover:bg-blue-600 rounded-t-md h-[95%] transition-colors relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500">98%</div></div>
                          <div className="w-1/6 bg-blue-100 hover:bg-blue-200 rounded-t-md h-[85%] transition-colors relative"></div>
                          <div className="w-1/6 bg-blue-100 hover:bg-blue-200 rounded-t-md h-[80%] transition-colors relative"></div>
                          <div className="w-1/6 bg-blue-100 hover:bg-blue-200 rounded-t-md h-[90%] transition-colors relative"></div>
                        </div>
                        <div className="flex justify-between px-3 text-[10px] text-gray-400 font-medium mt-2 border-t border-gray-50 pt-2">
                          <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
                        </div>
                      </div>

                      {/* Side Widgets */}
                      <div className="col-span-1 space-y-4">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarIcon className="w-4 h-4 text-blue-600" />
                            <p className="text-xs font-bold text-blue-900">Upcoming Exam</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">Mid-Terms</p>
                          <p className="text-[10px] text-gray-500">Starts in 3 days</p>
                        </div>
                        
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                          <p className="text-xs font-bold text-gray-800 mb-3 border-b border-gray-50 pb-2">Recent Announcements</p>
                          <div className="space-y-3">
                            <div>
                              <p className="text-[11px] font-bold text-gray-900 truncate">Holiday Notice</p>
                              <p className="text-[9px] text-gray-400">By Principal • 2h ago</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-900 truncate">Fee Submission</p>
                              <p className="text-[9px] text-gray-400">By Admin • 1d ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FLOATING WIDGETS */}
            
            {/* AI Notification Floating Card */}
            <div className="absolute -left-6 lg:-left-16 top-1/4 bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-blue-100 items-start gap-4 flex z-20 animate-bounce" style={{ animationDuration: '4s' }}>
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg relative flex-shrink-0">
                <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping"></div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-0.5">AI Action Triggered</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">Calling parent of absent student</p>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Rahul Kumar (Class 8-A)
                </p>
              </div>
            </div>
            
            {/* Quick Stat Floating Card */}
            <div className="absolute -right-4 lg:-right-12 bottom-20 bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-gray-100 items-center gap-4 flex z-20 animate-bounce" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="bg-green-100 p-3 rounded-xl border border-green-200">
                <CheckSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Class 10-B Attendance</p>
                <p className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  100% <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-bold">+2%</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5 — TRUST / VALUE STRIP */}
      <section className="py-12 border-y border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Everything your school needs. One connected system.</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"><Users className="w-5 h-5 text-gray-700"/><span className="font-semibold text-gray-800">Student Management</span></div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"><FileText className="w-5 h-5 text-gray-700"/><span className="font-semibold text-gray-800">Academic Management</span></div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"><CheckSquare className="w-5 h-5 text-gray-700"/><span className="font-semibold text-gray-800">Smart Attendance</span></div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"><IndianRupee className="w-5 h-5 text-gray-700"/><span className="font-semibold text-gray-800">Fee Management</span></div>
            <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity"><BrainCircuit className="w-5 h-5 text-blue-600"/><span className="font-semibold text-gray-800">AI Communication</span></div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PROBLEM -> SOLUTION */}
      <section className="py-24 px-4 bg-[#fafafa]">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16 tracking-tight">School Management Shouldn't Be This Complicated.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white p-4 rounded-full shadow-lg border border-gray-100">
                <ArrowRight className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Before */}
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm text-left opacity-80">
              <div className="inline-block px-3 py-1 bg-red-50 text-red-600 font-bold text-sm rounded-lg mb-6">Before</div>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-600"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div> Attendance tracked manually</li>
                <li className="flex items-start gap-3 text-gray-600"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div> Student records scattered across files</li>
                <li className="flex items-start gap-3 text-gray-600"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div> Teachers depend on unorganized WhatsApp groups</li>
                <li className="flex items-start gap-3 text-gray-600"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div> Fee follow-ups are difficult and manual</li>
                <li className="flex items-start gap-3 text-gray-600"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0"></div> Exam records spread across multiple systems</li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-white p-8 rounded-3xl border-2 border-blue-500 shadow-xl shadow-blue-900/5 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
              <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-bold text-sm rounded-lg mb-6">With SchoolERP</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">One connected platform.<br/>One source of truth.</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" /> Everything in a centralized dashboard</li>
                <li className="flex items-center gap-3 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" /> Real-time mobile access for all roles</li>
                <li className="flex items-center gap-3 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" /> Automated fee and exam tracking</li>
                <li className="flex items-center gap-3 text-gray-800 font-medium"><CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" /> AI-powered absentee calling</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — CORE FEATURES */}
      <section id="features" className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Everything Your School Needs. In One Place.</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Powerful tools designed around the everyday workflow of modern schools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Dashboard</h3>
              <p className="text-gray-600">Get a complete overview of your school at a glance. Track students, attendance, fees, and exams instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                <Users className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Student Management</h3>
              <p className="text-gray-600">Manage student records from admission to graduation. Profiles, class allocation, and parent info.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                <Settings className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Teacher Management</h3>
              <p className="text-gray-600">Manage your teaching staff. Assign subjects, allocate classes, and control access permissions easily.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors">
                <GraduationCap className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Class Management</h3>
              <p className="text-gray-600">Organize classes and sections seamlessly. Assign Class Teachers and structure your school hierarchy.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-red-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-red-600 transition-colors">
                <CheckSquare className="w-6 h-6 text-red-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Attendance</h3>
              <p className="text-gray-600">Record and monitor daily and class-wise attendance. Powerful analytics and absentee tracking.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                <FileText className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Marks & Exams</h3>
              <p className="text-gray-600">Manage examinations and academic performance. Upload marks, track results, and generate reports.</p>
            </div>

            {/* Feature 7 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-yellow-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-yellow-600 transition-colors">
                <IndianRupee className="w-6 h-6 text-yellow-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fee Management</h3>
              <p className="text-gray-600">Track school fees and payment status with complete visibility. Monitor paid and pending dues.</p>
            </div>

            {/* Feature 8 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                <CalendarIcon className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Timetable Management</h3>
              <p className="text-gray-600">Build class timetables without the usual complexity. Avoid clashes and manage teacher schedules.</p>
            </div>

            {/* Feature 9 */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all group">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-sky-600 transition-colors">
                <Megaphone className="w-6 h-6 text-sky-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Announcements</h3>
              <p className="text-gray-600">Keep everyone informed. Publish targeted notices for teachers, students, or the whole school.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — AI CALLING FEATURE */}
      <section id="ai-calling" className="py-24 px-4 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/30 to-transparent"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-8">
                <BrainCircuit className="w-4 h-4" /> Next-Gen Technology
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Your ERP Can Call Too.</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Turn attendance data into immediate action with AI-powered voice calling. When a student is marked absent, the system can automatically trigger a natural-sounding phone call to the parent.
              </p>
              
              <div className="space-y-4 mb-10">
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <PhoneCall className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">Absence & Late Calls</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <IndianRupee className="w-5 h-5 text-green-400" />
                  <span className="font-medium">Automated Fee Reminders</span>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                  <Megaphone className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">Important Voice Broadcasts</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Automate the Calls Your Staff Shouldn't Have to Make.</h3>
            </div>

            {/* AI Workflow Visual */}
            <div className="relative">
              <div className="bg-[#1a1f2e] border border-gray-700 rounded-3xl p-6 shadow-2xl relative">
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div> Active Call
                </div>

                <div className="flex flex-col gap-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                      <CheckSquare className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">9:05 AM</p>
                      <p className="font-bold">Student Marked Absent</p>
                      <p className="text-sm text-gray-500 mt-1">Rahul Kumar (Class 8-A)</p>
                    </div>
                  </div>
                  
                  <div className="w-0.5 h-6 bg-gray-700 ml-5 -my-4"></div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                      <BrainCircuit className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl w-full">
                      <p className="text-blue-300 text-sm font-bold flex items-center gap-2 mb-2"><Loader2 className="w-3 h-3 animate-spin" /> Calling Parent...</p>
                      <div className="flex items-center gap-2">
                        <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-full animate-[pulse_1s_ease-in-out_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-0.5 h-6 bg-gray-700 ml-5 -my-4"></div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 border border-green-500/30">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">9:06 AM</p>
                      <p className="font-bold text-green-400">Call Completed</p>
                      <p className="text-sm text-gray-500 mt-1">Parent notified and acknowledged.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — ROLE-BASED MANAGEMENT */}
      <section className="py-24 px-4 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">Everyone Gets the Right Access.</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">Role-based permissions keep your school's data secure, organized, and visible only to those who need it.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-3 border-gray-100">👑 Principal</h3>
              <p className="text-sm text-gray-600">Complete school-wide visibility and control. Manage staff, oversee attendance, fees, and post global announcements.</p>
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-3 border-gray-100">👨‍🏫 Class Teacher</h3>
              <p className="text-sm text-gray-600">Manage students and activities for their assigned class. High-level access to their specific classroom data.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-3 border-gray-100">✏️ Teacher</h3>
              <p className="text-sm text-gray-600">Access assigned classes via timetable. Mark attendance, upload marks, and post to Class Groups.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-3 border-gray-100">🎓 Student</h3>
              <p className="text-sm text-gray-600">Access personal academic information, grades, timetables, and receive assignments through Class Groups.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-gray-900 mb-2 border-b pb-3 border-gray-100">👪 Parent</h3>
              <p className="text-sm text-gray-600">Receive important updates, view fee records, and monitor child's attendance and academic progress.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 mb-16 tracking-tight">From Setup to Smarter School Management.</h2>
          
          <div className="flex flex-col md:flex-row gap-8 relative">
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-100"></div>
            
            <div className="flex-1 relative">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 font-black text-2xl rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-blue-100">1</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Set Up Your School</h3>
              <p className="text-gray-600">Import or create classes, subjects, teachers, and student directories to establish your structure.</p>
            </div>

            <div className="flex-1 relative">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 font-black text-2xl rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-indigo-100">2</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Run Daily Operations</h3>
              <p className="text-gray-600">Manage attendance smoothly, structure timetables, conduct exams, and process fee collections.</p>
            </div>

            <div className="flex-1 relative">
              <div className="w-16 h-16 bg-purple-50 text-purple-600 font-black text-2xl rounded-2xl flex items-center justify-center mb-6 relative z-10 border border-purple-100">3</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automate & Analyze</h3>
              <p className="text-gray-600">Use centralized dashboards and AI-powered voice calling to eliminate manual follow-ups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12 — BENEFITS */}
      <section className="py-24 px-4 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-900 mb-16 tracking-tight">Built to Save Time. Built to Scale.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Less Manual Work</h3>
              <p className="text-gray-600 text-lg">Reduce repetitive administrative tasks. Automate reporting, timetable scheduling, and parent follow-ups with ease.</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <LayoutDashboard className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Better Visibility</h3>
              <p className="text-gray-600 text-lg">Get real-time insight into school operations. Know exactly who is absent, fees pending, and academic performance instantly.</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mb-6">
                <Megaphone className="w-7 h-7 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Faster Communication</h3>
              <p className="text-gray-600 text-lg">Keep parents, teachers, and students connected with targeted announcements and secure Class Group feeds.</p>
            </div>

            <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smarter Decisions</h3>
              <p className="text-gray-600 text-lg">Use centralized data and high-level analytics to spot trends and make informed decisions about your institution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — SECURITY / RELIABILITY */}
      <section className="py-20 px-4 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your School Data. Organized and Protected.</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-gray-600 font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Role-based access</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Secure authentication</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Controlled permissions</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Reliable cloud infrastructure</span>
          </div>
        </div>
      </section>

      {/* SECTION 14 — FINAL CTA */}
      <section className="py-24 px-4 bg-blue-600 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tight">Ready to Make Your School Smarter?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Bring students, teachers, academics, attendance, fees and communication together in one powerful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/917989479005"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-700 px-8 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
            >
              Book a Demo <ArrowRight className="w-5 h-5" />
            </a>
            <Link 
              href="/login" 
              className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 border border-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-sm text-lg flex items-center justify-center"
            >
              Login to ERP
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 15 — FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6 text-white">
              <GraduationCap className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tight">SchoolERP</span>
            </div>
            <p className="text-sm">Smart School Management Platform built for the future of education.</p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Student Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Smart Attendance</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Exams & Marks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Fee Management</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Calling</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Solutions</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">For Principals</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Teachers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Entire Schools</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://wa.me/917989479005" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="https://wa.me/917989479005" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Book a Demo</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">System Login</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 SchoolERP. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
