import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import AcceptInvitationForm from "@/components/Forms/auth/accept-invitation-form";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('AcceptInvitation');
    return {
        title: t('metadata.title'),
        description: t('metadata.description'),
    };
}

interface AcceptInvitationPageProps {
    params: {
        token: string;
    };
}

const AcceptInvitationPage: React.FC<AcceptInvitationPageProps> = ({ params }) => {
    const t = useTranslations('AcceptInvitation');
    
    return (
        <div className="flex flex-wrap items-center">
            <ToastContainer />
            <div className="hidden w-full xl:block xl:w-1/2">
                <div className="px-26 py-17.5 text-center">
                    <Link
                        className="mb-5.5 inline-block"
                        href="/"
                        aria-label={t('accessibility.homeLink')}
                    >
                        <Image
                            className="hidden dark:block"
                            src={"/logos/logo.png"}
                            alt={t('accessibility.logo')}
                            width={176}
                            height={32}
                        />
                        <Image
                            className="dark:hidden"
                            src={"/logos/logo.png"}
                            alt={t('accessibility.logo')}
                            width={176}
                            height={32}
                        />
                    </Link>
                    <p className="2xl:px-20">
                        {t('tagline')}
                    </p>
                </div>
            </div>
            <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
                <AcceptInvitationForm token={params.token} />
            </div>
        </div>
    );
};

export default AcceptInvitationPage;