"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from "next/navigation";
import { get } from "@/utils/api";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from '@/components/Badge';

interface Category {
    id: number;
    name: string;
}

interface Variation {
    name: string;
    price: number;
    stock_quantity: number;
    sku: string;
    images: string[];
    image_urls: string[];
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
    variations: Variation[];
    category: Category;
    created_at: string;
    updated_at: string;
}

const ShowProduct = () => {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedVariation, setSelectedVariation] = useState<number | null>(null);
    const [variationImageIndex, setVariationImageIndex] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response: any = await get(`/products/${id}`);
                if (response.status && response.product) {
                    setProduct(response.product);
                } else {
                    setError('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const nextImage = (isVariation: boolean = false) => {
        if (isVariation && selectedVariation !== null && product?.variations[selectedVariation].images) {
            const variation = product.variations[selectedVariation];
            setVariationImageIndex((prev) =>
                prev === variation.images.length - 1 ? 0 : prev + 1
            );
        } else if (product?.images) {
            setCurrentImageIndex((prev) =>
                prev === product.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const previousImage = (isVariation: boolean = false) => {
        if (isVariation && selectedVariation !== null && product?.variations[selectedVariation].images) {
            const variation = product.variations[selectedVariation];
            setVariationImageIndex((prev) =>
                prev === 0 ? variation.images.length - 1 : prev - 1
            );
        } else if (product?.images) {
            setCurrentImageIndex((prev) =>
                prev === 0 ? product.images.length - 1 : prev - 1
            );
        }
    };

    const selectVariation = (index: number) => {
        setSelectedVariation(index);
        setVariationImageIndex(0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <p className="text-danger">{error || 'Product not found'}</p>
                <button
                    onClick={() => router.push('/shop/products')}
                    className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-black dark:text-white">
                        Product Details
                    </h3>
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 rounded bg-body px-4 py-2 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="p-6.5">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Product Images */}
                    <div className="relative">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg">
                            {selectedVariation !== null ? (
                                // Variation Images
                                product.variations[selectedVariation].images &&
                                    product.variations[selectedVariation].images.length > 0 ? (
                                    <>
                                        <img
                                            src={product.variations[selectedVariation].image_urls[variationImageIndex]}
                                            alt={`${product.variations[selectedVariation].name}`}
                                            className="h-full w-full object-cover"
                                        />
                                        {product.variations[selectedVariation].images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => previousImage(true)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={() => nextImage(true)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-meta-4">
                                        <p className="text-meta-3">No variation image available</p>
                                    </div>
                                )
                            ) : (
                                // Main Product Images
                                product.images && product.images.length > 0 ? (
                                    <>
                                        <img
                                            src={product.image_urls[currentImageIndex]}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                        {product.images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => previousImage(false)}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
                                                >
                                                    <ChevronLeft className="h-6 w-6" />
                                                </button>
                                                <button
                                                    onClick={() => nextImage(false)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white hover:bg-opacity-75"
                                                >
                                                    <ChevronRight className="h-6 w-6" />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gray-100 dark:bg-meta-4">
                                        <p className="text-meta-3">No image available</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {selectedVariation !== null ? (
                            product.variations[selectedVariation].images &&
                            product.variations[selectedVariation].images.length > 1 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto">
                                    {product.variations[selectedVariation].image_urls.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setVariationImageIndex(index)}
                                            className={`flex-shrink-0 ${variationImageIndex === index ? 'ring-2 ring-primary' : ''
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.variations[selectedVariation].name} - ${index + 1}`}
                                                className="h-20 w-20 rounded-md object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )
                        ) : (
                            product.images && product.images.length > 1 && (
                                <div className="mt-4 flex gap-2 overflow-x-auto">
                                    {product.image_urls.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentImageIndex(index)}
                                            className={`flex-shrink-0 ${currentImageIndex === index ? 'ring-2 ring-primary' : ''
                                                }`}
                                        >
                                            <img
                                                src={image}
                                                alt={`${product.name} - ${index + 1}`}
                                                className="h-20 w-20 rounded-md object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-black dark:text-white">
                                {selectedVariation !== null
                                    ? `${product.name} - ${product.variations[selectedVariation].name}`
                                    : product.name
                                }
                            </h2>
                            <div className="mt-2 flex items-center gap-3">
                                <Badge variant={product.is_active ? "success" : "destructive"}>
                                    {product.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <span className="text-sm text-meta-3">
                                    SKU: {selectedVariation !== null
                                        ? product.variations[selectedVariation].sku
                                        : product.sku
                                    }
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Price</h4>
                            <p className="text-2xl font-bold text-primary">
                                KES{selectedVariation !== null
                                    ? product.variations[selectedVariation].price
                                    : product.price
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Category</h4>
                            <p className="text-meta-3">{product.category.name}</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Stock Quantity</h4>
                            <p className="text-meta-3">
                                {selectedVariation !== null
                                    ? `${product.variations[selectedVariation].stock_quantity} units`
                                    : `${product.stock_quantity} units`
                                }
                            </p>
                        </div>

                        {product.variations && product.variations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-black dark:text-white">Variations</h4>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedVariation(null)}
                                        className={`rounded px-3 py-1 ${selectedVariation === null
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300'
                                            }`}
                                    >
                                        Base Product
                                    </button>
                                    {product.variations.map((variation, index) => (
                                        <button
                                            key={index}
                                            onClick={() => selectVariation(index)}
                                            className={`rounded px-3 py-1 ${selectedVariation === index
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-meta-4 dark:text-gray-300'
                                                }`}
                                        >
                                            {variation.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Description</h4>
                            <p className="text-meta-3">{product.description}</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium text-black dark:text-white">Additional Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Created At</p>
                                    <p className="text-meta-3">
                                        {new Date(product.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Last Updated</p>
                                    <p className="text-meta-3">
                                        {new Date(product.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
                            <button
                                onClick={() => router.push(`/shop/products/edit/${product.id}`)}
                                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                            >
                                Edit Product
                            </button>
                            <button
                                onClick={() => router.push('/shop/products')}
                                className="inline-flex items-center gap-2 rounded bg-body px-4 py-2 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
                            >
                                Back to Products
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowProduct;