"use client";

import { useState, useEffect } from "react";
import { post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ImagePlus, X } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export const AddProject = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        start_date: "",
        end_date: "",
        status: "pending",
        featured_on_home: false,
        home_excerpt: "",
        home_order: 0,
    });
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
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

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const newPhotos = Array.from(files).filter((file) => file.type.startsWith("image/"));
        setSelectedPhotos((prev) => [...prev, ...newPhotos]);

        newPhotos.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreviewUrls((prev) => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });

        e.target.value = "";
    };

    const removeSelectedPhoto = (index: number) => {
        setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
        setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
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
            const response: any = await post("/projects", formData);
            if (response.status) {
                const projectId = response.project?.id;

                // Upload any photos picked before the project existed.
                if (projectId && selectedPhotos.length > 0) {
                    const photoData = new FormData();
                    selectedPhotos.forEach((photo, index) => {
                        photoData.append(`photos[${index}]`, photo);
                    });
                    try {
                        await post(`/projects/${projectId}/photos`, photoData, { timeout: 300000 });
                    } catch (photoErr) {
                        console.error("Error uploading project photos:", photoErr);
                        // The project itself was created fine; let the admin add
                        // photos from its page rather than losing the project.
                    }
                }

                if (projectId) {
                    router.push(`/projects/${projectId}/show`);
                } else {
                    router.push('/projects');
                }
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
                        <Editor
                            value={formData.description}
                            onChange={(content: string) =>
                                setFormData((prev) => ({ ...prev, description: content }))
                            }
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Images
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handlePhotoChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="project-image-upload"
                            />
                            <label
                                htmlFor="project-image-upload"
                                className="flex cursor-pointer items-center gap-3"
                            >
                                <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-primary hover:bg-gray-1 dark:hover:bg-meta-4">
                                    <ImagePlus className="h-8 w-8 text-primary" />
                                </div>
                                <span className="text-sm text-black dark:text-white">
                                    Click to upload photos
                                </span>
                            </label>
                        </div>

                        {photoPreviewUrls.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                                {photoPreviewUrls.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="h-32 w-full rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedPhoto(index)}
                                            className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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