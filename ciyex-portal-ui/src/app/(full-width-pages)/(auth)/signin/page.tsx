import { Metadata } from "next";
import {PatientPortalAuth} from "@/components/auth/PatientPortalAuth";

export const metadata: Metadata = {
    title: "Patient Portal | Sign In & Sign Up",
    description: "Secure access to the Patient Portal",
};

export default function SignIn() {
    return <PatientPortalAuth />;
}
