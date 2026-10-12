import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import RunsList from "@/components/Crawler/RunsList";

export const metadata: Metadata = {
  title: "Archflaire Crawler Runs",
  description: "Archflaire Crawler Runs",
};

const CrawlerRunsPage = () => {
  return (
    <DefaultLayout>
      <Breadcrumb pageName="Crawler Runs" />

      <div className="flex flex-col gap-10">
        <RunsList />
      </div>
    </DefaultLayout>
  );
};

export default CrawlerRunsPage;
