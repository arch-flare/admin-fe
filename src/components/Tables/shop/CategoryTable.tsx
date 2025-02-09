"use client";

import { useEffect, useState } from "react";
import { get } from "@/utils/api";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const ShopCategoryTable = () => {
    const navigate = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const response: any = await get<{ status: boolean; categories: Category[] }>('/categories');
                if (response.status) {
                    setCategories(response.categories);
                }
            } catch (err) {
                setError('Failed to fetch categories');
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading categories...
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

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await get(`/categories/${id}`);
                setCategories(categories.filter(category => category.id !== id));
            } catch (err) {
                console.error('Error deleting category:', err);
                alert('Failed to delete category');
            }
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Categories
                </h4>
                <button
                    onClick={() => window.location.href = '/shop/categories/add'}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    <Plus size={16} />
                    Add Category
                </button>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                Category Name
                            </th>
                            <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                                Created Date
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
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                    <h5 className="font-medium text-black dark:text-white">
                                        {category.name}
                                    </h5>
                                    <p className="text-sm">{category.description || 'No description'}</p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {new Date(category.created_at).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p
                                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${category.is_active
                                                ? "bg-success text-success"
                                                : "bg-danger text-danger"
                                            }`}
                                    >
                                        {category.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center space-x-3.5">
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/categories/${category.id}`)}
                                            title="View Category"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/shop/categories/edit/${category.id}`)}
                                            title="Edit Category"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-danger"
                                            onClick={() => handleDelete(category.id)}
                                            title="Delete Category"
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

export default ShopCategoryTable;