"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { ImagePlus, Loader2, X } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    category_id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    is_active: boolean;
    images: string[];
    category: Category;
}

interface FormData {
    category_id: string;
    name: string;
    description: string;
    price: string;
    stock_quantity: string;
    sku: string;
    is_active: boolean;
    images: File[];
}

const EditProduct = () => {
    const router = useRouter();
    const { id } = useParams();
    const [formData, setFormData] = useState<FormData>({
        category_id: '',
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        sku: '',
        is_active: true,
        images: []
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setFetchLoading(true);
                // Fetch categories
                const categoriesResponse: any = await get('/categories');
                if (categoriesResponse.status) {
                    setCategories(categoriesResponse.categories);
                }

                // Fetch product details
                const productResponse: any = await get(`/products/${id}`);
                if (productResponse.status && productResponse.product) {
                    const product = productResponse.product;
                    setFormData({
                        category_id: product.category_id.toString(),
                        name: product.name,
                        description: product.description,
                        price: product.price.toString(),
                        stock_quantity: product.stock_quantity.toString(),
                        sku: product.sku,
                        is_active: product.is_active,
                        images: []
                    });
                    setExistingImages(product.images || []);
                    setImagePreview(product.images || []);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load product data');
            } finally {
                setFetchLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checkbox = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checkbox.checked }));
        } else if (type === 'file') {
            const fileInput = e.target as HTMLInputElement;
            if (fileInput.files) {
                const filesArray = Array.from(fileInput.files);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...filesArray]
                }));

                // Create preview URLs for new images
                const newPreviews = filesArray.map(file => URL.createObjectURL(file));
                setImagePreview(prev => [...prev, ...newPreviews]);
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const removeExistingImage = (imageUrl: string, index: number) => {
        setImagesToDelete(prev => [...prev, imageUrl]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        const adjustedIndex = index - existingImages.length;
        const newImages = [...formData.images];
        newImages.splice(adjustedIndex, 1);
        setFormData(prev => ({ ...prev, images: newImages }));

        // Remove preview
        const previewIndex = existingImages.length + adjustedIndex;
        URL.revokeObjectURL(imagePreview[previewIndex]);
        setImagePreview(prev => [
            ...prev.slice(0, previewIndex),
            ...prev.slice(previewIndex + 1)
        ]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'images') {
                    formData.images.forEach(image => {
                        data.append('images[]', image);
                    });
                } else {
                    data.append(key, value.toString());
                }
            });

            // Add images to delete
            imagesToDelete.forEach(image => {
                data.append('images_to_delete[]', image);
            });

            // Add method for Laravel
            data.append('_method', 'PUT');

            const response:any = await post(`/products/${id}`, data);
            if (response.status) {
                router.push('/products');
            } else {
                setError(response.message || 'Failed to update product');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update product');
            console.error('Error updating product:', err);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    Edit Product
                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Category <span className="text-meta-1">*</span>
                        </label>
                        <select
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Name <span className="text-meta-1">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter product name"
                            value={formData.name}
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
                            placeholder="Enter product description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        />
                    </div>

                    <div className="mb-4.5 grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Price <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="number"
                                name="price"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Stock Quantity <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock_quantity"
                                placeholder="0"
                                value={formData.stock_quantity}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>

                        <div>
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                SKU <span className="text-meta-1">*</span>
                            </label>
                            <input
                                type="text"
                                name="sku"
                                placeholder="Enter SKU"
                                value={formData.sku}
                                onChange={handleChange}
                                required
                                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Product Images
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {imagePreview.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="h-24 w-24 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            index < existingImages.length
                                                ? removeExistingImage(preview, index)
                                                : removeNewImage(index)
                                        }
                                        className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-primary hover:bg-gray-1 dark:hover:bg-meta-4">
                                <input
                                    type="file"
                                    name="images"
                                    onChange={handleChange}
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                />
                                <ImagePlus className="h-8 w-8 text-primary" />
                            </label>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex cursor-pointer select-none items-center">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    className="sr-only"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                />
                                <div className="box mr-4 flex h-5 w-5 items-center justify-center rounded border border-stroke dark:border-strokedark">
                                    <span className={`text-white ${formData.is_active ? 'opacity-100' : 'opacity-0'}`}>
                                        <svg
                                            className="fill-current"
                                            width="10"
                                            height="7"
                                            viewBox="0 0 10 7"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M9.70685 0.292804C9.89455 0.480344 10 0.734667 10 0.999847C10 1.26503 9.89455 1.51935 9.70685 1.70689L4.70059 6.7072C4.51283 6.89468 4.2582 7 3.9927 7C3.72721 7 3.47258 6.89468 3.28482 6.7072L0.281063 3.70701C0.0986771 3.5184 -0.00224342 3.26578 3.785e-05 3.00357C0.00231912 2.74136 0.10762 2.49053 0.29326 2.30511C0.4789 2.11969 0.730026 2.01451 0.992551 2.01224C1.25508 2.00996 1.50799 2.11076 1.69683 2.29293L3.9927 4.58607L8.29108 0.292804C8.47884 0.105322 8.73347 0 8.99896 0C9.26446 0 9.51908 0.105322 9.70685 0.292804Z"
                                                fill=""
                                            />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                            Active Status
                        </label>
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
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                'Update Product'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/products')}
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

export default EditProduct;