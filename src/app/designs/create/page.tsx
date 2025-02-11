import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import CreateDesign from "@/components/Forms/design/CreateDesign";

export const metadata: Metadata = {
    title: "Archflaire Create Design",
    description:
        "Archflaire Create Design",
};

const DesignListPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Create Design" />

            <div className="flex flex-col gap-10">
                <CreateDesign />
            </div>
        </DefaultLayout>
    );
};

export default DesignListPage;
