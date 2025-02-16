"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
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
    existingImages?: string[];
    imagesToDelete?: string[];
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
    variations: Array<{
        name: string;
        price: number;
        stock_quantity: number;
        sku: string;
        images: string[];
    }>;
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
    variations: Variation[];
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
        images: [],
        variations: []
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [variationPreviews, setVariationPreviews] = useState<string[][]>([]);

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

                    // Format variations data
                    const formattedVariations = product.variations?.map((variation: any) => ({
                        name: variation.name,
                        price: variation.price.toString(),
                        stock_quantity: variation.stock_quantity.toString(),
                        sku: variation.sku,
                        images: [],
                        existingImages: variation.image_urls || [],
                        imagesToDelete: []
                    })) || [];

                    setFormData({
                        category_id: product.category_id.toString(),
                        name: product.name,
                        description: product.description,
                        price: product.price.toString(),
                        stock_quantity: product.stock_quantity.toString(),
                        sku: product.sku,
                        is_active: product.is_active,
                        images: [],
                        variations: formattedVariations
                    });

                    setExistingImages(product.image || []);
                    setImagePreview(product.image_urls || []);

                    // Set variation previews
                    setVariationPreviews(
                        formattedVariations.map((v:any) => v.existingImages || [])
                    );
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

                // Check if this is a variation image
                const variationMatch = name.match(/variations\[(\d+)\]\.images/);
                if (variationMatch) {
                    const variationIndex = parseInt(variationMatch[1]);
                    handleVariationImageChange(variationIndex, filesArray);
                } else {
                    setFormData(prev => ({
                        ...prev,
                        images: [...prev.images, ...filesArray]
                    }));
                    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
                    setImagePreview(prev => [...prev, ...newPreviews]);
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
                i === index ? { ...variation, images: [...variation.images, ...files] } : variation
            )
        }));

        const previews = files.map(file => URL.createObjectURL(file));
        setVariationPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[index] = [...(newPreviews[index] || []), ...previews];
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
                images: [],
                existingImages: [],
                imagesToDelete: []
            }]
        }));
        setVariationPreviews(prev => [...prev, []]);
    };

    const removeVariation = (index: number) => {
        // Cleanup variation preview URLs
        variationPreviews[index]?.forEach(url => {
            if (!formData.variations[index].existingImages?.includes(url)) {
                URL.revokeObjectURL(url);
            }
        });

        setFormData(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }));
        setVariationPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageUrl: string, index: number) => {
        setImagesToDelete(prev => [...prev, imageUrl]);
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const removeVariationExistingImage = (variationIndex: number, imageUrl: string, imageIndex: number) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.map((variation, idx) => {
                if (idx === variationIndex) {
                    return {
                        ...variation,
                        existingImages: variation.existingImages?.filter((_, i) => i !== imageIndex),
                        imagesToDelete: [...(variation.imagesToDelete || []), imageUrl]
                    };
                }
                return variation;
            })
        }));

        setVariationPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[variationIndex] = newPreviews[variationIndex].filter((_, i) => i !== imageIndex);
            return newPreviews;
        });
    };

    const removeNewImage = (index: number) => {
        const adjustedIndex = index - existingImages.length;
        const newImages = [...formData.images];
        newImages.splice(adjustedIndex, 1);
        setFormData(prev => ({ ...prev, images: newImages }));

        const previewIndex = existingImages.length + adjustedIndex;
        URL.revokeObjectURL(imagePreview[previewIndex]);
        setImagePreview(prev => [
            ...prev.slice(0, previewIndex),
            ...prev.slice(previewIndex + 1)
        ]);
    };

    const removeVariationNewImage = (variationIndex: number, imageIndex: number) => {
        const variation = formData.variations[variationIndex];
        const existingImagesCount = variation.existingImages?.length || 0;
        const adjustedIndex = imageIndex - existingImagesCount;

        setFormData(prev => ({
            ...prev,
            variations: prev.variations.map((v, idx) => {
                if (idx === variationIndex) {
                    const newImages = [...v.images];
                    newImages.splice(adjustedIndex, 1);
                    return { ...v, images: newImages };
                }
                return v;
            })
        }));

        const previewIndex = existingImagesCount + adjustedIndex;
        URL.revokeObjectURL(variationPreviews[variationIndex][previewIndex]);
        setVariationPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[variationIndex] = [
                ...newPreviews[variationIndex].slice(0, previewIndex),
                ...newPreviews[variationIndex].slice(previewIndex + 1)
            ];
            return newPreviews;
        });
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

            // Add images to delete
            imagesToDelete.forEach(image => {
                data.append('images_to_delete[]', image);
            });

            // Append variations data
            formData.variations.forEach((variation, index) => {
                Object.entries(variation).forEach(([key, value]) => {
                    if (key === 'images') {
                        variation.images.forEach(image => {
                            data.append(`variations[${index}][images][]`, image);
                        });
                    } else if (key === 'imagesToDelete' && variation.imagesToDelete) {
                        variation.imagesToDelete.forEach(image => {
                            data.append(`variations[${index}][images_to_delete][]`, image);
                        });
                    } else if (key !== 'existingImages') {
                        data.append(`variations[${index}][${key}]`, value.toString());
                    }
                });
            });

            // Add method for Laravel
            data.append('_method', 'PUT');

            const response: any = await post(`/products/${id}`, data);
            if (response.status) {
                router.push('/shop/products');
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

    // Cleanup function for image preview URLs
    useEffect(() => {
        return () => {
            // Cleanup main product image previews
            imagePreview.forEach(url => {
                if (!existingImages.includes(url)) {
                    URL.revokeObjectURL(url);
                }
            });

            // Cleanup variation image previews
            formData.variations.forEach((variation, index) => {
                variationPreviews[index]?.forEach(url => {
                    if (!variation.existingImages?.includes(url)) {
                        URL.revokeObjectURL(url);
                    }
                });
            });
        };
    }, []);

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
                <h3 className="font-medium text-black dark:text-white">Edit Product</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    {/* Base product fields remain the same */}
                    {/* ... Previous fields code ... */}

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
                                        {/* Show existing images */}
                                        {variation.existingImages?.map((image, imgIndex) => (
                                            <div key={`existing-${imgIndex}`} className="relative">
                                                <img
                                                    src={image}
                                                    alt={`Variation ${index + 1} Existing ${imgIndex + 1}`}
                                                    className="h-24 w-24 rounded-lg object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariationExistingImage(index, image, imgIndex)}
                                                    className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Show new images */}
                                        {variation.images.map((_, imgIndex) => {
                                            const previewIndex = (variation.existingImages?.length || 0) + imgIndex;
                                            return (
                                                <div key={`new-${imgIndex}`} className="relative">
                                                    <img
                                                        src={variationPreviews[index][previewIndex]}
                                                        alt={`Variation ${index + 1} New ${imgIndex + 1}`}
                                                        className="h-24 w-24 rounded-lg object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariationNewImage(index, previewIndex)}
                                                        className="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white hover:bg-opacity-90"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
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
                                'Update Product'
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

export default EditProduct;