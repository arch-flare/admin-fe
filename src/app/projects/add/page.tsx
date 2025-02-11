import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddProject from "@/components/Forms/project/AddProject";

export const metadata: Metadata = {
    title: "Archflaire Add Project",
    description:
        "Archflaire Add Project",
};

const Add = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Project" />

            <div className="flex flex-col gap-10">
                <AddProject />
            </div>
        </DefaultLayout>
    );
};

export default Add;
