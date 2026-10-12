import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShowProject from "@/components/Forms/project/ShowProject";

export const metadata: Metadata = {
    title: "Archflaire Project Details",
    description:
        "Archflaire Project Details",
};

const Show = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Project Details" />

            <div className="flex flex-col gap-10">
                <ShowProject />
            </div>
        </DefaultLayout>
    );
};

export default Show;
