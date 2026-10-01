"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get } from "@/utils/api";

interface SiteStat {
  site: string;
  posted: number;
  duplicates: number;
  skipped: number;
  repriced?: number;
  failed: number;
  error: string | null;
}

interface Run {
  id: number;
  status: "running" | "completed" | "failed";
  started_at: string | null;
  finished_at: string | null;
  seen_at: string | null;
  summary: { sites?: SiteStat[] | string[] } | null;
  products_count: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
}

const statusStyle: Record<string, string> = {
  running: "bg-warning text-warning",
  completed: "bg-success text-success",
  failed: "bg-danger text-danger",
};

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString() : "-");

const RunsList = () => {
  const router = useRouter();
  const [runs, setRuns] = useState<Run[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res: any = await get("/crawler/runs", { page });
        if (res.status) {
          setRuns(res.runs.data);
          setLastPage(res.runs.last_page);
        }
      } catch {
        setError("Failed to load crawler runs");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  const failedSites = (run: Run) =>
    (run.summary?.sites as SiteStat[] | undefined)?.filter((s) => typeof s === "object" && s.error) ?? [];

  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-8 text-center shadow-default dark:border-strokedark dark:bg-boxdark">
        Loading crawler runs...
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
      <h4 className="mb-1 text-xl font-semibold text-black dark:text-white">Crawler runs</h4>
      <p className="mb-4 text-sm text-bodydark2">
        Each time the crawler runs it lists here. Open a run to review the products it posted.
      </p>

      {runs.length === 0 ? (
        <p className="py-10 text-center text-bodydark2">The crawler hasn&apos;t run yet.</p>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                {["Run", "Started", "Status", "Products posted", "Review", "Issues", ""].map((h) => (
                  <th key={h} className="px-4 py-4 font-medium text-black dark:text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="cursor-pointer hover:bg-gray-2 dark:hover:bg-meta-4" onClick={() => router.push(`/crawler/${run.id}`)}>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    <span className="font-medium text-black dark:text-white">#{run.id}</span>
                    {!run.seen_at && run.status !== "running" && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">New</span>
                    )}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-sm dark:border-strokedark">{fmt(run.started_at)}</td>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium capitalize ${statusStyle[run.status]}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-black dark:border-strokedark dark:text-white">{run.products_count}</td>
                  <td className="border-b border-[#eee] px-4 py-4 text-sm dark:border-strokedark">
                    <span className="text-warning">{run.pending_count} pending</span>
                    {" · "}
                    <span className="text-success">{run.approved_count} approved</span>
                    {" · "}
                    <span className="text-danger">{run.rejected_count} rejected</span>
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 text-sm text-danger dark:border-strokedark">
                    {failedSites(run).length
                      ? `${failedSites(run).length} site(s) failed: ${failedSites(run).map((s) => s.site).join(", ")}`
                      : ""}
                  </td>
                  <td className="border-b border-[#eee] px-4 py-4 dark:border-strokedark">
                    <button className="rounded-md bg-primary px-3 py-1.5 text-sm text-white hover:bg-opacity-90">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between py-4">
        <p className="text-sm text-black dark:text-white">
          Page {page} of {lastPage}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark dark:text-white"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="rounded-md border border-stroke px-4 py-2 text-sm disabled:opacity-50 dark:border-strokedark dark:text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunsList;
