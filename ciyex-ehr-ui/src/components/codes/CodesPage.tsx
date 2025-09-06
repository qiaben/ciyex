"use client";
import { useState, useCallback, useEffect } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface Code {
    id: number;
    codeType: string;
    code: string;
    modifier?: string;
    active: boolean;
    description?: string;
    shortDescription?: string;
    category?: string;
    diagnosisReporting?: boolean;
    serviceReporting?: boolean;
    relateTo?: string;
    feeStandard?: number;
}

const codeTypes = [
    { value: "CPT4", label: "CPT4 Procedure/Service" },
    { value: "HCPCS", label: "HCPCS Procedure/Service" },
    { value: "CVX", label: "CVX Immunization" },
    { value: "ICD10", label: "ICD10 Diagnosis" },
    { value: "ICD9", label: "ICD9 Diagnosis" },
    { value: "CUSTOM", label: "Custom" },
];

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/codes`;

async function safeJson(res: Response) {
    try {
        const text = await res.text();
        return text ? JSON.parse(text) : null;
    } catch {
        return null;
    }
}

export default function CodesPage() {
    const [codes, setCodes] = useState<Code[]>([]);
    const [selected, setSelected] = useState<Partial<Code> | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // UI input values
    const [q, setQ] = useState("");
    const [selectedType, setSelectedType] = useState<string>("");

    // Actual applied filters (used for fetching)
    const [searchText, setSearchText] = useState("");
    const [filter, setFilter] = useState<string>("");

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const orgId =
        typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
    const headers: HeadersInit = { orgId: orgId ?? "" };

    const loadCodes = useCallback(async () => {
        if (!orgId) return;
        try {
            let url = API_URL;
            if (searchText || filter) {
                const params = new URLSearchParams();
                if (searchText) params.append("q", searchText);
                if (filter) params.append("codeType", filter);
                url = `${API_URL}/search?${params.toString()}`;
            }
            const res = await fetchWithAuth(url, { headers });
            const json = await safeJson(res);
            if (res.ok && json) {
                setCodes(json.data || []);
                setPage(1);
            }
        } catch (err) {
            console.error("Error loading codes:", err);
        }
    }, [orgId, searchText, filter]);

    // Load once on mount
    useEffect(() => {
        loadCodes();
    }, [loadCodes]);

    // Run search only when button clicked
    const runSearch = () => {
        setSearchText(q);
        setFilter(selectedType);
    };

    const saveCode = async (form: Partial<Code>) => {
        if (!form.code || !form.codeType) return;
        let res: Response;
        if (form.id) {
            res = await fetchWithAuth(`${API_URL}/${form.id}`, {
                method: "PUT",
                headers,
                body: JSON.stringify(form),
            });
        } else {
            res = await fetchWithAuth(API_URL, {
                method: "POST",
                headers,
                body: JSON.stringify(form),
            });
        }
        if (res.ok) {
            await loadCodes();
            setShowCreate(false);
            setShowEdit(false);
        }
    };

    const deleteCode = async (id: number) => {
        const res = await fetchWithAuth(`${API_URL}/${id}`, {
            method: "DELETE",
            headers,
        });
        if (res.ok) await loadCodes();
    };

    const startIndex = (page - 1) * pageSize;
    const paginated = codes.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(codes.length / pageSize);

    return (
        <div className="p-6 space-y-6 font-sans">
            {/* Header */}
            {/*<h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">*/}
            {/*    Codes*/}
            {/*</h2>*/}

            {/* Search + Add New */}
            <div className="flex items-center gap-4">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border rounded px-2 py-2 text-sm w-60 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                >
                    <option value="">All Types</option>
                    {codeTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search..."
                        className="border rounded px-3 py-2 w-80 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                    />
                    <button
                        onClick={runSearch}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                        Search
                    </button>
                </div>

                <button
                    onClick={() => setShowCreate(true)}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                    + Add New
                </button>
            </div>

            {/* Table */}
            <div className="border rounded-lg bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {[
                            "Code",
                            "Type",
                            "Modifier",
                            "Category",
                            "Description",
                            "Short Desc",
                            "Relate To",
                            "Active",
                            "Dx Rep",
                            "Serv Rep",
                            "Fee",
                            "Actions",
                        ].map((h) => (
                            <th
                                key={h}
                                className={`px-3 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide
                    ${
                                    h === "Fee"
                                        ? "text-right"
                                        : h === "Actions" ||
                                        h === "Active" ||
                                        h === "Dx Rep" ||
                                        h === "Serv Rep"
                                            ? "text-center"
                                            : "text-left"
                                }`}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <td
                                colSpan={12}
                                className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm"
                            >
                                No codes found.
                            </td>
                        </tr>
                    ) : (
                        paginated.map((c) => (
                            <tr
                                key={c.id}
                                className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                    {c.code}
                                </td>
                                <td className="px-3 py-2">{c.codeType}</td>
                                <td className="px-3 py-2">{c.modifier}</td>
                                <td className="px-3 py-2">{c.category}</td>
                                <td
                                    className="px-3 py-2 truncate max-w-[200px]"
                                    title={c.description}
                                >
                                    {c.description}
                                </td>
                                <td className="px-3 py-2">{c.shortDescription}</td>
                                <td className="px-3 py-2">{c.relateTo}</td>
                                <td className="px-3 py-2 text-center">
                                    {c.active ? (
                                        <span className="inline-block bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                        Active
                      </span>
                                    ) : (
                                        <span className="inline-block bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 text-[11px] px-2 py-0.5 rounded-full font-semibold">
                        Inactive
                      </span>
                                    )}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {c.diagnosisReporting ? "Y" : "N"}
                                </td>
                                <td className="px-3 py-2 text-center">
                                    {c.serviceReporting ? "Y" : "N"}
                                </td>
                                <td className="px-3 py-2 text-right">{c.feeStandard}</td>
                                <td className="px-3 py-2 text-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelected(c);
                                            setShowEdit(true);
                                        }}
                                        className="text-gray-500 hover:text-blue-600"
                                        title="Edit"
                                    >
                                        ✎
                                    </button>
                                    <button
                                        onClick={() => deleteCode(c.id)}
                                        className="text-gray-500 hover:text-red-600"
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>

            {/* Pagination footer */}
            <div className="flex justify-between items-center mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                    >
                        Prev
                    </button>
                    <span>
            Page {page} of {totalPages || 1}
          </span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-600"
                    >
                        Next
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div>
                        Showing {paginated.length} of {codes.length}
                    </div>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                        className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                    >
                        {[10, 20, 50].map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <CodeModal
                    title="Create Code"
                    onClose={() => setShowCreate(false)}
                    onSave={saveCode}
                />
            )}

            {/* Edit Modal */}
            {showEdit && selected && (
                <CodeModal
                    title="Edit Code"
                    initialData={selected}
                    onClose={() => setShowEdit(false)}
                    onSave={saveCode}
                />
            )}
        </div>
    );
}

/* ---------------- Modal ---------------- */
function CodeModal({
                       title,
                       initialData,
                       onClose,
                       onSave,
                   }: {
    title: string;
    initialData?: Partial<Code>;
    onClose: () => void;
    onSave: (data: Partial<Code>) => void;
}) {
    const [form, setForm] = useState<Partial<Code>>(initialData || { active: true });

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg w-[650px] p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Fill out the code details below.
                </p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {/* Code and Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Code *
                        </label>
                        <input
                            value={form.code || ""}
                            onChange={(e) => setForm({ ...form, code: e.target.value })}
                            placeholder="e.g. I10"
                            className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Type *
                        </label>
                        <select
                            value={form.codeType || ""}
                            onChange={(e) => setForm({ ...form, codeType: e.target.value })}
                            className="w-full border rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        >
                            <option value="">Select Type</option>
                            {codeTypes.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Modifier and Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Modifier
                        </label>
                        <input
                            value={form.modifier || ""}
                            onChange={(e) => setForm({ ...form, modifier: e.target.value })}
                            placeholder="Modifier"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Category
                        </label>
                        <input
                            value={form.category || ""}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            placeholder="Category"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>

                    {/* Descriptions */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Description
                        </label>
                        <input
                            value={form.description || ""}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Full description"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Short Description
                        </label>
                        <input
                            value={form.shortDescription || ""}
                            onChange={(e) =>
                                setForm({ ...form, shortDescription: e.target.value })
                            }
                            placeholder="Short description"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>

                    {/* RelateTo and Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Relate To
                        </label>
                        <input
                            value={form.relateTo || ""}
                            onChange={(e) => setForm({ ...form, relateTo: e.target.value })}
                            placeholder="Relate To"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                            Fee Standard
                        </label>
                        <input
                            type="number"
                            value={form.feeStandard ?? ""}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    feeStandard: e.target.value
                                        ? parseFloat(e.target.value)
                                        : undefined,
                                })
                            }
                            placeholder="Fee"
                            className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="col-span-2 flex flex-wrap gap-6 mt-2">
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={form.active || false}
                                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                            />
                            Active
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={form.diagnosisReporting || false}
                                onChange={(e) =>
                                    setForm({ ...form, diagnosisReporting: e.target.checked })
                                }
                            />
                            Diagnosis Reporting
                        </label>
                        <label className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <input
                                type="checkbox"
                                checked={form.serviceReporting || false}
                                onChange={(e) =>
                                    setForm({ ...form, serviceReporting: e.target.checked })
                                }
                            />
                            Service Reporting
                        </label>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2 mt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 dark:text-gray-100 hover:bg-gray-400 dark:hover:bg-gray-600 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(form)}
                        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
