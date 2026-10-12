"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get, put } from "@/utils/api";
import { Eye, Loader2 } from "lucide-react";
import { Badge } from "@/components/Badge";

export interface ConsultationRequest {
    id: number;
    type: "consultation" | "inquiry";
    name: string;
    email: string;
    phone: string | null;
    service_type: "design" | "build" | "interior" | "full" | null;
    project_location: string | null;
    budget_range: string | null;
    preferred_date: string | null;
    preferred_time: string | null;
    message: string | null;
    status: "new" | "contacted" | "scheduled" | "closed";
    created_at: string;
}

export const SERVICE_LABELS: Record<NonNullable<ConsultationRequest["service_type"]>, string> = {
    design: "Architectural design",
    build: "Construction & PM",
    interior: "Interior design",
    full: "Full design & build",
};

export const TYPE_TABS: { value: string; label: string }[] = [
    { value: "", label: "All" },
    { value: "consultation", label: "Consultations" },
    { value: "inquiry", label: "Inquiries" },
];

export const STATUSES: ConsultationRequest["status"][] = [
    "new",
    "contacted",
    "scheduled",
    "closed",
];

export const statusBadgeVariant = (status: string) => {
    switch (status) {
        case "new":
            return "info" as const;
        case "contacted":
            return "warning" as const;
        case "scheduled":
            return "success" as const;
        case "closed":
            return "secondary" as const;
        default:
            return "default" as const;
    }
};

export const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
          })
        : "—";

const ConsultationTable = () => {
    const router = useRouter();
    const [rows, setRows] = useState<ConsultationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [typeFilter, setTypeFilter] = useState<string>("");
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

    const fetchRequests = async (page: number, status: string, type: string) => {
        try {
            setLoading(true);
            const query = new URLSearchParams({ page: String(page) });
            if (status) query.set("status", status);
            if (type) query.set("type", type);
            const response: any = await get(`/consultation-requests?${query.toString()}`);
            if (response.status) {
                const data = response.consultation_requests;
                setRows(data.data);
                setPagination({
                    currentPage: data.current_page,
                    totalPages: data.last_page,
                    total: data.total,
                });
            }
        } catch (err) {
            console.error("Error fetching consultation requests:", err);
            setError("Failed to load consultation requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(1, statusFilter, typeFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, typeFilter]);

    const updateStatus = async (id: number, status: string) => {
        const previous = rows;
        setSavingId(id);
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status: status as any } : r)));
        try {
            await put(`/consultation-requests/${id}`, { status });
        } catch (err) {
            console.error("Error updating status:", err);
            setRows(previous);
        } finally {
            setSavingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6.5">
                <h3 className="font-medium text-black dark:text-white">
                    Consultations &amp; Inquiries ({pagination.total})
                </h3>
                <div className="flex gap-1">
                    {TYPE_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setTypeFilter(tab.value)}
                            className={`rounded px-3 py-1.5 text-sm font-medium ${
                                typeFilter === tab.value
                                    ? "bg-primary text-white"
                                    : "text-body hover:text-primary dark:text-bodydark"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded border border-stroke bg-transparent px-3 py-1.5 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:text-white"
                >
                    <option value="">All statuses</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                            {s}
                        </option>
                    ))}
                </select>
            </div>

            {rows.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-body dark:text-bodydark">
                    Nothing here yet.
                </p>
            ) : (
                <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                <th className="min-w-[190px] px-4 py-4 font-medium text-black dark:text-white">
                                    Contact
                                </th>
                                <th className="min-w-[160px] px-4 py-4 font-medium text-black dark:text-white">
                                    Type / Service
                                </th>
                                <th className="min-w-[130px] px-4 py-4 font-medium text-black dark:text-white">
                                    Submitted
                                </th>
                                <th className="min-w-[130px] px-4 py-4 font-medium text-black dark:text-white">
                                    Preferred
                                </th>
                                <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                                    Status
                                </th>
                                <th className="px-4 py-4 font-medium text-black dark:text-white">View</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row) => (
                                <tr key={row.id}>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="font-medium text-black dark:text-white">{row.name}</p>
                                        <span className="text-sm text-meta-3">{row.email}</span>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {row.type === "inquiry"
                                                ? "General inquiry"
                                                : row.service_type
                                                  ? SERVICE_LABELS[row.service_type]
                                                  : "—"}
                                        </p>
                                        {row.type === "inquiry" && row.message && (
                                            <span className="line-clamp-1 max-w-[260px] text-sm text-meta-3">
                                                {row.message}
                                            </span>
                                        )}
                                        {row.budget_range && (
                                            <span className="text-sm text-meta-3">{row.budget_range}</span>
                                        )}
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 text-black dark:border-strokedark dark:text-white">
                                        {formatDate(row.created_at)}
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 text-black dark:border-strokedark dark:text-white">
                                        {formatDate(row.preferred_date)}
                                        {row.preferred_time && (
                                            <span className="block text-sm capitalize text-meta-3">
                                                {row.preferred_time}
                                            </span>
                                        )}
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={row.status}
                                                disabled={savingId === row.id}
                                                onChange={(e) => updateStatus(row.id, e.target.value)}
                                                className="rounded border border-stroke bg-transparent px-2 py-1 text-sm capitalize text-black outline-none focus:border-primary disabled:opacity-50 dark:border-strokedark dark:text-white"
                                            >
                                                {STATUSES.map((s) => (
                                                    <option key={s} value={s} className="capitalize">
                                                        {s}
                                                    </option>
                                                ))}
                                            </select>
                                            {savingId === row.id && (
                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <button
                                            onClick={() => router.push(`/consultations/${row.id}`)}
                                            className="hover:text-primary"
                                            title="View request"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark sm:px-6">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Page <span className="font-medium">{pagination.currentPage}</span> of{" "}
                        <span className="font-medium">{pagination.totalPages}</span>
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fetchRequests(pagination.currentPage - 1, statusFilter, typeFilter)}
                            disabled={pagination.currentPage === 1}
                            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => fetchRequests(pagination.currentPage + 1, statusFilter, typeFilter)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultationTable;
