import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JournalForm from "@/components/Forms/journal/JournalForm";

export const metadata: Metadata = {
    title: "Archflaire Edit Journal Post",
    description: "Archflaire Edit Journal Post",
};

export default function EditJournalPage({ params }: { params: { id: string } }) {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Post" />
            <div className="flex flex-col gap-10">
                <JournalForm postId={params.id} />
            </div>
        </DefaultLayout>
    );
}
