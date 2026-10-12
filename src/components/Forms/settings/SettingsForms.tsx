"use client";

import { useEffect, useState } from "react";
import { get } from "@/utils/api";
import { Loader2 } from "lucide-react";
import SocialLinksForm, { PlatformMeta } from "./SocialLinksForm";
import ContactInfoForm, { ContactFieldMeta } from "./ContactInfoForm";

type SettingsResponse = {
  status: boolean;
  socials: Record<string, string>;
  socials_meta: Record<string, PlatformMeta>;
  contact: Record<string, string>;
  contact_meta: Record<string, ContactFieldMeta>;
};

const SettingsForms = () => {
  const [data, setData] = useState<SettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = (await get("/settings")) as unknown as SettingsResponse;
        if (res.status) {
          setData(res);
        } else {
          setError("Could not load settings.");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
        setError("Could not load settings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">
        {error || "Could not load settings."}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <ContactInfoForm initialValues={data.contact} meta={data.contact_meta} />
      <SocialLinksForm initialValues={data.socials} meta={data.socials_meta} />
    </div>
  );
};

export default SettingsForms;
