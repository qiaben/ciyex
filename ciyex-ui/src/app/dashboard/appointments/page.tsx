"use client";

import { useEffect, useState } from "react";
import { Calendar, momentLocalizer, Views, View, ToolbarProps } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {CalendarDays, ChevronLeft, ChevronRight} from "lucide-react";
import { fetchWithAuth } from "@/utils/fetchWithAuth"; // ✅ import here
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// Setup localizer
const localizer = momentLocalizer(moment);

// ✅ Custom Toolbar with view buttons and navigation
const CustomToolbar = ({
                           label,
                           onNavigate,
                           view,
                           onView,
                       }: ToolbarProps) => {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                marginBottom: "10px",
            }}
        >
            {/* Navigation and Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => onNavigate("PREV")} style={styles.navButton}>
                    <ChevronLeft size={16} />
                </button>
                <span style={styles.label}>{label}</span>
                <button onClick={() => onNavigate("NEXT")} style={styles.navButton}>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* View switch buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
                {["day", "week", "month"].map((v) => (
                    <button
                        key={v}
                        onClick={() => onView(v as View)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            backgroundColor: view === v ? "#007bff" : "#fff",
                            color: view === v ? "#fff" : "#333",
                            cursor: "pointer",
                        }}
                    >
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function AppointmentCalendarPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("day");

    const [currentDate, setCurrentDate] = useState(new Date());


    useEffect(() => {
        async function fetchAppointments() {
            try {
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/appointment/list`);
                if (!res.ok) {
                    const text = await res.text();
                    console.error("Backend error:", text);
                    setError("Failed to fetch appointments");
                    return;
                }

                const json = await res.json();
                const parsed = json.entry?.map((entry: any) => entry.resource) || [];
                setAppointments(parsed);
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Error loading appointments");
            } finally {
                setLoading(false);
            }
        }

        fetchAppointments();
    }, []);

    const calendarEvents = appointments
        .filter((a) => a.start && a.end)
        .map((a) => {
            const patient = a.participant?.find((p: any) =>
                p.actor?.reference?.startsWith("Patient/")
            );
            const name = patient?.actor?.display || "Patient";
            const time = moment(a.start).format("h:mma");
            return {
                title: `${time} 👤 ${name}`,
                start: new Date(a.start),
                end: new Date(a.end),
                allDay: false,
            };
        });

    return (
        <div style={styles.page}>
            {/* Sidebar */}
            <div style={styles.sidebar}>


                {/* ✅ New calendar date picker */}
                <div style={styles.filterSection}>
                    <label style={styles.filterLabel}>Date</label>
                    <div style={styles.datePickerWrapper}>
                        <DatePicker
                            selected={currentDate}
                            onChange={(date: Date | null) => {
                                if (date) setCurrentDate(date);
                            }}
                            inline
                            calendarStartDay={1}
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                        />
                    </div>
                </div>
                <div style={styles.selectSection}>
                    <label>Facilities</label>
                    <select style={styles.select}>
                        <option>All Facilities</option>
                        <option>Qiaben Downtown</option>
                        <option>Qiaben North</option>
                    </select>
                    <label>Providers</label>
                    <select style={styles.select}>
                        <option>Administrator, Administrator</option>
                    </select>
                    <div style={styles.legend}>
                        <div style={{ ...styles.colorBox, background: "lightcyan" }} />
                        <span>Qiaben Downtown</span>
                    </div>
                    <div style={styles.legend}>
                        <div style={{ ...styles.colorBox, background: "darkolivegreen" }} />
                        <span>Qiaben North</span>
                    </div>
                </div>
            </div>

            {/* Calendar */}
            <div style={styles.main}>

                {loading ? (
                    <p>Loading appointments...</p>
                ) : error ? (
                    <p style={{ color: "tomato" }}>{error}</p>
                ) : (
                    <div style={styles.calendarContainer}>
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            views={["day", "week", "month"]}
                            view={calendarView}
                            onView={(view: View) => {
                                if (view === "day" || view === "week" || view === "month") {
                                    setCalendarView(view);
                                }
                            }}
                            formats={{
                                dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
                                    `${moment(start).format("MMMM D YYYY")} – ${moment(end).format("MMMM D YYYY")}`,
                            }}
                            components={{
                                toolbar: CustomToolbar,
                            }}
                            style={styles.calendar}
                            onSelectEvent={(event: any) => alert(`Viewing: ${event.title}`)}
                            eventPropGetter={(event) => {
                                const bgColor = event.title.includes("Smith")
                                    ? "#fceabb"
                                    : event.title.includes("Test")
                                        ? "#d1e7dd"
                                        : "#cce5ff";
                                return {
                                    style: {
                                        backgroundColor: bgColor,
                                        border: "1px solid #999",
                                        borderRadius: "4px",
                                        padding: "2px 6px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        color: "#111",
                                        cursor: "pointer",
                                    },
                                };

                            }}
                            date={currentDate}
                            onNavigate={(date) => setCurrentDate(date)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        display: "flex",
        height: "100vh",
        width: "100%", // ✅ prevent overflow on x-axis
        overflow: "hidden",
        fontFamily: "'Segoe UI', sans-serif",
    },

    sidebar: {
        width: "250px",
        background: "#f9fafb",
        padding: "16px",
        borderRight: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",   // ✅ Stack content vertically
        gap: "16px",               // ✅ Uniform spacing between sections
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
    },


    sidebarTitle: {
        fontSize: "18px",
        fontWeight: "bold",
        marginBottom: "12px",
    },
    monthPicker: {
        width: "100%",
        marginBottom: "20px",
        padding: "6px",
        fontSize: "14px",
    },
    selectSection: {
        fontSize: "14px",
        color: "#111",
        paddingTop: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
    },
    select: {
        width: "100%",
        marginBottom: "10px",
        padding: "6px",
    },
    legend: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        marginTop: "6px",
        fontSize: "13px",
        paddingBottom: "4px", // 👈 just for breathing space
    },
    colorBox: {
        width: "16px",
        height: "16px",
        border: "1px solid #ccc",
    },
    main: {
        flex: 1,
        minWidth: 0, // ✅ fix flex overflow bug
        padding: "24px",
        backgroundColor: "#fff",
        overflowX: "hidden", // ✅ extra safety
    },

    header: {
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    calendarContainer: {
        background: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        padding: "16px",
    },
    calendar: {
        height: "80vh",
        width: "100%",
    },
    navButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    },

    filterSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    filterLabel: {
        display: "block",
        fontWeight: 600,
        fontSize: "14px",
        color: "#333",
        marginBottom: "6px",
    },

    label: {
        fontWeight: "bold",
        fontSize: "18px",
    },

    datePickerWrapper: {
        display: "flex",
        justifyContent: "center",
    },

};
