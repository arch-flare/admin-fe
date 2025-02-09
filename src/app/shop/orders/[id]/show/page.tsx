import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShowOrder from "@/components/Forms/shop/orders/ShowOrder";

export const metadata: Metadata = {
    title: "Archflaire Show Order",
    description:
        "Archflaire Show Order",
};

const EditProductPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Show Product" />

            <div className="flex flex-col gap-10">
                <ShowOrder />
            </div>
        </DefaultLayout>
    );
};

export default EditProductPage;
