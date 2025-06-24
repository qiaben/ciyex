import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = 10;
  const offset = (page - 1) * perPage;
  const { data, totalCount } = await clerkClient().then(client => client.users.getUserList({
    orderBy: "-created_at",
    limit: perPage,
    offset,
  }));
  let filtered = data;
  if (role && role !== "") {
    filtered = data.filter((u: any) => u.publicMetadata.role === role);
  }
  // Sanitize for client
  const plainUsers = filtered.map((u: any) => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    emailAddresses: u.emailAddresses.map((e: any) => ({ emailAddress: e.emailAddress })),
    publicMetadata: { role: u.publicMetadata?.role || "" },
    lastSignInAt: u.lastSignInAt,
  }));
  return NextResponse.json({ users: plainUsers, totalCount });
} 