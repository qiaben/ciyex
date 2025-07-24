import { Suspense } from "react";
import SignUpForm from "./SignUpForm";

export default function SignUpPage() {
    return (
        <Suspense fallback={<div>Loading sign-up form...</div>}>
            <SignUpForm />
        </Suspense>
    );
}
