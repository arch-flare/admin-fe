"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { ImagePlus, Loader2, X, Plus, Trash2 } from "lucide-react";
import SearchableSelect from '@/components/common/SearchableSelect';

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
    image_urls: string[];
    variations: Array<{
        name: string;
        price: number;
        stock_quantity: number;
        sku: string;
        images: string[];
        image_urls?: string[];
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
    const [variationPreviews, setVariationPreviews] = useState<string[][]>([]);
    const previewUrls = useRef(new Set<string>());

    const createPreview = (file: File) => {
        const url = URL.createObjectURL(file);
        previewUrls.current.add(url);
        return url;
    };

    const revokePreview = (url?: string) => {
        if (url && previewUrls.current.delete(url)) {
            URL.revokeObjectURL(url);
        }
    };

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
                const productResponse: any = await get(`/admin/products/${id}`);
                if (productResponse.status && productResponse.product) {
                    const product = productResponse.product;

                    // Format variations data
                    const formattedVariations = product.variations?.map((variation: any) => ({
                        name: variation.name,
                        price: variation.price.toString(),
                        stock_quantity: variation.stock_quantity.toString(),
                        sku: variation.sku,
                        images: [],
                        existingImages: variation.images || []
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

                    setExistingImages(product.images || []);
                    setImagePreview(product.image_urls || []);

                    // Set variation previews
                    setVariationPreviews(
                        product.variations?.map((variation: any) => variation.image_urls || []) || []
                    );
                } else {
                    setError(productResponse.message || 'Product not found');
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
                    const newPreviews = filesArray.map(createPreview);
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

        const previews = files.map(createPreview);
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
            }]
        }));
        setVariationPreviews(prev => [...prev, []]);
    };

    const removeVariation = (index: number) => {
        // Cleanup variation preview URLs
        variationPreviews[index]?.forEach(revokePreview);

        setFormData(prev => ({
            ...prev,
            variations: prev.variations.filter((_, i) => i !== index)
        }));
        setVariationPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (_imagePath: string, index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
        setImagePreview(prev => prev.filter((_, i) => i !== index));
    };

    const removeVariationExistingImage = (variationIndex: number, _imagePath: string, imageIndex: number) => {
        setFormData(prev => ({
            ...prev,
            variations: prev.variations.map((variation, idx) => {
                if (idx === variationIndex) {
                    return {
                        ...variation,
                        existingImages: variation.existingImages?.filter((_, i) => i !== imageIndex)
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
        if (adjustedIndex < 0) return;
        const newImages = [...formData.images];
        newImages.splice(adjustedIndex, 1);
        setFormData(prev => ({ ...prev, images: newImages }));

        revokePreview(imagePreview[index]);
        setImagePreview(prev => [
            ...prev.slice(0, index),
            ...prev.slice(index + 1)
        ]);
    };

    const removeVariationNewImage = (variationIndex: number, imageIndex: number) => {
        const variation = formData.variations[variationIndex];
        const existingImagesCount = variation.existingImages?.length || 0;
        const adjustedIndex = imageIndex - existingImagesCount;
        if (adjustedIndex < 0) return;

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

        revokePreview(variationPreviews[variationIndex]?.[imageIndex]);
        setVariationPreviews(prev => {
            const newPreviews = [...prev];
            newPreviews[variationIndex] = [
                ...newPreviews[variationIndex].slice(0, imageIndex),
                ...newPreviews[variationIndex].slice(imageIndex + 1)
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
            data.append('category_id', formData.category_id);
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('stock_quantity', formData.stock_quantity);
            data.append('sku', formData.sku);
            data.append('is_active', formData.is_active ? '1' : '0');
            data.append('keep_images_present', '1');
            data.append('variations_present', '1');

            existingImages.forEach(image => data.append('keep_images[]', image));
            formData.images.forEach(image => data.append('images[]', image));

            formData.variations.forEach((variation, index) => {
                data.append(`variations[${index}][name]`, variation.name);
                data.append(`variations[${index}][sku]`, variation.sku);
                data.append(`variations[${index}][price]`, variation.price);
                data.append(`variations[${index}][stock_quantity]`, variation.stock_quantity);
                data.append(`variations[${index}][keep_images_present]`, '1');
                variation.existingImages?.forEach(image =>
                    data.append(`variations[${index}][keep_images][]`, image)
                );
                variation.images.forEach(image =>
                    data.append(`variations[${index}][images][]`, image)
                );
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
            const validationErrors = err.response?.data?.errors;
            const firstValidationError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : null;
            setError(
                (typeof firstValidationError === 'string' ? firstValidationError : null) ||
                err.response?.data?.message ||
                'Failed to update product'
            );
            console.error('Error updating product:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            previewUrls.current.forEach(url => URL.revokeObjectURL(url));
            previewUrls.current.clear();
        };
    }, []);

    if (fetchLoading) {
        return (
            <div className="animate-pulse space-y-5 rounded-2xl border border-[#e4ded2] bg-[#fffefa] p-6 dark:border-[#39463d] dark:bg-[#252f29]">
                <div className="h-7 w-48 rounded bg-[#e8e3d8] dark:bg-[#303c34]" />
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="h-28 rounded-xl bg-[#e8e3d8] dark:bg-[#303c34]" />
                    <div className="h-28 rounded-xl bg-[#e8e3d8] dark:bg-[#303c34]" />
                </div>
            </div>
        );
    }

    if (error && !formData.name) {
        return (
            <div className="rounded-2xl border border-[#e4ded2] bg-[#fffefa] p-8 text-center dark:border-[#39463d] dark:bg-[#252f29]">
                <p className="text-sm text-[#8b4938] dark:text-[#edb69f]">{error}</p>
                <button
                    type="button"
                    onClick={() => router.push('/shop/products')}
                    className="mt-5 rounded-xl bg-[#405746] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#314637]"
                >
                    Back to products
                </button>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-[#e4ded2] bg-[#fffefa] shadow-[0_18px_44px_rgba(53,58,44,0.06)] dark:border-[#39463d] dark:bg-[#252f29]">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-[#26332b] dark:text-[#f3f0e8]">Edit product</h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <section className="mb-8 rounded-2xl border border-[#e8e2d7] bg-[#fbfaf6] p-5 sm:p-6 dark:border-[#39463d] dark:bg-[#202a24]">
                        <div className="mb-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78806f] dark:text-[#a8b29f]">
                                Product information
                            </p>
                            <p className="mt-1 text-sm text-[#74796f] dark:text-[#aab3a7]">
                                Update the details customers see in the shop and the stock your team manages.
                            </p>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                            <div className="space-y-5">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                        Category <span className="text-danger">*</span>
                                    </label>
                                    <SearchableSelect
                                        name="category_id"
                                        required
                                        placeholder="Select category"
                                        searchPlaceholder="Search categories..."
                                        value={formData.category_id}
                                        onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                                        options={categories.map(category => ({ value: String(category.id), label: category.name }))}
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                        Product name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm text-[#26332b] outline-none transition placeholder:text-[#9a9d92] focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            Price (KES) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            step="0.01"
                                            required
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-3 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            Stock <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name="stock_quantity"
                                            value={formData.stock_quantity}
                                            onChange={handleChange}
                                            min="0"
                                            step="1"
                                            required
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-3 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            SKU <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="sku"
                                            value={formData.sku}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-3 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                        Description <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={5}
                                        required
                                        className="w-full resize-y rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm leading-6 text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                    />
                                </div>

                                <label className="flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-[#e2ddcf] bg-[#fffefa] px-4 py-3 dark:border-[#465348] dark:bg-[#252f29]">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                        className="h-4 w-4 accent-[#49624a]"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">Active in shop</span>
                                        <span className="mt-0.5 block text-xs text-[#74796f] dark:text-[#aab3a7]">Turn off to hide this product from customers.</span>
                                    </span>
                                </label>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <label className="text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                        Product images
                                    </label>
                                    <span className="text-xs text-[#74796f] dark:text-[#aab3a7]">JPG or PNG · 2 MB max</span>
                                </div>
                                <div className="flex min-h-48 flex-wrap content-start gap-3 rounded-2xl border border-dashed border-[#c9cdbf] bg-[#f6f4ed] p-4 dark:border-[#4c5a4e] dark:bg-[#1d2822]">
                                    {imagePreview.map((preview, index) => (
                                        <div key={`${preview}-${index}`} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-[#e2ddcf] bg-white dark:border-[#465348] dark:bg-[#252f29]">
                                            <img src={preview} alt={`Product image ${index + 1}`} className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                aria-label={`Remove product image ${index + 1}`}
                                                onClick={() => index < existingImages.length
                                                    ? removeExistingImage(existingImages[index], index)
                                                    : removeNewImage(index)}
                                                className="absolute right-1 top-1 rounded-full bg-[#24352b]/85 p-1.5 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#aab7a4] bg-[#fffefa] text-[#5b745a] transition hover:bg-[#edf1e8] dark:border-[#536651] dark:bg-[#252f29] dark:text-[#c6d7bf] dark:hover:bg-[#303b32]">
                                        <input
                                            type="file"
                                            name="images"
                                            onChange={handleChange}
                                            accept="image/jpeg,image/png,image/jpg"
                                            multiple
                                            className="sr-only"
                                        />
                                        <ImagePlus className="h-5 w-5" />
                                        <span className="text-[11px] font-medium">Add image</span>
                                    </label>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-[#74796f] dark:text-[#aab3a7]">
                                    Existing images stay attached until removed here. New images are added when you save.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Variations Section */}
                    <section className="mb-8">
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#78806f] dark:text-[#a8b29f]">
                                    Optional
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-[#26332b] dark:text-[#f3f0e8]">
                                    Product variations
                                </h2>
                            </div>
                            <button
                                type="button"
                                onClick={addVariation}
                                className="flex items-center gap-2 rounded-xl bg-[#405746] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#314637] focus:outline-none focus:ring-2 focus:ring-[#718a70] focus:ring-offset-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add variation
                            </button>
                        </div>

                        {formData.variations.map((variation, index) => (
                            <div key={`${variation.sku}-${index}`} className="mb-4 rounded-2xl border border-[#e4ded2] bg-[#fbfaf6] p-4 sm:p-5 dark:border-[#39463d] dark:bg-[#202a24]">
                                <div className="mb-4 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#78806f] dark:text-[#a8b29f]">Option {index + 1}</p>
                                        <h3 className="mt-1 font-semibold text-[#344238] dark:text-[#e5e9df]">{variation.name || 'New variation'}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVariation(index)}
                                        aria-label={`Remove variation ${index + 1}`}
                                        className="rounded-lg p-2 text-danger transition hover:bg-[#f5e8e2] focus:outline-none focus:ring-2 focus:ring-danger/30 dark:hover:bg-[#47332b]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            Variation name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name={`variations[${index}].name`}
                                            value={variation.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            SKU <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name={`variations[${index}].sku`}
                                            value={variation.sku}
                                            onChange={handleChange}
                                            required
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            Price (KES) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name={`variations[${index}].price`}
                                            value={variation.price}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            step="0.01"
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                            Stock quantity <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            name={`variations[${index}].stock_quantity`}
                                            value={variation.stock_quantity}
                                            onChange={handleChange}
                                            required
                                            min="0"
                                            className="w-full rounded-xl border border-[#dcd7ca] bg-[#fffefa] px-4 py-3 text-sm text-[#26332b] outline-none transition focus:border-[#71866b] focus:ring-2 focus:ring-[#71866b]/15 dark:border-[#465348] dark:bg-[#252f29] dark:text-[#f3f0e8]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                        Variation images
                                    </label>
                                    <div className="flex flex-wrap gap-4">
                                        {/* Show existing images */}
                                        {variation.existingImages?.map((image, imgIndex) => (
                                            <div key={`existing-${imgIndex}`} className="relative">
                                                <img
                                                    src={variationPreviews[index]?.[imgIndex] || ''}
                                                    alt={`Variation ${index + 1} Existing ${imgIndex + 1}`}
                                                    className="h-24 w-24 rounded-lg object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariationExistingImage(index, image, imgIndex)}
                                                    aria-label={`Remove variation ${index + 1} image ${imgIndex + 1}`}
                                                    className="absolute -right-2 -top-2 rounded-full bg-[#24352b]/90 p-1.5 text-white hover:bg-danger"
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
                                                        src={variationPreviews[index]?.[previewIndex] || ''}
                                                        alt={`Variation ${index + 1} New ${imgIndex + 1}`}
                                                        className="h-24 w-24 rounded-lg object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariationNewImage(index, previewIndex)}
                                                    aria-label={`Remove new variation ${index + 1} image ${imgIndex + 1}`}
                                                    className="absolute -right-2 -top-2 rounded-full bg-[#24352b]/90 p-1.5 text-white hover:bg-danger"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                        <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#aab7a4] bg-[#fffefa] text-[#5b745a] transition hover:bg-[#edf1e8] dark:border-[#536651] dark:bg-[#252f29] dark:text-[#c6d7bf] dark:hover:bg-[#303b32]">
                                            <input
                                                type="file"
                                                name={`variations[${index}].images`}
                                                onChange={handleChange}
                                                accept="image/jpeg,image/png,image/jpg"
                                                multiple
                                                className="sr-only"
                                            />
                                            <ImagePlus className="h-5 w-5" />
                                            <span className="text-[11px] font-medium">Add image</span>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-[#74796f] dark:text-[#aab3a7]">Existing images stay attached until removed here.</p>
                                </div>
                            </div>
                        ))}
                        {formData.variations.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-[#d7d4c8] px-5 py-7 text-center text-sm text-[#74796f] dark:border-[#465348] dark:text-[#aab3a7]">
                                No variations have been added. You can save this as a single product or add options above.
                            </div>
                        )}
                    </section>

                    {error && (
                        <div className="mb-4.5">
                            <div className="rounded-xl border border-[#edc6b7] bg-[#f8ece6] px-4 py-3 text-sm text-[#8b4938] dark:border-[#674336] dark:bg-[#3b2b24] dark:text-[#edb69f]">
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 border-t border-[#e8e2d7] pt-5 sm:flex-row dark:border-[#39463d]">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-[#405746] p-3 font-semibold text-white transition hover:bg-[#314637] disabled:cursor-not-allowed disabled:opacity-60 sm:flex-1"
                        >
                            {loading ? (
                                <Loader2 className="h-6 w-6 animate-spin" />
                            ) : (
                                'Save product'
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/shop/products')}
                            className="flex w-full justify-center rounded-xl border border-[#dcd7ca] bg-[#fbf9f4] p-3 font-medium text-[#475448] transition hover:bg-white dark:border-[#3b493e] dark:bg-[#252f29] dark:text-[#e1e6dd] dark:hover:bg-[#2d3931] sm:flex-1"
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
