# Doctor Update Fix - WorkingDays Relation Error

## Problem
You were experiencing this error when updating a doctor:
```
Invalid `prisma.doctor.update()` invocation:
An operation failed because it depends on one or more records that were required but not found. No 'Doctor' record (needed to inline the relation on 'WorkingDays' record) was found for a nested create on one-to-many relation 'DoctorToWorkingDays'.
```

## Root Causes
1. **Incorrect relation handling**: The original code was trying to use nested create/delete operations on the `working_days` relation
2. **Missing validation**: No check to ensure the doctor exists before updating
3. **Data structure mismatch**: Form data structure didn't match database expectations
4. **Poor error handling**: Generic error messages made debugging difficult

## Solutions Implemented

### 1. Fixed `updateDoctor` Function (`utils/services/doctor.ts`)

**Before:**
```typescript
// This was causing the error
if (data.working_days) {
  doctorDbData.working_days = {
    deleteMany: {},
    create: data.working_days,
  };
}
```

**After:**
```typescript
// Handle working_days update separately to avoid relation issues
if (data.working_days && Array.isArray(data.working_days)) {
  // First, delete existing working days
  await db.workingDays.deleteMany({
    where: { doctor_id: id }
  });

  // Then create new working days if any are provided
  if (data.working_days.length > 0) {
    await db.workingDays.createMany({
      data: data.working_days.map((day: any) => ({
        doctor_id: id,
        day: day.day,
        start_time: day.start_time,
        close_time: day.close_time || day.end_time // Handle both field names
      }))
    });
  }
}
```

### 2. Added Doctor Existence Validation
```typescript
// First, check if the doctor exists
const existingDoctor = await db.doctor.findUnique({
  where: { id },
  include: {
    working_days: true
  }
});

if (!existingDoctor) {
  return { 
    success: false, 
    error: true, 
    msg: "Doctor not found" 
  };
}
```

### 3. Enhanced Error Handling
```typescript
catch (error: any) {
  console.error("Doctor update error:", error);
  
  // Provide more specific error messages
  if (error.code === 'P2025') {
    return { 
      success: false, 
      error: true, 
      msg: "Doctor record not found" 
    };
  }
  
  if (error.message?.includes('WorkingDays')) {
    return { 
      success: false, 
      error: true, 
      msg: "Error updating working schedule. Please try again." 
    };
  }
  
  return { 
    success: false, 
    error: true, 
    msg: error?.message || "Failed to update doctor" 
  };
}
```

### 4. Updated API Route (`app/api/doctors/update/route.ts`)
- Added logging for debugging
- Improved error response structure
- Better error messages

### 5. Created Health Check Endpoint (`app/api/health/route.ts`)
- Added database connectivity check
- Useful for debugging connection issues

## Key Changes Made

### Database Operations
- **Separated working days operations**: Delete existing records first, then create new ones
- **Added existence validation**: Check if doctor exists before updating
- **Fixed field mapping**: Handle both `close_time` and `end_time` field names

### Error Handling
- **Specific error codes**: Handle Prisma error codes (P2025 for record not found)
- **Better error messages**: User-friendly error messages
- **Graceful degradation**: Don't fail entire update if Clerk update fails

### Logging and Debugging
- **Request logging**: Log incoming data structure
- **Health check endpoint**: Test database connectivity
- **Detailed error logging**: Better debugging information

## Testing the Fix

1. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/api/health
   ```

2. **Try updating a doctor** with working days data

3. **Check the console logs** for:
   - Doctor update request data
   - Any error messages
   - Database operation results

## Expected Data Structure

The form should send working days data like this:
```json
{
  "working_days": [
    {
      "day": "Monday",
      "start_time": "09:00",
      "close_time": "17:00"
    },
    {
      "day": "Tuesday", 
      "start_time": "09:00",
      "close_time": "17:00"
    }
  ]
}
```

## Common Issues and Solutions

### Issue: "Doctor not found"
**Solution**: Ensure the user ID exists in the database and matches the authenticated user

### Issue: "Error updating working schedule"
**Solution**: Check that the working_days data is properly formatted as an array

### Issue: Database connection errors
**Solution**: Use the health check endpoint to verify connectivity

## Next Steps

1. **Test the update functionality** with the doctor registration form
2. **Monitor the console logs** for any remaining issues
3. **Check the Aiven dashboard** for connection usage
4. **Verify working days are saved correctly** in the database

The fix should resolve the WorkingDays relation error and allow successful doctor updates with working schedule information. 