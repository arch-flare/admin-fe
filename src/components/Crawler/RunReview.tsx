"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { get, post } from "@/utils/api";
import { Check, Eye, X } from "lucide-react";

interface SiteStat {
  site: string;
  posted: number;
  duplicates: number;
  skipped: number;
  repriced?: number;
  failed: number;
  error: string | null;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  source: string | null;
  review_status: "pending" | "approved" | "rejected" | null;
  image_urls: string[];
  category: { name: string };
}

interface Run {
  id: number;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  summary: { sites?: SiteStat[] } | null;
  products_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}

const FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const badge: Record<string, string> = {
  pending: "bg-warning text-warning",
  approved: "bg-success text-success",
  rejected: "bg-danger text-danger",
};

const RunReview = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [run, setRun] = useState<Run | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState("pending");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await get(`/crawler/runs/${id}`, { page, ...(filter ? { review_status: filter } : {}) });
      if (res.status) {
        setRun(res.run);
        setProducts(res.products.data);
        setLastPage(res.products.last_page);
      }
    } catch {
      setError("Failed to load this crawler run");
    } finally {
      setLoading(false);
      // Opening a run marks it seen, so refresh the sidebar badge
      window.dispatchEvent(new Event("crawler-summary-refresh"));
    }
  }, [id, page, filter]);

  useEffect(() => {
    load();
  }, [load]);

  const review = async (productId: number, action: "approve" | "reject") => {
    setBusy(true);
    try {
      await post(`/crawler/products/${productId}/review`, { action });
      await load();
    } catch {
      alert("Could not update the product");
    } finally {
      setBusy(false);
    }
  };

  const reviewAll = async (action: "approve" | "reject") => {
    if (!window.confirm(`${action === "approve" ? "Approve" : "Reject"} all ${run?.pending_count} pending products in this run?`)) return;
    setBusy(true);
    try {
      await post(`/crawler/runs/${id}/review`, { action });
      await load();
    } catch {
      alert("Could not update the run");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return <div className="rounded-sm border border-stroke bg-white p-8 text-center text-danger shadow-default dark:border-strokedark dark:bg-boxdark">{error}</div>;
  }
  if (!run) {
    return <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">Loading...</div>;
  }

  const sites = (run.summary?.sites ?? []).filter((s): s is SiteStat => typeof s === "object");

  return (
    <div className="flex flex-col gap-6">
      {/* Run overview */}
      <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <button onClick={() => router.push("/crawler")} className="mb-2 text-sm text-primary hover:underline">
              &larr; All runs
            </button>
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Crawler run #{run.id} <span className="ml-2 text-sm font-normal capitalize text-bodydark2">{run.status}</span>
            </h4>
            <p className="text-sm text-bodydark2">
              Started {run.started_at ? new Date(run.started_at).toLocaleString() : "-"}
              {run.finished_at && <> · finished {new Date(run.finished_at).toLocaleString()}</>}
            </p>
            <p className="mt-2 text-sm text-black dark:text-white">
              {run.products_count} products posted ·{" "}
              <span className="text-warning">{run.pending_count} pending</span> ·{" "}
              <span className="text-success">{run.approved_count} approved</span> ·{" "}
              <span className="text-danger">{run.rejected_count} rejected</span>
            </p>
          </div>
          {run.pending_count > 0 && (
            <div className="flex gap-2">
              <button disabled={busy} onClick={() => reviewAll("approve")} className="flex items-center gap-1 rounded-md bg-success px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-50">
                <Check size={16} /> Approve all pending
              </button>
              <button disabled={busy} onClick={() => reviewAll("reject")} className="flex items-center gap-1 rounded-md bg-danger px-4 py-2 text-sm text-white hover:bg-opacity-90 disabled:opacity-50">
                <X size={16} /> Reject all pending
              </button>
            </div>
          )}
        </div>

        {sites.length > 0 && (
          <div className="mt-4 max-w-full overflow-x-auto">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  {["Site", "Posted", "Already existed", "Skipped", "Prices filled", "Failed", "Error"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium text-black dark:text-white">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.site}>
                    <td className="border-b border-[#eee] px-3 py-2 font-medium dark:border-strokedark">{s.site}</td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">{s.posted}</td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">{s.duplicates}</td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">{s.skipped}</td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">{s.repriced ?? 0}</td>
                    <td className="border-b border-[#eee] px-3 py-2 dark:border-strokedark">{s.failed}</td>
                    <td className="border-b border-[#eee] px-3 py-2 text-danger dark:border-strokedark">{s.error ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products posted by this run */}
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`rounded-full px-4 py-1.5 text-sm ${filter === f.key ? "bg-primary text-white" : "border border-stroke text-black dark:border-strokedark dark:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={`max-w-full overflow-x-auto ${loading ? "opacity-60" : ""}`}>
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                {["Product", "Category", "Source", "Price", "Review", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-4 font-medium text-black dark:text-white">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-bodydark2">No products here.</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                        <img src={p.image_urls?.[0] || "/images/placeholder.png"} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <h5 className="font-medium text-black dark:text-white">{p.name}</h5>
                        <p className="text-sm text-meta-3">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-black dark:border-strokedark dark:text-white">{p.category?.name}</td>
                  <td className="border-b border-[#eee] px-4 py-4 text-black dark:border-strokedark dark:text-white">{p.source}</td>
                  <td className="border-b border-[#eee] px-4 py-4 text-meta-3 dark:border-strokedark">KES{p.price}</td>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    {p.review_status && (
                      <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium capitalize ${badge[p.review_status]}`}>
                        {p.review_status}
                      </span>
                    )}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    <div className="flex items-center gap-2">
                      <button title="View product" className="hover:text-primary" onClick={() => router.push(`/shop/products/show/${p.id}`)}>
                        <Eye className="h-5 w-5" />
                      </button>
                      {p.review_status !== "approved" && (
                        <button disabled={busy} onClick={() => review(p.id, "approve")} className="rounded-md bg-success px-3 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-50">
                          Approve
                        </button>
                      )}
                      {p.review_status !== "rejected" && (
                        <button disabled={busy} onClick={() => review(p.id, "reject")} className="rounded-md bg-danger px-3 py-1 text-xs text-white hover:bg-opacity-90 disabled:opacity-50">
                          Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between py-4">
          <p className="text-sm text-black dark:text-white">Page {page} of {lastPage}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-md border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark dark:text-white">Previous</button>
            <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page >= lastPage} className="rounded-md border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark dark:text-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunReview;
