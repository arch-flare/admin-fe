import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EditDesign from "@/components/Forms/design/EditDesign";

export const metadata: Metadata = {
    title: "Archflaire Edit Design",
    description:
        "Archflaire Edit Design",
};

const EditDesignPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Design" />

            <div className="flex flex-col gap-10">
                <EditDesign />
            </div>
        </DefaultLayout>
    );
};

export default EditDesignPage;
