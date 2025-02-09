'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { post, get } from "@/utils/api";
import { useTranslations } from 'next-intl';

interface InvitationData {
    email: string;
    client_name: string;
    role: string;
}

const AcceptInvitationForm: React.FC<{ token: string }> = ({ token }) => {
    const t = useTranslations('AcceptInvitation');
    const router = useRouter();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            try {
                const response: any = await get(`/auth/invitations/${token}/verify`);
                if (response.success) {
                    setInvitationData(response.data);
                } else {
                    setError(t('errors.invalidToken'));
                    // router.push('/auth/login');
                }
            } catch (err) {
                setError(t('errors.invalidToken'));
                // router.push('/auth/login');
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response: any = await post(`/auth/invitations/${token}/register`, {
                name,
                password,
                password_confirmation: passwordConfirmation
            });

            if (response.success) {
                const { access_token, user } = response.data;
                Cookies.set('auth_token', access_token, { expires: 7 });
                localStorage.setItem('user_data', JSON.stringify(user));
                router.push('/');
            } else {
                setError(response.message || t('errors.registrationFailed'));
            }
        } catch (err: any) {
            setError(t('errors.generic'));
            console.error(t('errors.consoleError'), err);
        } finally {
            setLoading(false);
        }
    };

    if (!invitationData) {
        return <div className="text-center p-4">{t('loading')}</div>;
    }

    return (
        <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
            <span className="mb-1.5 block font-medium">
                {t('header.invited')} {invitationData.client_name}
            </span>
            <h2 className="mb-9 text-2xl font-bold text-black dark:text-white sm:text-title-xl2">
                {t('header.title')}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('fields.email.label')}
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={invitationData.email}
                            disabled
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary opacity-50"
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('fields.name.label')}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('fields.name.placeholder')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('fields.password.label')}
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder={t('fields.password.placeholder')}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            required
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="mb-2.5 block font-medium text-black dark:text-white">
                        {t('fields.passwordConfirmation.label')}
                    </label>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder={t('fields.passwordConfirmation.placeholder')}
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            required
                        />
                    </div>
                </div>

                {error && (
                    <div className="mb-4 text-red-500" role="alert">
                        {error}
                    </div>
                )}

                <div className="mb-5">
                    <button
                        type="submit"
                        className="w-full cursor-pointer rounded-lg border border-primary bg-primary p-4 text-white transition hover:bg-opacity-90"
                        disabled={loading}
                    >
                        {loading ? t('buttons.accepting') : t('buttons.accept')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AcceptInvitationForm;