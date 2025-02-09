import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddShopCategory from "@/components/Forms/shop/categories/AddCategory";

export const metadata: Metadata = {
    title: "Archflaire Add Shop Categories",
    description:
        "Archflaire Add Shop Categories",
};

const Add = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Add Category" />

            <div className="flex flex-col gap-10">
                <AddShopCategory />
            </div>
        </DefaultLayout>
    );
};

export default Add;
