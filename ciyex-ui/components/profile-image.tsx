import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProfileImageProps {
  url?: string | null;
  name?: string;
  className?: string;
  textClassName?: string;
  bgColor?: string;
  size?: number;
}

export function ProfileImage({
  url,
  name = "Profile",
  className,
  textClassName,
  bgColor,
  size = 40,
}: ProfileImageProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-full bg-muted",
        className
      )}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: bgColor 
      }}
    >
      {url ? (
        <Image
          src={url}
          alt={name}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <div className={cn("flex h-full w-full items-center justify-center", textClassName)}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}