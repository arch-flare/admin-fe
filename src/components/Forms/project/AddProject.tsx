"use client";

import { useState, useEffect } from "react";
import { post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";

export const AddProject = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        status: "pending",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const [validationErrors, setValidationErrors] = useState({
        title: "",
        location: "",
        start_date: "",
        end_date: "",
    });
    const [touched, setTouched] = useState({
        title: false,
        location: false,
        start_date: false,
        end_date: false,
    });

    interface ValidationErrors {
        title: string;
        location: string;
        start_date: string;
        end_date: string;
    }

    interface TouchedFields {
        title: boolean;
        location: boolean;
        start_date: boolean;
        end_date: boolean;
    }

    const validateField = (name: string, value: string): string => {
        let errorMessage = "";
        
        switch (name) {
            case "title":
                if (!value.trim()) {
                    errorMessage = "Project title is required";
                } else if (value.trim().length < 3) {
                    errorMessage = "Title must be at least 3 characters";
                }
                break;
            case "location":
                if (!value.trim()) {
                    errorMessage = "Location is required";
                }
                break;
            case "start_date":
                if (!value) {
                    errorMessage = "Start date is required";
                }
                break;
            case "end_date":
                if (value && formData.start_date && new Date(value) < new Date(formData.start_date)) {
                    errorMessage = "End date must be after start date";
                }
                break;
            default:
                break;
        }
        
        return errorMessage;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        
        if (name in touched && touched[name as keyof TouchedFields]) {
            const errorMessage = validateField(name, value);
            setValidationErrors(prev => ({ ...prev, [name]: errorMessage }));
        }
        
        // Special case for start_date affecting end_date validation
        if (name === "start_date" && formData.end_date) {
            const endDateError = validateField("end_date", formData.end_date);
            setValidationErrors(prev => ({ ...prev, end_date: endDateError }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTouched((prev: TouchedFields) => ({ ...prev, [name]: true }));
        const errorMessage = validateField(name, value);
        setValidationErrors((prev: ValidationErrors) => ({ ...prev, [name]: errorMessage }));
    };

    const validateForm = () => {
        const newErrors = {
            title: validateField("title", formData.title),
            location: validateField("location", formData.location),
            start_date: validateField("start_date", formData.start_date),
            end_date: validateField("end_date", formData.end_date)
        };
        
        setValidationErrors(newErrors);
        
        // Check if any errors exist
        return !Object.values(newErrors).some(error => error !== "");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Set all fields as touched to show all validation errors
        setTouched({
            title: true,
            location: true,
            start_date: true,
            end_date: true,
        });
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setError(null);

        try {
            const response = await post("/projects", formData);
            if (response.status) {
                router.push('/projects');
            } else {
                setError("Failed to create project. Please try again.");
            }
        } catch (err) {
            setError("Failed to create project. Please try again.");
            console.error("Error creating project:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Add New Project
                </h3>
            </div>
            <form onSubmit={handleSubmit} noValidate>
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
                            onBlur={handleBlur}
                            required
                            className={`w-full rounded border-[1.5px] ${
                                validationErrors.title && touched.title 
                                    ? "border-danger" 
                                    : "border-stroke"
                            } bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                        />
                        {validationErrors.title && touched.title && (
                            <p className="text-danger text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {validationErrors.title}
                            </p>
                        )}
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter project description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
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
                            onBlur={handleBlur}
                            required
                            className={`w-full rounded border-[1.5px] ${
                                validationErrors.location && touched.location 
                                    ? "border-danger" 
                                    : "border-stroke"
                            } bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                        />
                        {validationErrors.location && touched.location && (
                            <p className="text-danger text-sm mt-1 flex items-center">
                                <AlertCircle className="w-4 h-4 mr-1" />
                                {validationErrors.location}
                            </p>
                        )}
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
                                onBlur={handleBlur}
                                required
                                className={`w-full rounded border-[1.5px] ${
                                    validationErrors.start_date && touched.start_date 
                                        ? "border-danger" 
                                        : "border-stroke"
                                } bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                            />
                            {validationErrors.start_date && touched.start_date && (
                                <p className="text-danger text-sm mt-1 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {validationErrors.start_date}
                                </p>
                            )}
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
                                onBlur={handleBlur}
                                min={formData.start_date}
                                className={`w-full rounded border-[1.5px] ${
                                    validationErrors.end_date && touched.end_date 
                                        ? "border-danger" 
                                        : "border-stroke"
                                } bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary`}
                            />
                            {validationErrors.end_date && touched.end_date && (
                                <p className="text-danger text-sm mt-1 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    {validationErrors.end_date}
                                </p>
                            )}
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

                    {error && (
                        <div className="mb-4.5">
                            <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 rounded flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Create Project'
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

export default AddProject;