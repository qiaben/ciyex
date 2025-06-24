import db from "@/lib/db";
import { checkRole } from "@/utils/roles";
import { ReceiptText } from "lucide-react";
import { Table } from "../tables/table";
import { PatientBills } from "@prisma/client";
import { format, formatDate } from "date-fns";
import { ActionDialog } from "../action-dialog";
import { Separator } from "../ui/separator";
import { AddBills } from "../dialogs/add-bills";
import { GenerateFinalBills } from "./generate-final-bill";
import { CreditCard } from "lucide-react";

const columns = [
  {
    header: "No",
    key: "no",
    className: "hidden md:table-cell",
  },
  {
    header: "Service",
    key: "service",
  },
  {
    header: "Date",
    key: "date",
    className: "",
  },
  {
    header: "Quantity",
    key: "qnty",
    className: "hidden md:table-cell",
  },
  {
    header: "Unit Price",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    header: "Total Cost",
    key: "total",
    className: "",
  },
  {
    header: "Action",
    key: "action",
    className: "hidden xl:table-cell",
  },
];

interface ExtendedBillProps extends PatientBills {
  service: {
    service_name: string;
    id: number;
  };
}
export const BillsContainer = async ({ id }: { id: string }) => {
  const [data, servicesData] = await Promise.all([
    db.payment.findFirst({
      where: { appointment_id: Number(id) },
      include: {
        bills: {
          include: {
            service: { select: { service_name: true, id: true } },
          },
          orderBy: { created_at: "asc" },
        },
      },
    }),
    db.services.findMany(),
  ]);

  let totalBills = 0;

  const billData = data?.bills || [];

  if (billData) {
    totalBills = billData.reduce((sum, acc) => sum + acc.total_cost, 0);
  }

  const PLATFORM_FEE = 2.99;
  const totalWithFee = totalBills + PLATFORM_FEE;

  const renderRow = (item: ExtendedBillProps) => {
    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        <td className="hidden md:table-cell py-2 xl:py-6"># {item?.id}</td>
        <td className="items-center py-2">{item?.service?.service_name}</td>
        <td className="">{format(item?.service_date, "MMM d, yyyy")}</td>
        <td className="hidden items-center py-2 md:table-cell">
          {item?.quantity}
        </td>
        <td className="hidden lg:table-cell">{item?.unit_cost.toFixed(2)}</td>
        <td>{item?.total_cost.toFixed(2)}</td>
        <td className="hidden xl:table-cell">
          <ActionDialog
            type="delete"
            id={item?.id.toString()}
            deleteType="bill"
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <CreditCard className="text-blue-500 dark:text-blue-400" size={24} />
            <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-slate-100">Bills</h2>
            <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full text-sm">
              {billData.length} total records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Unit Cost</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody>
              {billData.map((bill: any) => (
                <tr key={bill.id} className="border-b border-slate-200 dark:border-slate-700">
                  <td className="py-3 px-4">{bill.service?.service_name}</td>
                  <td className="py-3 px-4">{format(new Date(bill.service_date), "MMM d, yyyy")}</td>
                  <td className="py-3 px-4">{bill.quantity}</td>
                  <td className="py-3 px-4">${bill.unit_cost.toFixed(2)}</td>
                  <td className="py-3 px-4">${bill.total_cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between md:text-center py-2 space-y-6 gap-4">
          <div className="w-[120px]">
            <span className="text-muted-foreground">Total Bill</span>
            <p className="text-xl font-semibold text-foreground">
              {totalWithFee.toFixed(2)}
            </p>
          </div>
          <div className="w-[120px]">
            <span className="text-muted-foreground">Payment Method</span>
            <p className="text-xl font-semibold text-foreground">
              {data?.payment_method || "-"}
            </p>
          </div>
          <div className="w-[120px]">
            <span className="text-muted-foreground">Status</span>
            <p className="text-xl font-semibold text-foreground">
              {data?.status || "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};