"use client";

import { useEffect, useState } from "react";
import { get, remove } from "@/utils/api";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Post {
    id: number;
    slug: string;
    title: string;
    description: string;
    image_url: string;
    is_published: boolean;
    published_at: string | null;
    read_minutes: number;
}

// Public site lives on the API host (strip the trailing /api/).
const SITE_URL = (process.env.NEXT_PUBLIC_API_URL || "https://archflaire.com/api/").replace(/\/api\/?$/, "");

const JournalTable = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        get<any>("/blog-posts")
            .then((r: any) => setPosts(r.posts.data))
            .catch(() => setError("Failed to fetch posts"))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this post? This cannot be undone.")) return;
        try {
            await remove(`/blog-posts/${id}`);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch {
            alert("Failed to delete post");
        }
    };

    const status = (p: Post) => {
        if (!p.is_published) return { label: "Draft", cls: "bg-warning text-warning" };
        if (p.published_at && new Date(p.published_at) > new Date()) return { label: "Scheduled", cls: "bg-primary text-primary" };
        return { label: "Published", cls: "bg-success text-success" };
    };

    if (loading) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
                Loading posts...
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">
                {error}
            </div>
        );
    }

    return (
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="mb-4 flex justify-between">
                <h4 className="text-xl font-semibold text-black dark:text-white">Journal</h4>
                <button onClick={() => router.push("/journal/create")}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-white hover:bg-opacity-90">
                    <Plus size={16} /> New Post
                </button>
            </div>

            <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="min-w-[280px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">Post</th>
                            <th className="min-w-[110px] px-4 py-4 font-medium text-black dark:text-white">Status</th>
                            <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">Date</th>
                            <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center">No posts yet.</td></tr>
                        )}
                        {posts.map((p) => {
                            const s = status(p);
                            return (
                                <tr key={p.id}>
                                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                                        <div className="flex items-center gap-4">
                                            <img src={p.image_url} alt="" className="h-12 w-20 rounded object-cover" />
                                            <div>
                                                <h5 className="font-medium text-black dark:text-white">{p.title}</h5>
                                                <p className="text-xs">/journal/{p.slug} · {p.read_minutes} min read</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${s.cls}`}>{s.label}</span>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <p className="text-black dark:text-white">
                                            {p.published_at ? new Date(p.published_at).toLocaleDateString() : "—"}
                                        </p>
                                    </td>
                                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                                        <div className="flex items-center space-x-3.5">
                                            <a href={`${SITE_URL}/journal/${p.slug}`} target="_blank" rel="noreferrer"
                                                className="hover:text-primary" title="View on site">
                                                <ExternalLink className="h-5 w-5" />
                                            </a>
                                            <button className="hover:text-primary" title="Edit"
                                                onClick={() => router.push(`/journal/${p.id}/edit`)}>
                                                <Pencil className="h-5 w-5" />
                                            </button>
                                            <button className="hover:text-danger" title="Delete" onClick={() => handleDelete(p.id)}>
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JournalTable;
