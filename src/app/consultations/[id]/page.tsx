import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ConsultationDetail from "@/components/Consultations/ConsultationDetail";

export const metadata: Metadata = {
    title: "Consultation Request — Archflaire",
    description: "Consultation request detail",
};

const ConsultationDetailPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Consultation Request" />
            <ConsultationDetail />
        </DefaultLayout>
    );
};

export default ConsultationDetailPage;
