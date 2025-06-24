import { getPaymentRecords } from "@/utils/services/payment";
import { checkRole } from "@/utils/roles";
import { generateMissingBills } from "@/scripts/generate-missing-bills";
import db from "@/lib/db";
import BillingTableClient from "./BillingTableClient";
import { SearchParamsProps } from "@/types";

export default async function BillingPage(props: SearchParamsProps) {
  await generateMissingBills();
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;
  const { data, totalPages, totalRecords, currentPage } = await getPaymentRecords({ page, search: searchQuery });
  const isAdmin = await checkRole("ADMIN");
  if (!data) return null;
  // Fetch PatientBills and Services for each payment
  const paymentsWithServices = await Promise.all(
    data.map(async (payment) => {
      // Fetch the service name, price, and appointment status via PatientIntake
      const appointment = await db.appointment.findUnique({
        where: { id: payment.appointment_id },
        include: {
          patientIntake: {
            include: {
              service: {
                select: { service_name: true, price: true, id: true }
              }
            }
          }
        }
      });
      const serviceName = appointment?.patientIntake?.service?.service_name || null;
      const servicePrice = appointment?.patientIntake?.service?.price || 0;
      const serviceId = appointment?.patientIntake?.service?.id || null;
      const appointment_status = appointment?.status || null;
      return { ...payment, serviceName, servicePrice, serviceId, appointment_status };
    })
  );

  let totalServiceCharges = 0;
  paymentsWithServices.forEach((payment) => {
    totalServiceCharges += payment.servicePrice || 0;
  });

  return (
    <BillingTableClient
      paymentsWithServices={paymentsWithServices}
      totalPages={totalPages}
      totalRecords={totalRecords}
      currentPage={currentPage}
      isAdmin={isAdmin}
      totalServiceCharges={totalServiceCharges}
    />
  );
}