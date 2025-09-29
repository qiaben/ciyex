'use client';

import AdminLayout from '@/app/(admin)/layout';
import ListOrg from '@/components/common/ListOrg';

export default function ManagePage() {
  return (
    <AdminLayout>
        <ListOrg />
    </AdminLayout>
  );
}
