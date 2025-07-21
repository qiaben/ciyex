import { useEffect, useState } from "react";

export function useUserRole() {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const storedRole = localStorage.getItem("role");
        setRole(storedRole);
        const onStorage = () => setRole(localStorage.getItem("role"));
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    return role;
}
