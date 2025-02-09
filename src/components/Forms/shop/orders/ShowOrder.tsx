"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { get } from "../../../../utils/api";
import { Badge } from "../../../Badge";
import { Loader2, ArrowLeft } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    images: string[];
}

interface OrderItem {
    id: number;
    product: Product;
    quantity: number;
    price: number;
}

interface Address {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postal_code: string;
}

interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    payment_status: string;
    payment_method: string;
    mpesa_transaction_id: string | null;
    shipping_address: Address;
    billing_address: Address;
    created_at: string;
    items: OrderItem[];
}

const ShowOrder = () => {
    const router = useRouter();
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                const response: any = await get(`/orders/${id}`);
                
                if (response.status) {
                    setOrder(response.order);
                }
            } catch (err) {
                console.error('Error fetching order:', err);
                setError('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                <p className="text-danger">{error || 'Order not found'}</p>
                <button
                    onClick={() => router.push('/orders')}
                    className="mt-4 inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white hover:bg-opacity-90"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            {/* Header */}
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="font-medium text-black dark:text-white">
                            Order #{order.order_number}
                        </h3>
                        <p className="text-sm text-meta-3">
                            Placed on {formatDate(order.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                        </Badge>
                        <button
                            onClick={() => router.push('/orders')}
                            className="inline-flex items-center gap-2 rounded bg-body px-4 py-2 text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" /> Back to Orders
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6.5">
                {/* Order Summary */}
                <div className="mb-8">
                    <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                        Order Summary
                    </h4>
                    <div className="rounded-sm border border-stroke dark:border-strokedark">
                        <div className="max-w-full overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                        <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                                            Product
                                        </th>
                                        <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                                            Price
                                        </th>
                                        <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                                            Quantity
                                        </th>
                                        <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={item.product.images[0] || '/api/placeholder/48/48'}
                                                        alt={item.product.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                    <div>
                                                        <h5 className="font-medium text-black dark:text-white">
                                                            {item.product.name}
                                                        </h5>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                <p className="text-black dark:text-white">
                                                    KES{item.price}
                                                </p>
                                            </td>
                                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                <p className="text-black dark:text-white">
                                                    {item.quantity}
                                                </p>
                                            </td>
                                            <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                                <p className="text-meta-3">
                                                    KES{(item.price * item.quantity)}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td colSpan={3} className="px-4 py-5 text-right">
                                            <p className="font-medium text-black dark:text-white">Total Amount:</p>
                                        </td>
                                        <td className="px-4 py-5">
                                            <p className="text-xl font-semibold text-meta-3">
                                                KES{order.total_amount}
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Addresses and Payment Info */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {/* Shipping Address */}
                    <div>
                        <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            Shipping Address
                        </h4>
                        <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                            <p className="font-medium text-black dark:text-white">
                                {order.shipping_address.first_name} {order.shipping_address.last_name}
                            </p>
                            <p className="mt-2 text-meta-3">{order.shipping_address.email}</p>
                            <p className="text-meta-3">{order.shipping_address.phone}</p>
                            <p className="mt-2 text-meta-3">{order.shipping_address.address}</p>
                            <p className="text-meta-3">
                                {order.shipping_address.city}, {order.shipping_address.postal_code}
                            </p>
                            <p className="text-meta-3">{order.shipping_address.country}</p>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                        <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            Billing Address
                        </h4>
                        <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                            <p className="font-medium text-black dark:text-white">
                                {order.billing_address.first_name} {order.billing_address.last_name}
                            </p>
                            <p className="mt-2 text-meta-3">{order.billing_address.email}</p>
                            <p className="text-meta-3">{order.billing_address.phone}</p>
                            <p className="mt-2 text-meta-3">{order.billing_address.address}</p>
                            <p className="text-meta-3">
                                {order.billing_address.city}, {order.billing_address.postal_code}
                            </p>
                            <p className="text-meta-3">{order.billing_address.country}</p>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="md:col-span-2">
                        <h4 className="mb-4 text-xl font-semibold text-black dark:text-white">
                            Payment Information
                        </h4>
                        <div className="rounded-sm border border-stroke p-4 dark:border-strokedark">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-meta-3">Payment Method</p>
                                    <p className="font-medium text-black dark:text-white">
                                        {order.payment_method}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-meta-3">Payment Status</p>
                                    <Badge variant={getStatusBadgeVariant(order.payment_status)}>
                                        {order.payment_status}
                                    </Badge>
                                </div>
                                {order.mpesa_transaction_id && (
                                    <div>
                                        <p className="text-sm text-meta-3">M-Pesa Transaction ID</p>
                                        <p className="font-medium text-black dark:text-white">
                                            {order.mpesa_transaction_id}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowOrder;