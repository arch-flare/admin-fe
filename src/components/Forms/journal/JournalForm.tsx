"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { get, post } from "@/utils/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Eye, FileText, ImagePlus, Loader2, PenLine, Save, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@/components/Editor"), { ssr: false });

interface Props {
    /** When set the form edits that post, otherwise it creates one. */
    postId?: string;
}

interface JournalService {
    slug: string;
    label: string;
}

interface JournalFormValues {
    title: string;
    slug: string;
    description: string;
    intro: string;
    body: string;
    service_slug: string;
    is_published: boolean;
    published_at: string;
}

const SITE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://archflaire.com/api/").replace(/\/api\/?$/, "");
const inputClass = "w-full rounded-md border border-stroke bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-body focus:border-primary focus:ring-2 focus:ring-primary/10 dark:border-strokedark dark:bg-boxdark dark:text-white";
const labelClass = "mb-2 block text-sm font-medium text-black dark:text-white";

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char] as string));
const slugify = (value: string) => value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const JournalForm = ({ postId }: Props) => {
    const router = useRouter();
    const isEdit = Boolean(postId);
    const [form, setForm] = useState<JournalFormValues>({
        title: "",
        slug: "",
        description: "",
        intro: "",
        body: "",
        service_slug: "",
        is_published: true,
        published_at: "",
    });
    const [services, setServices] = useState<JournalService[]>([]);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [removeImage, setRemoveImage] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const uploadedImageUrl = useMemo(() => newImage ? URL.createObjectURL(newImage) : null, [newImage]);
    const coverImage = removeImage ? null : uploadedImageUrl || currentImage;
    const previewSlug = slugify(form.slug || form.title) || "your-article-slug";

    useEffect(() => () => {
        if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    }, [uploadedImageUrl]);

    useEffect(() => {
        get<any>("/blog-posts-services")
            .then((response) => setServices(response?.services ?? []))
            .catch(() => setServices([]));
    }, []);

    useEffect(() => {
        if (!postId) return;
        let current = true;
        get<any>(`/blog-posts/${postId}`)
            .then((response) => {
                if (!current) return;
                const post = response.post;
                setForm({
                    title: post.title ?? "",
                    slug: post.slug ?? "",
                    description: post.description ?? "",
                    intro: post.intro ?? "",
                    body: post.body ?? "",
                    service_slug: post.service_slug ?? "",
                    is_published: Boolean(post.is_published),
                    published_at: post.published_at ? String(post.published_at).slice(0, 10) : "",
                });
                setCurrentImage(post.image ? post.image_url : null);
            })
            .catch(() => { if (current) setError("We couldn’t load this post. Please return to the journal and try again."); })
            .finally(() => { if (current) setLoading(false); });
        return () => { current = false; };
    }, [postId]);

    const set = <Key extends keyof JournalFormValues,>(name: Key, value: JournalFormValues[Key]) =>
        setForm((previous) => ({ ...previous, [name]: value }));

    const previewDocument = useMemo(() => {
        const title = escapeHtml(form.title || "Your article title");
        const description = escapeHtml(form.description || "A short introduction will appear here on the public journal.");
        const intro = form.intro ? `<p class="af-article-intro">${escapeHtml(form.intro)}</p>` : "";
        const image = coverImage ? `<figure class="af-article-cover"><img src="${escapeHtml(coverImage)}" alt="${title}"></figure>` : "";
        const body = form.body || '<p>Your article will appear here as you write.</p>';
        const date = form.published_at
            ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${form.published_at}T12:00:00`))
            : "Preview · date to be set";

        return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data: blob:; style-src 'unsafe-inline' https:; font-src https:;">
<link rel="stylesheet" href="${SITE_URL}/assets/css/journal.css?v=1">
<style>html,body{margin:0;background:#f7f6f2}body{min-height:100vh}.af-journal{box-sizing:border-box;width:100%;max-width:1240px}.af-journal *{box-sizing:border-box}.af-article-header{padding-top:4px}.af-article-content p:first-child{margin-top:0}</style>
</head><body><main class="af-journal af-journal-article">
<nav class="af-journal-breadcrumb"><a href="#">Journal</a><span>/</span><span>${title}</span></nav>
<header class="af-article-header"><p class="af-journal-eyebrow">ARCHFLAIRE · JOURNAL</p><h1>${title}</h1><p class="af-article-deck">${description}</p><p class="af-journal-meta">${date} <span>·</span> PREVIEW</p></header>
${image}<article class="af-article-body">${intro}<div class="af-article-content">${body}</div></article>
</main></body></html>`;
    }, [form.title, form.description, form.intro, form.body, form.published_at, coverImage]);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
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
            data.append("published_at", form.published_at);
            if (newImage) data.append("image", newImage);
            if (removeImage && !newImage) data.append("remove_image", "1");

            await post(isEdit ? `/blog-posts/${postId}` : "/blog-posts", data);
            router.push("/journal");
        } catch (saveError: any) {
            const response = saveError?.response?.data;
            if (response?.errors) setFieldErrors(response.errors);
            setError(response?.message || "We couldn’t save the post. Review the fields and try again.");
        } finally {
            setSaving(false);
        }
    };

    const fieldError = (name: string) => fieldErrors[name]?.[0]
        ? <p className="mt-1.5 text-xs text-danger">{fieldErrors[name][0]}</p>
        : null;

    if (loading) {
        return <div className="rounded-xl border border-stroke bg-white p-8 text-center text-sm text-body shadow-sm dark:border-strokedark dark:bg-boxdark">Loading post…</div>;
    }

    return (
        <form onSubmit={submit} className="space-y-5">
            {error && (
                <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300">
                    {error}
                </div>
            )}

            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(290px,.75fr)]">
                <div className="space-y-5">
                    <section className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <header className="border-b border-stroke px-5 py-4 dark:border-strokedark sm:px-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-body">01 / Story</p>
                            <h2 className="mt-1 text-lg font-semibold text-black dark:text-white">Shape the article</h2>
                        </header>
                        <div className="space-y-5 p-5 sm:p-6">
                            <div>
                                <label className={labelClass} htmlFor="journal-title">Title <span className="text-danger">*</span></label>
                                <input id="journal-title" className={inputClass} value={form.title} required maxLength={255}
                                    onChange={(event) => set("title", event.target.value)} placeholder="Give the story a clear title" />
                                {fieldError("title")}
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="journal-slug">Public URL</label>
                                <div className="flex items-stretch overflow-hidden rounded-md border border-stroke focus-within:border-primary dark:border-strokedark">
                                    <span className="flex items-center border-r border-stroke bg-gray-2 px-3 text-xs text-body dark:border-strokedark dark:bg-meta-4">/journal/</span>
                                    <input id="journal-slug" className="min-w-0 flex-1 bg-white px-3 py-3 text-sm text-black outline-none dark:bg-boxdark dark:text-white"
                                        value={form.slug} onChange={(event) => set("slug", event.target.value)} placeholder="generated-from-title" />
                                </div>
                                <p className="mt-1.5 text-xs text-body">Leave empty to create a URL from the title. Preview: <span className="font-medium">/journal/{previewSlug}</span></p>
                                {fieldError("slug")}
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="journal-description">Meta description <span className="text-danger">*</span></label>
                                <textarea id="journal-description" className={inputClass} rows={3} maxLength={320} required value={form.description}
                                    onChange={(event) => set("description", event.target.value)} placeholder="A concise summary for search results and article listings" />
                                <div className="mt-1.5 flex justify-between gap-3 text-xs text-body">
                                    <span>Aim for 150–160 characters.</span><span className={form.description.length > 160 ? "text-amber-600" : ""}>{form.description.length}/320</span>
                                </div>
                                {fieldError("description")}
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="journal-intro">Introduction <span className="font-normal text-body">(optional)</span></label>
                                <textarea id="journal-intro" className={inputClass} rows={3} value={form.intro}
                                    onChange={(event) => set("intro", event.target.value)} placeholder="A short opening paragraph shown before the article" />
                                {fieldError("intro")}
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <header className="flex flex-col gap-3 border-b border-stroke px-5 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-body">02 / Article</p>
                                <h2 className="mt-1 text-lg font-semibold text-black dark:text-white">Write and preview</h2>
                            </div>
                            <div className="inline-flex self-start rounded-md bg-gray-2 p-1 dark:bg-meta-4" role="tablist" aria-label="Article editor view">
                                <button type="button" role="tab" aria-selected={!showPreview} onClick={() => setShowPreview(false)}
                                    className={`inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-medium transition ${!showPreview ? "bg-white text-black shadow-sm dark:bg-boxdark dark:text-white" : "text-body hover:text-black dark:hover:text-white"}`}>
                                    <PenLine size={14} /> Write
                                </button>
                                <button type="button" role="tab" aria-selected={showPreview} onClick={() => setShowPreview(true)}
                                    className={`inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-medium transition ${showPreview ? "bg-white text-black shadow-sm dark:bg-boxdark dark:text-white" : "text-body hover:text-black dark:hover:text-white"}`}>
                                    <Eye size={14} /> Preview
                                </button>
                            </div>
                        </header>
                        {showPreview ? (
                            <div className="bg-gray-2 p-3 dark:bg-meta-4 sm:p-5">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-body">
                                    <span className="inline-flex items-center gap-2"><Eye size={14} /> Public article preview</span>
                                    {postId && form.is_published && (!form.published_at || new Date(`${form.published_at}T00:00:00`).getTime() <= Date.now()) ? (
                                        <a href={`${SITE_URL}/journal/${previewSlug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                                            Open saved public page <ExternalLink size={13} />
                                        </a>
                                    ) : (
                                        <span>{form.is_published ? "Save and publish to make this page public." : "Drafts are only visible in this preview."}</span>
                                    )}
                                </div>
                                <iframe title="Live public journal preview" sandbox="" srcDoc={previewDocument}
                                    className="h-[72vh] min-h-[640px] w-full rounded-md border border-stroke bg-[#f7f6f2] dark:border-strokedark" />
                            </div>
                        ) : (
                            <div className="p-5 sm:p-6">
                                <label className={`${labelClass} mb-3`} htmlFor="journal-body">Article body <span className="text-danger">*</span></label>
                                <Editor value={form.body} onChange={(content) => set("body", content)} />
                                {fieldError("body")}
                            </div>
                        )}
                    </section>
                </div>

                <aside className="space-y-5 xl:sticky xl:top-5">
                    <section className="rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
                        <header className="border-b border-stroke px-5 py-4 dark:border-strokedark">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-body">03 / Publishing</p>
                            <h2 className="mt-1 text-lg font-semibold text-black dark:text-white">Cover and visibility</h2>
                        </header>
                        <div className="space-y-5 p-5">
                            <div>
                                <label className={`${labelClass} mb-1`} htmlFor="journal-image">Cover image</label>
                                <p className="mb-3 text-xs leading-relaxed text-body">Choose an architectural or interior image. A wide landscape image works best.</p>
                                {coverImage ? (
                                    <div className="relative overflow-hidden rounded-md border border-stroke dark:border-strokedark">
                                        <img src={coverImage} alt="Journal cover preview" className="aspect-[1.45] w-full object-cover" />
                                        <button type="button" onClick={() => { setNewImage(null); setRemoveImage(Boolean(currentImage)); }}
                                            className="absolute right-2 top-2 inline-flex items-center gap-1 rounded bg-black/70 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-black" aria-label="Remove cover image">
                                            <X size={13} /> Remove
                                        </button>
                                    </div>
                                ) : (
                                    <label htmlFor="journal-image" className="flex aspect-[1.8] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-stroke bg-gray-2/70 px-4 text-center transition hover:border-primary dark:border-strokedark dark:bg-meta-4/30">
                                        <ImagePlus className="h-8 w-8 text-body" />
                                        <span className="mt-2 text-sm font-medium text-black dark:text-white">Add a cover image</span>
                                        <span className="mt-1 text-xs text-body">JPG, PNG or WebP · up to 5 MB</span>
                                    </label>
                                )}
                                <input id="journal-image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
                                    onChange={(event) => { setNewImage(event.target.files?.[0] ?? null); setRemoveImage(false); }} />
                                {coverImage && <label htmlFor="journal-image" className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary hover:underline"><Upload size={13} /> Replace cover</label>}
                                {fieldError("image")}
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="journal-service">Related service page</label>
                                <select id="journal-service" className={inputClass} value={form.service_slug}
                                    onChange={(event) => set("service_slug", event.target.value)}>
                                    <option value="">No related page</option>
                                    {services.map((service) => <option key={service.slug} value={service.slug}>{service.label}</option>)}
                                </select>
                                <p className="mt-1.5 text-xs leading-relaxed text-body">Connect this article with a related service page.</p>
                            </div>

                            <div>
                                <label className={labelClass} htmlFor="journal-publish-date">Publish date</label>
                                <div className="relative">
                                    <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" />
                                    <input id="journal-publish-date" type="date" className={`${inputClass} pl-10`} value={form.published_at}
                                        onChange={(event) => set("published_at", event.target.value)} />
                                </div>
                                <p className="mt-1.5 text-xs leading-relaxed text-body">A future date keeps the article scheduled until then.</p>
                                {fieldError("published_at")}
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 rounded-md border border-stroke p-3.5 dark:border-strokedark">
                                <input type="checkbox" checked={form.is_published} onChange={(event) => set("is_published", event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
                                <span>
                                    <span className="block text-sm font-medium text-black dark:text-white">Publish this article</span>
                                    <span className="mt-0.5 block text-xs leading-relaxed text-body">Turn off to save as a draft.</span>
                                </span>
                            </label>
                        </div>
                    </section>

                    <section className="rounded-xl border border-stroke bg-gray-2/60 p-5 dark:border-strokedark dark:bg-meta-4/30">
                        <div className="flex items-start gap-3">
                            <FileText size={17} className="mt-0.5 shrink-0 text-body" />
                            <div>
                                <h3 className="text-sm font-medium text-black dark:text-white">Public journal</h3>
                                <p className="mt-1 text-xs leading-relaxed text-body">Published stories appear at <span className="font-medium">archflaire.com/journal</span> and have their own shareable page.</p>
                                <button type="button" onClick={() => setShowPreview(true)} className="mt-3 text-xs font-medium text-primary hover:underline">Preview this article</button>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            <footer className="flex flex-col-reverse gap-3 rounded-xl border border-stroke bg-white p-4 shadow-sm dark:border-strokedark dark:bg-boxdark sm:flex-row sm:justify-end sm:p-5">
                <button type="button" onClick={() => router.push("/journal")}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-stroke px-5 py-2.5 text-sm font-medium text-body transition hover:bg-gray-2 hover:text-black focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:hover:bg-meta-4 dark:hover:text-white">
                    <ArrowLeft size={15} /> Cancel
                </button>
                <button type="submit" disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Create post"}
                </button>
            </footer>
        </form>
    );
};

export default JournalForm;
