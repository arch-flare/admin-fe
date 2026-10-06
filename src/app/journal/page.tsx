import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JournalTable from "@/components/Tables/JournalTable";

export const metadata: Metadata = {
    title: "Archflaire Journal",
    description: "Archflaire Journal",
};

export default function JournalPage() {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Journal" />
            <div className="flex flex-col gap-10">
                <JournalTable />
            </div>
        </DefaultLayout>
    );
}
