"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, post, remove, getFullImageUrl } from "@/utils/api";
import { Loader2, ImagePlus, Star, Trash2, X } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface ProjectPhoto {
    id: number;
    project_id: number;
    image_path: string;
    is_home_cover?: boolean;
}

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
    photos?: ProjectPhoto[];
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

    const [photos, setPhotos] = useState<ProjectPhoto[]>([]);
    const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
    const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);
    const [settingCoverId, setSettingCoverId] = useState<number | null>(null);
    const [photoError, setPhotoError] = useState<string | null>(null);

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
                    setPhotos(project.photos || []);
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
                router.push(`/projects/${id}/show`);
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

    const handleUploadPhotos = async () => {
        if (!id || selectedPhotos.length === 0) return;

        setUploadingPhotos(true);
        setPhotoError(null);

        try {
            const data = new FormData();
            selectedPhotos.forEach((photo, index) => {
                data.append(`photos[${index}]`, photo);
            });

            const response: any = await post(`/projects/${id}/photos`, data, { timeout: 300000 });

            if (response.status) {
                setPhotos(response.photos);
                setSelectedPhotos([]);
                setPhotoPreviewUrls([]);
            } else {
                setPhotoError("Failed to upload project photos. Please try again.");
            }
        } catch (err) {
            setPhotoError("Failed to upload project photos. Please try again.");
            console.error("Error uploading project photos:", err);
        } finally {
            setUploadingPhotos(false);
        }
    };

    const handleDeletePhoto = async (photoId: number) => {
        if (window.confirm('Are you sure you want to delete this project photo?')) {
            try {
                await remove(`/project-photos/${photoId}`);
                setPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
            } catch (err) {
                console.error('Error deleting project photo:', err);
                alert('Failed to delete project photo');
            }
        }
    };

    const handleSetHomeCover = async (photoId: number) => {
        if (!id) return;

        setSettingCoverId(photoId);
        try {
            const response: any = await post(`/projects/${id}/photos/${photoId}/home-cover`, {});
            if (response.status) {
                setPhotos(response.photos);
            } else {
                alert('Failed to set the home cover photo');
            }
        } catch (err) {
            console.error('Error setting home cover photo:', err);
            alert('Failed to set the home cover photo');
        } finally {
            setSettingCoverId(null);
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
        <div className="flex flex-col gap-10">
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
                            onClick={() => router.push(`/projects/${id}/show`)}
                            className="flex w-full justify-center rounded bg-body p-3 font-medium text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-black dark:text-white">
                        Project Photos
                    </h3>
                    <label
                        htmlFor="edit-project-photo-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                    >
                        <ImagePlus size={16} />
                        Add Photos
                    </label>
                    <input
                        id="edit-project-photo-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                </div>
            </div>

            <div className="p-6.5">
                {selectedPhotos.length > 0 && (
                    <div className="mb-6 rounded-sm border border-stroke p-4 dark:border-strokedark">
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm font-medium text-black dark:text-white">
                                Ready to upload {selectedPhotos.length} photo{selectedPhotos.length === 1 ? '' : 's'}
                            </p>
                            <button
                                type="button"
                                onClick={handleUploadPhotos}
                                disabled={uploadingPhotos}
                                className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                            >
                                {uploadingPhotos ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus size={16} />}
                                Upload
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                    </div>
                )}

                {photoError && (
                    <div className="mb-4.5 rounded bg-danger bg-opacity-10 px-4 py-3 text-danger">
                        {photoError}
                    </div>
                )}

                {photos.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No project photos yet
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {photos.map((photo) => (
                            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg">
                                <img
                                    src={getFullImageUrl(photo.image_path)}
                                    alt={`Project photo ${photo.id}`}
                                    className="h-full w-full object-cover transition group-hover:scale-105"
                                />
                                {photo.is_home_cover && (
                                    <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-primary px-2 py-1 text-xs font-medium text-white">
                                        <Star size={12} className="fill-current" />
                                        Home cover
                                    </span>
                                )}
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-black/60 p-2 opacity-0 transition group-hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={() => handleSetHomeCover(photo.id)}
                                        disabled={photo.is_home_cover || settingCoverId === photo.id}
                                        className="flex items-center gap-1 rounded bg-white/90 px-2 py-1 text-xs font-medium text-black hover:bg-white disabled:cursor-default disabled:opacity-60"
                                        title="Show this photo on the home page"
                                    >
                                        {settingCoverId === photo.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                        ) : (
                                            <Star size={12} />
                                        )}
                                        {photo.is_home_cover ? 'Home cover' : 'Set as home cover'}
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="absolute right-2 top-2 rounded-full bg-danger p-2 text-white opacity-0 transition hover:bg-opacity-90 group-hover:opacity-100"
                                    title="Delete Project Photo"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default EditProject;