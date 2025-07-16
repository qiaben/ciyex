// middleware.ts

import { NextResponse } from "next/server";
import { routeAccess } from "./lib/routes";

type UserMetadata = {
  role?: string;
  status?: 'pending' | 'approved' | 'rejected';
  doctorId?: string;
};

// === HARDCODED "AUTH" VALUES ===
const fakeToken = "test-dev-token";
const fakeRole = "doctor"; // change to "patient", "admin", etc. as needed
const fakeStatus: 'pending' | 'approved' | 'rejected' = "approved";
const fakeUserId = "user_12345";
const fakeSessionClaims = {
  metadata: {
    role: fakeRole,
    status: fakeStatus,
    doctorId: "doctor_789",
  },
  token: fakeToken,
  userId: fakeUserId,
};

const publicRoutes = [
  "/",
  "/blog",
  "/about_us",
  "/partner-with-us",
  "/contact",
  "/sign-up/sso-callback",
  "/doctor-registration",
  "/doctor-registration/pending",
  "/patient/registration",
  "/api/doctors/check",
  "/api/doctors/register"
];
const authRoutes = ["/sign-in", "/sign-up"];
const registrationRoutes = ["/doctor-registration", "/patient/registration"];

const matchers = Object.keys(routeAccess).map((route) => ({
  matcher: (req: Request) => req.url.includes(route),
  allowedRoles: routeAccess[route],
}));

export default async function middleware(req: any) {
  // Use hardcoded user info for all requests
  const userId = fakeUserId;
  const sessionClaims = fakeSessionClaims;
  const url = new URL(req.url);
  const path = url.pathname;

  // Allow access to public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Allow access to registration routes if user is authenticated
  if (registrationRoutes.includes(path) && userId) {
    const role = sessionClaims?.metadata?.role || "";
    if (role === 'patient' && path === '/doctor-registration') {
      return NextResponse.redirect(new URL('/patient', url.origin));
    }
    if (role === 'doctor' && path === '/patient/registration') {
      return NextResponse.redirect(new URL('/doctor', url.origin));
    }
    return NextResponse.next();
  }

  // Handle auth routes (sign-in, sign-up)
  if (authRoutes.includes(path)) {
    if (userId) {
      const urlParams = new URLSearchParams(url.search);
      const roleParam = urlParams.get('role');
      if (path === '/sign-up' && roleParam === 'doctor') {
        return NextResponse.redirect(new URL('/doctor-registration', url.origin));
      }
      if (path === '/sign-up' && roleParam) {
        return NextResponse.next();
      }
      const role = sessionClaims?.metadata?.role?.toLowerCase() || "patient";
      return NextResponse.redirect(new URL(`/${role}`, url.origin));
    }
    return NextResponse.next();
  }

  // Handle protected routes
  const role: string = userId && sessionClaims?.metadata?.role
      ? sessionClaims.metadata.role.toLowerCase()
      : "";

  if (!role && userId) {
    const urlParams = new URLSearchParams(url.search);
    const roleParam = urlParams.get('role');
    if (roleParam === 'doctor') {
      return NextResponse.redirect(new URL('/doctor-registration', url.origin));
    } else if (roleParam === 'patient') {
      return NextResponse.redirect(new URL('/patient/registration', url.origin));
    } else {
      return NextResponse.redirect(new URL('/sign-up', url.origin));
    }
  }

  // Special handling for doctors with pending status
  const metadata = sessionClaims?.metadata as UserMetadata | undefined;
  if (role === 'doctor' && metadata?.status === 'pending') {
    return NextResponse.redirect(new URL('/doctor-registration/pending', url.origin));
  }

  const matchingRoute = matchers.find(({ matcher }) => matcher(req));
  if (matchingRoute && !matchingRoute.allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL(`/${role || "patient"}`, url.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
