"use client";

import { useState } from "react";
import { put } from "@/utils/api";
import { Check, ExternalLink } from "lucide-react";

export type PlatformMeta = {
  label: string;
  icon: string;
  placeholder: string;
};

type Props = {
  initialValues: Record<string, string>;
  meta: Record<string, PlatformMeta>;
};

const isLikelyUrl = (value: string) => {
  const v = value.trim();
  if (!v) return true; // empty is allowed (clears the link)
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const SocialLinksForm = ({ initialValues, meta }: Props) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const platforms = Object.keys(meta);

  const handleChange = (platform: string, value: string) => {
    setValues((prev) => ({ ...prev, [platform]: value }));
    setSaved(false);
    setFieldErrors((prev) => {
      if (!prev[platform]) return prev;
      const next = { ...prev };
      delete next[platform];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    const localErrors: Record<string, string> = {};
    platforms.forEach((platform) => {
      if (!isLikelyUrl(values[platform] ?? "")) {
        localErrors[platform] = "Enter a full URL including https://";
      }
    });
    if (Object.keys(localErrors).length) {
      setFieldErrors(localErrors);
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, string> = {};
      platforms.forEach((platform) => {
        payload[platform] = (values[platform] ?? "").trim();
      });

      const res = (await put("/settings/social", payload)) as any;
      if (res.status) {
        setValues(res.socials || payload);
        setFieldErrors({});
        setSaved(true);
      } else {
        setFormError("Could not save. Please try again.");
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([key, msgs]) => {
          mapped[key] = Array.isArray(msgs) ? String(msgs[0]) : String(msgs);
        });
        setFieldErrors(mapped);
        setFormError("Some links need fixing.");
      } else {
        setFormError("Could not save. Please try again.");
      }
      console.error("Error saving social links:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">Social Links</h3>
        <p className="mt-1 text-sm text-body dark:text-bodydark">
          Paste the full address of each profile (for example{" "}
          <span className="font-mono">https://instagram.com/yourhandle</span>). Leave a field blank
          to hide that icon on the website.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="grid gap-5.5 sm:grid-cols-2">
            {platforms.map((platform) => {
              const m = meta[platform];
              const value = values[platform] ?? "";
              const err = fieldErrors[platform];
              return (
                <div key={platform}>
                  <label
                    htmlFor={`social-${platform}`}
                    className="mb-2.5 block text-sm font-medium text-black dark:text-white"
                  >
                    {m.label}
                  </label>
                  <div className="relative">
                    <input
                      id={`social-${platform}`}
                      type="url"
                      inputMode="url"
                      name={platform}
                      value={value}
                      onChange={(e) => handleChange(platform, e.target.value)}
                      placeholder={m.placeholder}
                      className={`w-full rounded border-[1.5px] bg-transparent px-4 py-3 pr-11 text-black outline-none transition focus:border-primary active:border-primary dark:bg-form-input dark:text-white ${
                        err
                          ? "border-danger focus:border-danger"
                          : "border-stroke dark:border-form-strokedark dark:focus:border-primary"
                      }`}
                    />
                    {value.trim() && isLikelyUrl(value) && (
                      <a
                        href={value.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open link"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-body hover:text-primary"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                  {err && <p className="mt-1.5 text-sm text-danger">{err}</p>}
                </div>
              );
            })}
          </div>

          {formError && (
            <div className="mt-5.5 rounded bg-danger bg-opacity-10 px-4 py-3 text-danger">
              {formError}
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex justify-center rounded bg-primary px-6 py-2.5 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            {saved && !saving && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <Check size={16} /> Saved
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SocialLinksForm;
