import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import ShowProduct from "@/components/Forms/shop/products/ShowProduct";

export const metadata: Metadata = {
    title: "Archflaire Add Shop Products",
    description:
        "Archflaire Add Shop Products",
};

const ShowProductPage = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Show Product" />

            <div className="flex flex-col gap-10">
                <ShowProduct />
            </div>
        </DefaultLayout>
    );
};

export default ShowProductPage;
