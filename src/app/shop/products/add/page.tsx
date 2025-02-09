import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddProduct from "@/components/Forms/shop/products/AddProduct";

export const metadata: Metadata = {
    title: "Archflaire Add Shop Products",
    description:
        "Archflaire Add Shop Products",
};

const AddProductPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Product" />

            <div className="flex flex-col gap-10">
                <AddProduct />
            </div>
        </DefaultLayout>
    );
};

export default AddProductPage;
