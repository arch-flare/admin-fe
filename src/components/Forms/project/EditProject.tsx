"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Project {
    id: number;
    title: string;
    description: string;
    location: string;
    status: 'pending' | 'in_progress' | 'completed';
    featured_on_home?: boolean;
    home_excerpt?: string | null;
    home_order?: number;
    start_date: string;
    end_date: string | null;
    created_at: string;
    updated_at: string;
}

interface FormData {
    title: string;
    description: string;
    location: string;
    status: string;
    start_date: string;
    end_date: string;
    featured_on_home: boolean;
    home_excerpt: string;
    home_order: number;
}

const EditProject = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        location: "",
        status: "pending",
        start_date: "",
        end_date: "",
        featured_on_home: false,
        home_excerpt: "",
        home_order: 0,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams();

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            try {
                setFetchLoading(true);
                const response: any = await get<{ status: boolean; project: Project }>(`/projects/${id}`);

                if (response.status && response.project) {
                    const project = response.project;
                    // Normalize the dates to YYYY-MM-DD format
                    const startDate = project.start_date.split("T")[0]; // Extract YYYY-MM-DD
                    const endDate = project.end_date ? project.end_date.split("T")[0] : "";
                    
                    setFormData({
                        title: project.title,
                        description: project.description || "",
                        location: project.location,
                        status: project.status,
                        start_date: startDate,
                        end_date: endDate,
                        featured_on_home: Boolean(project.featured_on_home),
                        home_excerpt: project.home_excerpt || "",
                        home_order: project.home_order ?? 0,
                    });
                } else {
                    setError("Project not found");
                    router.push('/projects');
                }
            } catch (err) {
                setError("Failed to fetch project details");
                console.error("Error fetching project:", err);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchProject();
    }, [id, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) return;
                if (key === "featured_on_home") {
                    data.append(key, value ? "1" : "0");
                } else {
                    data.append(key, String(value));
                }
            });
            data.append("_method", "PUT");

            const response: any = await post(`/projects/${id}`, data);

            if (response.status) {
                router.push('/projects');
            } else {
                setError(response.message || "Failed to update project. Please try again.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update project. Please try again.");
            console.error("Error updating project:", err);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Edit Project
                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Title <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            placeholder="Enter project title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Description
                        </label>
                        <Editor
                            value={formData.description}
                            onChange={(content: string) =>
                                setFormData((prev) => ({ ...prev, description: content }))
                            }
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Location <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="location"
                            placeholder="Enter project location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Start Date <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="date"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                End Date
                            </label>
                            <input
                                type="date"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                min={formData.start_date}
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="mb-4.5 rounded border border-stroke p-4 dark:border-strokedark">
                        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-black dark:text-white">
                            <input
                                type="checkbox"
                                checked={formData.featured_on_home}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, featured_on_home: e.target.checked }))
                                }
                                className="h-4 w-4"
                            />
                            Feature this project in the home page &ldquo;Excellence in Every Detail&rdquo; section
                        </label>

                        {formData.featured_on_home && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_120px]">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Home card summary
                                    </label>
                                    <textarea
                                        rows={3}
                                        maxLength={600}
                                        placeholder="Short plain-text blurb shown on the home card (falls back to the description if left blank)"
                                        value={formData.home_excerpt}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, home_excerpt: e.target.value }))
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                                        Order
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={formData.home_order}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, home_order: Number(e.target.value) || 0 }))
                                        }
                                        className="w-full rounded border-[1.5px] border-stroke bg-transparent px-4 py-2.5 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4.5">
                            <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 rounded">
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || fetchLoading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Update Project'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/projects')}
                            className="flex w-full justify-center rounded bg-body p-3 font-medium text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProject;