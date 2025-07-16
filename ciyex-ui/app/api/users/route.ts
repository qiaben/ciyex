import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust to your ORM import

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = 10;
  const offset = (page - 1) * perPage;

  // Fetch from your users table (adjust field names as needed)
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: role ? { role } : {},
      orderBy: { createdAt: "desc" }, // Adjust to your timestamp field
      skip: offset,
      take: perPage,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        lastSignInAt: true, // if you have this field
      },
    }),
    prisma.user.count({
      where: role ? { role } : {},
    }),
  ]);

  // If you have emailAddresses as a relation, adjust accordingly
  const plainUsers = users.map((u: any) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    emailAddresses: [{ emailAddress: u.email }],
    publicMetadata: { role: u.role || "" },
    lastSignInAt: u.lastSignInAt,
  }));

  return NextResponse.json({ users: plainUsers, totalCount });
}
