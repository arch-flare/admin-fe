"use client";

import { useEffect, useState } from "react";
import { get, remove } from "@/utils/api";
import { ArrowLeft, ArrowRight, ExternalLink, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
    id: number;
    slug: string;
    title: string;
    description: string;
    image_url: string | null;
    is_published: boolean;
    published_at: string | null;
    created_at: string | null;
    read_minutes: number;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

type StatusFilter = "all" | "published" | "draft" | "scheduled";

const SITE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://archflaire.com/api/").replace(/\/api\/?$/, "");

const statusFor = (post: Post) => {
    if (!post.is_published) return { label: "Draft", classes: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-300/20" };
    if (post.published_at && new Date(post.published_at).getTime() > Date.now()) return { label: "Scheduled", classes: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-300 dark:ring-sky-300/20" };
    return { label: "Published", classes: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-300/20" };
};

const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
    : "Not scheduled";

const JournalTable = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<Pagination>({ current_page: 1, last_page: 1, per_page: 20, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            setPage(1);
            setSearch(searchInput.trim());
        }, 300);
        return () => window.clearTimeout(timeout);
    }, [searchInput]);

    useEffect(() => {
        let current = true;
        setLoading(true);
        setError(null);

        get<any>("/blog-posts", { search, status, page })
            .then((response: any) => {
                if (!current) return;
                const result = response?.posts;
                setPosts(Array.isArray(result?.data) ? result.data : []);
                setPagination({
                    current_page: result?.current_page ?? 1,
                    last_page: result?.last_page ?? 1,
                    per_page: result?.per_page ?? 20,
                    total: result?.total ?? 0,
                });
            })
            .catch(() => {
                if (current) setError("We couldn’t load journal posts. Check your connection and try again.");
            })
            .finally(() => {
                if (current) setLoading(false);
            });

        return () => { current = false; };
    }, [search, status, page, reload]);

    const handleDelete = async (post: Post) => {
        if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
        setDeletingId(post.id);
        setError(null);
        try {
            await remove(`/blog-posts/${post.id}`);
            if (posts.length === 1 && page > 1) setPage((currentPage) => currentPage - 1);
            else setReload((current) => current + 1);
        } catch {
            setError("The post could not be deleted. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const hasFilters = search.length > 0 || status !== "all";
    const firstItem = pagination.total === 0 ? 0 : (pagination.current_page - 1) * pagination.per_page + 1;
    const lastItem = Math.min(pagination.current_page * pagination.per_page, pagination.total);

    return (
        <section className="overflow-hidden rounded-xl border border-stroke bg-white shadow-sm dark:border-strokedark dark:bg-boxdark">
            <header className="flex flex-col gap-4 border-b border-stroke px-5 py-5 dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-body">ARCHFLAIRE / EDITORIAL</p>
                    <h2 className="mt-1 text-xl font-semibold text-black dark:text-white">Journal posts</h2>
                </div>
                <button onClick={() => router.push("/journal/create")}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]">
                    <Plus size={16} /> New post
                </button>
            </header>

            <div className="flex flex-col gap-3 border-b border-stroke px-5 py-4 dark:border-strokedark sm:flex-row sm:items-center sm:px-7">
                <label className="relative block min-w-0 flex-1">
                    <span className="sr-only">Search journal posts</span>
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-body" aria-hidden="true" />
                    <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search titles, descriptions or slugs…"
                        className="w-full rounded-md border border-stroke bg-transparent py-2.5 pl-10 pr-4 text-sm text-black outline-none transition placeholder:text-body focus:border-primary dark:border-strokedark dark:text-white" />
                </label>
                <label className="flex items-center gap-3 text-sm text-body">
                    <span className="shrink-0">Status</span>
                    <select value={status} onChange={(event) => { setStatus(event.target.value as StatusFilter); setPage(1); }}
                        className="min-w-36 rounded-md border border-stroke bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white">
                        <option value="all">All posts</option>
                        <option value="published">Published</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="draft">Drafts</option>
                    </select>
                </label>
            </div>

            {error && (
                <div role="alert" className="mx-5 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-300/20 dark:bg-rose-400/10 dark:text-rose-300 sm:mx-7">
                    <span>{error}</span>
                    <button type="button" onClick={() => setReload((current) => current + 1)} className="font-medium underline underline-offset-2">Try again</button>
                </div>
            )}

            <div className="max-w-full overflow-x-auto">
                <table className="w-full min-w-[760px] table-auto text-left">
                    <thead>
                        <tr className="bg-gray-2 dark:bg-meta-4">
                            <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-body sm:px-7">Post</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-body">Status</th>
                            <th className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-body">Publish date</th>
                            <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-body sm:px-7">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && Array.from({ length: 4 }).map((_, index) => (
                            <tr key={`skeleton-${index}`}>
                                <td className="border-b border-[#eee] px-5 py-5 dark:border-strokedark sm:px-7">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-20 animate-pulse rounded bg-gray-2 dark:bg-meta-4" />
                                        <div className="space-y-2"><div className="h-4 w-48 animate-pulse rounded bg-gray-2 dark:bg-meta-4" /><div className="h-3 w-32 animate-pulse rounded bg-gray-2 dark:bg-meta-4" /></div>
                                    </div>
                                </td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark"><div className="h-6 w-20 animate-pulse rounded bg-gray-2 dark:bg-meta-4" /></td>
                                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark"><div className="h-4 w-24 animate-pulse rounded bg-gray-2 dark:bg-meta-4" /></td>
                                <td className="border-b border-[#eee] px-5 py-5 dark:border-strokedark sm:px-7" />
                            </tr>
                        ))}

                        {!loading && posts.map((post) => {
                            const postStatus = statusFor(post);
                            return (
                                <tr key={post.id} className="transition-colors hover:bg-gray-2/60 dark:hover:bg-meta-4/40">
                                    <td className="border-b border-[#eee] px-5 py-4 dark:border-strokedark sm:px-7">
                                        <div className="flex items-center gap-4">
                                            {post.image_url ? (
                                                <img src={post.image_url} alt="" className="h-14 w-20 shrink-0 rounded object-cover" loading="lazy" />
                                            ) : (
                                                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded bg-gray-2 text-body dark:bg-meta-4"><FileText size={20} /></div>
                                            )}
                                            <div className="min-w-0">
                                                <h3 className="truncate font-medium text-black dark:text-white">{post.title}</h3>
                                                <p className="mt-1 truncate text-xs text-body">/journal/{post.slug} <span className="px-1">·</span> {post.read_minutes} min read</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                                        <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${postStatus.classes}`}>{postStatus.label}</span>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-4 text-sm text-black dark:border-strokedark dark:text-white">
                                        {formatDate(post.published_at ?? (postStatus.label === "Published" ? post.created_at : null))}
                                    </td>
                                    <td className="border-b border-[#eee] px-5 py-4 dark:border-strokedark sm:px-7">
                                        <div className="flex items-center justify-end gap-1.5">
                                            {postStatus.label === "Published" && (
                                                <a href={`${SITE_URL}/journal/${post.slug}`} target="_blank" rel="noreferrer"
                                                    className="rounded p-2 text-body transition hover:bg-gray-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:hover:bg-meta-4"
                                                    title="View published post" aria-label={`View ${post.title} on the public site`}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                            )}
                                            <button type="button" className="rounded p-2 text-body transition hover:bg-gray-2 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary dark:hover:bg-meta-4"
                                                title="Edit post" aria-label={`Edit ${post.title}`} onClick={() => router.push(`/journal/${post.id}/edit`)}>
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button type="button" disabled={deletingId === post.id}
                                                className="rounded p-2 text-body transition hover:bg-rose-50 hover:text-danger focus:outline-none focus:ring-2 focus:ring-danger disabled:opacity-50 dark:hover:bg-rose-400/10"
                                                title="Delete post" aria-label={`Delete ${post.title}`} onClick={() => handleDelete(post)}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {!loading && posts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-5 py-14 text-center sm:px-7">
                                    <div className="mx-auto max-w-sm">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-2 text-body dark:bg-meta-4"><FileText size={21} /></div>
                                        <h3 className="mt-4 font-medium text-black dark:text-white">{hasFilters ? "No matching posts" : "Your journal is ready"}</h3>
                                        <p className="mt-1 text-sm text-body">{hasFilters ? "Try another search or status filter." : "Create your first article to start sharing studio stories."}</p>
                                        {hasFilters ? (
                                            <button className="mt-4 text-sm font-medium text-primary hover:underline" onClick={() => { setSearchInput(""); setSearch(""); setStatus("all"); setPage(1); }}>Clear search and filters</button>
                                        ) : (
                                            <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" onClick={() => router.push("/journal/create")}><Plus size={15} /> Create a post</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <footer className="flex flex-col gap-3 border-t border-stroke px-5 py-4 text-sm dark:border-strokedark sm:flex-row sm:items-center sm:justify-between sm:px-7">
                <p className="text-body">{loading ? "Loading posts…" : `Showing ${firstItem}–${lastItem} of ${pagination.total} ${pagination.total === 1 ? "post" : "posts"}`}</p>
                <div className="flex items-center justify-end gap-2">
                    <button type="button" disabled={loading || page <= 1} onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                        className="inline-flex items-center gap-1.5 rounded border border-stroke px-3 py-2 text-sm text-black transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-white">
                        <ArrowLeft size={15} /> Previous
                    </button>
                    <span className="px-2 text-xs text-body">{pagination.current_page} / {pagination.last_page}</span>
                    <button type="button" disabled={loading || page >= pagination.last_page} onClick={() => setPage((currentPage) => Math.min(pagination.last_page, currentPage + 1))}
                        className="inline-flex items-center gap-1.5 rounded border border-stroke px-3 py-2 text-sm text-black transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 dark:border-strokedark dark:text-white">
                        Next <ArrowRight size={15} />
                    </button>
                </div>
            </footer>
        </section>
    );
};

export default JournalTable;
