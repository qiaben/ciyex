'use client';
import { useEffect, useState } from 'react';
import { getServices } from "@/utils/services/admin";
import { Services } from "@prisma/client";
import { AddService } from "../dialogs/add-service";
import { Table } from "../tables/table";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

const columns = [
  {
    header: "ID",
    key: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Service Name",
    key: "name",
    className: "hidden md:table-cell",
  },
  {
    header: "Price",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    key: "description",
    className: "hidden xl:table-cell",
  },
  // {
  //   header: "Actions",
  //   key: "action",
  // },
];

export const ServiceSettings = () => {
  const [data, setData] = useState<Services[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getServices()
      .then(res => {
        if (mounted) {
          setData(res.data || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError('Failed to load services');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const renderRow = (item: Services) => (
    <tr
      key={item.id}
      className="border-b border-border even:bg-muted/50 text-sm hover:bg-muted/70"
    >
      <td className="flex items-center gap-2 md:gap-4 py-4">{item?.id}</td>
      <td className="hidden md:table-cell">{item.service_name}</td>
      <td className="hidden md:table-cell capitalize">
        {item?.price?.toFixed(2)}
      </td>
      <td className="hidden xl:table-cell w-[50%]">
        <p className="line-clamp-1">{item.description || ''}</p>
      </td>
      <td>
        {/* <div className="flex items-center gap-2">
              <Link href={`/list/teachers/${item?.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                  View
                </button>
              </Link>
    
              {checkRole("ADMIN") && (
                <ActionDialog
                  type="delete"
                  id={item.id.toString()}
                  deleteType="auditLog"
                />
              )}
            </div> */}
      </td>
    </tr>
  );

  return (
    <>

      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : (
          <Table columns={columns} renderRow={renderRow} data={data} />
        )}
      </CardContent>
    </>
  );
};