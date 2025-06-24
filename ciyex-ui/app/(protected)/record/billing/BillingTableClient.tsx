"use client";
import { useState } from "react";
import { ActionDialog } from "@/components/action-dialog";
import { ViewAction } from "@/components/action-options";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { cn } from "@/lib/utils";
import { ReceiptText, BadgeDollarSign, Info, X, FileText, CreditCard, Banknote, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

function StatusBadge({ status }: { status: string }) {
  let color = "bg-gray-200 text-gray-700 border border-gray-300";
  if (status === "PAID") color = "bg-emerald-100 text-emerald-700 border border-emerald-200";
  else if (status === "UNPAID") color = "bg-red-100 text-red-700 border border-red-200";
  else if (status === "PART") color = "bg-yellow-100 text-yellow-700 border border-yellow-200";
  else if (status === "COMPLETED") color = "bg-blue-100 text-blue-700 border border-blue-200";
  else if (status === "CANCELLED") color = "bg-gray-100 text-gray-500 border border-gray-200";
  return <span className={cn("px-2 py-1 rounded-full text-xs font-semibold shadow-sm", color)}>{status}</span>;
}

// PDF Invoice component
const InvoicePDF = ({ bill }: { bill: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.body}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.logo}>MEDICARE CLINIC</Text>
        <Text style={pdfStyles.address}>123 Health St, Wellness City, USA</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Date: {bill.bill_date ? new Date(bill.bill_date).toLocaleDateString() : "-"}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Patient: {bill.patient?.first_name} {bill.patient?.last_name}</Text>
        <Text>Gender: {bill.patient?.gender}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Service: {bill.serviceName} (#{bill.serviceId})</Text>
        <Text>Service Fee: ${bill.servicePrice?.toFixed(2)}</Text>
        <Text>Platform Fee: $2.99</Text>
        <Text>Total: ${(bill.servicePrice + 2.99).toFixed(2)}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Bill Status: {bill.status}</Text>
        <Text>Appointment Status: {bill.appointment_status}</Text>
        <Text>Payment Method: {bill.payment_method}</Text>
        <Text>Payment Date: {bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : "-"}</Text>
      </View>
    </Page>
  </Document>
);

const pdfStyles = StyleSheet.create({
  body: { padding: 32, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 16, borderBottom: '1 solid #eee', paddingBottom: 8 },
  logo: { fontSize: 20, fontWeight: 700, color: '#2563eb', marginBottom: 4 },
  address: { fontSize: 10, color: '#888' },
  section: { marginBottom: 12 },
});

export default function BillingTableClient({
  paymentsWithServices,
  totalPages,
  totalRecords,
  currentPage,
  totalPlatformFees,
  isAdmin,
  totalServiceCharges
}: any) {
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const handleOpenModal = (bill: any) => {
    setSelectedBill(bill);
    setModalOpen(true);
  };
  const handleOpenInvoiceModal = (bill: any) => {
    setSelectedBill(bill);
    setInvoiceModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBill(null);
  };
  const handleCloseInvoiceModal = () => {
    setInvoiceModalOpen(false);
    setSelectedBill(null);
  };

  // Animated summary cards
  const summaryCards = [
    { label: "Total Bills", value: totalRecords, icon: <ReceiptText size={32} className="text-blue-500 mb-2" /> },
    { label: "Total Service Charges", value: `$${totalServiceCharges.toFixed(2)}`, icon: <BadgeDollarSign size={32} className="text-emerald-500 mb-2" /> },
  ];

  const renderRow = (item: any, idx: number) => {
    const name = item?.patient?.first_name + " " + item?.patient?.last_name;
    const patient = item?.patient;
    const serviceNames = item.serviceName ? `${item.serviceName} (#${item.serviceId || "?"})` : "N/A";
    const serviceFee = item.servicePrice || 0;
    const platformFee = 2.99;
    const totalFee = serviceFee + platformFee;
    return (
      <motion.tr
        key={item?.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
        className="border-b border-slate-100 dark:border-slate-800 even:bg-white/60 dark:even:bg-slate-900/60 hover:bg-blue-50/60 dark:hover:bg-blue-900/30 transition-all duration-200"
      >
        <td className="px-6 py-4 font-semibold align-middle">{item?.id}</td>
        <td className="px-6 py-4 flex items-center gap-3 align-middle">
          <ProfileImage url={patient?.img!} name={name} className="size-8 shadow" />
          <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-muted-foreground">{patient?.gender}</div>
          </div>
        </td>
        <td className="px-6 py-4 align-middle">{item.serviceName || "N/A"}</td>
        <td className="px-6 py-4 align-middle">{item?.bill_date ? new Date(item?.bill_date).toLocaleDateString() : "-"}</td>
        <td className="px-6 py-4 align-middle">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100">${totalFee.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground mt-1">
            Service Fee = ${serviceFee.toFixed(2)}<br />
            Platform Fee = $2.99
          </div>
        </td>
        <td className="px-6 py-4 align-middle"><StatusBadge status={"PAID"} /></td>
        <td className="px-6 py-4 align-middle"><StatusBadge status={item?.appointment_status || "-"} /></td>
        <td className="px-6 py-4 flex items-center gap-2 align-middle">
          {item.payment_method === "CARD" && <CreditCard size={16} className="text-blue-500" />}
          {item.payment_method === "CASH_PAY" && <Banknote size={16} className="text-green-500" />}
          {item.payment_method === "AMAZON_PAY" && <FileText size={16} className="text-yellow-500" />}
          <span>{item.payment_method}</span>
        </td>
        <td className="px-6 py-4 align-middle">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs font-medium flex items-center gap-1 shadow-sm hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30" onClick={() => handleOpenInvoiceModal(item)}>
              <FileText size={16} className="text-emerald-500" /> Download Invoice
            </Button>
            {isAdmin && (
              <ActionDialog type="delete" deleteType="payment" id={item?.id.toString()} />
            )}
          </div>
        </td>
      </motion.tr>
    );
  };

  function BillDetailsModal({ open, onOpenChange, bill }: { open: boolean; onOpenChange: (v: boolean) => void; bill: any }) {
    if (!bill) return null;
    const platformFee = 2.99;
    const totalFee = (bill.servicePrice ?? 0) + platformFee;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ReceiptText className="text-blue-500" size={28} /> Bill Details
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400">Receipt #{bill.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-4">
              <ProfileImage url={bill.patient.img!} name={bill.patient.first_name + ' ' + bill.patient.last_name} className="size-14 shadow-lg" />
              <div>
                <div className="font-semibold text-lg">{bill.patient.first_name} {bill.patient.last_name}</div>
                <div className="text-xs text-muted-foreground">{bill.patient.gender}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold mb-2">Service</div>
              <table className="w-full text-sm mb-2">
                <thead>
                  <tr>
                    <th className="text-left">Service</th>
                    <th className="text-right">Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{bill.serviceName}</td>
                    <td className="text-right">${(bill.servicePrice ?? 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Platform Fee</span>
                <span className="font-medium">$2.99</span>
              </div>
              <div className="flex justify-between mt-2 border-t pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold">${(bill.servicePrice ?? 0).toFixed(2)} + $2.99 = ${totalFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Bill Status</span>
                <StatusBadge status={bill.status} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Appointment Status</span>
                <StatusBadge status={bill.appointment_status || "-"} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Payment Method</span>
                <span>{bill.payment_method}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Bill Date</span>
                <span>{bill.bill_date ? new Date(bill.bill_date).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-medium">Payment Date</span>
                <span>{bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : "-"}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Invoice Modal
  function InvoiceModal({ open, onOpenChange, bill }: { open: boolean; onOpenChange: (v: boolean) => void; bill: any }) {
    if (!bill) return null;
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="text-blue-500" size={28} /> Invoice
            </DialogTitle>
            <DialogDescription className="text-base text-slate-500 dark:text-slate-400">Invoice for Bill #{bill.id}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-bold text-lg text-blue-700">MEDICARE CLINIC</div>
                <div className="text-xs text-muted-foreground">123 Health St, Wellness City, USA</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Date</div>
                <div>{bill.bill_date ? new Date(bill.bill_date).toLocaleDateString() : "-"}</div>
              </div>
            </div>
            <div className="border-b border-slate-200 my-4" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold">Patient</div>
                <div>{bill.patient?.first_name} {bill.patient?.last_name}</div>
                <div className="text-xs text-muted-foreground">{bill.patient?.gender}</div>
              </div>
              <div>
                <div className="font-semibold">Payment Method</div>
                <div>{bill.payment_method}</div>
              </div>
            </div>
            <div className="border-b border-slate-200 my-4" />
            <div>
              <div className="font-semibold mb-2">Service Details</div>
              <div className="flex justify-between">
                <span>{bill.serviceName} (#{bill.serviceId})</span>
                <span>${(bill.servicePrice ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>Platform Fee</span>
                <span>$2.99</span>
              </div>
              <div className="flex justify-between mt-2 border-t pt-2 font-bold">
                <span>Total</span>
                <span>${((bill.servicePrice ?? 0) + 2.99).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-b border-slate-200 my-4" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-semibold">Bill Status</div>
                <StatusBadge status={bill.status} />
              </div>
              <div>
                <div className="font-semibold">Appointment Status</div>
                <StatusBadge status={bill.appointment_status || "-"} />
              </div>
              <div>
                <div className="font-semibold">Payment Date</div>
                <div>{bill.payment_date ? new Date(bill.payment_date).toLocaleDateString() : "-"}</div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <PDFDownloadLink
                document={<InvoicePDF bill={bill} />}
                fileName={`Invoice-${bill.id}.pdf`}
                className="btn btn-primary px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
              >
                {({ loading }) => loading ? "Preparing PDF..." : "Download PDF"}
              </PDFDownloadLink>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100/60 via-purple-100/40 to-emerald-100/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-10 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Animated Summary Cards */}
        <div className="w-full flex flex-col sm:flex-row gap-6 mb-8 justify-center items-center max-w-7xl mx-auto">
          {summaryCards.map((card, idx) => (
            <motion.div
              key={card.label}
              className="glass-card flex flex-col items-center flex-1 min-w-0 w-full sm:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              {card.icon}
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
            </motion.div>
          ))}
        </div>
        {/* Search and Table */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <ReceiptText className="text-blue-500" size={32} />
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Billing Overview</h2>
            </div>
            <div className="w-full sm:w-auto">
              <SearchInput />
            </div>
          </div>
          <div className="overflow-x-auto rounded-2xl shadow-inner">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="sticky top-0 z-10 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Bill ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Service Name(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Bill Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Appointment Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/70 dark:bg-slate-900/70 divide-y divide-slate-100 dark:divide-slate-800">
                {paymentsWithServices.map(renderRow)}
              </tbody>
            </table>
          </div>
          <div className="mt-8">
            <Pagination totalPages={totalPages} currentPage={currentPage} totalRecords={totalRecords} limit={10} />
          </div>
        </div>
      </div>
      <BillDetailsModal open={modalOpen} onOpenChange={setModalOpen} bill={selectedBill} />
      <InvoiceModal open={invoiceModalOpen} onOpenChange={setInvoiceModalOpen} bill={selectedBill} />
      <style jsx global>{`
        .glass-card {
          background: rgba(255,255,255,0.7);
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.10);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 2rem 1.5rem;
          transition: box-shadow 0.2s;
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.18);
        }
      `}</style>
    </div>
  );
} 