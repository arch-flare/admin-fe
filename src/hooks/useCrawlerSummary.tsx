"use client";

import { useCallback, useEffect, useState } from "react";
import { get } from "@/utils/api";

export interface CrawlerSummary {
  unseen_runs: number;
  pending_products: number;
  running: boolean;
}

const EMPTY: CrawlerSummary = { unseen_runs: 0, pending_products: 0, running: false };

/** Polls the crawler summary so the sidebar can show a notification badge. */
export default function useCrawlerSummary(intervalMs = 30000) {
  const [summary, setSummary] = useState<CrawlerSummary>(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const res: any = await get("/crawler/summary");
      if (res.status) {
        setSummary({
          unseen_runs: res.unseen_runs,
          pending_products: res.pending_products,
          running: res.running,
        });
      }
    } catch {
      // Not signed in yet, or the API is briefly unreachable: keep the last known value.
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, intervalMs);
    // Lets pages ask the sidebar to update right after a review action
    window.addEventListener("crawler-summary-refresh", refresh);
    return () => {
      clearInterval(id);
      window.removeEventListener("crawler-summary-refresh", refresh);
    };
  }, [refresh, intervalMs]);

  return summary;
}
