import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import JournalForm from "@/components/Forms/journal/JournalForm";

export const metadata: Metadata = {
    title: "Archflaire New Journal Post",
    description: "Archflaire New Journal Post",
};

export default function CreateJournalPage() {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="New Post" />
            <div className="flex flex-col gap-10">
                <JournalForm />
            </div>
        </DefaultLayout>
    );
}
