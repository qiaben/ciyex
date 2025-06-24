"use client";

import { useState } from "react";
import { ProfileImage } from "../../../../../components/profile-image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  gender?: string | null;
  img?: string | null;
  colorCode?: string | null;
  visits: number;
}

interface AllPatientsClientProps {
  patients: Patient[];
}

export default function AllPatientsClient({ patients }: AllPatientsClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 relative">
      <Link
        href="/doctor"
        className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 font-medium text-sm bg-white hover:bg-gray-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 z-20"
        style={{ position: 'absolute', top: 16, left: 16 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">All Patients</h1>
      <ul className="bg-white rounded-2xl shadow divide-y divide-gray-100">
        {patients.map((p) => {
          const gender = (p.gender ?? '').toLowerCase();
          let genderClass = 'bg-gray-100 text-gray-500';
          if (gender === 'male') genderClass = 'bg-blue-50 text-blue-600';
          else if (gender === 'female') genderClass = 'bg-pink-50 text-pink-600';
          return (
            <li key={p.id} className="flex items-center gap-4 py-4 px-6">
              <ProfileImage
                url={p.img!}
                name={`${p.first_name} ${p.last_name}`}
                className="size-10"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{p.first_name} {p.last_name}</div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 ${genderClass}`}>{p.gender ?? 'Other'}</span>
                <div className="text-xs text-gray-500 mt-1">Visits: <span className="font-semibold text-gray-700">{p.visits}</span></div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500 text-blue-600 font-semibold text-xs bg-white hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                View
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
      {/* Under Construction Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={e => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
            <span className="text-4xl mb-2">🚧</span>
            <h2 className="text-lg font-bold mb-2 text-gray-900">Under Construction</h2>
            <p className="text-gray-600 text-sm mb-4 text-center">This feature is coming soon!</p>
            <button
              type="button"
              className="mt-2 px-4 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={() => setModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 