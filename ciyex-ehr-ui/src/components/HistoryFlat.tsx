"use client";
import React from "react";

type HistoryForm = {
    general: { riskFactors: string; examsTests: string };
    family: {
        father: string; mother: string; siblings: string; spouse: string; offspring: string;
        diagFather: string; diagMother: string; diagSiblings: string; diagSpouse: string; diagOffspring: string;
    };
    relatives: {
        cancer: string; diabetes: string; heartProblems: string; epilepsy: string;
        suicide: string; tuberculosis: string; hbp: string; stroke: string;
        mentalIllness: string;
    };
    lifestyle: {
        tobacco: string; coffee: string; alcohol: string; drugs: string; counseling: string;
        exercise: string; hazardous: string; sleep: string; seatbelt: string;
    };
    other: { nameValue: string; additionalHistory: string };
};

type Props = {
    historyForm: HistoryForm;
    setHistoryForm: React.Dispatch<React.SetStateAction<HistoryForm>>;
    editHistory: boolean;
    setEditHistory: (v: boolean) => void;
    activeHistoryTab: keyof HistoryForm;
    setActiveHistoryTab: (tab: keyof HistoryForm) => void;
    saveHistory: () => Promise<void>;
};

const HistoryFlat: React.FC<Props> = ({
                                          historyForm,
                                          setHistoryForm,
                                          editHistory,
                                          setEditHistory,
                                          activeHistoryTab,
                                          setActiveHistoryTab,
                                          saveHistory,
                                      }) => {
    const sectionLabels: Record<keyof HistoryForm, string> = {
        general: "General",
        family: "Family History",
        relatives: "Relatives",
        lifestyle: "Lifestyle",
        other: "Other",
    };

    return (
        <div className="w-full p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800"></h2>
                {!editHistory && (
                    <button
                        onClick={() => setEditHistory(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b">
                {(Object.keys(sectionLabels) as Array<keyof HistoryForm>).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveHistoryTab(tab)}
                        className={`px-3 py-2 text-sm ${
                            activeHistoryTab === tab
                                ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                    >
                        {sectionLabels[tab]}
                    </button>
                ))}
            </div>


            {/* View Mode */}
            {!editHistory ? (
                <div className="space-y-2 text-sm">
                    {Object.entries(historyForm[activeHistoryTab]).map(([field, value]) => (
                        <div key={field}>
                            <strong className="capitalize">{field.replace(/([A-Z])/g, " $1")}:</strong>{" "}
                            {value || "—"}
                        </div>
                    ))}
                </div>
            ) : (
                /* Edit Mode */
                <form
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await saveHistory();
                            setEditHistory(false);
                        } catch (err) {
                            alert((err as Error).message);
                        }
                    }}
                >
                    {Object.entries(historyForm[activeHistoryTab]).map(([field, value]) => (
                        <div key={field} className="md:col-span-1">
                            <label className="block font-medium capitalize">
                                {field.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={value}
                                onChange={(e) =>
                                    setHistoryForm((prev) => ({
                                        ...prev,
                                        [activeHistoryTab]: {
                                            ...prev[activeHistoryTab],
                                            [field]: e.target.value,
                                        },
                                    }))
                                }
                            />
                        </div>
                    ))}

                    <div className="flex flex-wrap gap-2 mt-2 md:col-span-2">
                        <button
                            type="submit"
                            className="px-3 py-2 bg-emerald-600 text-white rounded"
                        >
                            Save & Exit
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditHistory(false)}
                            className="px-3 py-2 bg-gray-200 rounded"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default HistoryFlat;
