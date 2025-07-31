"use client";
import { useState } from "react";

export default function NewPatientForm() {
    const [form, setForm] = useState({
        title: "",
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        preferredName: "",
        birthFirstName: "",
        birthMiddleName: "",
        birthLastName: "",
        dob: "",
        sex: "",
        genderIdentity: "",
        sexualOrientation: "",
        ssn: "",
        maritalStatus: "",
        externalId: "",
        licenseId: "",
        userDefined1: "",
        userDefined2: "",
        userDefined3: "",
        billingNote: "",
        previousNames: "",
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const labelStyle = {
        fontWeight: 600,
        fontSize: "14px",
        marginBottom: "4px",
        color: "#1a1a1a",
    };

    const inputStyle = {
        padding: "8px",
        fontSize: "14px",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#fff",
        color: "#000",
        width: "100%",
    };

    const fieldStyle = {
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column" as const,
    };

    return (
        <div
            style={{
                backgroundColor: "#f1f1f1",
                padding: "2rem",
                maxWidth: "1200px",
                margin: "auto",
                color: "#000",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <h2
                style={{
                    marginBottom: "1rem",
                    borderBottom: "2px solid #555",
                    paddingBottom: "0.5rem",
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: "#444",
                }}
            >
                ADD NEW PATIENT
            </h2>

            <form style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                {/* Title */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Title:</label>
                    <select name="title" value={form.title} onChange={handleChange} style={inputStyle}>
                        <option>Unassigned</option>
                        <option>Mr.</option>
                        <option>Ms.</option>
                        <option>Mrs.</option>
                        <option>Dr.</option>
                    </select>
                </div>

                {/* Name */}
                <input name="firstName" placeholder="First Name" style={inputStyle} onChange={handleChange} />
                <input name="middleName" placeholder="Middle Name" style={inputStyle} onChange={handleChange} />
                <input name="lastName" placeholder="Last Name" style={inputStyle} onChange={handleChange} />
                <input name="suffix" placeholder="Name Suffix" style={inputStyle} onChange={handleChange} />

                {/* Preferred Name */}
                <div style={{ gridColumn: "span 4", ...fieldStyle }}>
                    <label style={labelStyle}>Preferred Name:</label>
                    <input name="preferredName" style={inputStyle} onChange={handleChange} />
                </div>

                {/* Birth Name */}
                <input name="birthFirstName" placeholder="Birth First Name" style={inputStyle} onChange={handleChange} />
                <input name="birthMiddleName" placeholder="Middle Name" style={inputStyle} onChange={handleChange} />
                <input name="birthLastName" placeholder="Birth Last Name" style={inputStyle} onChange={handleChange} />

                {/* DOB */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>DOB:</label>
                    <input name="dob" type="date" style={inputStyle} onChange={handleChange} />
                </div>

                {/* Sex */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Sex:</label>
                    <select name="sex" value={form.sex} onChange={handleChange} style={inputStyle}>
                        <option>Unassigned</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                    </select>
                </div>

                {/* Gender Identity */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Gender Identity:</label>
                    <select name="genderIdentity" value={form.genderIdentity} onChange={handleChange} style={inputStyle}>
                        <option>Unassigned</option>
                    </select>
                </div>

                {/* Sexual Orientation */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Sexual Orientation:</label>
                    <select name="sexualOrientation" value={form.sexualOrientation} onChange={handleChange} style={inputStyle}>
                        <option>Unassigned</option>
                    </select>
                </div>

                {/* SSN */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>S.S.:</label>
                    <input name="ssn" style={inputStyle} onChange={handleChange} />
                </div>

                {/* Marital Status */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>Marital Status:</label>
                    <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} style={inputStyle}>
                        <option>Unassigned</option>
                    </select>
                </div>

                {/* External ID */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>External ID:</label>
                    <input name="externalId" style={inputStyle} onChange={handleChange} />
                </div>

                {/* License ID */}
                <div style={fieldStyle}>
                    <label style={labelStyle}>License/ID:</label>
                    <input name="licenseId" style={inputStyle} onChange={handleChange} />
                </div>

                {/* User Defined */}
                <input name="userDefined1" placeholder="User Defined" style={inputStyle} onChange={handleChange} />
                <input name="userDefined2" placeholder=" " style={inputStyle} onChange={handleChange} />
                <input name="userDefined3" placeholder=" " style={inputStyle} onChange={handleChange} />

                {/* Billing Note */}
                <div style={{ gridColumn: "span 4", ...fieldStyle }}>
                    <label style={labelStyle}>Billing Note:</label>
                    <textarea name="billingNote" rows={2} style={{ ...inputStyle, resize: "vertical" }} onChange={handleChange} />
                </div>

                {/* Previous Names */}
                <div style={{ gridColumn: "span 4", ...fieldStyle }}>
                    <label style={labelStyle}>Previous Names:</label>
                    <textarea name="previousNames" rows={2} style={{ ...inputStyle, resize: "vertical" }} onChange={handleChange} />
                </div>

                {/* Submit */}
                <div style={{ gridColumn: "span 4", textAlign: "center" }}>
                    <button
                        type="submit"
                        style={{
                            backgroundColor: "#007bff",
                            color: "#fff",
                            padding: "10px 30px",
                            borderRadius: "5px",
                            fontWeight: "bold",
                            fontSize: "16px",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
}
