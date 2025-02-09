import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ProductsTable from "@/components/Tables/shop/ProductTable";
import OrdersList from "@/components/Tables/shop/OrderTable";

export const metadata: Metadata = {
    title: "Archflaire Shop Orders",
    description:
        "Archflaire Shop Orders",
};

const ShopOrders = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Shop Orders" />

            <div className="flex flex-col gap-10">
                <OrdersList />
            </div>
        </DefaultLayout>
    );
};

export default ShopOrders;
