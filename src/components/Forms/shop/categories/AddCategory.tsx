"use client";

import { useState } from "react";
import { post } from "@/utils/api";
import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";

// Add Category Component
export const AddShopCategory = () => {
    const navigate = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true,
        image: null as File | null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checkbox = e.target as HTMLInputElement;
            setFormData((prev) => ({ ...prev, [name]: checkbox.checked }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData((prev) => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            // Convert boolean to 1 or 0
            data.append("is_active", formData.is_active ? "1" : "0");
            if (formData.image) {
                data.append("image", formData.image);
            }

            const response = await post("/categories", data);
            if (response.status) {
                navigate.push('/shop/categories')
            } else {
                setError("Failed to create category. Please try again.");
            }
        } catch (err) {
            setError("Failed to create category. Please try again.");
            console.error("Error creating category:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Add New Category
                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Name <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter category name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Description
                        </label>
                        <textarea
                            name="description"
                            placeholder="Enter category description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Category Image
                        </label>
                        <div className="relative">
                            <input
                                type="file"
                                name="image"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex items-center gap-3 cursor-pointer"
                            >
                                <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-primary rounded-lg hover:bg-gray-1 dark:hover:bg-meta-4">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <ImagePlus className="w-8 h-8 text-primary" />
                                    )}
                                </div>
                                <span className="text-sm text-black dark:text-white">
                                    Click to upload image
                                </span>
                            </label>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4.5">
                            <div className="bg-danger bg-opacity-10 text-danger px-4 py-3 rounded">
                                {error}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                    >
                        {loading ? "Creating..." : "Create Category"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddShopCategory;