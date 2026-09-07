"use client";

import { useState } from "react";
import { put } from "@/utils/api";
import { Check } from "lucide-react";

export type ContactFieldMeta = {
  label: string;
  type: string;
  placeholder: string;
};

type Props = {
  initialValues: Record<string, string>;
  meta: Record<string, ContactFieldMeta>;
};

const ContactInfoForm = ({ initialValues, meta }: Props) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const fields = Object.keys(meta);

  const handleChange = (field: string, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaved(false);

    try {
      setSaving(true);
      const payload: Record<string, string> = {};
      fields.forEach((f) => (payload[f] = (values[f] ?? "").trim()));

      const res = (await put("/settings/contact", payload)) as any;
      if (res.status) {
        setValues(res.contact || payload);
        setFieldErrors({});
        setSaved(true);
      } else {
        setFormError("Could not save. Please try again.");
      }
    } catch (err: any) {
      const apiErrors = err?.response?.data?.errors;
      if (apiErrors && typeof apiErrors === "object") {
        const mapped: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, m]) => {
          mapped[k] = Array.isArray(m) ? String(m[0]) : String(m);
        });
        setFieldErrors(mapped);
        setFormError("Some fields need fixing.");
      } else {
        setFormError("Could not save. Please try again.");
      }
      console.error("Error saving contact info:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">Contact Information</h3>
        <p className="mt-1 text-sm text-body dark:text-bodydark">
          Shown in the website footer, on the &ldquo;Book a consultation&rdquo; page and in search-engine
          listings.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="grid gap-5.5 sm:grid-cols-2">
            {fields.map((field) => {
              const m = meta[field];
              const err = fieldErrors[field];
              return (
                <div key={field}>
                  <label
                    htmlFor={`contact-${field}`}
                    className="mb-2.5 block text-sm font-medium text-black dark:text-white"
                  >
                    {m.label}
                  </label>
                  <input
                    id={`contact-${field}`}
                    type={m.type === "email" ? "email" : "text"}
                    name={field}
                    value={values[field] ?? ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={m.placeholder}
                    className={`w-full rounded border-[1.5px] bg-transparent px-4 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:bg-form-input dark:text-white ${
                      err
                        ? "border-danger focus:border-danger"
                        : "border-stroke dark:border-form-strokedark dark:focus:border-primary"
                    }`}
                  />
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

export default ContactInfoForm;
