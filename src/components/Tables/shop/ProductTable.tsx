"use client";

import React, { useEffect, useState } from 'react';
import { get } from "@/utils/api";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    sku: string;
    is_active: boolean;
    image_urls: string[];
    images: string[];
    category: {
        id: number;
        name: string;
    };
    created_at: string;
}

const ProductsTable = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response: any = await get('/products');
                console.log('products response:', response.products.data);
                if (response.status) {
                    setProducts(response.products.data);
                }
            } catch (err) {
                setError('Failed to fetch products');
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await get(`/products/${id}`);
                if (response.status) {
                    setProducts(products.filter(product => product.id !== id));
                }
            } catch (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product');
            }
        }
    };

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading products...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">
                {error}
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Products
                </h4>
                <button
                    onClick={() => router.push('/shop/products/add')}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    <Plus size={16} />
                    Add Product
                </button>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                Product Details
                            </th>
                            <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                                Category
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Price
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Stock
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Status
                            </th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 overflow-hidden rounded-lg">
                                            <img
                                                src={product.image_urls[0] || '/api/placeholder/48/48'}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-black dark:text-white">
                                                {product.name}
                                            </h5>
                                            <p className="text-sm text-meta-3">SKU: {product.sku}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {product.category.name}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-meta-3">
                                        KES{product.price}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {product.stock_quantity}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p
                                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${product.is_active
                                            ? "bg-success text-success"
                                            : "bg-danger text-danger"
                                            }`}
                                    >
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center space-x-3.5">
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => router.push(`/shop/products/show/${product.id}`)}
                                            title="View Product"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => router.push(`/shop/products/edit/${product.id}`)}
                                            title="Edit Product"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-danger"
                                            onClick={() => handleDelete(product.id)}
                                            title="Delete Product"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductsTable;