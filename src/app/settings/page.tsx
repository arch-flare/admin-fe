import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import SettingsForms from "@/components/Forms/settings/SettingsForms";

export const metadata: Metadata = {
  title: "Settings | Archflaire Admin",
  description: "Manage site-wide settings for Archflaire",
};

const Settings = () => {
  return (
    <DefaultLayout>
      <div className="mx-auto max-w-4xl">
        <Breadcrumb pageName="Settings" />
        <SettingsForms />
      </div>
    </DefaultLayout>
  );
};

export default Settings;
