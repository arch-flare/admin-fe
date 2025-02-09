import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShopCategoryTable from "@/components/Tables/shop/CategoryTable";

export const metadata: Metadata = {
    title: "Archflaire Shop Categories",
    description:
        "Archflaire Shop Categories",
};

const ShopCategories = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Shop Categories" />

            <div className="flex flex-col gap-10">
                <ShopCategoryTable />
            </div>
        </DefaultLayout>
    );
};

export default ShopCategories;
