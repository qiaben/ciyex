'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Practice {
    orgId: number;
    orgName: string;
}

const PracticeSwitch: React.FC = () => {
    const [practices, setPractices] = useState<Practice[]>([]);
    const [userOrgIds, setUserOrgIds] = useState<number[]>([]);
    const router = useRouter();

    useEffect(() => {
        // Simulated data fetch for available practices
        const fetchedPractices: Practice[] = [
            { orgId: 1, orgName: "Qiaben Health" },
            { orgId: 2, orgName: "MediPlus" },
            { orgId: 3, orgName: "CareWell" }
        ];

        // Fetch the orgIds from localStorage
        const orgIdsFromStorage = JSON.parse(localStorage.getItem('orgIds') || '[]');
        setUserOrgIds(orgIdsFromStorage);

        // Filter practices based on orgIds from localStorage
        const filteredPractices = fetchedPractices.filter(practice => orgIdsFromStorage.includes(practice.orgId));
        setPractices(filteredPractices);
    }, []);

    const handlePracticeSelect = (orgId: number) => {
        // Proceed if the orgId is valid for the user
        if (userOrgIds.includes(orgId)) {
            localStorage.setItem('orgId', String(orgId));
            router.push(`/dashboard?orgId=${orgId}`);
        } else {
            alert("You do not have access to this practice.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Select a Practice</h2>
                <div className="space-y-3">
                    {practices.length > 0 ? (
                        practices.map((practice) => (
                            <button
                                key={practice.orgId}
                                onClick={() => handlePracticeSelect(practice.orgId)}
                                className="w-full p-3 text-left bg-gray-100 hover:bg-gray-200 rounded-md transition"
                            >
                                {practice.orgName}
                            </button>
                        ))
                    ) : (
                        <p>No available practices found for your account.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeSwitch;
