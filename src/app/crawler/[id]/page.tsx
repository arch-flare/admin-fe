import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RunReview from "@/components/Crawler/RunReview";

export const metadata: Metadata = {
  title: "Archflaire Review Crawler Run",
  description: "Archflaire Review Crawler Run",
};

const ReviewRunPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Review Crawler Run" />

      <div className="flex flex-col gap-10">
        <RunReview />
      </div>
    </DefaultLayout>
  );
};

export default ReviewRunPage;
