"use client";

import { useEffect, useState } from "react";
import { getAllFeesRecordsServer, getCollegeFeesStatsServer, FeeRecord } from "@/app/actions/fees";
import { getStudentsServer } from "@/app/actions/students";
import { exportToCsv } from "@/lib/exportUtils";
import { 
  IndianRupee, 
  Download, 
  CheckCircle2, 
  Clock, 
  Building, 
  Loader2, 
  Search, 
  Filter,
  Users,
  CreditCard
} from "lucide-react";

export default function PrincipalFeesPage() {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalCollected: 0, pendingAmount: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [feesRes, studentsRes, statsRes] = await Promise.all([
        getAllFeesRecordsServer(),
        getStudentsServer(),
        getCollegeFeesStatsServer()
      ]);

      if (feesRes.success && feesRes.data) {
        setFees(feesRes.data);
      }
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
      }
      if (statsRes.success) {
        setStats({
          totalCollected: statsRes.totalCollected || 0,
          pendingAmount: statsRes.pendingAmount || 0
        });
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const studentMap = new Map(students.map(s => [s.uid, s]));

  const enrichedFees = fees.map(f => {
    const student = studentMap.get(f.studentId);
    return {
      ...f,
      studentName: student ? student.name : "Student",
      rollNumber: student ? student.rollNumber : "N/A",
      classId: student ? student.classId : "N/A"
    };
  });

  const filteredFees = enrichedFees.filter(f => {
    const matchesSearch = 
      f.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.feeType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === "paid") return matchesSearch && f.status === "Paid";
    if (statusFilter === "pending") return matchesSearch && f.status !== "Paid";
    return matchesSearch;
  });

  const handleDownloadFeesCsv = () => {
    const headers = ["Invoice ID", "Student Name", "Roll Number", "Class", "Fee Type", "Amount (INR)", "Status", "Due Date"];
    const rows = filteredFees.map(f => [
      f.id,
      f.studentName,
      f.rollNumber,
      f.classId,
      f.feeType,
      f.amount,
      f.status,
      f.dueDate || "N/A"
    ]);

    exportToCsv("College_Fee_Collection_Report", headers, rows);
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  const grandTotal = stats.totalCollected + stats.pendingAmount;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 border-b pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <IndianRupee className="text-blue-600 w-8 h-8" /> 
            College Fee Collection & Accounts
          </h2>
          <p className="text-sm md:text-base text-gray-600 mt-2">
            Monitor tuition fee collections, hostel charges, outstanding dues, and download reconciliation reports.
          </p>
        </div>
        <button
          onClick={handleDownloadFeesCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Export Fees CSV ({filteredFees.length})
        </button>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Billed</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">₹{grandTotal.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Collected</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">₹{stats.totalCollected.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Outstanding Dues</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5">₹{stats.pendingAmount.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900">Fee Transactions Ledger</h3>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search student, roll no..."
                className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl w-full focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl p-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {filteredFees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No fee records found matching your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider bg-gray-50/50">
                  <th className="p-3.5 rounded-l-xl">Student Name</th>
                  <th className="p-3.5">Roll Number</th>
                  <th className="p-3.5">Class / Batch</th>
                  <th className="p-3.5">Fee Particulars</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredFees.map(fee => {
                  const isPaid = fee.status === "Paid";
                  return (
                    <tr key={fee.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-gray-900">{fee.studentName}</td>
                      <td className="p-3.5 font-mono text-xs text-gray-600">{fee.rollNumber}</td>
                      <td className="p-3.5 text-xs text-blue-700 font-medium">{fee.classId}</td>
                      <td className="p-3.5 text-gray-700">{fee.feeType}</td>
                      <td className="p-3.5 font-bold text-gray-900">₹{fee.amount.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            const headers = ["Invoice ID", "Student Name", "Roll No", "Fee Type", "Amount", "Status"];
                            const row = [[fee.id, fee.studentName, fee.rollNumber, fee.feeType, fee.amount, fee.status]];
                            exportToCsv(`Fee_Receipt_${fee.rollNumber}`, headers, row);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Download className="w-3 h-3" /> Receipt
                        </button>
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
  );
}
