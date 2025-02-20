'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { post } from "@/utils/api";

interface ResetPasswordResponse {
    message: string;
    status: string;
    user?: any;
    access_token?: string;
}

const ResetPasswordForm: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: '',
        token: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Get token and email from URL parameters
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (token && email) {
            setFormData(prev => ({
                ...prev,
                token,
                email: decodeURIComponent(email)
            }));
        } else {
            // Redirect to forgot password if parameters are missing
            toast.error('Invalid or expired password reset link');
            router.push('/auth/forgot-password');
        }
    }, [searchParams, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response: any = await post('auth/reset-password', formData);

            toast.success(response.message || 'Password reset successful');

            // If the API returns a token, store it
            if (response.access_token) {
                // Store token using your preferred method (Cookies.set, localStorage, etc.)
            }

            // Redirect to login or dashboard
            router.push('/auth/signin');

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to reset password';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                Reset Password
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        Email
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        disabled // Email is pre-filled from URL
                    />
                </div>

                <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        New Password
                    </label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter your new password"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                        placeholder="Confirm your new password"
                        className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
            </form>
        </div>
    );
};

export default ResetPasswordForm;