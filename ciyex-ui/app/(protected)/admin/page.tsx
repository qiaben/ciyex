import AnimatedDashboard from '../../../components/admin/AnimatedDashboard';
import { getAdminDashboardStats } from '@/utils/services/admin';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';

export const revalidate = 60;

export default async function AdminPage() {
  const result = await getAdminDashboardStats();
  const isAdmin = await checkRole('ADMIN');
  const { userId } = await auth();
  return <AnimatedDashboard result={result} isAdmin={isAdmin} userId={userId ?? ""} />;
}