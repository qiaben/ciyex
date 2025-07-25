"use client";

//import { Button } from "@/components/ui/button"; // ensure this file exists

export default function ProviderGreeting() {
    return (
        <div className="provider-container">
            {/* Role label */}
            <div className="provider-role">
                <h6><b>PROVIDER / DOCTOR</b></h6>
            </div>

            {/* Greeting card */}
            <div className="provider-greeting-card">
                <div>
                    <h2 className="provider-heading">
                        Good Morning, DOCTOR
                    </h2>
                    <p className="provider-subtext">
                        Here's your dashboard. Wishing you a productive day!
                    </p>
                </div>
               {/*<Button variant="outline">View Profile</Button>*/}
            </div>
        </div>
    );
}
