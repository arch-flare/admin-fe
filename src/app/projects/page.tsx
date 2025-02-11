import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProjectTable from "@/components/Tables/ProjectTable";

export const metadata: Metadata = {
    title: "Archflaire Projects",
    description:
        "Archflaire Projects",
};

const ShopOrders = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Projects" />

            <div className="flex flex-col gap-10">
                <ProjectTable />
            </div>
        </DefaultLayout>
    );
};

export default ShopOrders;
