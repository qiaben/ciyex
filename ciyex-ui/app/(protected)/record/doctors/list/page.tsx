import { ActionDialog } from "@/components/action-dialog";
import { ViewAction } from "@/components/action-options";
import { DoctorForm } from "@/components/forms/doctor-form";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { Button } from "@/components/ui/button";
import { SearchParamsProps } from "@/types";
import { checkRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/seeting";
import { getAllDoctors } from "@/utils/services/doctor";
import { Doctor } from "@prisma/client";
import { format } from "date-fns";
import { Users } from "lucide-react";
import React, { useState } from "react";
import { SheetContent } from "@/components/ui/sheet";
import DoctorsListToggle from "./DoctorsListToggle";

const columns = [
  {
    header: "Info",
    key: "name",
  },
  {
    header: "License",
    key: "license",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    key: "contact",
    className: "hidden md:table-cell",
  },
  {
    header: "Email",
    key: "email",
    className: "hidden lg:table-cell",
  },
  {
    header: "Joined Date",
    key: "created_at",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

const DoctorsList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const { data, totalPages, totalRecords, currentPage } = await getAllDoctors({
    page,
    search: searchQuery,
  });

  if (!data) return null;
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: Doctor) => (
    <tr
      key={item?.id}
      className="border-b border-border/40 even:bg-muted/50 text-sm hover:bg-muted/50 transition-colors"
    >
      <td className="flex items-center gap-4 p-4">
        <ProfileImage
          url={item?.img!}
          name={item?.name}
          className="size-10"
        />
        <div>
          <h3 className="uppercase font-medium">{item?.name}</h3>
          <span className="text-sm text-muted-foreground capitalize">{item?.specialization}</span>
        </div>
      </td>
      <td className="hidden md:table-cell text-muted-foreground">{item?.license_number}</td>
      <td className="hidden md:table-cell text-muted-foreground">{item?.phone}</td>
      <td className="hidden lg:table-cell text-muted-foreground">{item?.email}</td>
      <td className="hidden xl:table-cell text-muted-foreground">
        {item?.created_at ? format(new Date(item.created_at), "yyyy-MM-dd") : 'N/A'}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <ViewAction href={`/record/doctors/${item?.id}`} />
          {isAdmin && (
            <ActionDialog type="delete" id={item?.id} deleteType="doctor" />
          )}
        </div>
      </td>
    </tr>
  );

  const DoctorsListContent = (
    <>
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <Users size={20} className="text-muted-foreground" />
          <p className="text-2xl font-semibold text-foreground">{totalRecords}</p>
          <span className="text-muted-foreground text-sm xl:text-base">total doctors</span>
        </div>
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          {isAdmin && <DoctorForm />}
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-card rounded-xl py-6 px-3 2xl:px-6 border border-border/40">
      {DoctorsListContent}
      <DoctorsListToggle />
    </div>
  );
};

export default DoctorsList;