import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddProject from "@/components/Forms/project/AddProject";
import AddTimeline from "@/components/Forms/project/AddTimeline";

export const metadata: Metadata = {
    title: "Archflaire Add Timeline",
    description:
        "Archflaire Add Timeline",
};

const AddProjectTimelinePage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Timeline" />

            <div className="flex flex-col gap-10">
                <AddTimeline />
            </div>
        </DefaultLayout>
    );
};

export default AddProjectTimelinePage;
