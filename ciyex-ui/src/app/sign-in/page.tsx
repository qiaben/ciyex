import { Suspense } from "react";
import SignInForm from "./SignInForm";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SignInForm />
        </Suspense>
    );
}
