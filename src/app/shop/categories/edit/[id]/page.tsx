import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import AddShopCategory from "@/components/Forms/shop/categories/AddCategory";
import EditShopCategory from "@/components/Forms/shop/categories/EditCategory";

export const metadata: Metadata = {
    title: "Archflaire Edit Shop Categories",
    description:
        "Archflaire Edit Shop Categories",
};

const EditCategory = () => {
    return (
        <DefaultLayout>
            <Breadcrumb pageName="Edit Category" />

            <div className="flex flex-col gap-10">
                <EditShopCategory />
            </div>
        </DefaultLayout>
    );
};

export default EditCategory;
