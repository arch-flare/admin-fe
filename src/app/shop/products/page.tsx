import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProductsTable from "@/components/Tables/shop/ProductTable";

export const metadata: Metadata = {
    title: "Archflaire Shop Products",
    description:
        "Archflaire Shop Products",
};

const ShopProducts = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Shop Products" />

            <div className="flex flex-col gap-10">
                <ProductsTable />
            </div>
        </DefaultLayout>
    );
};

export default ShopProducts;
