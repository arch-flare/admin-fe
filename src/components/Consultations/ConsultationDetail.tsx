"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, put } from "@/utils/api";
import { ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/Badge";
import {
    ConsultationRequest,
    SERVICE_LABELS,
    STATUSES,
    statusBadgeVariant,
    formatDate,
} from "@/components/Tables/ConsultationTable";

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="border-b border-stroke py-4 last:border-b-0 dark:border-strokedark">
        <dt className="mb-1 text-xs font-semibold uppercase tracking-wide text-body dark:text-bodydark">
            {label}
        </dt>
        <dd className="text-black dark:text-white">{children || "—"}</dd>
    </div>
);

const ConsultationDetail = () => {
    const router = useRouter();
    const { id } = useParams();
    const [item, setItem] = useState<ConsultationRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                const response: any = await get(`/consultation-requests/${id}`);
                if (response.status) setItem(response.consultation_request);
            } catch (err) {
                console.error("Error fetching consultation request:", err);
                setError("Failed to load this request");
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const updateStatus = async (status: string) => {
        if (!item) return;
        const previous = item.status;
        setSaving(true);
        setItem({ ...item, status: status as any });
        try {
            await put(`/consultation-requests/${item.id}`, { status });
        } catch (err) {
            console.error("Error updating status:", err);
            setItem({ ...item, status: previous });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <p className="text-danger">{error || "Not found"}</p>
                <button
                    onClick={() => router.push("/consultations")}
                    className="mt-4 text-primary hover:underline"
                >
                    Back to all requests
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <button
                onClick={() => router.push("/consultations")}
                className="flex w-fit items-center gap-2 text-sm font-medium text-body hover:text-primary dark:text-bodydark"
            >
                <ArrowLeft className="h-4 w-4" /> All requests
            </button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark lg:col-span-2">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-semibold text-black dark:text-white">{item.name}</h3>
                        <Badge variant={statusBadgeVariant(item.status)}>
                            <span className="capitalize">{item.status}</span>
                        </Badge>
                    </div>
                    <p className="mb-6 text-sm text-body dark:text-bodydark">
                        Submitted {formatDate(item.created_at)}
                    </p>

                    <dl>
                        <Row label="Service requested">{SERVICE_LABELS[item.service_type]}</Row>
                        <Row label="Project location">{item.project_location}</Row>
                        <Row label="Approx. budget">{item.budget_range}</Row>
                        <Row label="Preferred date">
                            {formatDate(item.preferred_date)}
                            {item.preferred_time && (
                                <span className="capitalize"> · {item.preferred_time}</span>
                            )}
                        </Row>
                        <Row label="Message">
                            <p className="whitespace-pre-line leading-relaxed">{item.message}</p>
                        </Row>
                    </dl>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-body dark:text-bodydark">
                            Contact
                        </h4>
                        <a
                            href={`mailto:${item.email}`}
                            className="mb-3 flex items-center gap-2 text-black hover:text-primary dark:text-white"
                        >
                            <Mail className="h-4 w-4" /> {item.email}
                        </a>
                        <a
                            href={`tel:${item.phone.replace(/\s+/g, "")}`}
                            className="flex items-center gap-2 text-black hover:text-primary dark:text-white"
                        >
                            <Phone className="h-4 w-4" /> {item.phone}
                        </a>
                    </div>

                    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-body dark:text-bodydark">
                            Update status
                        </h4>
                        <div className="flex items-center gap-3">
                            <select
                                value={item.status}
                                disabled={saving}
                                onChange={(e) => updateStatus(e.target.value)}
                                className="w-full rounded border border-stroke bg-transparent px-3 py-2 capitalize text-black outline-none focus:border-primary disabled:opacity-50 dark:border-strokedark dark:text-white"
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s} className="capitalize">
                                        {s}
                                    </option>
                                ))}
                            </select>
                            {saving && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsultationDetail;
