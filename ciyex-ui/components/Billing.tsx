
import { CreditCard, Plus, Download } from "lucide-react";

export const Billing = () => {
  const bills = [
    {
      no: 1,
      service: "General Consultation",
      date: "2025-05-30",
      quantity: 1,
      unitPrice: 150.00,
      totalCost: 150.00,
      status: "Paid"
    }
  ];

  const summary = {
    total: 150.00,
    discount: 0.00,
    payable: 150.00,
    amountPaid: 150.00,
    unpaidAmount: 0.00
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-500 dark:text-blue-400" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Patient Bills</h2>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
              {bills.length} total records
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button className="bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-emerald-200 dark:border-emerald-700 flex items-center gap-2 justify-center">
              <Plus size={16} />
              Add Bill
            </button>
            <button className="bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 dark:hover:bg-purple-900/70 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-purple-200 dark:border-purple-700 flex items-center gap-2 justify-center">
              <Download size={16} />
              Generate Final Bill
            </button>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200/60 dark:border-blue-700/60 overflow-hidden">
          <div className="hidden lg:grid grid-cols-7 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">No</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Service</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Date</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Quantity</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Unit Price</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Cost</div>
            <div className="text-slate-600 dark:text-slate-400 text-sm font-medium">Action</div>
          </div>
          
          {bills.map((bill) => (
            <div key={bill.no} className="lg:grid lg:grid-cols-7 gap-4 p-4 border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-white/50 dark:hover:bg-slate-800/30 transition-all duration-300">
              {/* Mobile layout */}
              <div className="lg:hidden space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">#{bill.no}</span>
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs">
                    {bill.status}
                  </span>
                </div>
                <div>
                  <p className="text-slate-800 dark:text-slate-200 font-medium">{bill.service}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">{bill.date}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400 text-sm">Qty: {bill.quantity}</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">${bill.totalCost.toFixed(2)}</span>
                </div>
              </div>
              
              {/* Desktop layout */}
              <div className="hidden lg:contents">
                <div className="text-slate-800 dark:text-slate-200 font-medium">{bill.no}</div>
                <div className="text-slate-800 dark:text-slate-200">{bill.service}</div>
                <div className="text-slate-600 dark:text-slate-400">{bill.date}</div>
                <div className="text-slate-600 dark:text-slate-400">{bill.quantity}</div>
                <div className="text-slate-600 dark:text-slate-400">${bill.unitPrice.toFixed(2)}</div>
                <div className="text-slate-800 dark:text-slate-200 font-medium">${bill.totalCost.toFixed(2)}</div>
                <div>
                  <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-full text-xs">
                    {bill.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Total</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${summary.total.toFixed(2)}</p>
          </div>
          
          <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Discount</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${summary.discount.toFixed(2)}</p>
          </div>
          
          <div className="bg-blue-100 dark:bg-blue-900/50 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Payable</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${summary.payable.toFixed(2)}</p>
          </div>
          
          <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-lg p-4 border border-emerald-200 dark:border-emerald-700">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Amount Paid</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${summary.amountPaid.toFixed(2)}</p>
          </div>
          
          <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-4 border border-red-200 dark:border-red-700 col-span-2 lg:col-span-1">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Unpaid Amount</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200">${summary.unpaidAmount.toFixed(2)}</p>
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
};
