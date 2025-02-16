"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { ImagePlus, Loader2, X, Plus, Trash2 } from "lucide-react";

interface Category {
    id: number;
    name: string;
}

interface Variation {
    name: string;
    price: string;
    stock_quantity: string;
    sku: string;
    images: File[];
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
    variations: Variation[];
}

const AddProduct = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        category_id: '',
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        sku: '',
        is_active: true,
        images: [],
        variations: []
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [variationPreviews, setVariationPreviews] = useState<string[][]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response: any = await get('/categories');
                if (response.status) {
                    setCategories(response.categories);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

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

                // Check if this is a variation image
                const variationMatch = name.match(/variations\[(\d+)\]\.images/);
                if (variationMatch) {
                    const variationIndex = parseInt(variationMatch[1]);
                    handleVariationImageChange(variationIndex, filesArray);
                } else {
                    setFormData(prev => ({ ...prev, images: filesArray }));
                    const previews = filesArray.map(file => URL.createObjectURL(file));
                    setImagePreview(previews);
                }
            }
        } else {
            // Check if this is a variation field
            const variationMatch = name.match(/variations\[(\d+)\]\.(\w+)/);
            if (variationMatch) {
                const [_, index, field] = variationMatch;
                handleVariationFieldChange(parseInt(index), field, value);
            } else {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        }
    };

    const handleVariationFieldChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.map((variation, i) =>
                i === index ? { ...variation, [field]: value } : variation
            )
        }));
    };

    const handleVariationImageChange = (index: number, files: File[]) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.map((variation, i) =>
                i === index ? { ...variation, images: files } : variation
            )
        }));

        const previews = files.map(file => URL.createObjectURL(file));
        setVariationPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = previews;
            return newPreviews;
        });
    };

    const addVariation = () => {
        setFormData(prev => ({
            ...prev,
            variations: [...prev.variations, {
                name: '',
                price: '',
                stock_quantity: '',
                sku: '',
                images: []
            }]
        }));
        setVariationPreviews(prev => [...prev, []]);
    };

    const removeVariation = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }));

        // Cleanup variation preview URLs
        variationPreviews[index]?.forEach(previewUrl => {
            URL.revokeObjectURL(previewUrl);
        });
        setVariationPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeImage = (index: number, variationIndex?: number) => {
        if (typeof variationIndex === 'number') {
            // Remove variation image
            const newVariations = [...formData.variations];
            const newImages = [...newVariations[variationIndex].images];
            newImages.splice(index, 1);
            newVariations[variationIndex] = { ...newVariations[variationIndex], images: newImages };
            setFormData(prev => ({ ...prev, variations: newVariations }));

            const newPreviews = [...variationPreviews];
            URL.revokeObjectURL(newPreviews[variationIndex][index]);
            newPreviews[variationIndex].splice(index, 1);
            setVariationPreviews(newPreviews);
        } else {
            // Remove main product image
            const newImages = [...formData.images];
            newImages.splice(index, 1);
            setFormData(prev => ({ ...prev, images: newImages }));

            const newPreviews = [...imagePreview];
            URL.revokeObjectURL(newPreviews[index]);
            newPreviews.splice(index, 1);
            setImagePreview(newPreviews);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const data = new FormData();

            // Append basic product data
            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'images') {
                    formData.images.forEach(image => {
                        data.append('images[]', image);
                    });
                } else if (key === 'variations') {
                    // Skip variations here, we'll handle them separately
                } else {
                    data.append(key, value.toString());
                }
            });

            // Append variations data
            formData.variations.forEach((variation, index) => {
                Object.entries(variation).forEach(([key, value]) => {
                    if (key === 'images') {
                        variation.images.forEach(image => {
                            data.append(`variations[${index}][images][]`, image);
                        });
                    } else {
                        data.append(`variations[${index}][${key}]`, value.toString());
                    }
                });
            });

            const response: any = await post('/products', data);
            if (response.status) {
                router.push('/shop/products');
            } else {
                setError(response.message || 'Failed to create product');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product');
            console.error('Error creating product:', err);
        } finally {
            setLoading(false);
        }
    };

    // Cleanup function for image preview URLs
    useEffect(() => {
        return () => {
            // Cleanup main product image previews
            imagePreview.forEach(url => URL.revokeObjectURL(url));

            // Cleanup variation image previews
            variationPreviews.forEach(variations => {
                variations.forEach(url => URL.revokeObjectURL(url));
            });
        };
    }, []);

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">Add New Product</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    {/* Category Field */}
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

                    {/* Name Field */}
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

                    {/* Description Field */}
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

                    {/* Base Product Details Row */}
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

                    {/* Product Images */}
                    <div className="mb-4.5">
                        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                            Product Images <span className="text-meta-1">*</span>
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
                                        onClick={() => removeImage(index)}
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

                    {/* Active Status */}
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

                    {/* Variations Section */}
                    <div className="mb-4.5">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-black dark:text-white">
                                Product Variations
                            </label>
                            <button
                                type="button"
                                onClick={addVariation}
                                className="flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                            >
                                <Plus className="h-4 w-4" />
                                Add Variation
                            </button>
                        </div>

                        {formData.variations.map((variation, index) => (
                            <div key={index} className="mb-4 p-4 border border-stroke rounded-sm">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium">Variation #{index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeVariation(index)}
                                        className="text-danger hover:text-opacity-90"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Name <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name={`variations[${index}].name`}
                                            value={variation.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            SKU <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name={`variations[${index}].sku`}
                                            value={variation.sku}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Price <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name={`variations[${index}].price`}
                                            value={variation.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2.5 block text-black dark:text-white">
                                            Stock Quantity <span className="text-meta-1">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name={`variations[${index}].stock_quantity`}
                                            value={variation.stock_quantity}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2.5 block text-black dark:text-white">
                                        Images
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        {variationPreviews[index]?.map((preview, imgIndex) => (
                                            <div key={imgIndex} className="relative">
                                                <img
                                                    src={preview}
                                                    alt={`Variation ${index + 1} Preview ${imgIndex + 1}`}
                                                    className="h-24 w-24 rounded-lg object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(imgIndex, index)}
                                                    className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-primary hover:bg-gray-1 dark:hover:bg-meta-4">
                                            <input
                                                type="file"
                                                name={`variations[${index}].images`}
                                                onChange={handleChange}
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                            />
                                            <ImagePlus className="h-8 w-8 text-primary" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                'Create Product'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/shop/products')}
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

export default AddProduct;