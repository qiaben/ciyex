import { getCurrentUserFromToken } from "../../../../utils/auth";
import db from "@/lib/db";
import AllPatientsClient from "./all-patients-client";

interface Patient {
    id: string; // Ensure this matches your database type (string or number)
    first_name: string;
    last_name: string;
    gender: string;
    img: string | null;
    colorCode: string | null;
}

interface Appointment {
    patient: Patient;
    appointment_date: Date;
    patient_id: string;
    doctor_id: string;  // Make sure doctor_id is of type string or cast it to string if it's a number
    status: string; // Assuming you're using a status type
}

export default async function AllPatientsPage() {
    const user = await getCurrentUserFromToken();
    if (!user?.userId) {
        return <div>Unauthorized</div>;
    }

    // Get all appointments for this doctor, ensuring the doctor_id is a string
    const appointments: Appointment[] = await db.appointment.findMany({
        where: { doctor_id: String(user.userId) },  // Cast user.userId to string if it's a number
        include: {
            patient: {
                select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                    gender: true,
                    img: true,
                    colorCode: true,
                },
            },
        },
        orderBy: { appointment_date: "desc" },
    });

    // Unique patients by id, and count visits
    const patientMap = new Map<string, { patient: Patient; visits: number }>();
    for (const a of appointments) {
        if (!a.patient) continue;
        const patientId = String(a.patient.id); // Ensure patient ID is a string
        if (!patientMap.has(patientId)) {
            patientMap.set(patientId, { patient: a.patient, visits: 1 });
        } else {
            patientMap.get(patientId)!.visits += 1;
        }
    }

    const patients = Array.from(patientMap.values()).map(({ patient, visits }) => ({
        ...patient,
        visits,
    }));

    return <AllPatientsClient patients={patients} />;
}
