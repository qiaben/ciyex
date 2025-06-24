import { NextResponse } from 'next/server';
import { getDoctorById } from '@/utils/services/doctor';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log("Fetching doctor data for ID:", id);

    if (!id) {
      return NextResponse.json({ error: 'Doctor ID is required' }, { status: 400 });
    }

    const result = await getDoctorById(id);
    
    console.log("Doctor fetch result:", {
      success: result.success,
      hasData: !!result.data,
      workingDaysCount: result.data?.working_days?.length || 0,
      workingDays: result.data?.working_days
    });
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching doctor by id:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
