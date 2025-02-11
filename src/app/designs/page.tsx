import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShopCategoryTable from "@/components/Tables/shop/CategoryTable";
import DesignTable from "@/components/Tables/DesignTable";

export const metadata: Metadata = {
    title: "Archflaire Design",
    description:
        "Archflaire Design",
};

const DesignListPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Design" />

            <div className="flex flex-col gap-10">
                <DesignTable />
            </div>
        </DefaultLayout>
    );
};

export default DesignListPage;
