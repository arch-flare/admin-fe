"use client";

import { useState } from "react";
import { post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import dynamic from "next/dynamic";

// Import TinyMCE with dynamic import
const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

export const CreateDesign = () => {
    const navigate = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditorChange = (content: string) => {
        setFormData((prev) => ({ ...prev, description: content }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const fileList = Array.from(e.target.files);
            setImages(prev => [...prev, ...fileList]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            images.forEach((image) => {
                data.append('images[]', image);
            });

            const response = await post("/designs", data);
            if (response.status) {
                navigate.push('/designs');
            } else {
                setError("Failed to create design. Please try again.");
            }
        } catch (err) {
            setError("Failed to create design. Please try again.");
            console.error("Error creating design:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Create New Design
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
                            Images <span className="text-meta-1">*</span>
                        </label>
                        <div className="border-2 border-dashed border-stroke p-6 text-center">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="cursor-pointer"
                            >
                                <Upload className="mx-auto h-12 w-12 text-body" />
                                <span className="mt-4 block text-sm font-medium">
                                    Click to upload images
                                </span>
                            </label>
                        </div>

                        {/* Preview Images */}
                        {images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={URL.createObjectURL(image)}
                                            alt={`Preview ${index + 1}`}
                                            className="h-24 w-24 rounded object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white"
                                        >
                                            ×
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
                                'Create Design'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate.push('/designs')}
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

export default CreateDesign;