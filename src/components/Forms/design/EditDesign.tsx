"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { Loader2, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";

// Dynamic import for the Editor component
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Design {
    id: number;
    title: string;
    description: string;
    images: Array<{
        id: number;
        image_path: string;
    }>;
    created_at: string;
    updated_at: string;
}

interface FormData {
    title: string;
    description: string;
}

const EditDesign = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        title: "",
        description: "",
    });
    const [existingImages, setExistingImages] = useState<Design['images']>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get design ID from URL
    const { id } = useParams();

    useEffect(() => {
        const fetchDesign = async () => {
            if (!id) return;

            try {
                setFetchLoading(true);
                const response: any = await get<{ status: boolean; design: Design }>(`/designs/${id}`);

                if (response.status && response.design) {
                    const design = response.design;
                    setFormData({
                        title: design.title,
                        description: design.description || "",
                    });
                    setExistingImages(design.images);
                } else {
                    setError("Design not found");
                    router.push('/designs');
                }
            } catch (err) {
                setError("Failed to fetch design details");
                console.error("Error fetching design:", err);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchDesign();
    }, [id, router]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (content: string) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setNewImages(prev => [...prev, ...fileList]);
        }
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = async (imageId: number) => {
        try {
            const response = await post(`/design-images/${imageId}`, {
                _method: 'DELETE'
            });

            if (response.status) {
                setExistingImages(prev => prev.filter(img => img.id !== imageId));
            }
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Failed to delete image");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('_method', 'PUT');
            data.append('title', formData.title);
            data.append('description', formData.description);

            // Append new images
            newImages.forEach((image) => {
                data.append('images[]', image);
            });

            const response:any = await post(`/designs/${id}`, data);

            if (response.status) {
                router.push('/designs');
            } else {
                setError(response.message || "Failed to update design. Please try again.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update design. Please try again.");
            console.error("Error updating design:", err);
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
                    Edit Design
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
                            placeholder="Enter design title"
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
                        <Editor
                            value={formData.description}
                            onChange={handleEditorChange}
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Existing Images
                        </label>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {existingImages.map((image) => (
                                <div key={image.id} className="relative group">
                                    <Image
                                        src={`/storage/${image.image_path}`}
                                        alt="Design image"
                                        width={200}
                                        height={200}
                                        className="rounded-lg object-cover w-full h-48"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(image.id)}
                                        className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Add New Images
                        </label>
                        <div className="border-2 border-dashed border-stroke p-6 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleNewImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer"
                            >
                                <Upload className="mx-auto h-12 w-12 text-body" />
                                <span className="mt-4 block text-sm font-medium">
                                    Click to upload new images
                                </span>
                            </label>
                        </div>

                        {/* Preview New Images */}
                        {newImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {newImages.map((image, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                            className="rounded-lg object-cover w-full h-48"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeNewImage(index)}
                                            className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
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
                            disabled={loading || fetchLoading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Update Design'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/designs')}
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

export default EditDesign;