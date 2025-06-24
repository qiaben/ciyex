type RouteAccessProps = {
    [key: string]: string[];
  };
  
  export const routeAccess: RouteAccessProps = {
    "/admin(.*)": ["admin"],
    "/patient(.*)": ["patient", "admin", "doctor"],
    "/doctor(.*)": ["doctor"],
    "/record/users": ["admin"],
    "/record/doctors": ["admin"],
    "/record/doctors(.*)": ["admin", "doctor", "patient"],
    "/record/patients": ["admin", "doctor"],
    "/patient/registrations": ["patient"],
    "/record/Patient-Appointments(.*)": ["patient", "doctor"],
  };
  
