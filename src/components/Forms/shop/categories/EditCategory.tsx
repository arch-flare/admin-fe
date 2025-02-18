"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { get, post } from "@/utils/api";
import { ImagePlus, Loader2 } from "lucide-react";

interface Category {
    id: number;
    name: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean | number;
    created_at: string;
    updated_at: string;
}

interface FormData {
    name: string;
    description: string;
    is_active: boolean;
    image: File | null;
}

const EditShopCategory = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        name: "",
        description: "",
        is_active: true,
        image: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);

    // Get category ID from URL
    const { id } = useParams()

    useEffect(() => {
        const fetchCategory = async () => {
            if (!id) return;

            try {
                setFetchLoading(true);
                const response: any = await get<{ status: boolean; category: Category }>(`/categories/${id}`);

                if (response.status && response.category) {
                    const category = response.category;
                    setFormData({
                        name: category.name,
                        description: category.description || "",
                        is_active: category.is_active === 1 || category.is_active === true,
                        image: null,
                    });
                    if (category.image) {
                        setOriginalImage(category.image);
                        setImagePreview(category.image_url);
                    }
                } else {
                    setError("Category not found");
                    router.push('/shop/categories');
                }
            } catch (err) {
                setError("Failed to fetch category details");
                console.error("Error fetching category:", err);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCategory();
    }, [id, router]);

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
        if (!id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("is_active", formData.is_active ? "1" : "0");
            if (formData.image) {
                data.append("image", formData.image);
            }
            data.append("_method", "PUT"); // Laravel requires this for PUT requests

            const response: any = await post(`/categories/${id}`, data);

            if (response.status) {
                router.push('/shop/categories');
            } else {
                setError(response.message || "Failed to update category. Please try again.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update category. Please try again.");
            console.error("Error updating category:", err);
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
                    Edit Category
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
                                    Click to update image
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

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={loading || fetchLoading}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                'Update Category'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/shop/categories')}
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

export default EditShopCategory;