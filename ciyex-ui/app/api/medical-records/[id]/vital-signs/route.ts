import { NextRequest, NextResponse } from "next/server";
import { getVitalSignData } from "@/utils/services/medical";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const data = await getVitalSignData(id);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vital signs" }, { status: 500 });
  }
} 