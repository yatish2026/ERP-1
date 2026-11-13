"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/supabase/client";
import { getStudentFeesServer, FeeRecord } from "@/app/actions/fees";
import { 
  IndianRupee, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download, 
  Receipt, 
  ShieldCheck, 
  Loader2,
  Calendar,
  Building,
  HelpCircle
} from "lucide-react";

export default function StudentFeesPage() {
  const [loading, setLoading] = useState(true);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [selectedTab, setSelectedTab] = useState<"all" | "paid" | "pending">("all");

  useEffect(() => {
    const fetchFees = async (uid: string) => {
      const res = await getStudentFeesServer(uid);
      if (res.success && res.data) {
        setFees(res.data);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchFees(user.uid);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
      </div>
    );
  }

  const totalFees = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalPaid = fees.filter(f => f.status === "Paid").reduce((acc, f) => acc + f.amount, 0);
  const totalPending = fees.filter(f => f.status !== "Paid").reduce((acc, f) => acc + f.amount, 0);

  const filteredFees = fees.filter(f => {
    if (selectedTab === "paid") return f.status === "Paid";
    if (selectedTab === "pending") return f.status !== "Paid";
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 border-b pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <IndianRupee className="text-blue-600 w-8 h-8" /> 
              Fee Structure & Receipts
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              View your semester tuition fees, hostel/mess charges, and official payment receipts.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-4 h-4" /> Academic Year 2026-27
            </span>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Billed</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">₹{totalFees.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Paid</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-0.5">₹{totalPaid.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Pending Dues</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-0.5">₹{totalPending.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 mb-6 border-b border-gray-100 pb-3">
        <button
          onClick={() => setSelectedTab("all")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedTab === "all"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          All Invoices ({fees.length})
        </button>
        <button
          onClick={() => setSelectedTab("paid")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedTab === "paid"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Paid ({fees.filter(f => f.status === "Paid").length})
        </button>
        <button
          onClick={() => setSelectedTab("pending")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            selectedTab === "pending"
              ? "bg-amber-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Pending ({fees.filter(f => f.status !== "Paid").length})
        </button>
      </div>

      {/* Fees List */}
      <div className="space-y-4">
        {filteredFees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No fee records found in this category.</p>
          </div>
        ) : (
          filteredFees.map((fee) => {
            const isPaid = fee.status === "Paid";
            return (
              <div 
                key={fee.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:border-gray-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3.5 rounded-2xl mt-0.5 ${isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-900 text-base">{fee.feeType}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        isPaid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {fee.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Due: {fee.dueDate}
                      </span>
                      {fee.paymentDate && (
                        <span className="flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Paid on: {fee.paymentDate}
                        </span>
                      )}
                      {fee.transactionId && (
                        <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          Ref: {fee.transactionId}
                        </span>
                      )}
                      {fee.paymentMethod && (
                        <span className="text-gray-600">
                          Via: {fee.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-xl font-black text-gray-900">₹{fee.amount.toLocaleString()}</p>
                  </div>
                  {isPaid ? (
                    <button 
                      onClick={() => alert(`Receipt downloaded for Invoice: ${fee.transactionId || fee.id}`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Receipt
                    </button>
                  ) : (
                    <button 
                      onClick={() => alert(`Online payment portal initiated for ₹${fee.amount.toLocaleString()}. Proceeding with secure payment gateway...`)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* College Accounts Help Box */}
      <div className="mt-8 bg-blue-50/70 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-900 space-y-1">
          <p className="font-bold text-sm text-blue-950">College Accounts & Fee Desk</p>
          <p>For scholarship fee adjustments, bank DD submissions, or education loan tax certificates, please contact the College Bursar & Accounts Office (Room 104, Admin Block) or email <span className="font-semibold underline">accounts@college.edu</span>.</p>
        </div>
      </div>
    </div>
  );
}
