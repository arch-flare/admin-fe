"use client";

import { useState, useEffect } from "react";
import { get, post } from "@/utils/api";
import { useParams, useRouter } from "next/navigation";
import { ImagePlus, X, Loader2 } from "lucide-react";

interface Timeline {
    id: number;
    project_id: number;
    title: string;
    description: string;
    timeline_date: string;
    images: {
        id: number;
        image_path: string;
    }[];
}

interface FormData {
    title: string;
    description: string;
    timeline_date: string;
}

const EditTimeline = () => {
    const router = useRouter();
    const { id: projectId, timelineId } = useParams();

    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
        timeline_date: "",
    });

    const [existingImages, setExistingImages] = useState<{ id: number; image_path: string; }[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTimeline = async () => {
            if (!projectId || !timelineId) return;

            try {
                setFetchLoading(true);
                const response: any = await get<{ status: boolean; timeline: Timeline }>(
                    `/projects/${projectId}/timelines/${timelineId}`
                );

                if (response.status && response.timeline) {
                    const timeline = response.timeline;
                    setFormData({
                        title: timeline.title,
                        description: timeline.description,
                        timeline_date: timeline.timeline_date,
                    });
                    setExistingImages(timeline.images);
                } else {
                    setError("Timeline not found");
                    router.push(`/projects/${projectId}`);
                }
            } catch (err) {
                setError("Failed to fetch timeline details");
                console.error("Error fetching timeline:", err);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchTimeline();
    }, [projectId, timelineId, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // Convert FileList to Array and filter for only images
        const newImages = Array.from(files).filter(file => file.type.startsWith('image/'));

        const totalImages = existingImages.length + selectedImages.length + newImages.length;
        if (totalImages > 4) {
            alert('You can only have up to 4 images total');
            return;
        }

        setSelectedImages(prev => [...prev, ...newImages]);

        // Create preview URLs for new images
        newImages.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrls(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId: number) => {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId || !timelineId) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("timeline_date", formData.timeline_date);

            // Add remaining existing image IDs
            data.append("remaining_images", JSON.stringify(existingImages.map(img => img.id)));

            // Append each new image
            selectedImages.forEach((image, index) => {
                data.append(`images[${index}]`, image);
            });

            // Laravel requires this for PUT requests
            data.append("_method", "PUT");

            const response = await post(`/projects/${projectId}/timelines/${timelineId}`, data);

            if (response.status) {
                router.push(`/projects/${projectId}`);
            } else {
                setError("Failed to update timeline entry. Please try again.");
            }
        } catch (err) {
            setError("Failed to update timeline entry. Please try again.");
            console.error("Error updating timeline:", err);
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
                    Edit Timeline Entry
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
                            placeholder="Enter timeline title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Description <span className="text-meta-1">*</span>
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter timeline description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Date <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="date"
                            name="timeline_date"
                            value={formData.timeline_date}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Images
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                multiple
                                className="hidden"
                                id="image-upload"
                                disabled={existingImages.length + selectedImages.length >= 4}
                            />
                            <label
                                htmlFor="image-upload"
                                className={`flex items-center gap-3 cursor-pointer ${existingImages.length + selectedImages.length >= 4 ?
                                        'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-primary rounded-lg hover:bg-gray-1 dark:hover:bg-meta-4">
                                    <ImagePlus className="w-8 h-8 text-primary" />
                                </div>
                                <span className="text-sm text-black dark:text-white">
                                    {existingImages.length + selectedImages.length >= 4
                                        ? 'Maximum 4 images allowed'
                                        : 'Click to upload images (max 4)'}
                                </span>
                            </label>
                        </div>

                        {/* Existing Images */}
                        {existingImages.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {existingImages.map((image) => (
                                    <div key={image.id} className="relative">
                                        <img
                                            src={image.image_path}
                                            alt={`Image ${image.id}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(image.id)}
                                            className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-opacity-90"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* New Images Preview */}
                        {imagePreviewUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviewUrls.map((url, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={url}
                                            alt={`New Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 hover:bg-opacity-90"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
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
                            disabled={loading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Update Timeline Entry'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push(`/projects/${projectId}`)}
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

export default EditTimeline;