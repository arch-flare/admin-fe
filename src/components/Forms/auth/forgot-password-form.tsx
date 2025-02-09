'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';
import { post } from "@/utils/api";
import { toast } from "react-toastify";

interface ForgotPasswordResponse {
    message: string;
    status: string;
}

const ForgotPasswordForm: React.FC = () => {
    const t = useTranslations('ForgotPasswordForm');
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response:any = await post('auth/forgot-password', {
                email,
            });

            toast.success(response.message || t('notifications.success'));

            // Optionally redirect to login page after a short delay
            setTimeout(() => {
                router.push('/auth/signin');
            }, 5000);

        } catch (error: any) {
            const errorMessage = error.response?.data?.message || t('notifications.error');
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">
                {t('header.startFree')}
            </span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                {t('header.title')}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        className="mb-2.5 block font-medium text-black dark:text-white"
                        htmlFor="email"
                    >
                        {t('fields.email.label')}
                    </label>
                    <div className="relative">
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('fields.email.placeholder')}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            aria-label={t('fields.email.label')}
                            required
                            disabled={isLoading}
                        />
                        <span className="absolute right-4 top-4">
                            <svg
                                className="fill-current"
                                width="22"
                                height="22"
                                viewBox="0 0 22 22"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <g opacity="0.5">
                                    <path
                                        d="M19.2516 3.30005H2.75156C1.58281 3.30005 0.585938 4.26255 0.585938 5.46567V16.6032C0.585938 17.7719 1.54844 18.7688 2.75156 18.7688H19.2516C20.4203 18.7688 21.4172 17.8063 21.4172 16.6032V5.4313C21.4172 4.26255 20.4203 3.30005 19.2516 3.30005ZM19.2516 4.84692C19.2859 4.84692 19.3203 4.84692 19.3547 4.84692L11.0016 10.2094L2.64844 4.84692C2.68281 4.84692 2.71719 4.84692 2.75156 4.84692H19.2516ZM19.2516 17.1532H2.75156C2.40781 17.1532 2.13281 16.8782 2.13281 16.5344V6.35942L10.1766 11.5157C10.4172 11.6875 10.6922 11.7563 10.9672 11.7563C11.2422 11.7563 11.5172 11.6875 11.7578 11.5157L19.8016 6.35942V16.5688C19.8703 16.9125 19.5953 17.1532 19.2516 17.1532Z"
                                        fill=""
                                    />
                                </g>
                            </svg>
                        </span>
                    </div>
                </div>

                <div className="mb-5">
                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={t('buttons.resetPassword.ariaLabel')}
                        disabled={isLoading}
                    >
                        {isLoading ? t('buttons.resetPassword.loading') : t('buttons.resetPassword.text')}
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p>
                        {t('backToLogin.text')}{" "}
                        <Link
                            href="/auth/signin"
                            className="text-primary"
                            aria-label={t('backToLogin.linkLabel')}
                        >
                            {t('backToLogin.link')}
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default ForgotPasswordForm;