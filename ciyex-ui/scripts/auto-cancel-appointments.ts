import { autoCancelPastAppointments } from '../utils/services/appointment';
 
(async () => {
  const count = await autoCancelPastAppointments();
  console.log(`Auto-cancelled ${count} overdue appointments.`);
  process.exit(0);
})(); 