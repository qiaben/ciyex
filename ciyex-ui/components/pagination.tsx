"use client";

import React, { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  totalPages: number;
  limit: number;
}

export const Pagination = ({
  totalPages,
  currentPage,
  totalRecords,
  limit,
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const handlePrevious = () => {
    if (currentPage > 1) {
      router.push(
        pathname + "?" + createQueryString("p", (currentPage - 1).toString())
      );
      // router.push(`?p=${currentPage - 1}`);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      // router.push(`?p=${currentPage + 1}`);
      router.push(
        pathname + "?" + createQueryString("p", (currentPage + 1).toString())
      );
    }
  };

  if (totalRecords === 0) return null;

  return (
    <div className="py-6 flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 font-semibold hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Previous Page"
      >
        <span className="text-lg">←</span>
        Prev
      </button>
      <span className="text-sm font-medium text-gray-700 px-3">
        Page <span className="font-bold text-emerald-600">{currentPage}</span> of <span className="font-bold">{totalPages}</span>
      </span>
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-4 py-2 rounded-full border border-gray-200 bg-white shadow-sm text-gray-700 font-semibold hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Next Page"
      >
        Next
        <span className="text-lg">→</span>
      </button>
    </div>
  );
};