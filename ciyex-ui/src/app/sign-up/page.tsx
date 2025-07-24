'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const facilityOptions = [
    { id: 1, name: "Main Hospital" },
    { id: 2, name: "Downtown Clinic" },
    { id: 3, name: "Suburban Branch" },
];

export default function SignUpPage() {
    const searchParams = useSearchParams();
    const orgId = searchParams.get("orgId") || "";

    const [orgName, setOrgName] = useState(""); // ✅ Added
    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        gender: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        country: "US",
        facilityId: "",
    });

    // ✅ Fetch organization name
    useEffect(() => {
        if (orgId) {
            fetch(`/api/org/${orgId}`)
                .then((res) => res.json())
                .then((data) => setOrgName(data.name))
                .catch(() => setOrgName("Unknown Organization"));
        }
    }, [orgId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // ✅ orgId is submitted along with form
        console.log({ ...form, orgId });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-6 bg-white p-8 rounded-xl shadow">
                <h2 className="text-2xl font-bold text-center">Patient Sign Up</h2>

                {/* ✅ Display Practice / Org Name */}
                {orgId && (
                    <>
                        <div>
                            <label>Practice</label>
                            <input type="text" value={orgName} readOnly className="input bg-gray-100" />
                        </div>
                        {/* 📌 Hidden input to include orgId in submission */}
                        <input type="hidden" name="orgId" value={orgId} />
                    </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label>Email</label>
                        <input name="email" type="email" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Phone</label>
                        <input name="phone" type="tel" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Password</label>
                        <input name="password" type="password" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input name="confirmPassword" type="password" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>First Name</label>
                        <input name="firstName" type="text" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Middle Name</label>
                        <input name="middleName" type="text" className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Last Name</label>
                        <input name="lastName" type="text" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Date of Birth</label>
                        <input name="dob" type="date" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Gender</label>
                        <select name="gender" required className="input" onChange={handleChange}>
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label>Facility Location</label>
                        <select name="facilityId" required className="input" onChange={handleChange}>
                            <option value="">Select</option>
                            {facilityOptions.map((f) => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label>Street Address 1</label>
                    <input name="address1" type="text" required className="input" onChange={handleChange} />
                </div>
                <div>
                    <label>Street Address 2</label>
                    <input name="address2" type="text" className="input" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label>City</label>
                        <input name="city" type="text" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>State</label>
                        <input name="state" type="text" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Zip Code</label>
                        <input name="zip" type="text" required className="input" onChange={handleChange} />
                    </div>
                    <div>
                        <label>Country</label>
                        <input name="country" type="text" value="US" readOnly className="input" />
                    </div>
                </div>

                <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    Register
                </button>
                <p className="text-sm text-center text-gray-600 mt-4">
                    Already have an account? <Link href="/sign-in" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </form>

            <style jsx>{`
                .input {
                    margin-top: 0.25rem;
                    width: 100%;
                    padding: 0.5rem 0.75rem;
                    border: 1px solid #ccc;
                    border-radius: 0.5rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 1px #3b82f6;
                }
            `}</style>
        </div>
    );
}
