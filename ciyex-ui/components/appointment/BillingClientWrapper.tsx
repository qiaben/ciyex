"use client";
import { CreditCard, ReceiptText, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { AddBills } from "../dialogs/add-bills";
import { GenerateFinalBills } from "./generate-final-bill";
import BillingInvoiceDownload from "./BillingInvoiceDownload";
import { ActionDialog } from "../action-dialog";

export default function BillingClientWrapper({ bills, payment, appointmentId, isAdmin, isDoctor, servicesData }: any) {
  const PLATFORM_FEE = 2.99;
  const totalBills = bills.length;
  const totalAmountPaid = bills.reduce((sum: number, bill: any) => sum + bill.total_cost, 0) + (totalBills > 0 ? PLATFORM_FEE : 0);
  const totalWithFee = totalAmountPaid;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="flex flex-col sm:flex-row gap-4 mb-2 sm:mb-4 justify-center items-center">
        <div className="flex-1 min-w-[220px] bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow p-6 flex flex-col items-center justify-center">
          <ReceiptText size={36} className="text-blue-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{totalBills}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Bills</div>
        </div>
        <div className="flex-1 min-w-[220px] bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow p-6 flex flex-col items-center justify-center">
          <DollarSign size={36} className="text-emerald-500 mb-2" />
          <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">${totalAmountPaid.toFixed(2)}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Total Amount</div>
        </div>
      </div>
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-500 dark:text-blue-400" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Bills</h2>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
              {bills.length} total records
            </span>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <AddBills id={appointmentId} appId={appointmentId} servicesData={servicesData} />
              <GenerateFinalBills id={appointmentId} total_bill={totalWithFee} />
            </div>
          )}
        </div>
        {/* Bills Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Unit Cost</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                {isAdmin && (
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill: any) => (
                <tr key={bill.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-3 px-4">{bill.service?.service_name}</td>
                  <td className="py-3 px-4">{format(new Date(bill.service_date), "MMM d, yyyy")}</td>
                  <td className="py-3 px-4">{bill.quantity}</td>
                  <td className="py-3 px-4">${bill.unit_cost.toFixed(2)}</td>
                  <td className="py-3 px-4">${bill.total_cost.toFixed(2)}</td>
                  {isAdmin && (
                    <td className="py-3 px-4 text-right">
                      <ActionDialog type="delete" id={bill.id.toString()} deleteType="bill" />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Total (with Platform Fee)</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${totalWithFee.toFixed(2)}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Payment Method</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{payment?.payment_method || "-"}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/50 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Bill Status</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">{payment?.status || "-"}</p>
          </div>
        </div>
      </div>
      {/* Payment History */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Payment History</h3>
        <div className="text-center py-8">
          <CreditCard className="text-slate-400 dark:text-slate-500 mx-auto mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-400">No payment data found</p>
        </div>
      </div>
    </div>
  );
} 