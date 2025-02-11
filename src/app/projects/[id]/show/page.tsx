import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShowProject from "@/components/Forms/project/ShowProject";

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
                <ShowProject />
            </div>
        </DefaultLayout>
    );
};

export default Add;
