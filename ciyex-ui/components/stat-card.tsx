import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import { formatNumber } from "@/utils";

interface CardProps {
  title: string;
  icon: LucideIcon;
  note: string;
  value: number | string;
  className?: string;
  iconClassName?: string;
  link: string;
}

const CardIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon />;
};
export const StatCard = ({
  title,
  icon,
  note,
  value,
  className,
  iconClassName,
  link,
}: CardProps) => {
  // Accent color and icon color based on card type
  let accent = "text-blue-600 border-blue-400";
  if (title.toLowerCase().includes("cancel")) accent = "text-rose-600 border-rose-400";
  if (title.toLowerCase().includes("pending")) accent = "text-yellow-600 border-yellow-400";
  if (title.toLowerCase().includes("complete")) accent = "text-emerald-600 border-emerald-400";

  return (
    <Card
      className={cn(
        `relative w-full md:w-[330px] 2xl:w-[250px] rounded-xl border border-border bg-card shadow-sm p-4 flex flex-col gap-3 transition-all duration-300 group hover:shadow-md hover:scale-[1.03]`,
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between py-2 px-0 capitalize bg-transparent">
        <h3 className="font-semibold text-base text-foreground tracking-tight">{title}</h3>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="font-normal text-xs bg-transparent p-2 h-7 hover:underline text-muted-foreground hover:text-primary"
        >
          <Link href={link}>See Details</Link>
        </Button>
      </CardHeader>

      <CardContent className="flex items-center gap-4 px-0 py-2">
        {/* Minimal icon with accent border */}
        <div
          className={cn(
            `flex items-center justify-center w-12 h-12 rounded-full border-2 bg-background ${accent}`,
            iconClassName
          )}
        >
          <span className="text-2xl">
            <CardIcon icon={icon} />
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <h2 className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? formatNumber(value) : value}
          </h2>
          <span className="text-xs text-muted-foreground font-medium leading-tight">{note}</span>
        </div>
      </CardContent>
    </Card>
  );
};