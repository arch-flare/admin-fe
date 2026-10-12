import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ConsultationTable from "@/components/Tables/ConsultationTable";

export const metadata: Metadata = {
    title: "Archflaire Consultation Requests",
    description: "Consultation requests submitted from the Archflaire website",
};

const ConsultationsPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Consultations & Inquiries" />

            <div className="flex flex-col gap-10">
                <ConsultationTable />
            </div>
        </DefaultLayout>
    );
};

export default ConsultationsPage;
