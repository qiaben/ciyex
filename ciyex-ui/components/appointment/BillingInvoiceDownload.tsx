"use client";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Download } from "lucide-react";

const PLATFORM_FEE = 2.99;

const InvoicePDF = ({ bills, payment }: { bills: any[]; payment: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.body}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.logo}>MEDICARE CLINIC</Text>
        <Text style={pdfStyles.address}>123 Health St, Wellness City, USA</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Bill Date: {payment?.bill_date ? new Date(payment.bill_date).toLocaleDateString() : "-"}</Text>
        <Text>Payment Method: {payment?.payment_method || "-"}</Text>
        <Text>Status: {payment?.status || "-"}</Text>
      </View>
      <View style={pdfStyles.section}>
        <Text>Services:</Text>
        {bills.map((bill, idx) => (
          <Text key={bill.id}>
            {idx + 1}. {bill.service.service_name} - ${bill.unit_cost.toFixed(2)}
          </Text>
        ))}
        <Text>Platform Fee: ${PLATFORM_FEE.toFixed(2)}</Text>
        <Text>Total: ${(bills.reduce((sum, b) => sum + b.total_cost, 0) + PLATFORM_FEE).toFixed(2)}</Text>
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

export default function BillingInvoiceDownload({ bills, payment, appointmentId }: { bills: any[]; payment: any; appointmentId: string }) {
  return (
    <PDFDownloadLink
      document={<InvoicePDF bills={bills} payment={payment} />}
      fileName={`Invoice-${appointmentId}.pdf`}
      className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
    >
      {({ loading }) => loading ? "Preparing PDF..." : <><Download size={18} className="inline mr-1" />Download Invoice</>}
    </PDFDownloadLink>
  );
} 