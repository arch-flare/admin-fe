import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EditTimeline from "@/components/Forms/project/EditTimeline";

export const metadata: Metadata = {
    title: "Archflaire Edit Timeline",
    description:
        "Archflaire Edit Timeline",
};

const Add = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Timeline" />

            <div className="flex flex-col gap-10">
                <EditTimeline />
            </div>
        </DefaultLayout>
    );
};

export default Add;
