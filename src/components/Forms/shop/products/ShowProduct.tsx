"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    Package,
    Pencil,
    Tag,
} from "lucide-react";
import { get } from "@/utils/api";

interface Category {
    id: number;
    name: string;
}

interface Variation {
    name: string;
    price: number;
    stock_quantity: number;
    sku: string;
    images?: string[];
    image_urls?: string[];
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
    category?: Category | null;
    created_at: string;
    updated_at: string;
}

const formatPrice = (value: number) =>
    `KES ${new Intl.NumberFormat("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value) || 0)}`;

const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-KE", {
              day: "numeric",
              month: "short",
              year: "numeric",
          });
};

const ShowProduct = () => {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageIndex, setImageIndex] = useState(0);
    const [selectedVariation, setSelectedVariation] = useState<number | null>(null);

    useEffect(() => {
        let cancelled = false;
        const productId = Array.isArray(id) ? id[0] : id;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response: any = await get(`/admin/products/${productId}`);

                if (cancelled) return;

                if (response.status && response.product) {
                    setProduct(response.product);
                    setImageIndex(0);
                    setSelectedVariation(null);
                } else {
                    setError("Product not found");
                }
            } catch (err) {
                if (!cancelled) setError("Failed to load product details");
                console.error("Error fetching product:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchProduct();
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-6 rounded-[24px] bg-[#f4f1e9] p-4 sm:p-6 lg:p-8 dark:bg-[#19231e]">
                <div className="h-10 max-w-sm rounded-lg bg-[#e8e3d8] dark:bg-[#303c34]" />
                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="aspect-[4/3] rounded-[22px] bg-[#e8e3d8] dark:bg-[#303c34]" />
                    <div className="space-y-5 rounded-[22px] bg-[#fffefa] p-8 dark:bg-[#252f29]">
                        <div className="h-5 w-28 rounded bg-[#e8e3d8] dark:bg-[#303c34]" />
                        <div className="h-10 w-3/4 rounded bg-[#e8e3d8] dark:bg-[#303c34]" />
                        <div className="h-12 w-1/2 rounded bg-[#e8e3d8] dark:bg-[#303c34]" />
                        <div className="h-24 rounded bg-[#e8e3d8] dark:bg-[#303c34]" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="rounded-[24px] border border-[#e6dfd1] bg-[#fffefa] p-10 text-center shadow-[0_18px_44px_rgba(53,58,44,0.06)] dark:border-[#39463d] dark:bg-[#252f29]">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2e9df] text-[#9a5d43] dark:bg-[#3c3028] dark:text-[#e5ad89]">
                    <Package className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-[#26332b] dark:text-[#f3f0e8]">
                    Product details unavailable
                </h2>
                <p className="mt-2 text-sm text-[#74796f] dark:text-[#aab3a7]">
                    {error || "This product could not be found."}
                </p>
                <button
                    onClick={() => router.push("/shop/products")}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#405746] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#314637] focus:outline-none focus:ring-2 focus:ring-[#718a70] focus:ring-offset-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to products
                </button>
            </div>
        );
    }

    const variations = product.variations ?? [];
    const activeVariation =
        selectedVariation === null ? null : variations[selectedVariation] ?? null;
    const activeImages = activeVariation?.image_urls ?? product.image_urls ?? [];
    const activeImage = activeImages[imageIndex];
    const activePrice = activeVariation?.price ?? product.price;
    const activeSku = activeVariation?.sku ?? product.sku;
    const activeStock = activeVariation?.stock_quantity ?? product.stock_quantity;

    const selectVariation = (index: number | null) => {
        setSelectedVariation(index);
        setImageIndex(0);
    };

    const moveImage = (step: number) => {
        if (activeImages.length < 2) return;
        setImageIndex((current) => (current + step + activeImages.length) % activeImages.length);
    };

    return (
        <main className="space-y-6 rounded-[26px] bg-[#f4f1e9] p-4 text-[#26332b] sm:p-6 lg:p-8 dark:bg-[#19231e] dark:text-[#f3f0e8]">
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#78806f] dark:text-[#a8b29f]">
                        Shop / Product details
                    </p>
                    <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-[-0.035em] text-[#26332b] sm:text-3xl dark:text-[#f3f0e8]">
                        {product.name}
                    </h1>
                    <p className="mt-1 text-sm text-[#74796f] dark:text-[#aab3a7]">
                        Inventory record <span className="px-1.5 text-[#b2ad9f]">/</span> {product.sku}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => router.push("/shop/products")}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#dcd7ca] bg-[#fbf9f4] px-4 py-2.5 text-sm font-medium text-[#475448] transition hover:border-[#b7c0af] hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#718a70] dark:border-[#3b493e] dark:bg-[#252f29] dark:text-[#e1e6dd] dark:hover:bg-[#2d3931]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        All products
                    </button>
                    <button
                        onClick={() => router.push(`/shop/products/edit/${product.id}`)}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#405746] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(51,72,55,0.18)] transition hover:-translate-y-0.5 hover:bg-[#314637] focus:outline-none focus:ring-2 focus:ring-[#718a70] focus:ring-offset-2"
                    >
                        <Pencil className="h-4 w-4" />
                        Edit product
                    </button>
                </div>
            </header>

            <section className="grid overflow-hidden rounded-[24px] border border-[#e4ded2] bg-[#fffefa] shadow-[0_18px_44px_rgba(53,58,44,0.07)] lg:grid-cols-2 dark:border-[#39463d] dark:bg-[#252f29] dark:shadow-none">
                <div className="min-w-0 p-4 sm:p-6">
                    <div className="group relative aspect-[4/3] overflow-hidden rounded-[18px] bg-[#e9e5db] dark:bg-[#303a33]">
                        {activeImage ? (
                            <img
                                src={activeImage}
                                alt={activeVariation ? `${product.name} — ${activeVariation.name}` : product.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
                            />
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-3 text-[#7d8479] dark:text-[#aab3a7]">
                                <ImageIcon className="h-9 w-9" strokeWidth={1.4} />
                                <span className="text-sm">
                                    {activeVariation ? "No image for this variation" : "No product image available"}
                                </span>
                            </div>
                        )}

                        <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-[#fbf9f2]/90 px-3 py-1.5 text-xs font-medium text-[#455347] shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#1c2621]/90 dark:text-[#e8e9df]">
                            {activeVariation ? `Variation · ${activeVariation.name}` : "Main product"}
                        </div>

                        {activeImages.length > 1 && (
                            <>
                                <span className="absolute bottom-4 right-4 rounded-full bg-[#1e2922]/80 px-3 py-1.5 text-xs font-medium tabular-nums text-white backdrop-blur">
                                    {imageIndex + 1} / {activeImages.length}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Previous image"
                                    onClick={() => moveImage(-1)}
                                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#1e2922]/65 text-white backdrop-blur transition hover:bg-[#1e2922]/90 focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next image"
                                    onClick={() => moveImage(1)}
                                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-[#1e2922]/65 text-white backdrop-blur transition hover:bg-[#1e2922]/90 focus:outline-none focus:ring-2 focus:ring-white"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        )}
                    </div>

                    {activeImages.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {activeImages.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    aria-label={`Show image ${index + 1}`}
                                    aria-pressed={imageIndex === index}
                                    onClick={() => setImageIndex(index)}
                                    className={`h-[68px] w-[68px] flex-none overflow-hidden rounded-xl border-2 transition focus:outline-none focus:ring-2 focus:ring-[#718a70] ${
                                        imageIndex === index
                                            ? "border-[#536c54]"
                                            : "border-transparent opacity-75 hover:opacity-100"
                                    }`}
                                >
                                    <img src={image} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-col justify-between border-t border-[#e8e2d7] p-6 sm:p-8 lg:border-l lg:border-t-0 dark:border-[#39463d]">
                    <div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#727b6e] dark:text-[#aab3a7]">
                                <Tag className="h-3.5 w-3.5" />
                                {product.category?.name ?? "Uncategorised"}
                            </span>
                            <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                    product.is_active
                                        ? "bg-[#e4eee4] text-[#3f6548] dark:bg-[#2e4234] dark:text-[#b8d2b6]"
                                        : "bg-[#f3e7de] text-[#965b43] dark:bg-[#48352c] dark:text-[#e6b79a]"
                                }`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${product.is_active ? "bg-[#5b805f]" : "bg-[#b06e50]"}`} />
                                {product.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>

                        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#85897d] dark:text-[#aab3a7]">
                            {activeVariation ? "Variation price" : "Price"}
                        </p>
                        <p className="mt-1 text-3xl font-semibold tracking-[-0.04em] text-[#405746] tabular-nums sm:text-4xl dark:text-[#c6d7bf]">
                            {formatPrice(activePrice)}
                        </p>

                        <div className="mt-8 grid grid-cols-2 gap-3">
                            <div className="rounded-2xl bg-[#f4f1e9] p-4 dark:bg-[#1d2822]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#808679] dark:text-[#9ca89c]">
                                    SKU
                                </p>
                                <p className="mt-2 break-all text-sm font-semibold text-[#303d34] dark:text-[#eef0e7]">
                                    {activeSku || "—"}
                                </p>
                            </div>
                            <div className="rounded-2xl bg-[#f4f1e9] p-4 dark:bg-[#1d2822]">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#808679] dark:text-[#9ca89c]">
                                    Stock
                                </p>
                                <p className="mt-2 text-sm font-semibold text-[#303d34] tabular-nums dark:text-[#eef0e7]">
                                    {activeStock} <span className="font-normal text-[#7b8278] dark:text-[#aab3a7]">units</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#e8e2d7] pt-5 text-sm dark:border-[#39463d]">
                        <span className="text-[#74796f] dark:text-[#aab3a7]">
                            {activeVariation ? "Viewing variation" : "Product record"}
                        </span>
                        {activeVariation && (
                            <button
                                type="button"
                                onClick={() => selectVariation(null)}
                                className="font-semibold text-[#49664e] underline decoration-[#b6c3ae] underline-offset-4 transition hover:text-[#2c4734] focus:outline-none focus:ring-2 focus:ring-[#718a70] dark:text-[#c6d7bf]"
                            >
                                View main product
                            </button>
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-[24px] border border-[#e4ded2] bg-[#fffefa] p-5 shadow-[0_14px_34px_rgba(53,58,44,0.045)] sm:p-7 dark:border-[#39463d] dark:bg-[#252f29] dark:shadow-none">
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e8e2d7] pb-5 dark:border-[#39463d]">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85897d] dark:text-[#aab3a7]">
                            Product options
                        </p>
                        <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#26332b] dark:text-[#f3f0e8]">
                            Variations
                        </h2>
                    </div>
                    <span className="rounded-full bg-[#eef0e7] px-3 py-1.5 text-xs font-semibold text-[#52624e] dark:bg-[#334036] dark:text-[#d0dac9]">
                        {variations.length} {variations.length === 1 ? "variation" : "variations"}
                    </span>
                </div>

                {variations.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {variations.map((variation, index) => {
                            const variationImage = variation.image_urls?.[0];
                            const isSelected = selectedVariation === index;

                            return (
                                <button
                                    key={`${variation.sku}-${index}`}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => selectVariation(index)}
                                    className={`group flex min-w-0 items-start gap-4 rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#718a70] ${
                                        isSelected
                                            ? "border-[#71866b] bg-[#f1f3eb] shadow-[inset_0_0_0_1px_#71866b] dark:border-[#82977b] dark:bg-[#2b3930]"
                                            : "border-[#e8e2d7] bg-[#fbfaf6] hover:border-[#c3cbb9] hover:bg-[#f7f6f0] dark:border-[#39463d] dark:bg-[#202a24] dark:hover:bg-[#2a352e]"
                                    }`}
                                >
                                    <div className="h-[76px] w-[76px] flex-none overflow-hidden rounded-xl bg-[#e9e5db] dark:bg-[#364139]">
                                        {variationImage ? (
                                            <img
                                                src={variationImage}
                                                alt=""
                                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-[#899083] dark:text-[#aab3a7]">
                                                <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-[#2d3a31] dark:text-[#f0f0e8]">
                                                    {variation.name || `Variation ${index + 1}`}
                                                </h3>
                                                <p className="mt-1 break-all text-xs text-[#7a8175] dark:text-[#aab3a7]">
                                                    SKU: {variation.sku || "—"}
                                                </p>
                                            </div>
                                            <span className={`mt-1 h-2 w-2 flex-none rounded-full ${Number(variation.stock_quantity) > 0 ? "bg-[#73906f]" : "bg-[#b7785d]"}`} />
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-[#e8e2d7] pt-2.5 dark:border-[#39463d]">
                                            <span className="text-sm font-semibold text-[#49624a] tabular-nums dark:text-[#c6d7bf]">
                                                {formatPrice(variation.price)}
                                            </span>
                                            <span className="text-xs text-[#737b70] tabular-nums dark:text-[#aab3a7]">
                                                {variation.stock_quantity} in stock
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5 rounded-2xl bg-[#f7f5ef] px-5 py-8 text-center dark:bg-[#202a24]">
                        <Package className="mx-auto h-6 w-6 text-[#84907f] dark:text-[#aab3a7]" />
                        <p className="mt-2 text-sm font-medium text-[#596456] dark:text-[#d3d9cf]">
                            This product has no variations.
                        </p>
                    </div>
                )}
            </section>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                <section className="rounded-[24px] border border-[#e4ded2] bg-[#fffefa] p-5 sm:p-7 dark:border-[#39463d] dark:bg-[#252f29]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#85897d] dark:text-[#aab3a7]">
                        About this product
                    </p>
                    <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#26332b] dark:text-[#f3f0e8]">
                        Description
                    </h2>
                    <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-[#667066] dark:text-[#c1c9bd]">
                        {product.description?.trim() || "No description has been added for this product."}
                    </p>
                </section>

                <section className="rounded-[24px] border border-[#e4ded2] bg-[#fffefa] p-5 sm:p-7 dark:border-[#39463d] dark:bg-[#252f29]">
                    <div className="flex items-center gap-2 text-[#697763] dark:text-[#b2c0aa]">
                        <Package className="h-4 w-4" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                            Record information
                        </p>
                    </div>
                    <dl className="mt-5 divide-y divide-[#ece7dc] dark:divide-[#39463d]">
                        <div className="flex items-start justify-between gap-4 py-3 first:pt-0">
                            <dt className="text-sm text-[#7a8175] dark:text-[#aab3a7]">Category</dt>
                            <dd className="text-right text-sm font-medium text-[#344238] dark:text-[#e5e9df]">
                                {product.category?.name ?? "Uncategorised"}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3">
                            <dt className="text-sm text-[#7a8175] dark:text-[#aab3a7]">Created</dt>
                            <dd className="text-right text-sm font-medium text-[#344238] tabular-nums dark:text-[#e5e9df]">
                                {formatDate(product.created_at)}
                            </dd>
                        </div>
                        <div className="flex items-start justify-between gap-4 py-3 last:pb-0">
                            <dt className="text-sm text-[#7a8175] dark:text-[#aab3a7]">Last updated</dt>
                            <dd className="text-right text-sm font-medium text-[#344238] tabular-nums dark:text-[#e5e9df]">
                                {formatDate(product.updated_at)}
                            </dd>
                        </div>
                    </dl>
                </section>
            </div>
        </main>
    );
};

export default ShowProduct;
