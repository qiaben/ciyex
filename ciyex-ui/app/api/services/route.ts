import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { users } from '@clerk/clerk-sdk-node';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await users.getUser(userId);
    const providerName = clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.firstName || clerkUser?.lastName || "Provider";

    const data = await request.json();
    // Destructure new fields
    const { serviceName, description, price, isOnline, address, city, state, zipCode, hospitalName, selectedDays, dayRanges, status, mode, category, insurance_accepted } = data;

    // Backend validation for in-person services
    if (isOnline === false) {
      if (!hospitalName || !address || !city || !state || !zipCode) {
        return NextResponse.json({
          error: 'All location fields (hospitalName, address, city, state, zipCode) are required for in-person services.'
        }, { status: 400 });
      }
    }

    // Check if doctor exists, if not create one
    let doctor = await db.doctor.findUnique({
      where: { id: userId }
    });

    if (!doctor) {
      // Create a new doctor record
      doctor = await db.doctor.create({
        data: {
          id: userId,
          name: providerName,
          email: clerkUser?.emailAddresses[0]?.emailAddress || `${userId}@example.com`,
          specialization: 'General Medicine', // Default value
          license_number: `LIC-${userId}`, // Generate a temporary license number
          phone: clerkUser?.phoneNumbers[0]?.phoneNumber || '000-000-0000',
          address: address || 'Not specified',
          city: city || 'Not specified',
          state: state || 'Not specified',
          zip: zipCode || '00000',
          npi_number: `NPI-${userId}`, // Generate a temporary NPI number
          type: 'FULL'
        }
      });
    }

    // Create the service
    const service = await db.services.create({
      data: {
        service_name: serviceName,
        description,
        price: parseFloat(price),
        status: status || 'active',
        mode: mode || (isOnline ? 'virtual' : 'inperson'),
        category: category || '',
        hospitalName: hospitalName || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        providerName: providerName,
        doctor_id: doctor.id,
        insurance: {
          create: insurance_accepted?.map((provider: string) => ({
            provider
          })) || []
        }
      },
      include: {
        availability: true
      }
    });

    // Create service availability records
    if (selectedDays && dayRanges) {
      await Promise.all(
        selectedDays.map((day: string) => {
          const range = dayRanges[day];
          if (range?.from && range?.to) {
            return db.serviceAvailability.create({
              data: {
                service_id: service.id,
                day,
                from: range.from,
                to: range.to,
              },
            });
          }
        })
      );
    }

    return NextResponse.json({ success: true, data: service });
  } catch (error: any) {
    console.error('Service creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all services
    const services = await db.services.findMany({
      include: {
        availability: true,
        insurance: { select: { provider: true } }
      },
    });

    // Fetch all unique doctor IDs
    const doctorIds = [...new Set(services.map(s => s.doctor_id))];

    // Fetch all doctors in one query
    const doctors = await db.doctor.findMany({
      where: { id: { in: doctorIds } }
    });

    // Map doctorId to doctor object
    const doctorMap: Record<string, any> = {};
    doctors.forEach(doc => { doctorMap[doc.id] = doc; });

    // Attach doctor info to each service
    const servicesWithDoctor = services.map(service => ({
      ...service,
      doctor: doctorMap[service.doctor_id] || null
    }));

    return NextResponse.json({ success: true, data: servicesWithDoctor });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await users.getUser(userId);
    const providerName = clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.firstName || clerkUser?.lastName || "Provider";

    const data = await request.json();
    console.log('Received PATCH request data:', data);

    const { id, status, serviceName, description, price, isOnline, address, city, state, zipCode, hospitalName, selectedDays, dayRanges, mode, category, insurance_accepted } = data;
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Backend validation for in-person services
    if (isOnline === false) {
      if (!hospitalName || !address || !city || !state || !zipCode) {
        return NextResponse.json({
          error: 'All location fields (hospitalName, address, city, state, zipCode) are required for in-person services.'
        }, { status: 400 });
      }
    }

    console.log('Updating service with insurance_accepted:', insurance_accepted);

    // Delete existing insurance records
    await db.insuranceAccepted.deleteMany({
      where: { service_id: id }
    });

    // Update the service (all fields, including status if provided)
    const updatedService = await db.services.update({
      where: { id },
      data: {
        service_name: serviceName,
        description,
        price: parseFloat(price),
        mode: mode || (isOnline ? 'virtual' : 'inperson'),
        category: category || '',
        hospitalName: hospitalName || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        providerName: providerName,
        status: status || 'active',
        insurance: {
          create: insurance_accepted?.map((provider: string) => ({
            provider
          })) || []
        }
      },
      include: {
        availability: true
      }
    });

    console.log('Updated service:', updatedService);

    // Remove old availability and add new
    await db.serviceAvailability.deleteMany({ where: { service_id: id } });
    if (selectedDays && dayRanges) {
      await Promise.all(
        selectedDays.map((day: string) => {
          const range = dayRanges[day];
          if (range?.from && range?.to) {
            return db.serviceAvailability.create({
              data: {
                service_id: id,
                day,
                from: range.from,
                to: range.to,
              },
            });
          }
        })
      );
    }

    return NextResponse.json({ success: true, data: updatedService });
  } catch (error: any) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }
    await db.services.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete service' }, { status: 500 });
  }
} 