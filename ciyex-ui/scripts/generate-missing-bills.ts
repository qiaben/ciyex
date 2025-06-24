import db from "@/lib/db";

const PLATFORM_FEE = 2.99;

export async function generateMissingBills() {
  // Find all past appointments without a Payment and with valid payment_method
  const appointments = await db.appointment.findMany({
    where: {
      appointment_date: { lt: new Date() },
      bills: null, // Only appointments with no Payment
      payment_method: { in: ["CARD", "AMAZON_PAY", "CASH_PAY"] },
    },
    select: {
      id: true,
      patient_id: true,
      payment_method: true,
      patientIntake: {
        select: {
          service_id: true,
          service: {
            select: {
              price: true,
            }
          }
        }
      }
    }
  });

  let created = 0;
  for (const appt of appointments) {
    // Create the Payment
    const payment = await db.payment.create({
      data: {
        appointment_id: appt.id,
        patient_id: appt.patient_id,
        bill_date: new Date(),
        payment_date: new Date(),
        payment_method: appt.payment_method ?? undefined,
        status: "PAID",
      },
    });

    // Create a PatientBills record if service info is available
    const intakes = appt.patientIntake;
    if (Array.isArray(intakes) && intakes.length > 0) {
      const intake = intakes[0];
      if (intake?.service_id) {
        await db.patientBills.create({
          data: {
            bill_id: payment.id,
            service_id: intake.service_id,
            service_date: new Date(),
            quantity: 1,
            unit_cost: intake.service?.price ?? 0,
            total_cost: intake.service?.price ?? 0,
          },
        });
      }
    }

    created++;
  }
  console.log(`Generated ${created} missing bills.`);
}

// Run the script
if (require.main === module) {
  generateMissingBills().then(() => process.exit(0));
} 