import db from "@/lib/db";
import { Table } from "../tables/table";
import { Payment } from "@prisma/client";
import { format } from "date-fns";
import { ViewAction } from "../action-options";
import { checkRole } from "@/utils/roles";
import { ActionDialog } from "../action-dialog";

const columns = [
  {
    header: "No",
    key: "id",
  },
  {
    header: "Bill Date",
    key: "bill_date",
    className: "",
  },
  {
    header: "Payment Date",
    key: "pay_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Status",
    key: "status",
    className: "",
  },
  {
    header: "Actions",
    key: "action",
  },
];

export const PaymentsContainer = async ({
  patientId,
}: {
  patientId: string;
}) => {
  const data = await db.payment.findMany({
    where: { patient_id: patientId },
  });

  if (!data) return null;
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: Payment) => {
    return (
      <tr
        key={item.id}
        className="border-b border-border even:bg-muted/50 text-sm hover:bg-muted/70"
      >
        <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
          #{item?.id}
        </td>

        <td className="lowercase">{format(item?.bill_date, "MMM d, yyyy")}</td>
        <td className="hidden items-center py-2 md:table-cell">
          {format(item?.payment_date, "MMM d, yyyy")}
        </td>
        <td className="">{item?.status}</td>

        <td className="">
          <div className="flex items-center">
            <ViewAction
              href={`/record/appointments/${item?.appointment_id}?cat=bills`}
            />
            {isAdmin && (
              <ActionDialog
                type="delete"
                deleteType="payment"
                id={item?.id.toString()}
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      <Table columns={columns} data={data} renderRow={renderRow} />
    </div>
  );
};