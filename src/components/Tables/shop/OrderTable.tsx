"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { get } from "@/utils/api";
import { Eye, Loader2 } from "lucide-react";
import { Badge } from '@/components/Badge';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    mpesa_transaction_id: string | null;
    shipping_address: {
        address: string;
        city: string;
        country: string;
        postal_code: string;
    };
    created_at: string;
    items: OrderItem[];
}

interface PaginatedResponse {
    current_page: number;
    data: Order[];
    total: number;
    last_page: number;
}

const OrdersList = () => {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    useEffect(() => {
        fetchOrders(1);
    }, []);

    const fetchOrders = async (page: number) => {
        try {
            setLoading(true);
            const response: any = await get(`/orders?page=${page}`);

            if (response.status) {
                setOrders(response.orders.data);
                setPagination({
                    currentPage: response.orders.current_page,
                    totalPages: response.orders.last_page,
                    total: response.orders.total
                });
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6.5">
                <h3 className="font-medium text-black dark:text-white">
                    My Orders ({pagination.total})
                </h3>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                                Order Number
                            </th>
                            <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                                Date
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Status
                            </th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                                Total
                            </th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {order.order_number}
                                    </p>
                                    <span className="text-sm text-meta-3">
                                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                    </span>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-black dark:text-white">
                                        {formatDate(order.created_at)}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <Badge variant={getStatusBadgeVariant(order.status)}>
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <p className="text-meta-3">
                                        KES{order.total_amount}
                                    </p>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                    <button
                                        onClick={() => router.push(`/shop/orders/${order.id}/show`)}
                                        className="hover:text-primary"
                                        title="View Order Details"
                                    >
                                        <Eye className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark sm:px-6">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => fetchOrders(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => fetchOrders(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Showing page{' '}
                                <span className="font-medium">{pagination.currentPage}</span>{' '}
                                of{' '}
                                <span className="font-medium">{pagination.totalPages}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => fetchOrders(page)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${page === pagination.currentPage
                                                ? 'z-10 bg-primary text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersList;