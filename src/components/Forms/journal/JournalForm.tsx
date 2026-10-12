"use client";

import { useEffect, useState } from "react";
import { get, post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Props {
    /** When set the form edits that post, otherwise it creates one. */
    postId?: string;
}

const inputClass =
    "w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary";
const labelClass = "mb-3 block text-sm font-medium text-black dark:text-white";

export const JournalForm = ({ postId }: Props) => {
    const router = useRouter();
    const isEdit = Boolean(postId);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        description: "",
        intro: "",
        body: "",
        service_slug: "",
        is_published: true,
        published_at: "",
    });
    const [services, setServices] = useState<{ slug: string; label: string }[]>([]);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        get<any>("/blog-posts-services")
            .then((r: any) => setServices(r.services ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        if (!postId) return;
        get<any>(`/blog-posts/${postId}`)
            .then((r: any) => {
                const p = r.post;
                setForm({
                    title: p.title ?? "",
                    slug: p.slug ?? "",
                    description: p.description ?? "",
                    intro: p.intro ?? "",
                    body: p.body ?? "",
                    service_slug: p.service_slug ?? "",
                    is_published: Boolean(p.is_published),
                    published_at: p.published_at ? String(p.published_at).slice(0, 10) : "",
                });
                setCurrentImage(p.image ? p.image_url : null);
            })
            .catch(() => setError("Failed to load this post."))
            .finally(() => setLoading(false));
    }, [postId]);

    const set = (name: string, value: string | boolean) =>
        setForm((prev) => ({ ...prev, [name]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        try {
            const data = new FormData();
            data.append("title", form.title);
            data.append("slug", form.slug);
            data.append("description", form.description);
            data.append("intro", form.intro);
            data.append("body", form.body);
            data.append("service_slug", form.service_slug);
            data.append("is_published", form.is_published ? "1" : "0");
            if (form.published_at) data.append("published_at", form.published_at);
            if (newImage) data.append("image", newImage);
            if (removeImage && !newImage) data.append("remove_image", "1");

            // Updates go through POST so the multipart image upload is parsed.
            await post(isEdit ? `/blog-posts/${postId}` : "/blog-posts", data);
            router.push("/journal");
        } catch (err: any) {
            const res = err?.response?.data;
            if (res?.errors) setFieldErrors(res.errors);
            setError(res?.message || "Failed to save the post. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading post...
            </div>
        );
    }

    const fe = (name: string) =>
        fieldErrors[name] ? <p className="mt-1 text-sm text-danger">{fieldErrors[name][0]}</p> : null;

    return (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                    {isEdit ? "Edit Post" : "New Post"}
                </h3>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                    <div className="mb-4.5">
                        <label className={labelClass}>Title <span className="text-meta-1">*</span></label>
                        <input className={inputClass} value={form.title} required
                            onChange={(e) => set("title", e.target.value)} placeholder="Post title" />
                        {fe("title")}
                    </div>

                    <div className="mb-4.5">
                        <label className={labelClass}>URL slug</label>
                        <input className={inputClass} value={form.slug}
                            onChange={(e) => set("slug", e.target.value)}
                            placeholder="Leave blank to generate from the title" />
                        <p className="mt-1 text-xs">Public URL: /journal/{form.slug || "your-slug"}</p>
                        {fe("slug")}
                    </div>

                    <div className="mb-4.5">
                        <label className={labelClass}>
                            Meta description <span className="text-meta-1">*</span>
                            <span className="ml-2 font-normal text-xs">({form.description.length}/320 — aim for 150–160)</span>
                        </label>
                        <textarea className={inputClass} rows={3} maxLength={320} required value={form.description}
                            onChange={(e) => set("description", e.target.value)}
                            placeholder="Shown in Google results and on the journal index" />
                        {fe("description")}
                    </div>

                    <div className="mb-4.5">
                        <label className={labelClass}>Introduction (shown bold above the article)</label>
                        <textarea className={inputClass} rows={3} value={form.intro}
                            onChange={(e) => set("intro", e.target.value)} />
                    </div>

                    <div className="mb-4.5">
                        <label className={labelClass}>Article <span className="text-meta-1">*</span></label>
                        <Editor value={form.body} onChange={(c) => set("body", c)} />
                        {fe("body")}
                    </div>

                    <div className="mb-4.5">
                        <label className={labelClass}>Cover image</label>
                        <p className="mb-3 text-xs">Use architecture, interiors or site photos — no photos of people.</p>
                        {(newImage || (currentImage && !removeImage)) && (
                            <div className="mb-3">
                                <img
                                    src={newImage ? URL.createObjectURL(newImage) : currentImage!}
                                    alt="Cover preview"
                                    className="h-32 w-56 rounded object-cover"
                                />
                                <button type="button" className="mt-2 text-sm text-danger"
                                    onClick={() => { setNewImage(null); if (currentImage) setRemoveImage(true); }}>
                                    Remove image
                                </button>
                            </div>
                        )}
                        <div className="border-2 border-dashed border-stroke p-6 text-center">
                            <input type="file" accept="image/*" id="journal-image" className="hidden"
                                onChange={(e) => { setNewImage(e.target.files?.[0] ?? null); setRemoveImage(false); }} />
                            <label htmlFor="journal-image" className="cursor-pointer">
                                <Upload className="mx-auto h-10 w-10 text-body" />
                                <span className="mt-3 block text-sm font-medium">
                                    {currentImage || newImage ? "Replace cover image" : "Click to upload a cover image"}
                                </span>
                            </label>
                        </div>
                        {fe("image")}
                    </div>

                    <div className="mb-4.5 grid gap-4.5 md:grid-cols-2">
                        <div>
                            <label className={labelClass}>Related service page</label>
                            <select className={inputClass} value={form.service_slug}
                                onChange={(e) => set("service_slug", e.target.value)}>
                                <option value="">None</option>
                                {services.map((s) => (
                                    <option key={s.slug} value={s.slug}>{s.label}</option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs">The post appears under &ldquo;Related reading&rdquo; on that service page.</p>
                        </div>
                        <div>
                            <label className={labelClass}>Publish date</label>
                            <input type="date" className={inputClass} value={form.published_at}
                                onChange={(e) => set("published_at", e.target.value)} />
                            <p className="mt-1 text-xs">A future date schedules the post.</p>
                        </div>
                    </div>

                    <label className="mb-6 flex cursor-pointer items-center gap-3 text-sm text-black dark:text-white">
                        <input type="checkbox" checked={form.is_published}
                            onChange={(e) => set("is_published", e.target.checked)} />
                        Published (untick to keep as a draft)
                    </label>

                    {error && (
                        <div className="mb-4.5 rounded bg-danger bg-opacity-10 px-4 py-3 text-danger">{error}</div>
                    )}

                    <div className="flex gap-3">
                        <button type="submit" disabled={saving}
                            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50">
                            {saving ? <Loader2 className="h-6 w-6 animate-spin" /> : isEdit ? "Save Changes" : "Create Post"}
                        </button>
                        <button type="button" onClick={() => router.push("/journal")}
                            className="flex w-full justify-center rounded bg-body p-3 font-medium text-black hover:bg-opacity-90 dark:bg-meta-4 dark:text-white">
                            Cancel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JournalForm;
