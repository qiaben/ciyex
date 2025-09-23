"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SuperAdminOrg {
  orgId: number;
  orgName: string;
  roles: string[];
}

const PracticeSwitch: React.FC = () => {
  const [orgs, setOrgs] = useState<SuperAdminOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      // Load orgs from localStorage (saved during SuperAdminSignIn)
      const storedOrgs = JSON.parse(localStorage.getItem("orgs") || "[]");

      // Filter only SUPER_ADMIN roles
      const superAdminOrgs: SuperAdminOrg[] = storedOrgs.filter(
        (org: SuperAdminOrg) => org.roles.includes("SUPER_ADMIN")
      );

      setOrgs(superAdminOrgs);

      // Auto-select if only one SUPER_ADMIN org
      if (superAdminOrgs.length === 1) {
        handleOrgSelect(superAdminOrgs[0].orgId, superAdminOrgs[0].orgName);
      }
    } catch (err) {
      console.error("Error loading superadmin orgs:", err);
      setOrgs([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOrgSelect = (orgId: number, orgName: string) => {
    localStorage.setItem("orgId", String(orgId));
    localStorage.setItem("orgName", orgName);
    router.push(`/dashboard?orgId=${orgId}`); // ✅ fixed
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Loading organizations...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Select an Organization</h2>
        <div className="space-y-3">
          {orgs.length > 0 ? (
            orgs.map((org) => (
              <button
                key={org.orgId}
                onClick={() => handleOrgSelect(org.orgId, org.orgName)}
                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md transition"
              >
                {org.orgName || `Org #${org.orgId}`}
              </button>
            ))
          ) : (
            <p>No organizations with SUPER_ADMIN role found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PracticeSwitch;
