import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EditProject from "@/components/Forms/project/EditProject";

export const metadata: Metadata = {
    title: "Archflaire Edit Project",
    description:
        "Archflaire Edit Project",
};

const Add = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Project" />

            <div className="flex flex-col gap-10">
                <EditProject />
            </div>
        </DefaultLayout>
    );
};

export default Add;
