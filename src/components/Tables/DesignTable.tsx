"use client";

import { useEffect, useState } from "react";
import { get } from "@/utils/api";
import { Eye, Pencil, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Design {
    id: number;
    title: string;
    description: string;
    images: Array<{
        id: number;
        image_path: string;
    }>;
    created_at: string;
    updated_at: string;
}

const DesignTable = () => {
    const navigate = useRouter();
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDesigns = async () => {
            try {
                setLoading(true);
                const response: any = await get<{ status: boolean; designs: Design[] }>('/designs');
                if (response.status) {
                    setDesigns(response.designs.data);
                }
            } catch (err) {
                setError('Failed to fetch designs');
                console.error('Error fetching designs:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDesigns();
    }, []);

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading designs...
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
        if (window.confirm('Are you sure you want to delete this design?')) {
            try {
                await get(`/designs/${id}`);
                setDesigns(designs.filter(design => design.id !== id));
            } catch (err) {
                console.error('Error deleting design:', err);
                alert('Failed to delete design');
            }
        }
    };

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="flex justify-between mb-4">
                <h4 className="text-xl font-semibold text-black dark:text-white">
                    Designs
                </h4>
                <button
                    onClick={() => navigate.push('/designs/create')}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    <Plus size={16} />
                    Create Design
                </button>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                                Design
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Images
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Created Date
                            </th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {designs.map((design) => (
                            <tr key={design.id}>
                                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                    <h5 className="font-medium text-black dark:text-white">
                                        {design.title}
                                    </h5>
                                    <p className="text-sm">{design.description}</p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        <span>{design.images.length}</span>
                                    </div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {new Date(design.created_at).toLocaleDateString()}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <div className="flex items-center space-x-3.5">
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/designs/${design.id}/show`)}
                                            title="View Design"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-primary"
                                            onClick={() => navigate.push(`/designs/${design.id}/edit`)}
                                            title="Edit Design"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            className="hover:text-danger"
                                            onClick={() => handleDelete(design.id)}
                                            title="Delete Design"
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

export default DesignTable;