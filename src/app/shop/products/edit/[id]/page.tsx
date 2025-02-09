import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import EditProduct from "@/components/Forms/shop/products/EditProduct";

export const metadata: Metadata = {
    title: "Archflaire Edit Shop Products",
    description:
        "Archflaire Edit Shop Products",
};

const EditProductPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Product" />

            <div className="flex flex-col gap-10">
                <EditProduct />
            </div>
        </DefaultLayout>
    );
};

export default EditProductPage;
